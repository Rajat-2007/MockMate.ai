"""Cashfree checkout and server-verified subscription activation."""

from __future__ import annotations

import json
import logging
import re
import uuid
from decimal import Decimal, InvalidOperation
from typing import Any
from urllib.parse import quote

import httpx
from fastapi import APIRouter, Header, HTTPException, Request, status
from sqlalchemy import select

from app.api.deps import CurrentUserDep, SessionDep, SettingsDep
from app.models.billing import PaymentOrder
from app.schemas.billing import (
    CreateOrderRequest,
    CreateOrderResponse,
    PaymentStatusResponse,
    PaymentVerifiedResponse,
    PlanSlug,
    VerifyPaymentRequest,
)
from app.services.billing import (
    PLAN_PRICES_INR,
    activate_paid_order,
    cashfree_enabled,
    check_interview_quota,
    is_founder,
    verify_cashfree_webhook,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def _cashfree_headers(settings: SettingsDep) -> dict[str, str]:
    return {
        "x-client-id": settings.cashfree_client_id,
        "x-client-secret": settings.cashfree_client_secret,
        "x-api-version": settings.cashfree_api_version,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }


def _valid_phone(value: str | None) -> str | None:
    if not value:
        return None
    digits = re.sub(r"\D", "", value)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    return digits if len(digits) == 10 else None


def _amount_matches(value: Any, expected_paise: int) -> bool:
    try:
        return Decimal(str(value)) == (Decimal(expected_paise) / Decimal(100))
    except (InvalidOperation, TypeError, ValueError):
        return False


@router.get("/status", response_model=PaymentStatusResponse)
async def billing_status(
    db: SessionDep, current_user: CurrentUserDep, settings: SettingsDep
) -> PaymentStatusResponse:
    plan, used, limit, expires_at = await check_interview_quota(db, settings, current_user)
    return PaymentStatusResponse(
        plan=plan,
        is_founder=plan == "founder",
        interviews_used=used,
        interview_limit=limit,
        remaining_interviews=max(limit - used, 0) if limit is not None else None,
        subscription_expires_at=expires_at,
        payment_configured=cashfree_enabled(settings),
    )


@router.post("/orders", response_model=CreateOrderResponse)
async def create_order(
    data: CreateOrderRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
    settings: SettingsDep,
) -> CreateOrderResponse:
    if is_founder(settings, current_user):
        raise HTTPException(status_code=400, detail="Founder access already includes all paid features.")
    if not cashfree_enabled(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Cashfree checkout is not configured. Add Cashfree sandbox credentials to the backend environment.",
        )

    profile = current_user.profile
    phone = _valid_phone(profile.phone if profile else None)
    if not phone:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Add a valid 10-digit mobile number in your profile before checkout.",
        )

    amount_paise = PLAN_PRICES_INR[data.plan] * 100
    order_id = f"mm_{uuid.uuid4().hex}"
    customer_name = re.sub(r"[^A-Za-z0-9 ]", "", current_user.full_name or "MockMate User").strip()[:100] or "MockMate User"
    frontend_base = settings.frontend_base_url.rstrip("/")
    payload = {
        "order_id": order_id,
        "order_amount": amount_paise / 100,
        "order_currency": "INR",
        "customer_details": {
            "customer_id": f"mm_{current_user.id.hex}",
            "customer_name": customer_name,
            "customer_email": current_user.email,
            "customer_phone": phone,
        },
        "order_meta": {
            "return_url": f"{frontend_base}/dashboard/billing?order_id={{order_id}}"
        },
        "order_note": f"MockMate {data.plan.title()} monthly subscription",
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(20)) as client:
            response = await client.post(
                f"{settings.cashfree_base_url.rstrip('/')}/orders",
                headers=_cashfree_headers(settings),
                json=payload,
            )
            response.raise_for_status()
            provider_order = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Cashfree order creation failed: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not start secure checkout. Please try again.",
        ) from exc

    session_id = provider_order.get("payment_session_id") if isinstance(provider_order, dict) else None
    returned_order_id = provider_order.get("order_id") if isinstance(provider_order, dict) else None
    if (
        not isinstance(session_id, str) or not session_id
        or returned_order_id != order_id
        or not _amount_matches(provider_order.get("order_amount"), amount_paise)
        or provider_order.get("order_currency") != "INR"
    ):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Cashfree returned an invalid order response.",
        )

    db.add(PaymentOrder(
        user_id=current_user.id,
        gateway_order_id=order_id,
        plan_slug=data.plan,
        amount_paise=amount_paise,
    ))
    await db.commit()

    mode = "production" if "api.cashfree.com" in settings.cashfree_base_url else "sandbox"
    return CreateOrderResponse(
        order_id=order_id,
        payment_session_id=session_id,
        mode=mode,
        amount=amount_paise,
        plan=data.plan,
    )


