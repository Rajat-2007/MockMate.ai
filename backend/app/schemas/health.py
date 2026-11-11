"""Health and readiness payloads."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

HealthStatus = Literal["ok", "degraded"]


class DependencyCheck(BaseModel):
    """Result of probing one optional dependency."""

    configured: bool = Field(
        description="False when no URL/key is set, so the check is skipped."
    )
    ok: bool = Field(description="True when the dependency answered correctly.")
    latency_ms: float | None = Field(
        default=None, description="Round trip in milliseconds, when measured."
    )
    detail: str | None = Field(
        default=None, description="Short, non-sensitive error summary."
    )


class HealthResponse(BaseModel):
    status: HealthStatus
    service: str
    version: str
    environment: str
    checks: dict[str, DependencyCheck]


class LivenessResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str
