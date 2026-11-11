"""Settings parsing and production safety rails."""

from __future__ import annotations

import pytest
from app.core.config import DEFAULT_SECRET, Settings


def test_cors_origins_are_split_and_trimmed() -> None:
    settings = Settings(
        backend_cors_origins="http://localhost:3000, https://mockmate.ai ,"
    )

    assert settings.cors_origins == [
        "http://localhost:3000",
        "https://mockmate.ai",
    ]


def test_docs_are_disabled_in_production() -> None:
    settings = Settings(
        environment="production",
        debug=False,
        secret_key="a" * 40,
        backend_cors_origins="https://mockmate.ai",
    )

    assert settings.docs_url is None
    assert settings.openapi_url is None


def test_production_rejects_default_secret() -> None:
    settings = Settings(
        environment="production",
        debug=False,
        secret_key=DEFAULT_SECRET,
        backend_cors_origins="https://mockmate.ai",
    )

    with pytest.raises(RuntimeError) as error:
        settings.assert_production_safe()

    assert "SECRET_KEY" in str(error.value)


def test_production_rejects_wildcard_cors_and_debug() -> None:
    settings = Settings(
        environment="production",
        debug=True,
        secret_key="b" * 40,
        backend_cors_origins="*",
    )

    with pytest.raises(RuntimeError) as error:
        settings.assert_production_safe()

    message = str(error.value)
    assert "BACKEND_CORS_ORIGINS" in message
    assert "DEBUG" in message


def test_local_environment_is_allowed_to_use_defaults() -> None:
    settings = Settings(environment="local")

    settings.assert_production_safe()
    assert settings.is_production is False


def test_integration_status_reflects_configured_credentials() -> None:
    settings = Settings(
        database_url="",
        redis_url="redis://localhost:6379/0",
        llm_api_key="test-key",
    )

    status = settings.integration_status()

    assert status["database"] is False
    assert status["redis"] is True
    assert status["llm"] is True
    assert status["payments"] is False


def test_integration_status_accepts_local_ollama_without_api_key() -> None:
    settings = Settings(
        llm_api_key="",
        ollama_base_url="http://localhost:11434",
        ollama_model="llama3.2:3b",
    )

    assert settings.integration_status()["llm"] is True
