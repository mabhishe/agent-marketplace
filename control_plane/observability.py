"""
Observability setup for Control Plane.
Configures OpenTelemetry for tracing, metrics, and logging.
"""

import logging
from typing import Optional

from opentelemetry import trace, metrics
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.exporter.prometheus import PrometheusMetricReader
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.exporter.gcp_trace import CloudTraceExporter
from prometheus_client import Counter, Histogram, Gauge

from control_plane.config import settings

logger = logging.getLogger(__name__)


def setup_observability():
    """Initialize OpenTelemetry instrumentation."""
    if settings.ENVIRONMENT == "production":
        setup_production_observability()
    else:
        setup_development_observability()


def setup_production_observability():
    """Setup observability for production environment."""
    logger.info("Setting up production observability...")

    # Configure tracing with Google Cloud Trace
    if settings.ENABLE_TRACING:
        cloud_trace_exporter = CloudTraceExporter(
            project_id=settings.GCP_PROJECT_ID
        )
        trace_provider = TracerProvider()
        trace_provider.add_span_processor(
            BatchSpanProcessor(cloud_trace_exporter)
        )
        trace.set_tracer_provider(trace_provider)

        # Instrument FastAPI
        FastAPIInstrumentor().instrument()

        # Instrument SQLAlchemy
        SQLAlchemyInstrumentor().instrument()

        logger.info("Tracing configured with Google Cloud Trace")

    # Configure metrics
    if settings.ENABLE_METRICS:
        prometheus_reader = PrometheusMetricReader()
        meter_provider = MeterProvider(metric_readers=[prometheus_reader])
        metrics.set_meter_provider(meter_provider)
        logger.info("Metrics configured with Prometheus")


def setup_development_observability():
    """Setup observability for development environment."""
    logger.info("Setting up development observability...")

    # Configure tracing with Jaeger (if enabled)
    if settings.JAEGER_ENABLED:
        jaeger_exporter = JaegerExporter(
            agent_host_name=settings.JAEGER_HOST,
            agent_port=settings.JAEGER_PORT,
        )
        trace_provider = TracerProvider()
        trace_provider.add_span_processor(
            BatchSpanProcessor(jaeger_exporter)
        )
        trace.set_tracer_provider(trace_provider)

        # Instrument FastAPI
        FastAPIInstrumentor().instrument()

        # Instrument SQLAlchemy
        SQLAlchemyInstrumentor().instrument()

        logger.info(
            f"Tracing configured with Jaeger at {settings.JAEGER_HOST}:{settings.JAEGER_PORT}"
        )

    # Configure metrics with Prometheus
    if settings.ENABLE_METRICS:
        prometheus_reader = PrometheusMetricReader()
        meter_provider = MeterProvider(metric_readers=[prometheus_reader])
        metrics.set_meter_provider(meter_provider)
        logger.info("Metrics configured with Prometheus")


# Custom metrics
class ControlPlaneMetrics:
    """Custom metrics for Control Plane."""

    def __init__(self):
        """Initialize custom metrics."""
        # API metrics
        self.api_requests_total = Counter(
            "control_plane_api_requests_total",
            "Total API requests",
            ["method", "endpoint", "status"],
        )

        self.api_request_duration = Histogram(
            "control_plane_api_request_duration_seconds",
            "API request duration",
            ["method", "endpoint"],
        )

        # Agent metrics
        self.agent_runs_total = Counter(
            "control_plane_agent_runs_total",
            "Total agent runs",
            ["agent_id", "status"],
        )

        self.agent_run_duration = Histogram(
            "control_plane_agent_run_duration_seconds",
            "Agent run duration",
            ["agent_id"],
        )

        # Deployment metrics
        self.deployments_active = Gauge(
            "control_plane_deployments_active",
            "Number of active deployments",
        )

        self.deployment_errors_total = Counter(
            "control_plane_deployment_errors_total",
            "Total deployment errors",
            ["error_type"],
        )

        # Billing metrics
        self.billing_transactions_total = Counter(
            "control_plane_billing_transactions_total",
            "Total billing transactions",
            ["status"],
        )

        self.billing_revenue_total = Counter(
            "control_plane_billing_revenue_total",
            "Total revenue",
            ["currency"],
        )

        # Database metrics
        self.db_connections_active = Gauge(
            "control_plane_db_connections_active",
            "Active database connections",
        )

        self.db_query_duration = Histogram(
            "control_plane_db_query_duration_seconds",
            "Database query duration",
            ["operation"],
        )


# Global metrics instance
metrics_instance = ControlPlaneMetrics()


def get_tracer(name: str) -> trace.Tracer:
    """Get a tracer instance."""
    return trace.get_tracer(name)


def get_meter(name: str) -> metrics.Meter:
    """Get a meter instance."""
    return metrics.get_meter(name)
