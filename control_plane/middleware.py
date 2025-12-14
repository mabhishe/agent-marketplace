"""
Middleware for Control Plane FastAPI application.
Handles authentication, error handling, and request logging.
"""

import json
import logging
import time
import uuid
from typing import Callable

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log all incoming requests and responses."""

    async def dispatch(self, request: Request, call_next: Callable):
        """Log request and response details."""
        # Generate request ID
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Log request
        start_time = time.time()
        logger.info(
            f"[{request_id}] {request.method} {request.url.path}",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "query": request.url.query,
            },
        )

        # Call next middleware/endpoint
        response = await call_next(request)

        # Log response
        duration = time.time() - start_time
        logger.info(
            f"[{request_id}] {request.method} {request.url.path} - {response.status_code} ({duration:.2f}s)",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_seconds": duration,
            },
        )

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id
        return response


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Authentication middleware.
    Validates JWT tokens and extracts user information.
    """

    # Public endpoints that don't require authentication
    PUBLIC_PATHS = [
        "/api/v1/health",
        "/health",
        "/api/docs",
        "/api/openapi.json",
        "/api/v1/agents",  # GET /agents is public
    ]

    async def dispatch(self, request: Request, call_next: Callable):
        """Validate authentication for protected endpoints."""
        # Skip authentication for public endpoints
        if request.url.path in self.PUBLIC_PATHS or request.method == "OPTIONS":
            return await call_next(request)

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing authorization header"},
            )

        try:
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"detail": "Invalid authorization scheme"},
                )

            # TODO: Validate JWT token and extract user info
            # For now, just pass through
            request.state.user = {"id": "user-123", "role": "admin"}

        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authorization header"},
            )

        return await call_next(request)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global error handling middleware.
    Catches exceptions and returns proper error responses.
    """

    async def dispatch(self, request: Request, call_next: Callable):
        """Handle exceptions globally."""
        try:
            response = await call_next(request)
            return response
        except Exception as exc:
            request_id = getattr(request.state, "request_id", "unknown")
            logger.error(
                f"[{request_id}] Unhandled exception: {exc}",
                exc_info=True,
                extra={
                    "request_id": request_id,
                    "path": request.url.path,
                    "method": request.method,
                },
            )

            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "detail": "Internal server error",
                    "request_id": request_id,
                },
            )
