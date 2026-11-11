"""Razorpay order verification and subscription activation."""

from __future__ import annotations

import hashlib
import hmac
import logging
import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.models.billing import InterviewUsage, PaymentOrder, Subscription
from app.models.user import User, UserRole

logger = logging.getLogger(__name__)

PLAN_PRICES_INR = {"starter": 149, "pro": 499}
PLAN_LIMITS = {"free": 4, "starter": 20, "pro": 60}
SUBSCRIPTION_DURATION = timedelta(days=30)


def current_month() -> str:
    return datetime.now(UTC).strftime("%Y-%m")


def is_founder(settings: Settings, user: User) -> bool:
    return bool(
        settings.founder_email
        and user.email.casefold() == settings.founder_email.casefold()
        and user.role == UserRole.admin
        and user.is_verified
    )


async def active_subscription(
    db: AsyncSession, user_id: uuid.UUID
) -> Subscription | None:
    result = await db.execute(
        select(Subscription)
        .where(Subscription.user_id == user_id)
        .order_by(Subscription.created_at.desc())
    )
    now = datetime.now(UTC)
    for subscription in result.scalars():
        expires_at = subscription.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at > now:
            return subscription
    return None


async def usage_for_month(
    db: AsyncSession, user_id: uuid.UUID
) -> InterviewUsage | None:
    result = await db.execute(
        select(InterviewUsage).where(
            InterviewUsage.user_id == user_id,
            InterviewUsage.usage_month == current_month(),
        )
    )
    return result.scalar_one_or_none()


async def check_interview_quota(
    db: AsyncSession, settings: Settings, user: User
) -> tuple[str, int, int | None, datetime | None]:
    subscription = await active_subscription(db, user.id)
    plan = subscription.plan_slug if subscription else "free"
    usage = await usage_for_month(db, user.id)
    used = usage.count if usage else 0

    if is_founder(settings, user):
        return "founder", used, None, None

    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    return plan, used, limit, subscription.expires_at if subscription else None


async def enforce_interview_quota(
    db: AsyncSession, settings: Settings, user: User
) -> tuple[str, int, int | None, datetime | None]:
    plan, used, limit, expires_at = await check_interview_quota(db, settings, user)
    if limit is not None and used >= limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"You have used all {limit} {plan} interviews for this month. "
                "Upgrade your plan or try again next month."
            ),
        )
    return plan, used, limit, expires_at


async def record_interview(
    db: AsyncSession, user_id: uuid.UUID, limit: int | None
) -> None:
    usage = await usage_for_month(db, user_id)
    if usage is None:
        db.add(
            InterviewUsage(user_id=user_id, usage_month=current_month(), count=1)
        )
        try:
            await db.commit()
            return
        except IntegrityError:
            await db.rollback()

    statement = (
        update(InterviewUsage)
        .where(
            InterviewUsage.user_id == user_id,
            InterviewUsage.usage_month == current_month(),
        )
        .values(count=InterviewUsage.count + 1)
        .returning(InterviewUsage.user_id)
    )
    if limit is not None:
        statement = statement.where(InterviewUsage.count < limit)
    result = await db.execute(statement)
    if result.scalar_one_or_none() is None:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=(
                f"You have used all {limit} interviews for this month. "
                "Upgrade your plan or try again next month."
            ),
        )
    await db.commit()


def razorpay_enabled(settings: Settings) -> bool:
    return bool(
        settings.razorpay_key_id
        and settings.razorpay_key_secret
        and settings.razorpay_webhook_secret
    )


def verify_checkout_signature(
    settings: Settings, order_id: str, payment_id: str, signature: str
) -> bool:
    expected = hmac.new(
        settings.razorpay_key_secret.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_webhook_signature(settings: Settings, body: bytes, signature: str) -> bool:
    if not settings.razorpay_webhook_secret:
        return False
    expected = hmac.new(
        settings.razorpay_webhook_secret.encode(), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def activate_paid_order(
    db: AsyncSession, order: PaymentOrder
) -> Subscription:
    if order.status == "paid":
        result = await db.execute(
            select(Subscription).where(Subscription.payment_order_id == order.id)
        )
        subscription = result.scalar_one_or_none()
        if subscription is not None:
            return subscription

    payment_order_id = order.id
    now = datetime.now(UTC)
    previous_subscription = await active_subscription(db, order.user_id)
    starts_at = now
    if previous_subscription is not None:
        starts_at = previous_subscription.expires_at
        if starts_at.tzinfo is None:
            starts_at = starts_at.replace(tzinfo=UTC)
    subscription = Subscription(
        user_id=order.user_id,
        plan_slug=order.plan_slug,
        payment_order_id=order.id,
        expires_at=starts_at + SUBSCRIPTION_DURATION,
    )
    order.status = "paid"
    db.add(subscription)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        result = await db.execute(
            select(Subscription).where(
                Subscription.payment_order_id == payment_order_id
            )
        )
        existing_subscription = result.scalar_one_or_none()
        if existing_subscription is None:
            raise
        return existing_subscription
    await db.refresh(subscription)
    return subscription


def payment_entity(payload: dict[str, Any]) -> dict[str, Any] | None:
    try:
        entity = payload["payload"]["payment"]["entity"]
    except (KeyError, TypeError):
        return None
    return entity if isinstance(entity, dict) else None
