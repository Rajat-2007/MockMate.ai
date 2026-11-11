"""Billing signature and founder-account checks."""

from __future__ import annotations

import hashlib
import hmac
import uuid

import pytest
from app.core.config import Settings
from app.db.base import Base, load_all_models
from app.models.billing import InterviewUsage, PaymentOrder, Subscription
from app.models.user import User, UserRole
from app.services.billing import (
    PLAN_LIMITS,
    PLAN_PRICES_INR,
    activate_paid_order,
    is_founder,
    record_interview,
    usage_for_month,
    verify_checkout_signature,
    verify_webhook_signature,
)
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine


def test_founder_email_is_case_insensitive() -> None:
    settings = Settings(founder_email="owner@example.com")
    founder = User(
        email="Owner@Example.com",
        role=UserRole.admin,
        is_verified=True,
    )
    assert is_founder(settings, founder)
    assert not is_founder(settings, User(email="candidate@example.com"))
    assert not is_founder(
        settings,
        User(email="Owner@Example.com", role=UserRole.candidate, is_verified=True),
    )
    assert not is_founder(
        settings,
        User(email="Owner@Example.com", role=UserRole.admin, is_verified=False),
    )


def test_published_plan_limits_and_prices_are_server_defined() -> None:
    assert PLAN_LIMITS == {"free": 4, "starter": 20, "pro": 60}
    assert PLAN_PRICES_INR == {"starter": 149, "pro": 499}


def test_checkout_signature_verifies_with_constant_time_comparison() -> None:
    settings = Settings(razorpay_key_secret="test-secret")
    signed_data = b"order_123|payment_456"
    signature = hmac.new(
        b"test-secret", signed_data, hashlib.sha256
    ).hexdigest()

    assert verify_checkout_signature(
        settings, "order_123", "payment_456", signature
    )
    assert not verify_checkout_signature(
        settings, "order_123", "payment_456", "wrong-signature"
    )


def test_webhook_signature_requires_configured_secret() -> None:
    settings = Settings(razorpay_webhook_secret="webhook-secret")
    body = b'{"event":"payment.captured"}'
    signature = hmac.new(
        b"webhook-secret", body, hashlib.sha256
    ).hexdigest()

    assert verify_webhook_signature(settings, body, signature)
    assert not verify_webhook_signature(Settings(), body, signature)


@pytest.mark.asyncio
async def test_interview_quota_is_enforced_atomically() -> None:
    load_all_models()
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, expire_on_commit=False)
    user_id = uuid.uuid4()
    try:
        async with factory() as session:
            session.add(
                User(
                    id=user_id,
                    email="candidate@example.com",
                    hashed_password="test-hash",
                )
            )
            await session.commit()
            await record_interview(session, user_id, limit=1)
            usage = await usage_for_month(session, user_id)
            assert isinstance(usage, InterviewUsage)
            assert usage.count == 1

            with pytest.raises(HTTPException) as error:
                await record_interview(session, user_id, limit=1)
            assert error.value.status_code == 429
    finally:
        await engine.dispose()


@pytest.mark.asyncio
async def test_payment_activation_is_idempotent() -> None:
    load_all_models()
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, expire_on_commit=False)
    user_id = uuid.uuid4()
    try:
        async with factory() as session:
            session.add(
                User(
                    id=user_id,
                    email="buyer@example.com",
                    hashed_password="test-hash",
                )
            )
            await session.commit()
            order = PaymentOrder(
                user_id=user_id,
                gateway_order_id="order_123",
                plan_slug="starter",
                amount_paise=14900,
            )
            session.add(order)
            await session.commit()

            first = await activate_paid_order(session, order)
            second = await activate_paid_order(session, order)
            assert first.id == second.id
            subscriptions = await session.execute(
                select(Subscription).where(Subscription.user_id == user_id)
            )
            assert len(list(subscriptions.scalars())) == 1
    finally:
        await engine.dispose()
