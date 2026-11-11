"""Dependency probes for the health endpoint.

No secrets are ever returned: errors are truncated to a short summary.
"""

from __future__ import annotations

import asyncio
import logging
import time

from redis.asyncio import Redis
from sqlalchemy import text

from app.core.config import Settings
from app.db.session import DatabaseNotConfiguredError, get_engine
from app.schemas.health import DependencyCheck, HealthResponse

logger = logging.getLogger("app.health")

PROBE_TIMEOUT_SECONDS = 2.0
MAX_DETAIL_LENGTH = 160


def _summarise(error: BaseException) -> str:
    message = str(error).strip() or error.__class__.__name__
    return message[:MAX_DETAIL_LENGTH]


async def check_database(settings: Settings) -> DependencyCheck:
    if not settings.database_url:
        return DependencyCheck(
            configured=False,
            ok=False,
            detail="DATABASE_URL is not set",
        )

    started = time.perf_counter()
    try:
        engine = get_engine()
        async with asyncio.timeout(PROBE_TIMEOUT_SECONDS):
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
    except DatabaseNotConfiguredError as error:
        return DependencyCheck(configured=False, ok=False, detail=_summarise(error))
    except Exception as error:
        logger.warning(
            "database health check failed", extra={"error": _summarise(error)}
        )
        return DependencyCheck(
            configured=True,
            ok=False,
            latency_ms=round((time.perf_counter() - started) * 1000, 1),
            detail=_summarise(error),
        )

    return DependencyCheck(
        configured=True,
        ok=True,
        latency_ms=round((time.perf_counter() - started) * 1000, 1),
    )


async def check_redis(settings: Settings) -> DependencyCheck:
    if not settings.redis_url:
        return DependencyCheck(
            configured=False,
            ok=False,
            detail="REDIS_URL is not set",
        )

    started = time.perf_counter()
    client = Redis.from_url(
        settings.redis_url,
        socket_connect_timeout=PROBE_TIMEOUT_SECONDS,
        socket_timeout=PROBE_TIMEOUT_SECONDS,
    )
    try:
        async with asyncio.timeout(PROBE_TIMEOUT_SECONDS):
            await client.ping()
    except Exception as error:
        logger.warning("redis health check failed", extra={"error": _summarise(error)})
        return DependencyCheck(
            configured=True,
            ok=False,
            latency_ms=round((time.perf_counter() - started) * 1000, 1),
            detail=_summarise(error),
        )
    finally:
        await client.aclose()

    return DependencyCheck(
        configured=True,
        ok=True,
        latency_ms=round((time.perf_counter() - started) * 1000, 1),
    )


async def collect_health(settings: Settings) -> HealthResponse:
    database, cache = await asyncio.gather(
        check_database(settings),
        check_redis(settings),
    )

    checks = {"database": database, "redis": cache}
    degraded = any(check.configured and not check.ok for check in checks.values())

    return HealthResponse(
        status="degraded" if degraded else "ok",
        service=settings.app_name,
        version=settings.version,
        environment=settings.environment,
        checks=checks,
    )
