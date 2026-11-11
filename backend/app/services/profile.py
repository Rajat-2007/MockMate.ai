"""User profile service for onboarding and profile updates."""

from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.profile import OnboardingRequest, ProfileUpdate


class ProfileService:
    @staticmethod
    async def get_or_create_profile(
        db: AsyncSession, user_id: uuid.UUID
    ) -> UserProfile:
        stmt = select(UserProfile).where(UserProfile.user_id == user_id)
        result = await db.execute(stmt)
        profile = result.scalar_one_or_none()
        if not profile:
            profile = UserProfile(user_id=user_id, onboarding_completed=False)
            db.add(profile)
            await db.commit()
            await db.refresh(profile)
        return profile

    @classmethod
    async def complete_onboarding(
        cls, db: AsyncSession, user: User, data: OnboardingRequest
    ) -> UserProfile:
        profile = await cls.get_or_create_profile(db, user.id)

        # Update user's full name if changed
        if data.full_name and data.full_name != user.full_name:
            user.full_name = data.full_name.strip()

        profile.academic_stream = data.academic_stream
        profile.course = data.course
        profile.specialization = data.specialization
        profile.college = data.college
        profile.current_year = data.current_year
        profile.experience_level = data.experience_level
        profile.target_role = data.target_role
        profile.career_goal = data.career_goal
        profile.preferred_language = data.preferred_language
        profile.onboarding_completed = True

        await db.commit()
        await db.refresh(profile)
        await db.refresh(user)
        return profile

    @classmethod
    async def update_profile(
        cls, db: AsyncSession, user: User, data: ProfileUpdate
    ) -> UserProfile:
        profile = await cls.get_or_create_profile(db, user.id)

        if data.full_name is not None and data.full_name.strip():
            user.full_name = data.full_name.strip()

        update_dict = data.model_dump(exclude_unset=True, exclude={"full_name"})
        for field, value in update_dict.items():
            setattr(profile, field, value)

        await db.commit()
        await db.refresh(profile)
        await db.refresh(user)
        return profile
