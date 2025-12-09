# Agent Marketplace Platform - TODO

## Phase 1: Database Schema & Core Infrastructure
- [x] Create Agent table (id, name, description, category, version, status, pricing, icon, developer_id, created_at, updated_at)
- [x] Create AgentTool table (id, agent_id, tool_name, tool_type, input_schema, output_schema, permission_level)
- [x] Create Deployment table (id, user_id, agent_id, deployment_type, status, cloud_provider, config, created_at)
- [x] Create Organization table (id, name, owner_id, created_at)
- [x] Create Subscription table (id, user_id, billing_model, price, status, stripe_customer_id, created_at)
- [x] Create AgentExecution table (id, deployment_id, status, input, output, error, execution_time, created_at)
- [x] Create CloudCredentials table (id, user_id, cloud_provider, credentials_encrypted, created_at)
- [x] Extend users table with organization_id, role, profile fields
- [x] Run database migrations (pnpm db:push)

## Phase 2: Authentication & Authorization
- [ ] Verify Firebase Auth integration (already in place via Manus OAuth)
- [ ] Implement RBAC (Owner, Admin, Developer, Operator roles)
- [ ] Create adminProcedure for admin-only operations
- [ ] Create developerProcedure for developer-only operations
- [ ] Test authentication flow with different roles

## Phase 3: Agent Registry & Marketplace API
- [x] Create agent.list procedure (public, with filtering by category/rating/pricing)
- [x] Create agent.detail procedure (public, get single agent details)
- [x] Create agent.create procedure (protected, for developers)
- [x] Create agent.update procedure (protected, for agent owners)
- [x] Create agent.delete procedure (protected, for agent owners)
- [x] Create agent.publish procedure (admin approval workflow)
- [ ] Create agent.getVersions procedure (get agent version history)
- [ ] Create tool.validate procedure (validate tool schema and permissions)
- [x] Create agent.search procedure (full-text search on marketplace)

## Phase 4: Deployment Orchestrator
- [x] Create deployment.create procedure (handle SaaS vs BYOC selection)
- [x] Create deployment.list procedure (user's deployments)
- [ ] Create deployment.getStatus procedure (real-time deployment status)
- [ ] Create deployment.logs procedure (stream deployment logs)
- [ ] Create deployment.delete procedure (remove deployment)
- [ ] Create cloudCredentials.save procedure (encrypt and store cloud credentials)
- [ ] Create cloudCredentials.validate procedure (test cloud credentials)
- [ ] Implement deployment orchestration logic (mock for MVP)

## Phase 5: Billing & Subscription
- [x] Create subscription.list procedure (user's subscriptions)
- [x] Create subscription.create procedure (Stripe integration)
- [x] Create subscription.cancel procedure
- [ ] Create billing.getUsage procedure (track usage for metering)
- [ ] Create billing.invoice procedure (list invoices)
- [ ] Implement Stripe webhook handler for payment events
- [x] Create billing models (per-task, monthly, per-agent)

## Phase 6: Frontend - Marketplace & Discovery
- [ ] Create MarketplaceLayout component
- [x] Create AgentMarketplace page (browse agents)
- [x] Create AgentDetail page (view agent details, reviews, pricing)
- [ ] Create AgentSearch component (search/filter functionality)
- [ ] Create DeveloperProfile page (view developer info)
- [x] Implement agent filtering (category, rating, pricing)
- [x] Add agent ratings and reviews display

## Phase 7: Frontend - Dashboard & User Management
- [x] Create Dashboard page (user overview)
- [x] Create DeploymentList page (manage deployments)
- [ ] Create DeploymentDetail page (view deployment status, logs)
- [ ] Create CloudCredentials page (manage cloud credentials)
- [x] Create SubscriptionManagement page (view/manage subscriptions)
- [ ] Create UserProfile page (user settings)
- [ ] Create Organization settings page

## Phase 8: Frontend - Developer Portal
- [ ] Create DeveloperDashboard page (agent management)
- [ ] Create AgentBuilder page (create/edit agents)
- [ ] Create AgentManifestEditor page (edit manifest.yaml)
- [ ] Create ToolBuilder page (define agent tools)
- [ ] Create AgentPublish page (submit to marketplace)
- [ ] Create DeveloperAnalytics page (agent usage stats)
- [ ] Create DeveloperEarnings page (revenue tracking)

## Phase 9: Frontend - Deployment & Configuration
- [x] Create DeploymentWizard component (step-by-step deployment)
- [x] Create CloudProviderSelector component (GCP, AWS, Azure)
- [x] Create DeploymentTypeSelector component (SaaS vs BYOC)
- [ ] Create CredentialsForm component (cloud credentials input)
- [x] Create DeploymentConfirmation page (review before deploy)
- [ ] Create DeploymentSuccess page (confirmation + next steps)

## Phase 10: Frontend - Billing & Checkout
- [ ] Create BillingPage (overview of charges)
- [ ] Create SubscriptionSelector component (choose billing model)
- [ ] Create CheckoutFlow component (Stripe integration)
- [ ] Create InvoiceList page (view past invoices)
- [ ] Create PaymentMethodManagement page

## Phase 11: Admin Features
- [ ] Create AdminDashboard page (system overview)
- [ ] Create AgentApprovalQueue page (review pending agents)
- [ ] Create UserManagement page (manage users)
- [ ] Create SystemLogs page (audit logs)
- [ ] Create BillingAdmin page (revenue tracking)

## Phase 12: Testing & Validation
- [ ] Write Vitest tests for auth procedures
- [ ] Write Vitest tests for agent CRUD operations
- [ ] Write Vitest tests for deployment logic
- [ ] Write Vitest tests for billing calculations
- [ ] Write integration tests for marketplace search
- [ ] Test authentication flow with different roles
- [ ] Test deployment workflow (SaaS and BYOC)
- [ ] Test billing and subscription management

## Phase 13: Deployment & GitHub
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Setup GitHub Actions CI/CD
- [ ] Create deployment documentation
- [ ] Create API documentation

## Phase 14: Polish & Optimization
- [ ] Add error handling and user feedback
- [ ] Optimize database queries
- [ ] Add loading states and skeletons
- [ ] Implement caching strategies
- [ ] Add analytics tracking
- [ ] Security audit and hardening
- [ ] Performance testing and optimization

## Notes
- MVP focuses on 4 DevOps agents (Cloud Cost Optimizer, CI/CD Automation, Deployment Manager, Monitoring Agent)
- BYOC runtime delivered as Docker container
- SaaS runtime uses Cloud Run
- Gemini 2.0 Flash for LLM calls
- Stripe for billing
