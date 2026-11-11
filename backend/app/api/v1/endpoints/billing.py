"""UPI-enabled checkout and server-verified plan activation."""

from __future__ import annotations

import json
import logging
import uuid
from typing import Any

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
    check_interview_quota,
    is_founder,
    payment_entity,
    razorpay_enabled,
    verify_checkout_signature,
    verify_webhook_signature,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/status", response_model=PaymentStatusResponse)
async def billing_status(
    db: SessionDep, current_user: CurrentUserDep, settings: SettingsDep
) -> PaymentStatusResponse:
    plan, used, limit, expires_at = await check_interview_quota(
        db, settings, current_user
    )
    founder = plan == "founder"
    return PaymentStatusResponse(
        plan=plan,
        is_founder=founder,
        interviews_used=used,
        interview_limit=limit,
        remaining_interviews=max(limit - used, 0) if limit is not None else None,
        subscription_expires_at=expires_at,
        payment_configured=razorpay_enabled(settings),
    )


@router.post("/orders", response_model=CreateOrderResponse)
async def create_order(
    data: CreateOrderRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
    settings: SettingsDep,
) -> CreateOrderResponse:
    if is_founder(settings, current_user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Founder access already includes all paid features.",
        )
    if not razorpay_enabled(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "UPI checkout is not fully configured. Set Razorpay merchant keys "
                "and the webhook secret on the backend."
            ),
        )

    amount_paise = PLAN_PRICES_INR[data.plan] * 100
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(20)) as client:
            response = await client.post(
                f"{settings.razorpay_base_url.rstrip('/')}/orders",
                auth=httpx.BasicAuth(
                    settings.razorpay_key_id, settings.razorpay_key_secret
                ),
                json={
                    "amount": amount_paise,
                    "currency": "INR",
                    "receipt": uuid.uuid4().hex,
                    "notes": {
                        "user_id": str(current_user.id),
                        "plan": data.plan,
                    },
                },
            )
            response.raise_for_status()
            provider_order = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Razorpay order creation failed: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not start UPI checkout. Please try again.",
        ) from exc

    gateway_order_id = (
        provider_order.get("id") if isinstance(provider_order, dict) else None
    )
    if (
        not isinstance(gateway_order_id, str)
        or not gateway_order_id
        or provider_order.get("amount") != amount_paise
        or provider_order.get("currency") != "INR"
    ):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The payment provider returned an invalid order.",
        )

    db.add(
        PaymentOrder(
            user_id=current_user.id,
            gateway_order_id=gateway_order_id,
            plan_slug=data.plan,
            amount_paise=amount_paise,
        )
    )
    await db.commit()
    return CreateOrderResponse(
        key_id=settings.razorpay_key_id,
        order_id=gateway_order_id,
        amount=amount_paise,
        plan=data.plan,
        company_name="TRA Services Pvt Ltd",
    )


@router.post("/verify", response_model=PaymentVerifiedResponse)
async def verify_payment(
    data: VerifyPaymentRequest,
    db: SessionDep,
    current_user: CurrentUserDep,
    settings: SettingsDep,
) -> PaymentVerifiedResponse:
    if not razorpay_enabled(settings):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="UPI checkout is not configured.",
        )
    if not verify_checkout_signature(
        settings, data.order_id, data.payment_id, data.signature
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed. No plan was activated.",
        )

    result = await db.execute(
        select(PaymentOrder).where(
            PaymentOrder.gateway_order_id == data.order_id,
            PaymentOrder.user_id == current_user.id,
        )
    )
    order = result.scalar_one_or_none()
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment order was not found for this account.",
        )
    plan: PlanSlug
    if order.plan_slug == "starter":
        plan = "starter"
    elif order.plan_slug == "pro":
        plan = "pro"
    else:
        logger.error("Payment order has an unsupported plan: %s", order.plan_slug)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="This payment order contains an unsupported plan.",
        )

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(20)) as client:
            response = await client.get(
                f"{settings.razorpay_base_url.rstrip('/')}/payments/{data.payment_id}",
                auth=httpx.BasicAuth(
                    settings.razorpay_key_id, settings.razorpay_key_secret
                ),
            )
            response.raise_for_status()
            payment = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.warning("Razorpay payment lookup failed: %s", type(exc).__name__)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not confirm payment with the gateway. Please retry.",
        ) from exc

    if not isinstance(payment, dict):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="The payment provider returned an invalid payment record.",
        )
    if (
        payment.get("status") != "captured"
        or payment.get("order_id") != order.gateway_order_id
        or payment.get("amount") != order.amount_paise
        or payment.get("currency") != "INR"
    ):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="The gateway has not confirmed the full plan payment yet.",
        )

    subscription = await activate_paid_order(db, order)
    return PaymentVerifiedResponse(
        plan=plan, expires_at=subscription.expires_at
    )


@router.post("/webhook", status_code=status.HTTP_204_NO_CONTENT)
async def payment_webhook(
    request: Request,
    db: SessionDep,
    settings: SettingsDep,
    x_razorpay_signature: str = Header(default=""),
) -> None:
    body = await request.body()
    if not verify_webhook_signature(settings, body, x_razorpay_signature):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment webhook signature.",
        )
    try:
        event: dict[str, Any] = json.loads(body)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment webhook payload.",
        ) from exc

    if not isinstance(event, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment webhook payload.",
        )
    if event.get("event") != "payment.captured":
        return None
    payment = payment_entity(event)
    if payment is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment webhook is missing payment details.",
        )
    gateway_order_id = payment.get("order_id")
    if not isinstance(gateway_order_id, str):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment webhook is missing an order identifier.",
        )

    result = await db.execute(
        select(PaymentOrder).where(PaymentOrder.gateway_order_id == gateway_order_id)
    )
    order = result.scalar_one_or_none()
    if order is None:
        logger.warning("Razorpay webhook received an unknown order")
        return None
    if (
        payment.get("amount") != order.amount_paise
        or payment.get("currency") != "INR"
        or payment.get("status") != "captured"
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment webhook amount or status did not match the order.",
        )
    await activate_paid_order(db, order)
    return None
