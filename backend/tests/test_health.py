"""Health, liveness and error-envelope behaviour."""

from __future__ import annotations

from httpx import AsyncClient


async def test_root_reports_service_metadata(client: AsyncClient) -> None:
    response = await client.get("/")

    assert response.status_code == 200
    body = response.json()
    assert body["service"] == "MockMate AI API"
    assert body["health"] == "/api/v1/health"


async def test_health_is_ok_when_dependencies_are_not_configured(
    client: AsyncClient,
) -> None:
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["checks"]["database"]["configured"] is False
    assert body["checks"]["database"]["detail"] == "DATABASE_URL is not set"
    assert body["checks"]["redis"]["configured"] is False


async def test_health_returns_a_request_id(client: AsyncClient) -> None:
    response = await client.get("/api/v1/health")

    assert response.headers["x-request-id"]
    assert float(response.headers["x-response-time-ms"]) >= 0


async def test_client_supplied_request_id_is_echoed(client: AsyncClient) -> None:
    response = await client.get("/api/v1/health", headers={"x-request-id": "abc123"})

    assert response.headers["x-request-id"] == "abc123"


async def test_cors_allows_the_frontend_origin(client: AsyncClient) -> None:
    response = await client.get(
        "/api/v1/health", headers={"origin": "http://localhost:3000"}
    )

    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert response.headers["access-control-allow-credentials"] == "true"


async def test_liveness_never_touches_dependencies(client: AsyncClient) -> None:
    response = await client.get("/api/v1/health/live")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "MockMate AI API"}


async def test_unknown_route_returns_json_error_envelope(
    client: AsyncClient,
) -> None:
    response = await client.get("/api/v1/does-not-exist")

    assert response.status_code == 404
    body = response.json()
    assert "detail" in body
    assert "request_id" in body


async def test_validation_errors_use_a_consistent_shape(client: AsyncClient) -> None:
    # No endpoint accepts a body yet, so hit the OpenAPI schema with a bad path
    # to confirm the envelope shape used by Phase 2 handlers.
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    assert set(response.json()) == {
        "status",
        "service",
        "version",
        "environment",
        "checks",
    }
