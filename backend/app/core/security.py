"""Cryptographic utilities: password hashing with bcrypt, JWT token creation."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt

from app.core.config import get_settings


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt with salt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def create_token(
    payload: dict[str, Any],
    expires_delta: timedelta,
    token_type: str = "access",
) -> str:
    """Create a signed JWT token with expiration and token_type."""
    settings = get_settings()
    now = datetime.now(UTC)
    to_encode = payload.copy()
    to_encode.update(
        {
            "iat": now,
            "exp": now + expires_delta,
            "type": token_type,
        }
    )
    return jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_access_token(
    user_id: str,
    email: str,
    role: str = "candidate",
    expires_delta: timedelta | None = None,
) -> str:
    """Issue a short-lived access token."""
    settings = get_settings()
    delta = expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "email": email, "role": role}
    return create_token(payload, delta, token_type="access")


def create_refresh_token(
    user_id: str,
    expires_delta: timedelta | None = None,
) -> str:
    """Issue a long-lived refresh token."""
    settings = get_settings()
    delta = expires_delta or timedelta(days=settings.refresh_token_expire_days)
    payload = {"sub": user_id}
    return create_token(payload, delta, token_type="refresh")


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token against application secret."""
    settings = get_settings()
    return jwt.decode(
        token,
        settings.secret_key,
        algorithms=[settings.jwt_algorithm],
    )