@router.post("/verify", response_model=PaymentVerifiedResponse)
async def verify_payment(
    data: VerifyPaymentRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
    settings: SettingsDep,
) -> PaymentVerifiedResponse:
    if not cashfree_enabled(settings):
        raise HTTPException(status_code=503, detail="Cashfree checkout is not configured.")

    result = await db.execute(select(PaymentOrder).where(
        PaymentOrder.gateway_order_id == data.order_id,
        PaymentOrder.user_id == current_user.id,
    ))
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(status_code=404, detail="Payment order was not found for this account.")

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(20)) as client:
            headers = _cashfree_headers(settings)
            base = settings.cashfree_base_url.rstrip("/")
            encoded_order_id = quote(order.gateway_order_id, safe="")
            order_response = await client.get(f"{base}/orders/{encoded_order_id}", headers=headers)
            order_response.raise_for_status()
            provider_order = order_response.json()
            payments_response = await client.get(
                f"{base}/orders/{encoded_order_id}/payments", headers=headers
            )
            payments_response.raise_for_status()
            payments = payments_response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Cashfree payment verification failed: %s", type(exc).__name__)
        raise HTTPException(status_code=502, detail="Could not confirm payment with Cashfree. Please retry.") from exc

    if (
        not isinstance(provider_order, dict)
        or provider_order.get("order_id") != order.gateway_order_id
        or provider_order.get("order_currency") != "INR"
        or not _amount_matches(provider_order.get("order_amount"), order.amount_paise)
        or not isinstance(payments, list)
    ):
        raise HTTPException(status_code=402, detail="Cashfree order details did not match this purchase.")

    successful_payment = next((
        payment for payment in payments
        if isinstance(payment, dict)
        and payment.get("payment_status") == "SUCCESS"
        and payment.get("order_id") == order.gateway_order_id
        and payment.get("payment_currency") == "INR"
        and _amount_matches(payment.get("payment_amount"), order.amount_paise)
    ), None)
    if successful_payment is None:
        raise HTTPException(status_code=402, detail="Cashfree has not confirmed the full payment yet.")

    subscription = await activate_paid_order(db, order)
    plan: PlanSlug = "starter" if order.plan_slug == "starter" else "pro"
    return PaymentVerifiedResponse(plan=plan, expires_at=subscription.expires_at)


@router.post("/webhook", status_code=status.HTTP_204_NO_CONTENT)
async def payment_webhook(
    request: Request,
    db: SessionDep,
    settings: SettingsDep,
    x_webhook_signature: str = Header(default=""),
    x_webhook_timestamp: str = Header(default=""),
) -> None:
    body = await request.body()
    if not verify_cashfree_webhook(settings, body, x_webhook_signature, x_webhook_timestamp):
        raise HTTPException(status_code=400, detail="Invalid Cashfree webhook signature.")
    try:
        event: dict[str, Any] = json.loads(body)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid payment webhook payload.") from exc

    if not isinstance(event, dict):
        raise HTTPException(status_code=400, detail="Invalid payment webhook payload.")
    if event.get("type") != "PAYMENT_SUCCESS_WEBHOOK":
        return None

    data = event.get("data")
    payment = data.get("payment") if isinstance(data, dict) else None
    provider_order = data.get("order") if isinstance(data, dict) else None
    if not isinstance(payment, dict) or not isinstance(provider_order, dict):
        raise HTTPException(status_code=400, detail="Cashfree webhook is missing payment details.")

    gateway_order_id = provider_order.get("order_id")
    if not isinstance(gateway_order_id, str):
        raise HTTPException(status_code=400, detail="Cashfree webhook is missing an order identifier.")

    result = await db.execute(select(PaymentOrder).where(
        PaymentOrder.gateway_order_id == gateway_order_id
    ))
    order = result.scalar_one_or_none()
    if order is None:
        logger.warning("Cashfree webhook received an unknown order")
        return None

    if (
        payment.get("payment_status") != "SUCCESS"
        or provider_order.get("order_currency") != "INR"
        or not _amount_matches(provider_order.get("order_amount"), order.amount_paise)
        or not _amount_matches(payment.get("payment_amount"), order.amount_paise)
        or payment.get("payment_currency") != "INR"
    ):
        raise HTTPException(status_code=400, detail="Cashfree payment amount or status did not match the order.")

    await activate_paid_order(db, order)
    return None
