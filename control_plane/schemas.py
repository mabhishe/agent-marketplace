"""
Pydantic models for API request/response validation.
Defines the contract between Control Plane and clients.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl


# Enums
class AgentStatus(str, Enum):
    """Agent status values."""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    PUBLISHED = "published"
    DEPRECATED = "deprecated"


class DeploymentType(str, Enum):
    """Deployment type values."""
    SAAS = "saas"
    BYOC = "byoc"


class DeploymentStatus(str, Enum):
    """Deployment status values."""
    PENDING = "pending"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    STOPPED = "stopped"


class BillingModel(str, Enum):
    """Billing model values."""
    PER_TASK = "per_task"
    MONTHLY = "monthly"
    PER_AGENT = "per_agent"


class ApprovalStatus(str, Enum):
    """Approval status values."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# Agent Models
class AgentToolInput(BaseModel):
    """Input specification for an agent tool."""
    name: str
    type: str
    description: str
    required: bool = False


class AgentToolOutput(BaseModel):
    """Output specification for an agent tool."""
    name: str
    type: str
    description: str


class AgentTool(BaseModel):
    """Agent tool definition."""
    name: str
    vendor: str
    description: str
    inputs: List[AgentToolInput]
    outputs: List[AgentToolOutput]
    permissions: List[str]


class AgentPermission(BaseModel):
    """Permission required by an agent."""
    resource: str
    scope: str
    description: str


class AgentManifest(BaseModel):
    """Complete agent manifest."""
    agent_id: str
    name: str
    version: str
    description: str
    author: str
    category: str
    tags: List[str]
    tools: List[AgentTool]
    permissions: List[AgentPermission]
    constraints: List[str]
    risk_level: str


class AgentCreate(BaseModel):
    """Request to create a new agent."""
    manifest: AgentManifest
    container_image: str
    helm_chart_url: Optional[str] = None


class AgentUpdate(BaseModel):
    """Request to update an agent."""
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    manifest: Optional[AgentManifest] = None


class AgentResponse(BaseModel):
    """Agent response model."""
    id: int
    agent_id: str
    name: str
    description: str
    version: str
    status: AgentStatus
    category: str
    tags: List[str]
    rating: float
    review_count: int
    price: float
    risk_level: str
    developer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Deployment Models
class DeploymentCreate(BaseModel):
    """Request to create a new deployment."""
    agent_id: int
    deployment_type: DeploymentType
    cloud_provider: Optional[str] = None
    config: Dict[str, Any] = {}
    namespace: Optional[str] = None
    scheduling_config: Optional[Dict[str, Any]] = None


class DeploymentUpdate(BaseModel):
    """Request to update a deployment."""
    config: Optional[Dict[str, Any]] = None
    namespace: Optional[str] = None
    scheduling_config: Optional[Dict[str, Any]] = None


class DeploymentResponse(BaseModel):
    """Deployment response model."""
    id: int
    user_id: int
    agent_id: int
    deployment_type: DeploymentType
    status: DeploymentStatus
    cloud_provider: Optional[str]
    config: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Approval Models
class ApprovalCreate(BaseModel):
    """Request to create an approval."""
    agent_id: int
    approval_type: str
    description: str


class ApprovalResponse(BaseModel):
    """Approval response model."""
    id: int
    agent_id: int
    approval_type: str
    status: ApprovalStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Billing Models
class SubscriptionCreate(BaseModel):
    """Request to create a subscription."""
    agent_id: int
    billing_model: BillingModel
    price: float


class SubscriptionResponse(BaseModel):
    """Subscription response model."""
    id: int
    user_id: int
    agent_id: int
    billing_model: BillingModel
    price: float
    status: str
    stripe_customer_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Telemetry Models
class MetricPoint(BaseModel):
    """Single metric data point."""
    timestamp: datetime
    value: float
    labels: Dict[str, str] = {}


class MetricsResponse(BaseModel):
    """Metrics response model."""
    metric_name: str
    points: List[MetricPoint]


class LogEntry(BaseModel):
    """Log entry model."""
    timestamp: datetime
    level: str
    message: str
    fields: Dict[str, Any] = {}
    trace_id: Optional[str] = None


class LogsResponse(BaseModel):
    """Logs response model."""
    entries: List[LogEntry]
    total_count: int


# Error Models
class ErrorResponse(BaseModel):
    """Error response model."""
    detail: str
    error_code: Optional[str] = None
    request_id: Optional[str] = None


# Health Models
class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    service: str
    version: str
    timestamp: datetime
    dependencies: Dict[str, str] = {}
