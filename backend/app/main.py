"""FastAPI application factory.

Run locally with: ``uvicorn app.main:app --reload --port 8000``
"""

from __future__ import annotations

import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1 import api_router
from app.core.config import Settings, get_settings
from app.core.logging import configure_logging, request_id_var
from app.core.middleware import RequestContextMiddleware
from app.db.session import DatabaseNotConfiguredError, dispose_engine

logger = logging.getLogger("app")


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or get_settings()
    configure_logging(resolved.environment, resolved.debug)
    resolved.assert_production_safe()

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        logger.info(
            "service starting",
            extra={
                "environment": resolved.environment,
                "version": resolved.version,
                "integrations": resolved.integration_status(),
            },
        )
        try:
            from app.db.session import init_db
            await init_db()
            logger.info("database tables initialized")
        except Exception as exc:
            logger.warning("database init deferred: %s", exc)
        yield
        await dispose_engine()
        logger.info("service stopped")

    app = FastAPI(
        title=resolved.app_name,
        version=resolved.version,
        summary="AI mock interviews, evaluation and reports.",
        docs_url=resolved.docs_url,
        redoc_url=None,
        openapi_url=resolved.openapi_url,
        lifespan=lifespan,
    )
    app.state.settings = resolved

    app.add_middleware(RequestContextMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["x-request-id", "x-response-time-ms"],
    )

    app.include_router(api_router, prefix=resolved.api_v1_prefix)

    @app.get("/", include_in_schema=False)
    async def root() -> dict[str, str]:
        return {
            "service": resolved.app_name,
            "version": resolved.version,
            "health": f"{resolved.api_v1_prefix}/health",
            "docs": resolved.docs_url or "disabled",
        }

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        _: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "detail": exc.detail,
                "request_id": request_id_var.get(),
            },
            headers=getattr(exc, "headers", None),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        _: Request, exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "detail": "Request validation failed",
                "errors": jsonable_encoder(exc.errors()),
                "request_id": request_id_var.get(),
            },
        )

    @app.exception_handler(DatabaseNotConfiguredError)
    async def database_not_configured_handler(
        _: Request, exc: DatabaseNotConfiguredError
    ) -> JSONResponse:
        logger.warning("database access attempted without configuration")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "detail": str(exc),
                "request_id": request_id_var.get(),
            },
        )

    return app


app = create_app()
