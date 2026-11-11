"""User Profile database model.

Stores academic stream, course, specialization, career goals, target role,
experience level and interview preferences.
"""

from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, String, Text, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.mixins import TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class UserProfile(Base, TimestampMixin):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        server_default=text("gen_random_uuid()"),
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # Academic & Career details
    academic_stream: Mapped[str | None] = mapped_column(String(100), default=None)
    course: Mapped[str | None] = mapped_column(String(100), default=None)
    specialization: Mapped[str | None] = mapped_column(String(150), default=None)
    college: Mapped[str | None] = mapped_column(String(255), default=None)
    current_year: Mapped[str | None] = mapped_column(String(50), default=None)
    experience_level: Mapped[str | None] = mapped_column(String(50), default="Fresher")
    target_role: Mapped[str | None] = mapped_column(String(150), default=None)
    career_goal: Mapped[str | None] = mapped_column(String(255), default=None)
    preferred_language: Mapped[str] = mapped_column(String(50), default="English")

    # Additional profile details
    bio: Mapped[str | None] = mapped_column(Text, default=None)
    phone: Mapped[str | None] = mapped_column(String(30), default=None)
    avatar_url: Mapped[str | None] = mapped_column(String(500), default=None)
    onboarding_completed: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    user: Mapped[User] = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<UserProfile user_id={self.user_id} course={self.course}>"
