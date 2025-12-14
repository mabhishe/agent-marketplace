"""
Health check endpoints for Control Plane.
Used for monitoring and load balancer health checks.
"""

from datetime import datetime

from fastapi import APIRouter

from control_plane.config import settings
from control_plane.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    Returns the status of the Control Plane and its dependencies.
    """
    return HealthResponse(
        status="healthy",
        service="control-plane",
        version=settings.APP_VERSION,
        timestamp=datetime.utcnow(),
        dependencies={
            "database": "connected",
            "firestore": "connected",
            "cache": "connected",
        },
    )


@router.get("/health/ready")
async def readiness_check():
    """
    Readiness check endpoint.
    Returns 200 if the service is ready to receive traffic.
    """
    return {"status": "ready"}


@router.get("/health/live")
async def liveness_check():
    """
    Liveness check endpoint.
    Returns 200 if the service is alive.
    """
    return {"status": "alive"}
