"""
Database configuration and session management for Control Plane.
Uses SQLAlchemy with PostgreSQL for relational data.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base

from control_plane.config import settings

# Database URL for async operations
DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

# Create async engine
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_pre_ping=True,  # Verify connections before using
)

# Create session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

# Base class for ORM models
Base = declarative_base()


async def init_db():
    """Initialize database (create tables if they don't exist)."""
    async with engine.begin() as conn:
        # In production, use Alembic migrations instead
        await conn.run_sync(Base.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database session.
    Usage in FastAPI:
        @app.get("/")
        async def my_endpoint(session: AsyncSession = Depends(get_session)):
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def close_db():
    """Close database connections."""
    await engine.dispose()
