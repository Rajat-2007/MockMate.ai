"""Shared pytest fixtures.

The app is built with explicit settings so tests never touch a real database,
Redis instance or .env file.
"""

from __future__ import annotations

import pytest
from app.core.config import Settings, get_settings
from app.main import create_app
from httpx import ASGITransport, AsyncClient


@pytest.fixture
def settings() -> Settings:
    return Settings(
        environment="local",
        debug=True,
        secret_key="test-secret-key-that-is-long-enough-for-tests",
        database_url="",
        redis_url="",
        backend_cors_origins="http://localhost:3000",
    )


@pytest.fixture
async def client(settings: Settings) -> AsyncClient:
    get_settings.cache_clear()
    app = create_app(settings)
    transport = ASGITransport(app=app)

    async with AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as async_client:
        yield async_client

    get_settings.cache_clear()
