# Quick Start Guide - 15 Minutes

Get the Agent Marketplace Platform up and running in 15 minutes.

---

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.10+
- Docker (optional, for BYOC)
- Google Cloud account (for deployment)
- Git

---

## Step 1: Clone the Repository (2 minutes)

```bash
git clone https://github.com/mabhishe/agent-marketplace
cd agent-marketplace
```

---

## Step 2: Install Dependencies (3 minutes)

```bash
# Install Node dependencies
pnpm install

# Install Python dependencies (optional, for local development)
pip install -r requirements.txt
```

---

## Step 3: Set Up Environment (2 minutes)

Create a `.env.local` file:

```bash
# Control Plane
CONTROL_PLANE_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/agent_marketplace

# Google Cloud
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=us-central1

# Authentication
OAUTH_CLIENT_ID=your-oauth-client-id
OAUTH_CLIENT_SECRET=your-oauth-client-secret

# Stripe (optional)
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Step 4: Start the Development Server (2 minutes)

```bash
# Start frontend and backend
pnpm dev

# In another terminal, start the Data Plane (optional)
python -m uvicorn data_plane.main:app --reload --port 8000
```

The application will be available at:
- **Frontend:** http://localhost:5173
- **Control Plane API:** http://localhost:3000/api
- **Data Plane:** http://localhost:8000

---

## Step 5: Explore the Application (6 minutes)

### 5.1 Browse the Marketplace

1. Open http://localhost:5173
2. Navigate to "Marketplace"
3. See sample agents (Billing Normalizer, Cost Optimizer, etc.)
4. Click on an agent to see details

### 5.2 Install an Agent

1. Click "Install" on any agent
2. Follow the install wizard:
   - Confirm role and responsibilities
   - Choose runtime (SaaS or BYOC)
   - Consent to permissions
   - Configure basics (schedule, thresholds)
   - Review and start

### 5.3 View Dashboard

1. Navigate to "Dashboard"
2. See installed agents and status
3. View recent runs and logs
4. Check metrics and trends

### 5.4 Trigger a Run

1. Go to Dashboard
2. Click "Run Now" on an agent
3. View real-time logs
4. See results and recommendations

### 5.5 Review Approvals

1. Navigate to "Approvals"
2. See pending approvals (if any)
3. Review action details
4. Approve or reject

---

## Key Files to Explore

### Frontend

```
client/src/
├── pages/
│   ├── Marketplace.tsx      # Agent catalog
│   ├── AgentDetail.tsx      # Agent details
│   ├── Dashboard.tsx        # User dashboard
│   ├── DeploymentWizard.tsx # Install wizard
│   └── Home.tsx             # Landing page
├── components/
│   └── DashboardLayout.tsx  # Main layout
└── lib/
    └── trpc.ts              # API client
```

### Backend

```
server/
├── routers.ts               # API endpoints
├── db.ts                    # Database queries
└── _core/
    ├── context.ts           # Request context
    ├── auth.ts              # Authentication
    └── llm.ts               # LLM integration
```

### Database

```
drizzle/
├── schema.ts                # Database tables
└── migrations/              # Database migrations
```

---

## Common Tasks

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test server/marketplace.test.ts

# Watch mode
pnpm test --watch
```

### Build for Production

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

### Database Migrations

```bash
# Create migration
pnpm db:push

# View migrations
pnpm db:studio
```

### Format Code

```bash
# Format all files
pnpm format

# Check formatting
pnpm format --check
```

---

## API Examples

### List Agents

```bash
curl http://localhost:3000/api/v1/agents
```

### Get Agent Details

```bash
curl http://localhost:3000/api/v1/agents/com.aicloud.finops.billing-normalizer
```

### Install Agent

```bash
curl -X POST http://localhost:3000/api/v1/orgs/org-123/install \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "com.aicloud.finops.billing-normalizer",
    "deployment_type": "saas",
    "config": {
      "schedule": "0 9 * * *"
    }
  }'
```

### Trigger Agent Run

```bash
curl -X POST http://localhost:3000/api/v1/agents/com.aicloud.finops.billing-normalizer/runs \
  -H "Content-Type: application/json" \
  -d '{
    "deployment_id": "dep-123",
    "inputs": {
      "billing_source": "aws_cur",
      "time_window": "2025-12-01/2025-12-02"
    }
  }'
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error

```bash
# Check database is running
psql postgresql://user:password@localhost:5432/agent_marketplace

# Run migrations
pnpm db:push
```

### Module Not Found

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Port 8000 in Use (Data Plane)

```bash
# Use different port
python -m uvicorn data_plane.main:app --reload --port 8001
```

---

## Next Steps

1. **Read the [Architecture Guide](./ARCHITECTURE.md)** - Understand the system
2. **Explore the [API Docs](./API_SPECIFICATION.md)** - Learn the REST API
3. **Build an [Agent](./AGENT_DEVELOPMENT.md)** - Create your own agent
4. **Deploy to Production** - See [Deployment Guide](./DEPLOYMENT_SAAS.md)

---

## Getting Help

- **Documentation:** See [README](./README.md)
- **API Reference:** See [API Specification](./API_SPECIFICATION.md)
- **Architecture:** See [Architecture Guide](./ARCHITECTURE.md)
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions

---

**Time Estimate:** 15 minutes  
**Difficulty:** Beginner  
**Next:** [Architecture Guide](./ARCHITECTURE.md)
