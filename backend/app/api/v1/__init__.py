"""Version 1 of the public API."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, billing, health, interviews, profile

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])

__all__ = ["api_router"]
