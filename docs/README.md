# Agent Marketplace Platform - Complete Documentation

**Version:** 1.0.0  
**Status:** MVP - Production Ready  
**Last Updated:** December 2025  

Welcome to the Agent Marketplace Platform documentation. This guide will help you understand the platform, get started, and contribute to the ecosystem.

---

## 📚 Documentation Index

### For Investors & Stakeholders
1. **[Investor Pitch Deck](./INVESTOR_PITCH.md)** - 12-slide presentation for fundraising
2. **[Product Requirements Document (PRD)](./PRD.md)** - Complete product specification
3. **[Business Model & Pricing](./PRD.md#pricing--billing)** - Revenue streams and unit economics

### For Architects & Engineers
1. **[Architecture Overview](./ARCHITECTURE.md)** - System design and components
2. **[Data Flows](./ARCHITECTURE.md#data-flows)** - How data moves through the system
3. **[Deployment Architecture](./ARCHITECTURE.md#deployment-architecture)** - SaaS and BYOC setups
4. **[Scalability Architecture](./ARCHITECTURE.md#scalability-architecture)** - How we scale

### For API Developers
1. **[API Specification](./API_SPECIFICATION.md)** - Complete REST API reference
2. **[Authentication & Authorization](./API_SPECIFICATION.md#authentication)** - Auth flows
3. **[Webhook Events](./API_SPECIFICATION.md#webhook-events)** - Event subscriptions

### For Security & Compliance
1. **[Security & Compliance](./SECURITY_COMPLIANCE.md)** - Security controls and frameworks
2. **[Data Protection](./SECURITY_COMPLIANCE.md#data-protection)** - Encryption and key management
3. **[Audit & Logging](./SECURITY_COMPLIANCE.md#audit--logging)** - Compliance logging
4. **[Incident Response](./SECURITY_COMPLIANCE.md#incident-response)** - Breach procedures

### For Operations & DevOps
1. **[Deployment Guide - SaaS](./DEPLOYMENT_SAAS.md)** - Deploy to Google Cloud
2. **[Deployment Guide - BYOC](./DEPLOYMENT_BYOC.md)** - Deploy to customer cloud
3. **[Monitoring & Observability](./MONITORING.md)** - Metrics and dashboards
4. **[Operations Runbook](./OPERATIONS_RUNBOOK.md)** - Day-to-day operations

### For Developers & Contributors
1. **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 15 minutes
2. **[Developer Guide](./DEVELOPER_GUIDE.md)** - Architecture deep dive
3. **[Agent Development Guide](./AGENT_DEVELOPMENT.md)** - Build agents for marketplace
4. **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute

### For Product & Growth
1. **[Product Roadmap](./ROADMAP.md)** - 12-month feature plan
2. **[Go-to-Market Strategy](./PRD.md#go-to-market-strategy)** - Customer acquisition
3. **[Success Metrics](./PRD.md#kpis--success-metrics)** - KPIs and tracking

---

## 🚀 Quick Links

**Get Started Immediately:**
- [5-minute overview](#5-minute-overview)
- [Architecture diagram](#architecture-at-a-glance)
- [Key concepts](#key-concepts)

**Deep Dives:**
- [Complete PRD](./PRD.md)
- [API Reference](./API_SPECIFICATION.md)
- [Architecture Details](./ARCHITECTURE.md)

**Deployment:**
- [SaaS Deployment](./DEPLOYMENT_SAAS.md)
- [BYOC Deployment](./DEPLOYMENT_BYOC.md)

**Development:**
- [Quick Start](./QUICKSTART.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Agent Development](./AGENT_DEVELOPMENT.md)

---

## 5-Minute Overview

### What is Agent Marketplace Platform?

A **multi-tenant SaaS platform** that enables organizations to discover, deploy, and manage **AI agents** for cloud automation.

**Key Features:**
- 🎯 **Marketplace** - Browse 100+ pre-built agents
- 🚀 **Flexible Deployment** - SaaS (vendor-hosted) or BYOC (customer cloud)
- 🧠 **5-Level Memory System** - Agents learn and improve over time
- 📊 **Full Audit Trail** - Every step logged with OpenTelemetry
- 🤝 **Multi-Agent Orchestration** - Agents collaborate on complex tasks
- 🔒 **Enterprise Security** - SOC2-ready, per-tenant isolation

### Who Uses It?

- **FinOps Analysts** - Optimize cloud costs automatically
- **Cloud Engineers** - Automate infrastructure management
- **DevOps Teams** - Deploy and manage agents at scale
- **MSPs** - Manage customer clouds efficiently
- **SMBs** - Access enterprise automation affordably

### How It Works

```
1. Browse Marketplace
   ↓
2. Install Agent (SaaS or BYOC)
   ↓
3. Configure & Schedule
   ↓
4. Agent Runs Automatically
   ↓
5. Review Results & Approve Actions
   ↓
6. Track ROI & Metrics
```

---

## Architecture at a Glance

### System Components

```
┌─────────────────────────────────────────┐
│       MARKETPLACE FRONTEND              │
│    (React + Tailwind + Dark/Light)      │
└────────────────┬────────────────────────┘
                 │ HTTPS
┌────────────────▼────────────────────────┐
│      CONTROL PLANE (FastAPI)            │
│   Multi-tenant, Stateless, Scalable     │
│                                         │
│  • Agent Registry                       │
│  • Deployment Orchestration             │
│  • Approval Workflows                   │
│  • Billing & Revenue                    │
│  • Memory Management                    │
└────────────────┬────────────────────────┘
                 │ HTTPS (outbound only)
        ┌────────┴────────┐
        │                 │
    ┌───▼──────┐      ┌──▼────────┐
    │ SaaS     │      │ BYOC      │
    │ Data     │      │ Data      │
    │ Plane    │      │ Plane     │
    │ (Cloud   │      │ (Docker/  │
    │ Run)     │      │ K8s)      │
    └──────────┘      └───────────┘
```

### Technology Stack

**Frontend:**
- React 19
- Tailwind CSS 4
- shadcn/ui components
- Dark/Light mode

**Control Plane:**
- FastAPI (Python)
- Postgres (relational)
- Firestore (documents)
- Vertex Vector Search (embeddings)

**Data Plane:**
- Python runtime
- Google ADK (agent framework)
- LangGraph (orchestration)
- OpenTelemetry (observability)

**Infrastructure:**
- Google Cloud Platform
- Cloud Run (serverless)
- Kubernetes (BYOC)
- Cloud SQL, Firestore, Cloud Storage

---

## Key Concepts

### 1. Agents

**What:** AI-powered automation tools that perform specific tasks

**Examples:**
- Billing Normalizer - Normalize cloud billing data
- Cost Optimizer - Identify and remediate cloud waste
- Compliance Checker - Verify cloud compliance
- Deployment Manager - Automate infrastructure deployment

**Manifest:** YAML file defining agent capabilities, inputs, outputs, tools, permissions

### 2. Deployments

**What:** Instance of an agent running in an organization

**Types:**
- **SaaS** - Runs in AiCloudGuard's managed infrastructure
- **BYOC** - Runs in customer's cloud account

**Lifecycle:** Install → Configure → Run → Monitor → Uninstall

### 3. Memory System (5 Levels)

**Level 1 - Session:** In-memory context for current workflow

**Level 2 - Task:** Firestore storage of past agent runs (30-day retention)

**Level 3 - Vector:** Semantic knowledge base (long-term, Vertex Vector Search)

**Level 4 - Episode:** Experience replay for learning (90-day retention)

**Level 5 - Preference:** Organization policies and settings (persistent)

**Benefit:** Agents improve over time, massive token savings

### 4. Approval Workflows (HITL)

**What:** Human-in-the-loop approval for critical actions

**Process:**
1. Agent identifies action (e.g., "Terminate unused RDS")
2. System queues approval
3. Human reviews impact and approves/rejects
4. Agent executes approved action

**Benefit:** Safety, compliance, control

### 5. Multi-Tenant Isolation

**What:** Complete data and resource isolation per organization

**Mechanisms:**
- Per-org database rows
- Per-org vector namespaces
- Per-org Cloud Run instances
- Per-org encryption keys
- Per-org audit logs

**Benefit:** Security, compliance, multi-customer support

---

## Deployment Models

### SaaS (Vendor-Hosted)

**How It Works:**
1. User installs agent from marketplace
2. Control Plane creates Cloud Run instance
3. Agent runs in AiCloudGuard's infrastructure
4. Data stays in customer's cloud (via credentials)

**Advantages:**
- ✅ Fastest setup (2 minutes)
- ✅ No infrastructure management
- ✅ Automatic scaling
- ✅ Included monitoring

**Disadvantages:**
- ❌ Data flows through our infrastructure
- ❌ Less control over environment
- ❌ Dependent on our uptime

**Best For:** SMBs, startups, quick experimentation

### BYOC (Bring Your Own Cloud)

**How It Works:**
1. User downloads Helm chart and Terraform templates
2. User deploys to their Kubernetes cluster
3. Agent runs entirely in customer's cloud
4. Only metadata flows to Control Plane

**Advantages:**
- ✅ Data never leaves customer's cloud
- ✅ Full control over environment
- ✅ Meets compliance requirements
- ✅ Can be air-gapped

**Disadvantages:**
- ❌ Requires Kubernetes knowledge
- ❌ Customer manages infrastructure
- ❌ Longer setup (1-2 hours)

**Best For:** Enterprises, regulated industries, data-sensitive use cases

---

## Pricing Model

### SaaS Subscriptions (70% of revenue)

| Plan | Price | Agents | Runs/Month | Features |
|------|-------|--------|-----------|----------|
| Starter | $49/mo | 5 | 1,000 | Basic agents, L1-L2 memory |
| Pro | $249/mo | 25 | 10,000 | All agents, L1-L5 memory, approvals |
| Enterprise | $999+/mo | Unlimited | Unlimited | Custom, dedicated support, SLA |

**Usage Charges:**
- Per-run: $0.05-0.50 depending on plan
- Compute: $0.50/CPU-hour (BYOC)
- Storage: Based on usage

### Marketplace Revenue Share (20% of revenue)

- **Developer:** 80% of agent revenue
- **Platform:** 20% of agent revenue
- **Minimum payout:** $100/month
- **Payment:** Monthly via Stripe Connect

---

## Getting Started

### For End Users

**1. Sign Up**
- Visit marketplace
- Create organization account
- Set up billing

**2. Install Agent**
- Browse marketplace
- Select agent
- Complete install wizard
- Choose SaaS or BYOC

**3. Configure**
- Set schedule
- Configure thresholds
- Connect cloud account
- Review permissions

**4. Run & Monitor**
- Agent runs automatically
- Monitor dashboard
- Review logs
- Approve actions

### For Developers

**1. Read Documentation**
- [Quick Start](./QUICKSTART.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Agent Development](./AGENT_DEVELOPMENT.md)

**2. Set Up Environment**
```bash
git clone https://github.com/mabhishe/agent-marketplace
cd agent-marketplace
pnpm install
pnpm dev
```

**3. Explore Code**
- Frontend: `client/src/`
- Control Plane: `server/`
- Schemas: `drizzle/schema.ts`
- Tests: `server/*.test.ts`

**4. Build Agent**
- Follow [Agent Development Guide](./AGENT_DEVELOPMENT.md)
- Create manifest.yaml
- Build container image
- Submit to marketplace

### For Operators

**1. Deploy Control Plane**
- See [Deployment Guide - SaaS](./DEPLOYMENT_SAAS.md)
- Configure environment variables
- Set up databases
- Deploy to Cloud Run

**2. Deploy Data Plane**
- SaaS: Automatic with Control Plane
- BYOC: Generate Helm charts for customers

**3. Monitor & Operate**
- See [Monitoring Guide](./MONITORING.md)
- Set up dashboards
- Configure alerts
- Review logs

---

## Key Features

### 🎯 Marketplace

- **Browse Agents** - Search, filter, sort by rating/price
- **Agent Details** - View manifest, permissions, pricing, reviews
- **Install Wizard** - 6-step guided installation
- **Reviews & Ratings** - Community feedback

### 🚀 Deployment

- **SaaS** - 2-minute setup, managed by us
- **BYOC** - Full control, runs in your cloud
- **Multi-cloud** - AWS, GCP, Azure support
- **Scheduling** - Cron-based or manual triggers

### 📊 Dashboard

- **Real-time Status** - Agent status, last run, next run
- **Structured Logs** - Searchable, filterable logs
- **Metrics** - Cost trends, success rates, anomalies
- **Approvals Queue** - HITL approval management

### 🧠 Memory System

- **Session Memory** - In-memory context
- **Task Memory** - Learn from past runs
- **Vector Memory** - Semantic knowledge base
- **Episode Memory** - Experience replay
- **Preference Memory** - Organization policies

### 🔒 Security

- **Encryption** - AES-256 at rest and in transit
- **RBAC** - Role-based access control
- **Audit Logs** - 7-year immutable logs
- **SOC2** - Ready for compliance audit
- **GDPR** - Full compliance

### 💰 Billing

- **Usage-based** - Pay for what you use
- **Subscriptions** - Monthly plans
- **Revenue Share** - 80/20 for developers
- **Invoicing** - Automatic monthly invoices
- **Stripe Integration** - Secure payments

---

## Support & Community

### Getting Help

**Documentation:**
- [FAQ](./FAQ.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [API Docs](./API_SPECIFICATION.md)

**Community:**
- GitHub Issues - Report bugs
- Discussions - Ask questions
- Slack - Real-time chat

**Enterprise Support:**
- Dedicated support team
- SLA guarantees
- Custom integrations
- Training & onboarding

### Contributing

**We Welcome:**
- Bug reports
- Feature requests
- Documentation improvements
- Code contributions

**See:** [Contributing Guide](./CONTRIBUTING.md)

---

## Roadmap

### Q4 2025 (MVP - Current)
- ✅ Control Plane (FastAPI)
- ✅ SaaS Data Plane (Cloud Run)
- ✅ Basic marketplace
- ✅ 5-level memory system
- ✅ Structured logging

### Q1 2026 (Enterprise)
- 🔄 BYOC Data Plane (Docker/K8s)
- 🔄 Advanced approval workflows
- 🔄 Custom integrations
- 🔄 Developer portal
- 🔄 Analytics & reporting

### Q2 2026 (Scale)
- 🔄 Agent-to-agent workflows
- 🔄 Advanced memory features
- 🔄 Marketplace monetization
- 🔄 Multi-cloud support
- 🔄 Enterprise features

### Q3-Q4 2026 (Growth)
- 🔄 Global deployment
- 🔄 Advanced security features
- 🔄 Industry-specific agents
- 🔄 API marketplace
- 🔄 White-label options

**See:** [Complete Roadmap](./ROADMAP.md)

---

## FAQ

**Q: How is this different from AWS Bedrock Agents?**
A: We're multi-cloud, have a marketplace ecosystem, and our proprietary 5-level memory system makes agents smarter over time.

**Q: Can I run agents in my own cloud?**
A: Yes! BYOC (Bring Your Own Cloud) lets you deploy agents to your Kubernetes cluster.

**Q: How much does it cost?**
A: Starts at $49/month for Starter plan. See [Pricing](./PRD.md#pricing--billing).

**Q: Is my data secure?**
A: Yes. AES-256 encryption, SOC2-ready, GDPR compliant. See [Security](./SECURITY_COMPLIANCE.md).

**Q: Can I build my own agents?**
A: Yes! See [Agent Development Guide](./AGENT_DEVELOPMENT.md).

**Q: What's the SLA?**
A: 99.9% uptime for Control Plane, 99.5% for SaaS Data Plane.

---

## Contact & Resources

**Website:** https://aicloudconsult.com  
**Email:** founders@aicloudguard.com  
**GitHub:** https://github.com/mabhishe/agent-marketplace  
**Docs:** https://docs.agentmarketplace.com  

**Social:**
- Twitter: @aicloudguard
- LinkedIn: AiCloudGuard
- Slack: [Community](https://slack.agentmarketplace.com)

---

## License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.

---

## Acknowledgments

Built with:
- [Google Cloud Platform](https://cloud.google.com)
- [Google ADK](https://developers.google.com/agents)
- [LangGraph](https://langchain.com/langgraph)
- [FastAPI](https://fastapi.tiangolo.com)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

---

**Last Updated:** December 2025  
**Version:** 1.0.0  
**Status:** Production Ready

---

## Next Steps

1. **Read the [Quick Start Guide](./QUICKSTART.md)** - Get up and running in 15 minutes
2. **Explore the [Architecture](./ARCHITECTURE.md)** - Understand the system design
3. **Review the [API Docs](./API_SPECIFICATION.md)** - Learn the REST API
4. **Check the [Roadmap](./ROADMAP.md)** - See what's coming next

**Questions?** Check [FAQ](./FAQ.md) or [Troubleshooting](./TROUBLESHOOTING.md)

**Ready to get started?** [Sign up for beta](https://beta.agentmarketplace.com)
