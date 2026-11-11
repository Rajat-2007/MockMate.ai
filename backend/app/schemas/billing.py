"""Billing API request and response shapes."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

PlanSlug = Literal["starter", "pro"]


class CreateOrderRequest(BaseModel):
    plan: PlanSlug


class CreateOrderResponse(BaseModel):
    key_id: str
    order_id: str
    amount: int
    currency: Literal["INR"] = "INR"
    plan: PlanSlug
    company_name: str = "TRA Services Pvt Ltd"


class VerifyPaymentRequest(BaseModel):
    order_id: str = Field(min_length=1, max_length=80)
    payment_id: str = Field(min_length=1, max_length=80)
    signature: str = Field(min_length=1, max_length=256)


class PaymentStatusResponse(BaseModel):
    plan: str
    is_founder: bool
    interviews_used: int
    interview_limit: int | None
    remaining_interviews: int | None
    subscription_expires_at: datetime | None = None
    payment_configured: bool


class PaymentVerifiedResponse(BaseModel):
    status: Literal["active"] = "active"
    plan: PlanSlug
    expires_at: datetime
