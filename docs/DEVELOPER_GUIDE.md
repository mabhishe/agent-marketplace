# Developer Guide - Architecture Deep Dive

This guide is for developers who want to understand the platform architecture and contribute to the codebase.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Code Organization](#code-organization)
4. [Development Workflow](#development-workflow)
5. [Key Concepts](#key-concepts)
6. [Common Tasks](#common-tasks)
7. [Performance Optimization](#performance-optimization)
8. [Debugging](#debugging)

---

## Architecture Overview

### System Layers

```
┌─────────────────────────────────────────┐
│         PRESENTATION LAYER              │
│  React Components + State Management    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          APPLICATION LAYER              │
│  tRPC Procedures + Business Logic       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           DATA ACCESS LAYER             │
│  Database Queries + ORM (Drizzle)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          PERSISTENCE LAYER              │
│  Postgres + Firestore + Vector DB       │
└─────────────────────────────────────────┘
```

### Request Flow

```
1. User Action (Frontend)
   ↓
2. tRPC Call (HTTP POST to /api/trpc)
   ↓
3. Authentication & Authorization
   ↓
4. Business Logic (Procedure)
   ↓
5. Database Query (Drizzle ORM)
   ↓
6. Response (JSON)
   ↓
7. UI Update (React State)
```

---

## Technology Stack

### Frontend

**Framework:** React 19
```
- Component-based architecture
- Hooks for state management
- Context API for global state
- Suspense for async operations
```

**Styling:** Tailwind CSS 4
```
- Utility-first CSS framework
- Dark mode support
- Responsive design
- Custom theme variables
```

**UI Components:** shadcn/ui
```
- Pre-built accessible components
- Radix UI primitives
- Customizable with Tailwind
- Consistent design system
```

**Routing:** Wouter
```
- Lightweight router
- Hash-based routing
- Nested routes support
- URL parameter parsing
```

**API Client:** tRPC
```
- End-to-end type safety
- Automatic code generation
- React Query integration
- Optimistic updates
```

### Backend

**Framework:** FastAPI (planned) / Express (current)
```
- RESTful API design
- Automatic OpenAPI docs
- Request validation with Pydantic
- Dependency injection
```

**ORM:** Drizzle ORM
```
- Type-safe SQL builder
- Schema-first approach
- Migrations support
- Query builder
```

**Database:** PostgreSQL
```
- Relational data model
- ACID transactions
- Full-text search
- JSON support
```

**Document Store:** Firestore
```
- Real-time updates
- Automatic scaling
- Flexible schema
- Sub-collections
```

**Vector Search:** Vertex Vector Search
```
- Semantic search
- Approximate nearest neighbor
- Per-tenant namespaces
- Similarity scoring
```

### Infrastructure

**Compute:** Google Cloud Run
```
- Serverless containers
- Auto-scaling
- Pay-per-use pricing
- Stateless services
```

**Database:** Cloud SQL
```
- Managed PostgreSQL
- Automated backups
- High availability
- Read replicas
```

**Storage:** Cloud Storage
```
- Object storage
- Versioning
- Lifecycle policies
- Encryption
```

**Logging:** Cloud Logging
```
- Centralized logging
- Full-text search
- Long-term retention
- Structured logs
```

---

## Code Organization

### Frontend Structure

```
client/
├── public/                  # Static assets
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json
├── src/
│   ├── pages/              # Page components
│   │   ├── Home.tsx
│   │   ├── Marketplace.tsx
│   │   ├── AgentDetail.tsx
│   │   ├── Dashboard.tsx
│   │   └── DeploymentWizard.tsx
│   ├── components/         # Reusable components
│   │   ├── DashboardLayout.tsx
│   │   ├── AgentCard.tsx
│   │   ├── LogViewer.tsx
│   │   └── MetricsChart.tsx
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/              # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useLocalStorage.ts
│   │   └── useDebounce.ts
│   ├── lib/                # Utilities
│   │   ├── trpc.ts         # tRPC client
│   │   ├── utils.ts        # Helper functions
│   │   └── constants.ts    # Constants
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
└── tsconfig.json           # TypeScript config
```

### Backend Structure

```
server/
├── routers.ts              # tRPC routers
├── db.ts                   # Database queries
├── _core/                  # Core infrastructure
│   ├── index.ts            # Server entry point
│   ├── context.ts          # Request context
│   ├── auth.ts             # Authentication
│   ├── trpc.ts             # tRPC setup
│   ├── env.ts              # Environment variables
│   ├── llm.ts              # LLM integration
│   ├── storage.ts          # File storage
│   ├── notification.ts     # Notifications
│   ├── cookies.ts          # Cookie handling
│   └── systemRouter.ts     # System procedures
├── *.test.ts               # Test files
└── types.ts                # Type definitions
```

### Database Structure

```
drizzle/
├── schema.ts               # Table definitions
├── migrations/             # Migration files
│   ├── 0001_init.sql
│   ├── 0002_add_agents.sql
│   └── ...
└── meta/                   # Migration metadata
```

### Shared Structure

```
shared/
├── const.ts                # Constants
├── types.ts                # Shared types
└── utils.ts                # Shared utilities
```

---

## Development Workflow

### 1. Feature Development

**Step 1: Update Schema (if needed)**
```typescript
// drizzle/schema.ts
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  // ... more columns
});
```

**Step 2: Run Migration**
```bash
pnpm db:push
```

**Step 3: Add Database Query**
```typescript
// server/db.ts
export async function getAgentById(id: number) {
  const db = await getDb();
  return db.query.agents.findFirst({
    where: eq(agents.id, id),
  });
}
```

**Step 4: Create tRPC Procedure**
```typescript
// server/routers.ts
export const appRouter = router({
  agent: router({
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getAgentById(input.id);
      }),
  }),
});
```

**Step 5: Use in Frontend**
```typescript
// client/src/pages/AgentDetail.tsx
const { data: agent } = trpc.agent.getById.useQuery({ id: 123 });
```

**Step 6: Write Tests**
```typescript
// server/agent.test.ts
describe("agent.getById", () => {
  it("returns agent by id", async () => {
    const agent = await getAgentById(1);
    expect(agent).toBeDefined();
    expect(agent.name).toBe("Billing Normalizer");
  });
});
```

### 2. Testing

**Unit Tests**
```bash
# Run all tests
pnpm test

# Run specific test
pnpm test agent.test.ts

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

**Integration Tests**
```typescript
// server/integration.test.ts
describe("Agent Installation", () => {
  it("installs agent successfully", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.deployment.create({
      agentId: "com.aicloud.finops.billing-normalizer",
      deploymentType: "saas",
    });
    expect(result.deploymentId).toBeDefined();
  });
});
```

### 3. Code Review Checklist

Before submitting a PR:

- [ ] Code follows project style guide
- [ ] All tests pass (`pnpm test`)
- [ ] No console errors or warnings
- [ ] Types are correct (TypeScript)
- [ ] Database migrations are included
- [ ] API documentation is updated
- [ ] Commit messages are clear
- [ ] No hardcoded secrets or credentials

---

## Key Concepts

### 1. tRPC Procedures

**Public Procedure** (no auth required)
```typescript
publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    return getAgent(input.id);
  })
```

**Protected Procedure** (auth required)
```typescript
protectedProcedure
  .input(z.object({ id: z.number() }))
  .mutation(async ({ input, ctx }) => {
    // ctx.user is available
    return updateAgent(input.id, ctx.user.id);
  })
```

### 2. Database Queries

**Select**
```typescript
const agents = await db.query.agents.findMany({
  where: eq(agents.status, "published"),
  limit: 10,
});
```

**Insert**
```typescript
await db.insert(agents).values({
  name: "New Agent",
  description: "Description",
});
```

**Update**
```typescript
await db.update(agents)
  .set({ status: "published" })
  .where(eq(agents.id, 1));
```

**Delete**
```typescript
await db.delete(agents)
  .where(eq(agents.id, 1));
```

### 3. React Hooks

**useQuery** (fetch data)
```typescript
const { data, isLoading, error } = trpc.agent.list.useQuery();
```

**useMutation** (modify data)
```typescript
const { mutate, isPending } = trpc.agent.create.useMutation({
  onSuccess: () => {
    // Refetch or update cache
    trpc.useUtils().agent.list.invalidate();
  },
});
```

**useAuth** (get current user)
```typescript
const { user, isAuthenticated, logout } = useAuth();
```

### 4. Error Handling

**Backend**
```typescript
if (!agent) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Agent not found",
  });
}
```

**Frontend**
```typescript
const { data, error } = trpc.agent.getById.useQuery({ id: 123 });

