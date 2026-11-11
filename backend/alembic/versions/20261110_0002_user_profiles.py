"""Add user_profiles table for student academic stream, course, target role and onboarding.

Revision ID: 20261110_0002
Revises: 20261110_0001
Create Date: 2026-11-10
"""

from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20261110_0002"
down_revision: str | None = "20261110_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "user_profiles",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            server_default=sa.text("gen_random_uuid()"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("academic_stream", sa.String(length=100), nullable=True),
        sa.Column("course", sa.String(length=100), nullable=True),
        sa.Column("specialization", sa.String(length=150), nullable=True),
        sa.Column("college", sa.String(length=255), nullable=True),
        sa.Column("current_year", sa.String(length=50), nullable=True),
        sa.Column(
            "experience_level",
            sa.String(length=50),
            nullable=True,
            server_default="Fresher",
        ),
        sa.Column("target_role", sa.String(length=150), nullable=True),
        sa.Column("career_goal", sa.String(length=255), nullable=True),
        sa.Column(
            "preferred_language",
            sa.String(length=50),
            nullable=False,
            server_default="English",
        ),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("avatar_url", sa.String(length=500), nullable=True),
        sa.Column(
            "onboarding_completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_user_profiles")),
        sa.UniqueConstraint("user_id", name=op.f("uq_user_profiles_user_id")),
    )
    op.create_index(
        op.f("ix_user_profiles_user_id"), "user_profiles", ["user_id"], unique=True
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_user_profiles_user_id"), table_name="user_profiles")
    op.drop_table("user_profiles")
