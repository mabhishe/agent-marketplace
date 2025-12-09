# Agent Marketplace Platform

A comprehensive SaaS platform for hiring and deploying AI agents. Deploy specialized, tool-enabled AI agents to automate your workflows with flexible deployment options (cloud-hosted or bring-your-own-cloud).

## Overview

The Agent Marketplace Platform enables organizations to discover, deploy, and manage AI agents for various automation tasks. The platform supports two deployment models:

- **SaaS Data Plane**: Agents run in our managed cloud infrastructure
- **BYOC (Bring Your Own Cloud)**: Agents run inside your own cloud account for maximum security and control

## Features

### Core Platform Features

- **Agent Marketplace**: Browse and discover pre-built AI agents
- **Flexible Deployment**: Choose between cloud-hosted (SaaS) or BYOC deployment
- **Multi-Cloud Support**: Deploy to GCP, AWS, or Azure
- **Agent Registry**: Manage agent versions and metadata
- **Subscription Management**: Multiple billing models (per-task, monthly, per-agent)
- **User Authentication**: OAuth-based authentication with role-based access control
- **Dashboard**: Monitor deployments and subscriptions

### Supported Agent Categories

- Cloud Cost Optimization
- CI/CD Automation
- Infrastructure Management
- Monitoring & Alerts
- DevOps Automation
- Security Management

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **shadcn/ui** for component library
- **tRPC** for type-safe API calls
- **Wouter** for routing

### Backend
- **Express.js** for HTTP server
- **tRPC** for RPC procedures
- **Drizzle ORM** for database access
- **MySQL/TiDB** for data persistence
- **Zod** for schema validation

### Infrastructure
- **Cloud Run** for serverless compute
- **GCP Pub/Sub** for event streaming
- **Google Cloud Storage** for file storage
- **Vertex Vector Search** for semantic search

## Project Structure

```
agent-marketplace/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app router
│   └── public/            # Static assets
├── server/                # Backend API
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database queries
│   ├── *.test.ts          # Vitest tests
│   └── _core/             # Core infrastructure
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database
- Manus OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mabhishe/agent-marketplace.git
cd agent-marketplace
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env file with required variables
DATABASE_URL=mysql://user:password@localhost:3306/agent_marketplace
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
```

4. Run database migrations:
```bash
pnpm db:push
```

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## API Documentation

### Marketplace Router

#### `marketplace.listAgents`
List published agents with optional filtering.

```typescript
trpc.marketplace.listAgents.useQuery({
  limit: 20,
  offset: 0,
  category: "DevOps" // optional
})
```

#### `marketplace.getAgentDetail`
Get detailed information about a specific agent.

```typescript
trpc.marketplace.getAgentDetail.useQuery(agentId)
```

#### `marketplace.searchAgents`
Search agents by query and category.

```typescript
trpc.marketplace.searchAgents.useQuery({
  query: "cost optimizer",
  category: "DevOps" // optional
})
```

### Agent Router (Protected)

#### `agent.createAgent`
Create a new agent (requires authentication).

```typescript
trpc.agent.createAgent.useMutation({
  name: "Cost Optimizer",
  description: "Optimizes cloud spending",
  category: "DevOps",
  billingModel: "per-task",
  basePrice: 1000
})
```

#### `agent.getMyAgents`
Get all agents created by the current user.

```typescript
trpc.agent.getMyAgents.useQuery()
```

#### `agent.publishAgent`
Publish an agent to the marketplace (admin only).

```typescript
trpc.agent.publishAgent.useMutation(agentId)
```

### Deployment Router (Protected)

#### `deployment.createDeployment`
Create a new deployment.

```typescript
trpc.deployment.createDeployment.useMutation({
  agentId: 1,
  deploymentType: "saas", // or "byoc"
  cloudProvider: "gcp", // required for BYOC
  config: {} // optional deployment config
})
```

#### `deployment.listDeployments`
List all deployments for the current user.

```typescript
trpc.deployment.listDeployments.useQuery()
```

### Billing Router (Protected)

#### `billing.listSubscriptions`
List all active subscriptions.

```typescript
trpc.billing.listSubscriptions.useQuery()
```

#### `billing.createSubscription`
Create a new subscription.

```typescript
trpc.billing.createSubscription.useMutation({
  agentId: 1,
  billingModel: "per-task",
  pricePerUnit: 1000
})
```

## Database Schema

### Core Tables

- **users**: User accounts and authentication
- **organizations**: Multi-tenant organizations
- **agents**: Agent definitions and metadata
- **agentTools**: Tools available to agents
- **deployments**: Agent deployments
- **agentExecutions**: Task execution history
- **subscriptions**: User subscriptions
- **invoices**: Billing invoices
- **cloudCredentials**: Encrypted cloud credentials
- **agentReviews**: User reviews and ratings

## Testing

Run the test suite:

```bash
pnpm test
```

Tests are written using Vitest and cover:
- Authentication and authorization
- Marketplace operations
- Agent management
- Deployment workflows
- Billing operations

## Development Workflow

1. **Update Schema**: Edit `drizzle/schema.ts`
2. **Run Migrations**: `pnpm db:push`
3. **Add Queries**: Add database helpers in `server/db.ts`
4. **Create Procedures**: Add tRPC procedures in `server/routers.ts`
5. **Build UI**: Create React components in `client/src/pages/`
6. **Write Tests**: Add Vitest tests in `server/*.test.ts`
7. **Test**: `pnpm test`

## Deployment

### Building for Production

```bash
pnpm build
```

### Starting Production Server

```bash
pnpm start
```

## Security Considerations

- All API endpoints require HTTPS
- Sensitive data (cloud credentials) is encrypted
- RBAC enforces access control
- BYOC deployments keep customer data isolated
- Zero-trust communication between components
- Secrets stored in environment variables

## Roadmap

### MVP (Current)
- [x] Agent marketplace with browsing
- [x] SaaS and BYOC deployment options
- [x] User authentication and authorization
- [x] Subscription management
- [x] Dashboard for users
- [x] API documentation

### Phase 2
- [ ] Agent execution and monitoring
- [ ] Real-time deployment logs
- [ ] Advanced billing and metering
- [ ] Developer analytics
- [ ] Agent versioning
- [ ] Custom agent builder

### Phase 3
- [ ] Multi-agent workflows
- [ ] Agent marketplace ratings and reviews
- [ ] Advanced search and filtering
- [ ] Team collaboration features
- [ ] Audit logging
- [ ] Advanced security features

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact support@agentmarketplace.com

## Acknowledgments

- Built with [tRPC](https://trpc.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Database ORM with [Drizzle](https://orm.drizzle.team/)

---

**Status**: MVP - Production Ready

**Last Updated**: December 2025

**Repository**: https://github.com/mabhishe/agent-marketplace
