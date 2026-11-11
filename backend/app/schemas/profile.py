"""User profile and onboarding request/response schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    academic_stream: str | None = None
    course: str | None = None
    specialization: str | None = None
    college: str | None = None
    current_year: str | None = None
    experience_level: str | None = "Fresher"
    target_role: str | None = None
    career_goal: str | None = None
    preferred_language: str = "English"
    bio: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    onboarding_completed: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=160)
    academic_stream: str | None = Field(None, max_length=100)
    course: str | None = Field(None, max_length=100)
    specialization: str | None = Field(None, max_length=150)
    college: str | None = Field(None, max_length=255)
    current_year: str | None = Field(None, max_length=50)
    experience_level: str | None = Field(None, max_length=50)
    target_role: str | None = Field(None, max_length=150)
    career_goal: str | None = Field(None, max_length=255)
    preferred_language: str | None = Field(None, max_length=50)
    bio: str | None = None
    phone: str | None = Field(None, max_length=30)
    avatar_url: str | None = Field(None, max_length=500)


class OnboardingRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    academic_stream: str = Field(min_length=2, max_length=100)
    course: str = Field(min_length=2, max_length=100)
    specialization: str | None = Field(None, max_length=150)
    college: str | None = Field(None, max_length=255)
    current_year: str = Field(min_length=1, max_length=50)
    experience_level: str = Field(min_length=2, max_length=50)
    target_role: str = Field(min_length=2, max_length=150)
    career_goal: str | None = Field(None, max_length=255)
    preferred_language: str = Field(default="English", max_length=50)
