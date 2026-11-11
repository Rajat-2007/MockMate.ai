"""Tests for cryptographic utilities: bcrypt hashing and JWT tokens."""

from __future__ import annotations

import uuid

from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)


def test_password_hashing() -> None:
    raw = "SuperSecretPassword123!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword123!", hashed) is False


def test_jwt_access_token_cycle() -> None:
    user_id = str(uuid.uuid4())
    token = create_access_token(
        user_id=user_id,
        email="student@mockmate.ai",
        role="candidate",
    )
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["email"] == "student@mockmate.ai"
    assert payload["role"] == "candidate"
    assert payload["type"] == "access"


def test_jwt_refresh_token_cycle() -> None:
    user_id = str(uuid.uuid4())
    token = create_refresh_token(user_id=user_id)
    payload = decode_token(token)
    assert payload["sub"] == user_id
    assert payload["type"] == "refresh"
