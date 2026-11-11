"""Application settings loaded from environment variables."""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["local", "development", "staging", "production"]

DEFAULT_SECRET = "change-me-use-a-long-random-string"


class Settings(BaseSettings):
    """Typed view over the process environment.

    Every integration is optional at boot: an empty URL or key puts that
    integration into an explicit "not configured" state instead of crashing.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "MockMate AI API"
    version: str = "0.1.0"
    environment: Environment = "local"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    secret_key: str = DEFAULT_SECRET
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    refresh_token_expire_days: int = 7
    backend_cors_origins: str = "http://localhost:3000"

    database_url: str = ""
    db_echo: bool = False

    redis_url: str = ""

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"

    llm_base_url: str = "https://api.openai.com/v1"
    llm_api_key: str = ""
    llm_model: str = "gpt-4o-mini"
    llm_timeout_seconds: float = Field(default=60.0, gt=0, le=300)

    storage_backend: Literal["local", "s3"] = "local"
    upload_dir: str = "./storage"

    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""
    razorpay_webhook_secret: str = ""
    razorpay_base_url: str = "https://api.razorpay.com/v1"
    founder_email: str = "founder@example.com"

    @property
    def cors_origins(self) -> list[str]:
        """Parse the comma-separated origin list."""
        return [
            origin.strip()
            for origin in self.backend_cors_origins.split(",")
            if origin.strip()
        ]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def docs_url(self) -> str | None:
        """Interactive docs stay off in production."""
        return None if self.is_production else "/docs"

    @property
    def openapi_url(self) -> str | None:
        return None if self.is_production else f"{self.api_v1_prefix}/openapi.json"

    def assert_production_safe(self) -> None:
        """Fail fast on unsafe defaults instead of shipping them."""
        if not self.is_production:
            return

        problems: list[str] = []
        if self.secret_key == DEFAULT_SECRET or len(self.secret_key) < 32:
            problems.append("SECRET_KEY is missing or shorter than 32 characters")
        if "*" in self.cors_origins:
            problems.append("BACKEND_CORS_ORIGINS allows every origin")
        if self.debug:
            problems.append("DEBUG must be false in production")

        if problems:
            raise RuntimeError(
                "Unsafe production configuration: " + "; ".join(problems)
            )

    def integration_status(self) -> dict[str, bool]:
        """Which optional integrations have enough configuration to be used."""
        return {
            "database": bool(self.database_url),
            "redis": bool(self.redis_url),
            "llm": bool(
                (self.llm_base_url and self.llm_api_key and self.llm_model)
                or (self.ollama_base_url and self.ollama_model)
            ),
            "payments": bool(
                self.razorpay_key_id
                and self.razorpay_key_secret
                and self.razorpay_webhook_secret
            ),
        }


@lru_cache
def get_settings() -> Settings:
    """Cached settings accessor (one read of the environment per process)."""
    return Settings()
