# Agent Marketplace Platform - Architecture & Data Flows

**Version:** 1.0.0  
**Date:** December 2025  

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Component Overview](#component-overview)
3. [Data Flows](#data-flows)
4. [Deployment Architecture](#deployment-architecture)
5. [Security Architecture](#security-architecture)
6. [Scalability Architecture](#scalability-architecture)

---

## System Architecture

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKETPLACE FRONTEND                          │
│  (React 19 + Tailwind 4 + aicloudconsult.com branding)         │
│  - Catalog browsing                                              │
│  - Agent details & reviews                                       │
│  - Install wizard                                                │
│  - Dashboard & monitoring                                        │
│  - Developer portal                                              │
│  - Admin panel                                                   │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS
                 │ (REST API calls)
┌────────────────▼────────────────────────────────────────────────┐
│              CONTROL PLANE (FastAPI)                             │
│  Multi-tenant, stateless, horizontally scalable                 │
│                                                                  │
│  ├─ Agent Registry & Manifest Validation                        │
│  ├─ Deployment Orchestration                                    │
│  ├─ Approval Workflows (HITL)                                   │
│  ├─ Billing & Revenue Tracking                                  │
│  ├─ Telemetry Aggregation                                       │
│  ├─ Memory Management APIs                                      │
│  └─ Multi-tenant Organization Management                        │
│                                                                  │
│  Database Layer:                                                │
│  ├─ Postgres (relational data)                                  │
│  ├─ Firestore (document storage)                                │
│  └─ Vertex Vector Search (embeddings)                           │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS (outbound only)
                 │ Data Plane polls Control Plane
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼────────┐
│ DATA PLANE   │  │ DATA PLANE    │
│ SAAS         │  │ BYOC          │
│ (Cloud Run)  │  │ (Docker/K8s)  │
│              │  │               │
│ Per-tenant   │  │ Single-tenant │
│ Isolation    │  │ Customer-owned│
│              │  │               │
│ ├─ Agent     │  │ ├─ Agent      │
│ │ Executor   │  │ │ Executor    │
│ ├─ LangGraph │  │ ├─ LangGraph  │
│ ├─ Google    │  │ ├─ Google     │
│ │ ADK        │  │ │ ADK         │
│ ├─ Tool      │  │ ├─ Tool       │
│ │ Registry   │  │ │ Registry    │
│ ├─ Logging   │  │ ├─ Logging    │
│ │ Pipeline   │  │ │ Pipeline    │
│ └─ Memory    │  │ └─ Memory     │
│   Manager    │  │   Manager    │
└──────────────┘  └───────────────┘
```

---

## Component Overview

### 1. Frontend Layer

**Technology:** React 19 + Tailwind CSS 4 + shadcn/ui

**Components:**
- Marketplace catalog with search and filters
- Agent detail pages with manifest viewer
- Multi-step install wizard
- Agent dashboard with real-time logs
- Developer portal for agent submission
- Admin panel for marketplace management

**Features:**
- Dark/Light mode (matching aicloudconsult.com)
- Responsive design (mobile, tablet, desktop)
- Real-time updates via WebSocket
- Offline support for critical features

### 2. Control Plane (FastAPI)

**Technology:** FastAPI + Postgres + Firestore + Vertex Vector Search

**Responsibilities:**
- Agent marketplace and registry
- Manifest validation and versioning
- Multi-tenant organization management
- Deployment orchestration
- Approval workflow management
- Billing and revenue tracking
- Telemetry aggregation
- Memory management APIs

**Deployment:** Cloud Run (stateless, auto-scaling)

**Scaling:** Horizontal scaling up to 100+ instances

### 3. Data Plane - SaaS (Cloud Run)

**Technology:** Python + Google ADK + LangGraph + OpenTelemetry

**Responsibilities:**
- Poll Control Plane for tasks
- Load all 5 memory levels
- Execute LangGraph workflows
- Execute tools with permission validation
- Log every step with structured logs
- Handle A2A protocol for agent-to-agent communication
- Report results back to Control Plane
- Store task summaries and episodes

**Deployment:** Cloud Run (per-tenant isolation)

**Scaling:** Horizontal scaling based on task queue

### 4. Data Plane - BYOC (Docker/Kubernetes)

**Technology:** Docker + Kubernetes + Helm + Terraform

**Responsibilities:**
- Same as SaaS Data Plane
- Runs in customer's cloud account
- Single-tenant per customer
- Uses customer's cloud credentials

**Deployment:** Generated via Helm charts and Terraform templates

**Scaling:** Customer-managed Kubernetes cluster

### 5. Storage Layer

**Postgres:**
- Users and authentication
- Organizations and teams
- Agent listings and metadata
- Subscriptions and billing
- Approvals and audit logs

**Firestore:**
- Agent manifests and versions
- Task summaries (Level 2 memory)
- Episodes (Level 4 memory)
- Organization preferences (Level 5 memory)
- Run logs and telemetry

**Vertex Vector Search:**
- Customer environments (Level 3)
- Cost anomalies (Level 3)
- Automation patterns (Level 3)
- Vendor troubleshooting (Level 3)
- Application architectures (Level 3)

**Cloud Storage:**
- Agent container images
- Helm charts and Terraform templates
- Normalized reports and outputs
- Backup and archives

---

## Data Flows

### Flow 1: Agent Installation

```
User → Frontend
  ↓
User clicks "Install" on agent
  ↓
Frontend → Control Plane
  POST /orgs/{org_id}/install
  ├─ agent_id
  ├─ deployment_type (saas/byoc)
  └─ config
  ↓
Control Plane
  ├─ Validates agent manifest
  ├─ Checks org permissions
  ├─ Creates deployment record
  ├─ Generates deployment artifact
  └─ Returns deployment_id
  ↓
Frontend shows "Installation in progress"
  ↓
Control Plane triggers Data Plane startup
  ├─ SaaS: Creates Cloud Run service
  └─ BYOC: Generates Helm + Terraform
  ↓
Data Plane starts
  ├─ Connects to Control Plane
  ├─ Registers as ready
  └─ Waits for tasks
  ↓
Frontend shows "Agent ready"
```

### Flow 2: Agent Execution

```
User → Frontend
  ↓
User triggers agent run
  ↓
Frontend → Control Plane
  POST /agents/{id}/runs
  ├─ deployment_id
  └─ inputs
  ↓
Control Plane
  ├─ Creates run record
  ├─ Enqueues task
  └─ Returns run_id
  ↓
Data Plane polls Control Plane
  GET /tasks/next
  ↓
Data Plane receives task
  ├─ Loads org preferences (Level 5)
  ├─ Initializes session state (Level 1)
  ├─ Fetches task memories (Level 2)
  ├─ Fetches vector knowledge (Level 3)
  ├─ Fetches episodes (Level 4)
  └─ Builds context
  ↓
Data Plane executes LangGraph workflow
  ├─ Initialize agent nodes
  ├─ Execute step 1: Fetch data
  │   ├─ Log: "Fetching billing data"
  │   ├─ Execute tool
  │   └─ Log: "Fetched 15000 records"
  ├─ Execute step 2: Normalize data
  │   ├─ Log: "Normalizing records"
  │   └─ Log: "Normalization complete"
  ├─ Execute step 3: Detect anomalies
  │   ├─ Log: "Analyzing patterns"
  │   └─ Log: "Detected 3 anomalies"
  └─ Execute step 4: Generate recommendations
      ├─ Log: "Generating recommendations"
      └─ Log: "5 recommendations generated"
  ↓
Data Plane stores memories
  ├─ Store task summary (Level 2)
  │   ├─ Embed with 1536-dim vector
  │   └─ Store in Firestore
  └─ Store episode (Level 4)
      ├─ Embed with 1536-dim vector
      └─ Store in Firestore
  ↓
Data Plane reports results
  POST /agents/{id}/runs/{run_id}/complete
  ├─ outputs
  ├─ logs
  ├─ metrics
  └─ status
  ↓
Control Plane
  ├─ Updates run record
  ├─ Triggers webhooks
  ├─ Updates metrics
  └─ Sends notifications
  ↓
Frontend updates dashboard
  ├─ Shows results
  ├─ Shows logs
  ├─ Shows metrics
  └─ Queues approvals if needed
```

### Flow 3: Approval Workflow

```
Agent run completes with remediation action
  ↓
Control Plane checks constraints
  ├─ "requires-human-approval-for-remediation"
  └─ Creates approval record
  ↓
Control Plane sends notification
  ├─ Email to approvers
  ├─ Slack webhook
  └─ In-app notification
  ↓
Frontend shows approval queue
  ├─ Action details
  ├─ Impact analysis
  └─ [Approve] [Reject] buttons
  ↓
User reviews and approves
  POST /orgs/{org_id}/approvals/{approval_id}/approve
  ├─ approved: true
  └─ comments: "Looks good"
  ↓
Control Plane
  ├─ Updates approval record
  ├─ Notifies Data Plane
  └─ Triggers remediation
  ↓
Data Plane executes remediation
  ├─ Logs: "Executing approved action"
  ├─ Executes: "Terminate RDS instance"
  ├─ Logs: "Action completed successfully"
  └─ Reports results
  ↓
Control Plane updates run
  ├─ Sets status: "remediated"
  └─ Records approval history
  ↓
Frontend shows completion
  ├─ "Remediation successful"
  └─ "Cost saved: $5,000"
```

### Flow 4: Memory System

```
Agent execution begins
  ↓
Load Memory Levels:

Level 5 (Preferences):
  ├─ Fetch from Firestore
  ├─ org_id/preferences
  └─ Load once per session

Level 1 (Session):
  ├─ Initialize in-memory state
  ├─ LangGraph state object
  └─ Cleared after workflow

Level 2 (Task):
  ├─ Search Firestore
  ├─ agents/{agentId}/task_summaries
  ├─ Semantic search (top 5)
  └─ Embed with 1536-dim vector

Level 3 (Vector):
  ├─ Search Vertex Vector Search
  ├─ Namespaces:
  │  ├─ customer_environments
  │  ├─ cost_anomalies
  │  ├─ automation_patterns
  │  ├─ vendor_troubleshooting
  │  └─ application_architectures
  ├─ Semantic search (top 10)
  └─ Similarity threshold: 0.7

Level 4 (Episode):
  ├─ Search Firestore
  ├─ agents/{agentId}/episodes
  ├─ Experience replay (top 3)
  └─ Embed with 1536-dim vector

Build Context:
  ├─ Combine all memory levels
  ├─ Prioritize by relevance
  └─ Total context size: ~10K tokens

Execute with Context:
  ├─ LangGraph uses context
  ├─ Agent makes better decisions
  └─ Learns from past experiences

Store New Memories:
  ├─ After execution completes
  ├─ Generate task summary (L2)
  ├─ Generate episode (L4)
  ├─ Embed both
  └─ Store in respective systems

Garbage Collection:
  ├─ Level 2: Delete after 30 days
  ├─ Level 4: Delete after 90 days
  ├─ Level 3: Keep indefinitely
  └─ Level 5: Keep indefinitely
```

### Flow 5: Billing & Revenue

```
Agent run completes
  ↓
Control Plane calculates charges
  ├─ Base price: $0.50
  ├─ Per-record: $0.001 × 15000 = $15
  ├─ Compute: $0.50 × 2 CPU-hours = $1
  └─ Total: $16.50
  ↓
Control Plane records usage
  ├─ User account: -$16.50
  ├─ Developer account: +$13.20 (80%)
  ├─ Platform account: +$3.30 (20%)
  └─ Timestamp: 2025-12-01T09:02:00Z
  ↓
Monthly billing cycle (1st of month)
  ├─ Aggregate all usage charges
  ├─ Add subscription fee
  ├─ Generate invoice
  └─ Charge Stripe
  ↓
Developer payout (monthly)
  ├─ Calculate total earnings
  ├─ Deduct platform fees
  ├─ Generate payout record
  ├─ Minimum payout: $100
  └─ Transfer via Stripe Connect
```

---

## Deployment Architecture

### SaaS Deployment (Vendor-Hosted)

```
Google Cloud Project (AiCloudGuard)
├─ Cloud Run (Control Plane)
│  ├─ FastAPI service
│  ├─ Auto-scaling: 1-100 instances
│  ├─ Memory: 2GB per instance
│  └─ CPU: 2 vCPU per instance
│
├─ Cloud Run (Data Plane - SaaS)
│  ├─ Per-tenant container instances
│  ├─ Auto-scaling based on task queue
│  ├─ Memory: 4GB per instance
│  ├─ CPU: 2 vCPU per instance
│  └─ Network isolation per tenant
│
├─ Cloud SQL (Postgres)
│  ├─ High availability setup
│  ├─ Automated backups
│  ├─ Read replicas for scaling
│  └─ Encrypted at rest
│
├─ Firestore
│  ├─ Multi-region replication
│  ├─ Automatic scaling
│  ├─ Per-tenant collection isolation
│  └─ Encrypted at rest
│
├─ Vertex Vector Search
│  ├─ Per-tenant namespace
│  ├─ Automatic scaling
│  ├─ 1536-dimensional embeddings
│  └─ Similarity search < 500ms
│
├─ Cloud Storage
│  ├─ Agent container images
│  ├─ Helm charts and Terraform
│  ├─ Reports and outputs
│  └─ Backup and archives
│
├─ Cloud Logging
│  ├─ Structured logs aggregation
│  ├─ 7-year retention
│  ├─ Full-text search
│  └─ Immutable logs
│
├─ Cloud Monitoring
│  ├─ Prometheus metrics
│  ├─ Custom dashboards
│  ├─ SLO tracking
│  └─ Alert policies
│
└─ Cloud Trace
   ├─ Distributed tracing
   ├─ Jaeger integration
   ├─ Latency analysis
   └─ Dependency mapping
```

### BYOC Deployment (Customer-Owned)

```
Customer's Cloud Account (GCP/AWS/Azure)
├─ Kubernetes Cluster
│  ├─ Namespace: agent-marketplace
│  ├─ Deployment: data-plane-agent
│  ├─ Replicas: 2-10 (auto-scaling)
│  ├─ Resource limits:
│  │  ├─ CPU: 2-4 cores
│  │  ├─ Memory: 4-8GB
│  │  └─ Disk: 10GB
│  │
│  ├─ ConfigMap: agent-config
│  │  ├─ Control Plane URL
│  │  ├─ Agent configuration
│  │  └─ Logging settings
│  │
│  ├─ Secret: agent-credentials
│  │  ├─ API key for Control Plane
│  │  ├─ Cloud provider credentials
│  │  └─ Encryption keys
│  │
│  ├─ PersistentVolume: agent-logs
│  │  ├─ Size: 100GB
│  │  ├─ Retention: 90 days
│  │  └─ Backup: Daily
│  │
│  └─ Service: agent-service
│     ├─ Type: ClusterIP
│     ├─ Port: 8000
│     └─ Health check: /health
│
├─ Generated via Helm:
│  ├─ helm-chart/
│  │  ├─ Chart.yaml
│  │  ├─ values.yaml
│  │  ├─ templates/deployment.yaml
│  │  ├─ templates/configmap.yaml
│  │  ├─ templates/secret.yaml
│  │  └─ templates/service.yaml
│  │
│  └─ Installation:
│     └─ helm install agent-marketplace ./helm-chart
│
└─ Generated via Terraform:
   ├─ main.tf (GKE/EKS/AKS)
   ├─ networking.tf (VPC, subnets)
   ├─ iam.tf (roles, permissions)
   ├─ storage.tf (persistent volumes)
   └─ outputs.tf (endpoints, credentials)
```

---

## Security Architecture

### Data Encryption

```
At Rest:
├─ Postgres: AES-256 encryption
├─ Firestore: AES-256 encryption
├─ Cloud Storage: AES-256 encryption
├─ Encryption keys: Per-org, rotated every 90 days
└─ Key management: Google Cloud KMS

In Transit:
├─ All APIs: TLS 1.3
├─ Certificate pinning: Enabled
├─ Perfect forward secrecy: Enabled
└─ Mutual TLS: For service-to-service
```

### Access Control

```
IAM Model:
├─ Roles:
│  ├─ admin: Full org access
│  ├─ developer: Can deploy agents
│  ├─ operator: Can run agents
│  ├─ approver: Can approve runs
│  └─ viewer: Read-only access
│
├─ Service Accounts:
│  ├─ Per-agent service account
│  ├─ Scoped permissions
│  ├─ Temporary credentials
│  └─ Audit logging
│
└─ OAuth 2.0:
   ├─ Manus OAuth integration
   ├─ JWT tokens with expiry
   ├─ Refresh token rotation
   └─ Scope-based permissions
```

### Audit Logging

```
Logged Events:
├─ Agent installation
├─ Agent execution
├─ Permission changes
├─ Data access
├─ Approval actions
├─ Billing events
├─ Configuration changes
└─ Security events

Log Properties:
├─ Immutable logs
├─ 7-year retention
├─ Tamper detection
├─ Full-text search
├─ Structured format
└─ Encrypted storage
```

### Secrets Management

```
Secrets Lifecycle:
├─ Generated: Secure random, 256-bit
├─ Stored: Google Cloud Secret Manager
├─ Rotated: Every 90 days
├─ Revoked: Immediate
├─ Audited: All access logged
└─ No secrets in logs: Automatic redaction
```

---

## Scalability Architecture

### Horizontal Scaling

```
Control Plane:
├─ Stateless FastAPI services
├─ Auto-scaling: 1-100 instances
├─ Load balancing: Cloud Load Balancer
├─ Database: Read replicas for scaling
└─ Cache: Redis for session caching

Data Plane (SaaS):
├─ Per-tenant container instances
├─ Auto-scaling based on task queue
├─ Queue: Cloud Tasks for job distribution
├─ Backpressure: Automatic throttling
└─ Circuit breaker: Failure isolation

Data Plane (BYOC):
├─ Customer-managed Kubernetes
├─ Horizontal Pod Autoscaler (HPA)
├─ Vertical Pod Autoscaler (VPA)
├─ Resource quotas per namespace
└─ Network policies for isolation
```

### Database Scaling

```
Postgres (Relational):
├─ Primary-replica setup
├─ Read replicas: 3-5 instances
├─ Connection pooling: PgBouncer
├─ Sharding: By org_id for future scale
└─ Partitioning: By date for logs

Firestore (Document):
├─ Automatic scaling
├─ Per-collection indexes
├─ Composite indexes for complex queries
├─ Eventual consistency for reads
└─ Strong consistency for writes

Vertex Vector Search:
├─ Automatic scaling
├─ Per-tenant namespace
├─ Batch indexing for efficiency
├─ Approximate nearest neighbor search
└─ Similarity threshold tuning
```

### Performance Optimization

```
Caching:
├─ Frontend: Browser cache (1 hour)
├─ CDN: CloudFlare for static assets
├─ API: Redis cache for hot data
├─ Database: Query result caching
└─ Vector search: Embedding cache

Async Processing:
├─ Task queue: Cloud Tasks
├─ Pub/Sub: For event streaming
├─ Batch jobs: Scheduled tasks
├─ Webhooks: Async notifications
└─ Background workers: For heavy lifting

Query Optimization:
├─ Database indexes on frequently queried fields
├─ Query result pagination
├─ Lazy loading for large datasets
├─ Aggregation pipelines
└─ Query plan analysis
```

---

**Architecture Version:** 1.0.0  
**Last Updated:** December 2025  
**Next Review:** March 2026
