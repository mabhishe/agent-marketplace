"""
Configuration management for Control Plane.
Loads settings from environment variables and provides defaults.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Agent Marketplace Platform - Control Plane"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_HOSTS: List[str] = ["*"]
    CORS_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/agent_marketplace"
    DATABASE_ECHO: bool = False
    DATABASE_POOL_SIZE: int = 20
    DATABASE_MAX_OVERFLOW: int = 10

    # Firestore
    FIRESTORE_PROJECT_ID: str = ""
    FIRESTORE_CREDENTIALS_PATH: Optional[str] = None

    # Google Cloud
    GCP_PROJECT_ID: str = ""
    GCP_REGION: str = "us-central1"

    # Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # OAuth
    OAUTH_PROVIDER_URL: str = "https://api.manus.im"
    OAUTH_CLIENT_ID: str = ""
    OAUTH_CLIENT_SECRET: str = ""

    # Stripe
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    # Observability
    ENABLE_TRACING: bool = True
    ENABLE_METRICS: bool = True
    JAEGER_ENABLED: bool = False
    JAEGER_HOST: str = "localhost"
    JAEGER_PORT: int = 6831

    # Data Plane
    DATA_PLANE_URL: str = "http://localhost:8001"
    DATA_PLANE_TIMEOUT_SECONDS: int = 300

    # Agent Registry
    AGENT_REGISTRY_CACHE_TTL_SECONDS: int = 3600
    MAX_AGENT_EXECUTION_TIME_SECONDS: int = 3600

    # Memory System
    TASK_MEMORY_RETENTION_DAYS: int = 30
    EPISODE_MEMORY_RETENTION_DAYS: int = 90
    VECTOR_DB_SIMILARITY_THRESHOLD: float = 0.7

    # Billing
    BILLING_CYCLE_DAY: int = 1
    PAYMENT_RETRY_ATTEMPTS: int = 3
    PAYMENT_RETRY_DELAY_SECONDS: int = 60

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    class Config:
        env_file = ".env.local"
        case_sensitive = True


# Global settings instance
settings = Settings()
