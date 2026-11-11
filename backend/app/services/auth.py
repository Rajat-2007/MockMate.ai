"""Authentication business logic service."""

from __future__ import annotations

import uuid
from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.profile import UserProfile
from app.models.user import User, UserRole
from app.schemas.auth import (
    LoginRequest,
    SignupRequest,
    TokenResponse,
)


class AuthService:
    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        stmt = (
            select(User)
            .options(selectinload(User.profile))
            .where(User.email == email.lower().strip())
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
        stmt = (
            select(User).options(selectinload(User.profile)).where(User.id == user_id)
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    @classmethod
    async def signup(
        cls, db: AsyncSession, data: SignupRequest
    ) -> tuple[User, TokenResponse]:
        existing = await cls.get_user_by_email(db, data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        hashed = hash_password(data.password)
        user = User(
            email=data.email.lower().strip(),
            hashed_password=hashed,
            full_name=data.full_name.strip(),
            role=UserRole.candidate,
            is_active=True,
            is_verified=False,
        )
        db.add(user)
        await db.flush()

        # Create blank profile
        profile = UserProfile(
            user_id=user.id,
            onboarding_completed=False,
        )
        db.add(profile)
        await db.commit()
        await db.refresh(user)

        tokens = cls._generate_token_response(user, onboarding_completed=False)
        return user, tokens

    @classmethod
    async def login(
        cls, db: AsyncSession, data: LoginRequest
    ) -> tuple[User, TokenResponse]:
        user = await cls.get_user_by_email(db, data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been deactivated",
            )

        onboarding_done = user.profile.onboarding_completed if user.profile else False
        tokens = cls._generate_token_response(
            user, onboarding_completed=onboarding_done
        )
        return user, tokens

    @classmethod
    async def refresh_tokens(
        cls, db: AsyncSession, refresh_token_str: str
    ) -> TokenResponse:
        try:
            payload = decode_token(refresh_token_str)
            if payload.get("type") != "refresh":
                raise ValueError("Not a refresh token")
            user_id_str = payload.get("sub")
            if not user_id_str:
                raise ValueError("Missing subject")
            user_id = uuid.UUID(user_id_str)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            ) from None

        user = await cls.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        onboarding_done = user.profile.onboarding_completed if user.profile else False
        return cls._generate_token_response(user, onboarding_completed=onboarding_done)

    @classmethod
    async def request_password_reset(cls, db: AsyncSession, email: str) -> str | None:
        user = await cls.get_user_by_email(db, email)
        if not user:
            # Do not reveal whether user exists for security
            return None

        # Create short-lived reset token (30 mins)
        reset_token = create_token(
            {"sub": str(user.id), "email": user.email},
            timedelta(minutes=30),
            token_type="reset_password",
        )
        return reset_token

    @classmethod
    async def reset_password(
        cls, db: AsyncSession, token: str, new_password: str
    ) -> User:
        try:
            payload = decode_token(token)
            if payload.get("type") != "reset_password":
                raise ValueError("Invalid token type")
            user_id = uuid.UUID(payload["sub"])
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token",
            ) from None

        user = await cls.get_user_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        user.hashed_password = hash_password(new_password)
        await db.commit()
        await db.refresh(user)
        return user

    @classmethod
    async def change_password(
        cls, db: AsyncSession, user: User, current_password: str, new_password: str
    ) -> None:
        if not verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password",
            )
        user.hashed_password = hash_password(new_password)
        await db.commit()

    @classmethod
    def _generate_token_response(
        cls, user: User, onboarding_completed: bool
    ) -> TokenResponse:
        access_token = create_access_token(
            user_id=str(user.id),
            email=user.email,
            role=user.role.value,
        )
        refresh_token = create_refresh_token(user_id=str(user.id))
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            onboarding_completed=onboarding_completed,
        )
