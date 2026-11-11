"""Grant verified admin access to the configured founder account.

Run only after the founder has created and verified their account:
    python -m scripts.grant_founder_access
"""

from __future__ import annotations

import asyncio

from app.core.config import get_settings
from app.db.session import dispose_engine, get_session_factory
from app.models.user import User, UserRole
from sqlalchemy import select


async def main() -> None:
    settings = get_settings()
    if not settings.founder_email.strip():
        raise RuntimeError("FOUNDER_EMAIL must be configured before granting access.")

    factory = get_session_factory()
    async with factory() as session:
        result = await session.execute(
            select(User).where(User.email == settings.founder_email.lower().strip())
        )
        user = result.scalar_one_or_none()
        if user is None:
            raise RuntimeError(
                "The founder account does not exist yet. "
                "Sign up before running this command."
            )
        user.role = UserRole.admin
        user.is_verified = True
        await session.commit()
        print(f"Founder admin access granted to {user.email}.")

    await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
