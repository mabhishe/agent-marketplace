# FastAPI Control Plane Implementation Guide

Complete guide to the FastAPI-based Control Plane for the Agent Marketplace Platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [API Endpoints](#api-endpoints)
5. [Database Models](#database-models)
6. [Authentication & Authorization](#authentication--authorization)
7. [A2A Protocol](#a2a-protocol)
8. [Deployment](#deployment)
9. [Testing](#testing)

---

## Architecture Overview

### Control Plane (FastAPI)

The Control Plane is a multi-tenant FastAPI application that serves as the central hub for:

- **Agent Marketplace** - Browse, search, and install agents
- **Deployment Orchestration** - Manage SaaS and BYOC deployments
- **Billing & Subscriptions** - Handle payments and usage tracking
- **Approval Workflows** - Human-in-the-loop for critical actions
- **Telemetry & Monitoring** - Collect metrics and logs

### Communication Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Control Plane (FastAPI)                  │
│  - Agent Registry                                            │
│  - Deployment Manager                                        │
│  - Billing System                                            │
│  - Approval Workflows                                        │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ HTTPS (Outbound Only)
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼────────────┐          ┌──────────▼────────┐
│  Data Plane (SaaS) │          │ Data Plane (BYOC) │
│  - Cloud Run       │          │ - Customer K8s    │
│  - LangGraph       │          │ - LangGraph       │
│  - Agent Execution │          │ - Agent Execution │
└────────────────────┘          └───────────────────┘
```

**Key Principle:** Data Plane initiates all communication with Control Plane over HTTPS. Control Plane never pushes to Data Plane.

---

## Project Structure

```
control_plane/
├── __init__.py
├── main.py                 # FastAPI application entry point
├── config.py              # Configuration management
├── database.py            # Database setup and sessions
├── middleware.py          # Custom middleware
├── schemas.py             # Pydantic models
├── observability.py       # OpenTelemetry setup
├── routers/
│   ├── __init__.py
│   ├── health.py          # Health check endpoints
│   ├── agents.py          # Agent marketplace endpoints
│   ├── deployments.py     # Deployment management
│   ├── billing.py         # Billing and subscriptions
│   ├── approvals.py       # Approval workflows
│   └── telemetry.py       # Metrics and logs
├── models/
│   ├── __init__.py
│   ├── agent.py           # Agent ORM models
│   ├── deployment.py      # Deployment ORM models
│   ├── billing.py         # Billing ORM models
│   └── user.py            # User ORM models
├── services/
│   ├── __init__.py
│   ├── agent_service.py   # Agent business logic
│   ├── deployment_service.py
│   ├── billing_service.py
│   └── approval_service.py
└── tests/
    ├── __init__.py
    ├── test_agents.py
    ├── test_deployments.py
    └── test_billing.py
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- PostgreSQL 13+
- Google Cloud account (for Firestore, Cloud Run)

### Installation

```bash
# Clone repository
git clone https://github.com/mabhishe/agent-marketplace
cd agent-marketplace

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements-fastapi.txt

# Create .env file
cp .env.fastapi.example .env.local
# Edit .env.local with your configuration
```

### Running the Server

```bash
# Development
python -m uvicorn control_plane.main:app --reload --host 0.0.0.0 --port 8000

# Production
python -m uvicorn control_plane.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### API Documentation

- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI JSON: http://localhost:8000/api/openapi.json

---

## API Endpoints

### Health Checks

```
GET  /health              - Health check
GET  /health/ready        - Readiness check
GET  /health/live         - Liveness check
```

### Agent Marketplace

```
GET    /api/v1/agents                    - List agents (public)
GET    /api/v1/agents/{agent_id}         - Get agent details (public)
POST   /api/v1/agents                    - Create agent (developer)
PUT    /api/v1/agents/{agent_id}         - Update agent (developer)
DELETE /api/v1/agents/{agent_id}         - Delete agent (developer)
POST   /api/v1/agents/{agent_id}/publish - Publish agent (admin)
GET    /api/v1/agents/search             - Search agents (public)
```

### Deployments

```
POST   /api/v1/orgs/{org_id}/install     - Start installation
GET    /api/v1/orgs/{org_id}/deployments - List deployments
GET    /api/v1/deployments/{id}          - Get deployment details
```

### Billing

```
POST   /api/v1/orgs/{org_id}/subscriptions - Create subscription
GET    /api/v1/orgs/{org_id}/subscriptions - List subscriptions
GET    /api/v1/orgs/{org_id}/billing       - Get billing info
```

### Approvals

```
GET    /api/v1/orgs/{org_id}/approvals   - List approvals
POST   /api/v1/orgs/{org_id}/approve     - Approve action
POST   /api/v1/orgs/{org_id}/reject      - Reject action
```

### Telemetry

```
GET    /api/v1/orgs/{org_id}/telemetry   - Get telemetry data
GET    /api/v1/orgs/{org_id}/metrics     - Get metrics
GET    /api/v1/orgs/{org_id}/logs        - Get logs
GET    /api/v1/metrics                   - Prometheus metrics
```

---

## Database Models

### Agent

```python
class Agent(Base):
    __tablename__ = "agents"
    
    id: int
    agent_id: str (unique)
    name: str
    description: str
    version: str
    status: AgentStatus
    category: str
    tags: List[str]
    manifest: JSON
    container_image: str
    helm_chart_url: str
    rating: float
    review_count: int
    price: float
    risk_level: str
    developer_id: int (FK)
    created_at: datetime
    updated_at: datetime
```

### Deployment

```python
class Deployment(Base):
    __tablename__ = "deployments"
    
    id: int
    user_id: int (FK)
    agent_id: int (FK)
    deployment_type: DeploymentType
    status: DeploymentStatus
    cloud_provider: str
    config: JSON
    namespace: str
    created_at: datetime
    updated_at: datetime
```

### Subscription

```python
class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id: int
    user_id: int (FK)
    agent_id: int (FK)
    billing_model: BillingModel
    price: float
    status: str
    stripe_customer_id: str
    created_at: datetime
    updated_at: datetime
```

---

## Authentication & Authorization

### JWT Tokens

```python
# Token structure
{
    "sub": "user-123",
    "org_id": "org-456",
    "role": "admin",
    "exp": 1234567890
}
```

### Roles

- **user** - Regular user, can install agents
- **developer** - Can create and manage agents
- **admin** - Can approve agents, manage billing
- **operator** - Can manage deployments

### Protected Endpoints

```python
from fastapi import Depends
from control_plane.auth import get_current_user

@app.post("/api/v1/agents")
async def create_agent(
    agent: AgentCreate,
    current_user: User = Depends(get_current_user)
):
    # Only authenticated users can create agents
    pass
```

---

## A2A Protocol

### Message Format

```json
{
  "task_id": "uuid",
  "from": "BillingNormalizer:v1.0",
  "to": "AnomalyDetector:v1.1",
  "payload_ref": "gs://org-bucket/audit/normalized-2025-12-01.json",
  "status": "completed",
  "meta": {
    "run_start": "2025-12-01T09:00:00Z",
    "run_end": "2025-12-01T09:01:40Z"
  }
}
```

### Agent Registry

```python
# Register agent with Control Plane
POST /api/v1/agents/register
{
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "version": "1.0.0",
  "endpoint": "https://data-plane.example.com/agents/billing-normalizer"
}
```

### Message Routing

```python
# Data Plane polls for messages
GET /api/v1/agents/{agent_id}/messages?limit=10

# Data Plane sends results
POST /api/v1/agents/{agent_id}/results
{
  "task_id": "uuid",
  "status": "completed",
  "output": {...}
}
```

---

## Deployment

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements-fastapi.txt .
RUN pip install -r requirements-fastapi.txt

COPY control_plane/ ./control_plane/

CMD ["uvicorn", "control_plane.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Google Cloud Run

```bash
# Build and deploy
gcloud run deploy control-plane \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$DATABASE_URL,STRIPE_API_KEY=$STRIPE_API_KEY
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: control-plane
spec:
  replicas: 3
  selector:
    matchLabels:
      app: control-plane
  template:
    metadata:
      labels:
        app: control-plane
    spec:
      containers:
      - name: control-plane
        image: gcr.io/project/control-plane:1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: control-plane-secrets
              key: database-url
```

---

## Testing

### Unit Tests

```python
import pytest
from fastapi.testclient import TestClient
from control_plane.main import app

client = TestClient(app)

def test_list_agents():
    response = client.get("/api/v1/agents")
    assert response.status_code == 200
    assert "results" in response.json()

def test_create_agent():
    agent_data = {
        "manifest": {...},
        "container_image": "gcr.io/...",
    }
    response = client.post("/api/v1/agents", json=agent_data)
    assert response.status_code == 201
```

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=control_plane

# Run specific test
pytest control_plane/tests/test_agents.py::test_list_agents
```

---

## Next Steps

1. **Implement ORM Models** - Create SQLAlchemy models for all entities
2. **Implement Services** - Business logic layer
3. **Add Authentication** - JWT token validation
4. **Implement A2A Protocol** - Agent-to-agent communication
5. **Add Observability** - OpenTelemetry instrumentation
6. **Write Tests** - Comprehensive test coverage
7. **Deploy** - Deploy to production

---

**Last Updated:** December 2025  
**Version:** 1.0.0
