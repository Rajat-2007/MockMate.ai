"""User profile, onboarding, and academic streams endpoints."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter

from app.api.deps import CurrentUserDep, SessionDep
from app.core.academic_data import (
    ACADEMIC_STREAMS,
    EXPERIENCE_LEVELS,
    INTERVIEW_LANGUAGES,
    TARGET_JOB_ROLES,
)
from app.schemas.profile import OnboardingRequest, ProfileResponse, ProfileUpdate
from app.services.profile import ProfileService

router = APIRouter()


@router.get(
    "",
    response_model=ProfileResponse,
    summary="Get profile details of the authenticated student",
)
async def get_profile(current_user: CurrentUserDep, db: SessionDep) -> ProfileResponse:
    profile = await ProfileService.get_or_create_profile(db, current_user.id)
    return ProfileResponse.model_validate(profile)


@router.put(
    "",
    response_model=ProfileResponse,
    summary="Update profile details of the authenticated student",
)
async def update_profile(
    data: ProfileUpdate, current_user: CurrentUserDep, db: SessionDep
) -> ProfileResponse:
    profile = await ProfileService.update_profile(db, current_user, data)
    return ProfileResponse.model_validate(profile)


@router.post(
    "/onboarding",
    response_model=ProfileResponse,
    summary="Complete student onboarding",
)
async def complete_onboarding(
    data: OnboardingRequest, current_user: CurrentUserDep, db: SessionDep
) -> ProfileResponse:
    profile = await ProfileService.complete_onboarding(db, current_user, data)
    return ProfileResponse.model_validate(profile)


@router.get(
    "/academic-options",
    summary="Get lists of academic streams and options",
)
async def get_academic_options() -> dict[str, Any]:
    return {
        "streams": ACADEMIC_STREAMS,
        "experience_levels": EXPERIENCE_LEVELS,
        "target_roles": TARGET_JOB_ROLES,
        "languages": INTERVIEW_LANGUAGES,
    }