if (error) {
  return <div>Error: {error.message}</div>;
}
```

---

## Common Tasks

### Add a New Page

```typescript
// client/src/pages/NewPage.tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function NewPage() {
  const { user } = useAuth();

  return (
    <div className="container">
      <h1>New Page</h1>
      <p>Welcome, {user?.name}</p>
    </div>
  );
}
```

Then add to routing in `App.tsx`:
```typescript
<Route path="/new-page" component={NewPage} />
```

### Add a New API Endpoint

```typescript
// server/routers.ts
export const appRouter = router({
  newFeature: router({
    getData: publicProcedure
      .query(async () => {
        return { message: "Hello" };
      }),
  }),
});
```

Then use in frontend:
```typescript
const { data } = trpc.newFeature.getData.useQuery();
```

### Add Database Table

```typescript
// drizzle/schema.ts
export const newTable = mysqlTable("new_table", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});
```

Then run:
```bash
pnpm db:push
```

### Add Environment Variable

1. Add to `.env.local`:
```
MY_VAR=value
```

2. Reference in code:
```typescript
const myVar = process.env.MY_VAR;
```

3. For frontend, prefix with `VITE_`:
```
VITE_MY_VAR=value
```

---

## Performance Optimization

### Frontend Optimization

**Code Splitting**
```typescript
import { lazy, Suspense } from "react";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**Memoization**
```typescript
import { memo, useMemo } from "react";

const AgentCard = memo(({ agent }) => {
  return <div>{agent.name}</div>;
});

export default function List({ agents }) {
  const sorted = useMemo(
    () => agents.sort((a, b) => a.name.localeCompare(b.name)),
    [agents]
  );

  return sorted.map(agent => <AgentCard key={agent.id} agent={agent} />);
}
```

