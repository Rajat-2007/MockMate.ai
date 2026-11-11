"""Health endpoints.

- ``/health``      full readiness: probes PostgreSQL and Redis when configured
- ``/health/live`` liveness only: never touches a dependency
"""

from __future__ import annotations

from fastapi import APIRouter, Request, Response, status

from app.core.config import Settings
from app.schemas.health import HealthResponse, LivenessResponse
from app.services.health import collect_health

router = APIRouter()


@router.get(
    "",
    response_model=HealthResponse,
    summary="Readiness of the API and its dependencies",
    responses={
        status.HTTP_503_SERVICE_UNAVAILABLE: {
            "description": "At least one configured dependency is unreachable."
        }
    },
)
async def health(request: Request, response: Response) -> HealthResponse:
    settings: Settings = request.app.state.settings
    result = await collect_health(settings)

    if result.status == "degraded":
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return result


@router.get(
    "/live",
    response_model=LivenessResponse,
    summary="Liveness probe",
)
async def live(request: Request) -> LivenessResponse:
    settings: Settings = request.app.state.settings
    return LivenessResponse(service=settings.app_name)
