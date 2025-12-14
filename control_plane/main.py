"""
Agent Marketplace Platform - Control Plane

Multi-tenant FastAPI application for managing agent marketplace,
deployments, and billing. Acts as the central hub for all platform operations.

Architecture:
- Control Plane: This service (FastAPI)
- Data Plane: Separate service(s) that execute agents
- Communication: HTTPS only (outbound from Data Plane)
"""

import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from pydantic_settings import BaseSettings

from control_plane.config import settings
from control_plane.database import init_db, get_session
from control_plane.middleware import (
    AuthMiddleware,
    ErrorHandlerMiddleware,
    RequestLoggingMiddleware,
)
from control_plane.routers import (
    agents,
    deployments,
    billing,
    approvals,
    telemetry,
    health,
)
from control_plane.observability import setup_observability

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting Control Plane...")
    await init_db()
    setup_observability()
    logger.info("Control Plane started successfully")

    yield

    # Shutdown
    logger.info("Shutting down Control Plane...")
    logger.info("Control Plane shutdown complete")


# Create FastAPI application
app = FastAPI(
    title="Agent Marketplace Platform - Control Plane",
    description="Multi-tenant API for agent marketplace, deployments, and billing",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Add middleware (order matters - added in reverse order of execution)
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(AuthMiddleware)


# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(agents.router, prefix="/api/v1", tags=["agents"])
app.include_router(deployments.router, prefix="/api/v1", tags=["deployments"])
app.include_router(billing.router, prefix="/api/v1", tags=["billing"])
app.include_router(approvals.router, prefix="/api/v1", tags=["approvals"])
app.include_router(telemetry.router, prefix="/api/v1", tags=["telemetry"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - returns API information."""
    return {
        "name": "Agent Marketplace Platform - Control Plane",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs",
        "openapi": "/api/openapi.json",
    }


# Health check endpoint
@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "service": "control-plane"}


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "control_plane.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