**Query Optimization**
```typescript
// Only fetch what you need
const { data } = trpc.agent.list.useQuery(
  { limit: 20, offset: 0 },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  }
);
```

### Backend Optimization

**Database Indexing**
```typescript
// drizzle/schema.ts
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  status: varchar("status", { length: 50 }).notNull(),
  // ... more columns
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
}));
```

**Query Optimization**
```typescript
// Use select to fetch only needed columns
const agents = await db
  .select({ id: agents.id, name: agents.name })
  .from(agents)
  .limit(10);

// Use joins instead of multiple queries
const agentsWithDeployments = await db
  .select()
  .from(agents)
  .leftJoin(deployments, eq(agents.id, deployments.agentId));
```

**Caching**
```typescript
// Cache expensive operations
const cache = new Map();

export async function getAgentWithCache(id: number) {
  if (cache.has(id)) {
    return cache.get(id);
  }

  const agent = await getAgentById(id);
  cache.set(id, agent);
  return agent;
}
```

---

## Debugging

### Frontend Debugging

**Browser DevTools**
```javascript
// In browser console
// Inspect React component
$r.props

// Check Redux state
__REDUX_DEVTOOLS_EXTENSION__
```

**React DevTools**
- Install React DevTools browser extension
- Inspect component tree
- Check props and state
- Profile performance

**Network Debugging**
- Open Network tab in DevTools
- Check API requests
- Inspect request/response payloads
- Monitor performance

### Backend Debugging

**Console Logging**
```typescript
console.log("Debug:", variable);
console.error("Error:", error);
```

**Structured Logging**
```typescript
import { logger } from "./logger";

logger.info("Agent run started", {
  agentId: "com.aicloud.finops.billing-normalizer",
  runId: "run-123",
});
```

**Database Query Debugging**
```typescript
// Enable query logging
const db = drizzle(connection, { logger: true });
```

**Error Tracking**
```typescript
// Use Sentry or similar
Sentry.captureException(error);
```

---

## Best Practices

1. **Type Safety** - Use TypeScript everywhere
2. **Error Handling** - Handle all error cases
3. **Testing** - Write tests for critical paths
4. **Documentation** - Document complex logic
5. **Performance** - Monitor and optimize
6. **Security** - Never log secrets, validate inputs
7. **Accessibility** - Use semantic HTML, ARIA labels
8. **Responsive Design** - Mobile-first approach

---

**Next Steps:**
- [Quick Start Guide](./QUICKSTART.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [API Specification](./API_SPECIFICATION.md)
