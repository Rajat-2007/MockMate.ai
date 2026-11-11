"""Authentication endpoints: signup, login, refresh, profile me, password management."""

from __future__ import annotations

from fastapi import APIRouter, status

from app.api.deps import CurrentUserDep, SessionDep
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    MessageResponse,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshTokenRequest,
    SignupRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth import AuthService

router = APIRouter()


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
)
async def signup(data: SignupRequest, db: SessionDep) -> TokenResponse:
    _, tokens = await AuthService.signup(db, data)
    return tokens


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log into an existing account",
)
async def login(data: LoginRequest, db: SessionDep) -> TokenResponse:
    _, tokens = await AuthService.login(db, data)
    return tokens


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh an expired access token using a refresh token",
)
async def refresh(data: RefreshTokenRequest, db: SessionDep) -> TokenResponse:
    return await AuthService.refresh_tokens(db, data.refresh_token)


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Log out of the session",
)
async def logout() -> MessageResponse:
    return MessageResponse(message="Successfully logged out")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get the currently logged-in user details",
)
async def get_me(current_user: CurrentUserDep) -> UserResponse:
    onboarding_done = (
        current_user.profile.onboarding_completed if current_user.profile else False
    )
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        onboarding_completed=onboarding_done,
    )


@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password reset link/token",
)
async def forgot_password(
    data: PasswordResetRequest, db: SessionDep
) -> MessageResponse:
    await AuthService.request_password_reset(db, data.email)
    # Always return success to prevent email enumeration
    return MessageResponse(
        message=(
            "If an account with that email exists, password reset instructions "
            "have been generated."
        )
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Reset password using a valid reset token",
)
async def reset_password(data: PasswordResetConfirm, db: SessionDep) -> MessageResponse:
    await AuthService.reset_password(db, data.token, data.new_password)
    return MessageResponse(
        message="Password has been successfully reset. You can now log in."
    )


@router.post(
    "/change-password",
    response_model=MessageResponse,
    summary="Change password for an authenticated user",
)
async def change_password(
    data: ChangePasswordRequest, current_user: CurrentUserDep, db: SessionDep
) -> MessageResponse:
    await AuthService.change_password(
        db, current_user, data.current_password, data.new_password
    )
    return MessageResponse(message="Password changed successfully.")
