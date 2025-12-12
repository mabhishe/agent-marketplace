# Agent Marketplace Platform - API Specification

**Version:** 1.0.0  
**Base URL:** `https://api.agentmarketplace.com/api/v1`  
**Authentication:** OAuth 2.0 + Service Accounts  

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rate Limiting](#rate-limiting)
3. [Error Handling](#error-handling)
4. [Marketplace Endpoints](#marketplace-endpoints)
5. [Installation Endpoints](#installation-endpoints)
6. [Execution Endpoints](#execution-endpoints)
7. [Approval Endpoints](#approval-endpoints)
8. [Telemetry Endpoints](#telemetry-endpoints)
9. [Memory Endpoints](#memory-endpoints)
10. [Webhook Events](#webhook-events)

---

## Authentication

### OAuth 2.0 Flow

```
POST /oauth/authorize
POST /oauth/token
```

### Service Account Authentication

```
Authorization: Bearer <jwt_token>
X-API-Key: <service_account_key>
```

### JWT Token Format

```json
{
  "sub": "org-123",
  "iss": "https://api.agentmarketplace.com",
  "aud": "agent-marketplace",
  "exp": 1735689600,
  "iat": 1735603200,
  "scope": "agents:read agents:write deployments:write"
}
```

---

## Rate Limiting

### Limits by Plan

| Plan | Requests/Minute | Concurrent Requests |
|------|-----------------|-------------------|
| Starter | 100 | 10 |
| Pro | 1,000 | 100 |
| Enterprise | Unlimited | Unlimited |

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1735603260
```

### Rate Limit Exceeded Response

```
HTTP 429 Too Many Requests

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded",
    "retry_after": 60
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "error details"
    },
    "request_id": "req-123"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication failed |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict |
| RATE_LIMIT_EXCEEDED | 429 | Rate limit exceeded |
| INTERNAL_ERROR | 500 | Server error |

---

## Marketplace Endpoints

### GET /agents

List all available agents in the marketplace.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | - | Filter by category (finops, devops, security) |
| search | string | - | Full-text search |
| limit | number | 20 | Results per page (max 100) |
| offset | number | 0 | Pagination offset |
| sort_by | string | rating | Sort by: rating, price, newest, trending |
| min_rating | number | - | Minimum rating (0-5) |
| max_price | number | - | Maximum price per run |

**Request:**
```bash
GET /agents?category=finops&limit=20&offset=0
```

**Response:**
```json
{
  "agents": [
    {
      "id": "com.aicloud.finops.billing-normalizer",
      "name": "Billing Normalizer",
      "description": "Normalize provider billing data",
      "category": "finops",
      "tags": ["billing", "normalization"],
      "rating": 4.8,
      "reviews_count": 125,
      "price": 0.50,
      "risk_level": "low",
      "author": {
        "name": "AiCloudGuard",
        "contact": "security@aicloudguard.com"
      },
      "icon": "https://cdn.aicloud.com/icons/billing-normalizer.png",
      "installs_count": 450,
      "runs_count": 15000
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0,
  "has_more": true
}
```

**Error Responses:**
```
400 Bad Request - Invalid query parameters
401 Unauthorized - Authentication required
```

---

### GET /agents/{id}

Get detailed information about a specific agent.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID (e.g., com.aicloud.finops.billing-normalizer) |

**Request:**
```bash
GET /agents/com.aicloud.finops.billing-normalizer
```

**Response:**
```json
{
  "id": "com.aicloud.finops.billing-normalizer",
  "name": "Billing Normalizer",
  "version": "1.0.0",
  "description": "Normalize provider billing data into canonical schema",
  "manifest": {
    "inputs": [...],
    "outputs": [...],
    "tools": [...],
    "permissions": [...],
    "constraints": [...]
  },
  "rating": 4.8,
  "reviews": [
    {
      "author": "john@example.com",
      "rating": 5,
      "comment": "Excellent agent, saved us $50K/month",
      "created_at": "2025-12-01T09:00:00Z"
    }
  ],
  "pricing": {
    "model": "per-run",
    "base_price": 0.50,
    "per_record": 0.001
  },
  "sla": {
    "uptime_percent": 99.5,
    "response_time_seconds": 300
  },
  "author": {
    "name": "AiCloudGuard",
    "contact": "security@aicloudguard.com",
    "website": "https://aicloudguard.com"
  },
  "certification": {
    "automated_scans_passed": true,
    "manual_review_id": "rev-2025-001",
    "certified_date": "2025-12-01"
  },
  "installs_count": 450,
  "runs_count": 15000,
  "created_at": "2025-10-01T00:00:00Z",
  "updated_at": "2025-12-01T00:00:00Z"
}
```

**Error Responses:**
```
401 Unauthorized - Authentication required
404 Not Found - Agent not found
```

---

### GET /agents/{id}/reviews

Get reviews for an agent.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | number | 20 | Results per page |
| offset | number | 0 | Pagination offset |
| sort_by | string | recent | Sort by: recent, helpful, rating |

**Response:**
```json
{
  "reviews": [
    {
      "id": "rev-123",
      "author": "john@example.com",
      "rating": 5,
      "comment": "Excellent agent, saved us $50K/month",
      "helpful_count": 12,
      "created_at": "2025-12-01T09:00:00Z"
    }
  ],
  "total": 125,
  "average_rating": 4.8
}
```

---

## Installation Endpoints

### POST /orgs/{org_id}/install

Start agent installation process.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| org_id | string | Organization ID |

**Request Body:**
```json
{
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "deployment_type": "saas",
  "cloud_provider": null,
  "config": {
    "schedule": "0 9 * * *",
    "namespace": "default",
    "thresholds": {
      "cost_spike_percent": 20
    }
  },
  "cloud_credentials": {
    "aws_role_arn": "arn:aws:iam::123456789:role/agent-role"
  }
}
```

**Response:**
```json
{
  "deployment_id": "dep-123",
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "org_id": "org-123",
  "deployment_type": "saas",
  "status": "pending",
  "created_at": "2025-12-01T09:00:00Z",
  "estimated_start_time": "2025-12-01T09:05:00Z"
}
```

**Error Responses:**
```
400 Bad Request - Invalid configuration
401 Unauthorized - Authentication required
403 Forbidden - Insufficient permissions
404 Not Found - Agent or org not found
409 Conflict - Agent already installed
```

---

### GET /orgs/{org_id}/deployments

List all deployments for an organization.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status (pending, running, idle, error) |
| agent_id | string | - | Filter by agent ID |
| limit | number | 20 | Results per page |
| offset | number | 0 | Pagination offset |

**Response:**
```json
{
  "deployments": [
    {
      "deployment_id": "dep-123",
      "agent_id": "com.aicloud.finops.billing-normalizer",
      "agent_name": "Billing Normalizer",
      "deployment_type": "saas",
      "status": "running",
      "last_run": {
        "run_id": "run-456",
        "status": "completed",
        "created_at": "2025-12-01T09:00:00Z",
        "completed_at": "2025-12-01T09:02:00Z"
      },
      "next_run": "2025-12-02T09:00:00Z",
      "created_at": "2025-12-01T08:00:00Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

---

### GET /deployments/{deployment_id}

Get deployment details.

**Response:**
```json
{
  "deployment_id": "dep-123",
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "agent_name": "Billing Normalizer",
  "org_id": "org-123",
  "deployment_type": "saas",
  "status": "running",
  "config": {
    "schedule": "0 9 * * *",
    "namespace": "default",
    "thresholds": {...}
  },
  "statistics": {
    "total_runs": 30,
    "successful_runs": 29,
    "failed_runs": 1,
    "success_rate": 0.9667,
    "avg_duration_seconds": 120,
    "total_cost_saved": 125000
  },
  "created_at": "2025-12-01T08:00:00Z",
  "updated_at": "2025-12-01T09:02:00Z"
}
```

---

### DELETE /deployments/{deployment_id}

Uninstall an agent deployment.

**Response:**
```json
{
  "success": true,
  "deployment_id": "dep-123",
  "uninstalled_at": "2025-12-01T10:00:00Z"
}
```

---

## Execution Endpoints

### POST /agents/{id}/runs

Trigger an agent run.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Agent ID |

**Request Body:**
```json
{
  "deployment_id": "dep-123",
  "inputs": {
    "billing_source": "aws_cur",
    "time_window": "2025-12-01/2025-12-02",
    "include_recommendations": true
  },
  "priority": "normal",
  "timeout_seconds": 3600
}
```

**Response:**
```json
{
  "run_id": "run-456",
  "deployment_id": "dep-123",
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "org_id": "org-123",
  "status": "queued",
  "inputs": {...},
  "created_at": "2025-12-01T09:00:00Z",
  "estimated_start_time": "2025-12-01T09:00:30Z"
}
```

**Error Responses:**
```
400 Bad Request - Invalid inputs
401 Unauthorized - Authentication required
403 Forbidden - Insufficient permissions
404 Not Found - Agent or deployment not found
409 Conflict - Deployment not running
```

---

### GET /agents/{id}/runs/{run_id}

Get run results and logs.

**Response:**
```json
{
  "run_id": "run-456",
  "deployment_id": "dep-123",
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "org_id": "org-123",
  "status": "completed",
  "inputs": {
    "billing_source": "aws_cur",
    "time_window": "2025-12-01/2025-12-02"
  },
  "outputs": {
    "normalized_report": "gs://org-bucket/reports/2025-12-01.json",
    "summary": {
      "total_cost": 125000,
      "anomalies_detected": 3,
      "recommendations_count": 5
    },
    "recommendations": [
      {
        "action": "Terminate unused RDS instance",
        "savings": 5000,
        "risk_level": "low"
      }
    ]
  },
  "logs": [
    {
      "timestamp": "2025-12-01T09:00:00.123Z",
      "level": "info",
      "step": 1,
      "action": "fetch_billing_data",
      "message": "Fetching AWS CUR data",
      "duration_ms": 1240,
      "status": "completed"
    }
  ],
  "metrics": {
    "duration_seconds": 120,
    "memory_used_mb": 512,
    "cost_saved": 5000,
    "success": true
  },
  "created_at": "2025-12-01T09:00:00Z",
  "started_at": "2025-12-01T09:00:30Z",
  "completed_at": "2025-12-01T09:02:00Z"
}
```

---

### GET /agents/{id}/runs

List runs for an agent.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | - | Filter by status (queued, running, completed, failed) |
| limit | number | 20 | Results per page |
| offset | number | 0 | Pagination offset |
| time_range | string | 24h | Time range (1h, 24h, 7d, 30d) |

**Response:**
```json
{
  "runs": [
    {
      "run_id": "run-456",
      "status": "completed",
      "created_at": "2025-12-01T09:00:00Z",
      "completed_at": "2025-12-01T09:02:00Z",
      "duration_seconds": 120,
      "success": true,
      "cost_saved": 5000
    }
  ],
  "total": 30,
  "limit": 20,
  "offset": 0
}
```

---

### GET /agents/{id}/runs/{run_id}/logs

Stream run logs.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| level | string | - | Filter by level (info, warn, error) |
| step | number | - | Filter by step number |
| follow | boolean | false | Stream logs in real-time |

**Response (Streaming):**
```
event: log
data: {"timestamp":"2025-12-01T09:00:00.123Z","level":"info","step":1,"action":"fetch_billing_data","message":"Fetching AWS CUR data"}

event: log
data: {"timestamp":"2025-12-01T09:00:01.456Z","level":"info","step":2,"action":"normalize_data","message":"Normalizing 15000 records"}

event: log
data: {"timestamp":"2025-12-01T09:00:02.789Z","level":"info","step":3,"action":"detect_anomalies","message":"Detected 3 anomalies"}
```

---

## Approval Endpoints

### GET /orgs/{org_id}/approvals

Get pending approvals.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| status | string | pending | Filter by status (pending, approved, rejected) |
| limit | number | 20 | Results per page |
| offset | number | 0 | Pagination offset |

**Response:**
```json
{
  "approvals": [
    {
      "approval_id": "app-789",
      "run_id": "run-456",
      "agent_id": "com.aicloud.finops.billing-normalizer",
      "agent_name": "Billing Normalizer",
      "status": "pending",
      "action": "Terminate unused RDS instance",
      "impact": {
        "cost_savings": 5000,
        "risk_level": "low"
      },
      "created_at": "2025-12-01T09:02:00Z",
      "expires_at": "2025-12-02T09:02:00Z"
    }
  ],
  "total": 3,
  "limit": 20,
  "offset": 0
}
```

---

### POST /orgs/{org_id}/approvals/{approval_id}/approve

Approve a pending action.

**Request Body:**
```json
{
  "approved": true,
  "comments": "Looks good, proceed with remediation"
}
```

**Response:**
```json
{
  "approval_id": "app-789",
  "status": "approved",
  "approved_by": "john@example.com",
  "approved_at": "2025-12-01T10:00:00Z",
  "comments": "Looks good, proceed with remediation"
}
```

---

### POST /orgs/{org_id}/approvals/{approval_id}/reject

Reject a pending action.

**Request Body:**
```json
{
  "approved": false,
  "comments": "Need more analysis before proceeding"
}
```

**Response:**
```json
{
  "approval_id": "app-789",
  "status": "rejected",
  "rejected_by": "john@example.com",
  "rejected_at": "2025-12-01T10:00:00Z",
  "comments": "Need more analysis before proceeding"
}
```

---

## Telemetry Endpoints

### GET /orgs/{org_id}/telemetry

Get organization telemetry and metrics.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| time_range | string | 24h | Time range (1h, 24h, 7d, 30d) |
| metric | string | - | Specific metric to fetch |
| granularity | string | hourly | Granularity (hourly, daily) |

**Response:**
```json
{
  "time_range": "24h",
  "metrics": {
    "run_count": 150,
    "successful_runs": 149,
    "failed_runs": 1,
    "success_rate": 0.9933,
    "avg_duration_seconds": 120,
    "total_cost_saved": 125000,
    "total_cost_spent": 750,
    "roi": 166.67
  },
  "time_series": [
    {
      "timestamp": "2025-12-01T00:00:00Z",
      "run_count": 6,
      "successful_runs": 6,
      "cost_saved": 5000,
      "cost_spent": 30
    }
  ],
  "top_agents": [
    {
      "agent_id": "com.aicloud.finops.billing-normalizer",
      "runs": 50,
      "success_rate": 0.98,
      "cost_saved": 50000
    }
  ]
}
```

---

## Memory Endpoints

### POST /memory/task

Store a task summary.

**Request Body:**
```json
{
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "org_id": "org-123",
  "inputs": {
    "billing_source": "aws_cur",
    "time_window": "2025-12-01/2025-12-02"
  },
  "outputs": {
    "normalized_report": "gs://org-bucket/reports/2025-12-01.json",
    "summary": {...}
  },
  "decisions": [
    "Identified 3 cost anomalies",
    "Recommended terminating unused RDS"
  ],
  "costs_saved": 15000
}
```

**Response:**
```json
{
  "task_id": "task-123",
  "embedding": [0.123, 0.456, ...],
  "stored_at": "2025-12-01T09:00:00Z"
}
```

---

### POST /memory/vector/search

Search vector memory.

**Request Body:**
```json
{
  "namespace": "cost_anomalies",
  "query_embedding": [0.123, 0.456, ...],
  "top_k": 5,
  "threshold": 0.7
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "anom-001",
      "similarity": 0.95,
      "data": {
        "situation": "AWS costs spiked 30% month-over-month",
        "resolution": "Identified unused RDS instances"
      }
    }
  ]
}
```

---

### GET /memory/preferences

Get organization preferences.

**Response:**
```json
{
  "org_id": "org-123",
  "compliance_requirements": [...],
  "budget_rules": {...},
  "automation_settings": {...},
  "alerting_thresholds": {...},
  "access_rules": {...}
}
```

---

### POST /memory/preferences

Update organization preferences.

**Request Body:**
```json
{
  "compliance_requirements": ["no-destructive-operations"],
  "budget_rules": {
    "monthly_budget": 50000,
    "alert_threshold_percent": 80
  },
  "automation_settings": {
    "auto_remediate": false,
    "require_approval": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "updated_at": "2025-12-01T10:00:00Z"
}
```

---

## Webhook Events

### Webhook Payload Format

```json
{
  "event_id": "evt-123",
  "event_type": "agent.run.completed",
  "timestamp": "2025-12-01T09:00:00Z",
  "org_id": "org-123",
  "data": {...}
}
```

### Event Types

**agent.run.started**
```json
{
  "run_id": "run-456",
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "deployment_id": "dep-123",
  "started_at": "2025-12-01T09:00:00Z"
}
```

**agent.run.completed**
```json
{
  "run_id": "run-456",
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "status": "completed",
  "outputs": {...},
  "duration_seconds": 120,
  "completed_at": "2025-12-01T09:02:00Z"
}
```

**agent.run.failed**
```json
{
  "run_id": "run-456",
  "agent_id": "com.aicloud.finops.billing-normalizer",
  "error": "Timeout exceeded",
  "failed_at": "2025-12-01T09:05:00Z"
}
```

**approval.requested**
```json
{
  "approval_id": "app-789",
  "run_id": "run-456",
  "action": "Terminate unused RDS instance",
  "impact": {...},
  "requested_at": "2025-12-01T09:02:00Z"
}
```

**approval.approved**
```json
{
  "approval_id": "app-789",
  "approved_by": "john@example.com",
  "approved_at": "2025-12-01T10:00:00Z"
}
```

---

**API Version:** 1.0.0  
**Last Updated:** December 2025  
**Next Review:** March 2026
