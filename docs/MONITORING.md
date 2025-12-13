# Monitoring & Observability Guide

Complete guide to monitoring, observability, and operational health of the Agent Marketplace Platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Observability Stack](#observability-stack)
3. [Metrics](#metrics)
4. [Logging](#logging)
5. [Tracing](#tracing)
6. [Dashboards](#dashboards)
7. [Alerting](#alerting)
8. [SLOs & SLIs](#slos--slis)
9. [Troubleshooting](#troubleshooting)

---

## Overview

### Observability Pillars

**Metrics:** Quantitative measurements of system behavior
- CPU, memory, disk usage
- Request rate, latency, errors
- Business metrics (runs, costs, revenue)

**Logs:** Detailed event records
- Application logs
- Access logs
- Audit logs
- Error logs

**Traces:** Request flow through system
- Distributed tracing
- Service dependencies
- Performance bottlenecks

### Goals

- **Visibility:** Understand system behavior in real-time
- **Debugging:** Quickly identify and fix issues
- **Performance:** Optimize slow operations
- **Compliance:** Maintain audit trail
- **Reliability:** Prevent and mitigate outages

---

## Observability Stack

### Components

**Metrics Collection:**
- Prometheus (metrics database)
- StatsD (metrics aggregation)
- Custom instrumentation

**Log Aggregation:**
- Google Cloud Logging
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Structured logging

**Distributed Tracing:**
- Jaeger (trace backend)
- OpenTelemetry (instrumentation)
- Trace sampling

**Visualization:**
- Grafana (dashboards)
- Google Cloud Console
- Custom dashboards

### Architecture

```
Application
    ↓
OpenTelemetry Instrumentation
    ↓
┌───────────────────────────────┐
├─ Metrics → Prometheus         │
├─ Logs → Cloud Logging         │
└─ Traces → Jaeger              │
    ↓
┌───────────────────────────────┐
├─ Grafana (Dashboards)         │
├─ Cloud Console (Monitoring)   │
└─ Kibana (Log Search)          │
    ↓
Alerts & Notifications
```

---

## Metrics

### Key Metrics

**API Metrics:**
- Request rate (requests/sec)
- Latency (p50, p95, p99)
- Error rate (5xx, 4xx)
- Response size
- Cache hit rate

**Application Metrics:**
- Agent runs (total, by status)
- Deployment count
- User count
- Subscription count
- Memory usage (by level)

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Disk usage
- Network I/O
- Database connections

**Business Metrics:**
- Revenue (MRR, ARR)
- Customer count
- Agent count
- Marketplace revenue
- Cost savings (customer-reported)

### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'control-plane'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'

  - job_name: 'data-plane'
    static_configs:
      - targets: ['localhost:8001']
    metrics_path: '/metrics'

  - job_name: 'database'
    static_configs:
      - targets: ['localhost:5432']
```

### Custom Metrics

**Python (FastAPI):**
```python
from prometheus_client import Counter, Histogram, Gauge

# Counter
agent_runs_total = Counter(
    'agent_runs_total',
    'Total agent runs',
    ['agent_id', 'status']
)

# Histogram
agent_run_duration = Histogram(
    'agent_run_duration_seconds',
    'Agent run duration',
    ['agent_id']
)

# Gauge
active_deployments = Gauge(
    'active_deployments',
    'Number of active deployments'
)

# Usage
agent_runs_total.labels(
    agent_id='com.aicloud.finops.billing-normalizer',
    status='success'
).inc()
```

---

## Logging

### Log Levels

**DEBUG:** Detailed information for debugging
```
[DEBUG] User login attempt: user_id=123, ip=203.0.113.45
```

**INFO:** General informational messages
```
[INFO] Agent run started: run_id=run-123, agent_id=com.aicloud.finops.billing-normalizer
```

**WARNING:** Warning messages for potentially harmful situations
```
[WARNING] High memory usage detected: memory=85%, threshold=80%
```

**ERROR:** Error messages for error conditions
```
[ERROR] Database connection failed: error=Connection timeout
```

**CRITICAL:** Critical messages for critical conditions
```
[CRITICAL] Service down: control-plane unavailable for 5 minutes
```

### Structured Logging

**Format:**
```json
{
  "timestamp": "2025-12-01T09:00:00.123Z",
  "level": "INFO",
  "logger": "agent_executor",
  "message": "Agent run completed",
  "fields": {
    "run_id": "run-123",
    "agent_id": "com.aicloud.finops.billing-normalizer",
    "duration_seconds": 120,
    "status": "success",
    "cost_savings": 5000
  },
  "trace_id": "trace-123",
  "span_id": "span-456"
}
```

### Log Retention

**Retention Policies:**
- Audit logs: 7 years
- Application logs: 90 days
- Debug logs: 30 days
- Archived logs: Cloud Storage

### Searching Logs

**Cloud Logging Query:**
```
resource.type="cloud_run_revision"
resource.labels.service_name="control-plane"
severity="ERROR"
timestamp>="2025-12-01T00:00:00Z"
```

**Kibana Query:**
```
agent_id:"com.aicloud.finops.billing-normalizer" AND status:"error"
```

---

## Tracing

### OpenTelemetry Instrumentation

**Python (FastAPI):**
```python
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Configure Jaeger exporter
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

trace.set_tracer_provider(TracerProvider())
trace.get_tracer_provider().add_span_processor(
    BatchSpanProcessor(jaeger_exporter)
)

# Create tracer
tracer = trace.get_tracer(__name__)

# Use in code
with tracer.start_as_current_span("agent_run") as span:
    span.set_attribute("agent_id", agent_id)
    span.set_attribute("run_id", run_id)
    # ... run agent
```

### Trace Sampling

**Sampling Strategy:**
```
- Production: 10% sampling (1 in 10 requests)
- Staging: 50% sampling
- Development: 100% sampling
```

### Trace Analysis

**Common Traces:**
- User login flow
- Agent installation
- Agent execution
- Approval workflow
- Billing processing

---

## Dashboards

### Main Dashboard

**Sections:**
- System health (uptime, latency, errors)
- Agent metrics (runs, success rate, duration)
- User metrics (active users, new users, churn)
- Business metrics (revenue, customers, agents)

### Service Dashboards

**Control Plane:**
- Request rate and latency
- Error rate and types
- Database performance
- Cache hit rate
- Authentication metrics

**Data Plane:**
- Agent execution metrics
- Memory usage by level
- Tool execution metrics
- Log processing metrics

**Database:**
- Query performance
- Connection pool usage
- Replication lag
- Backup status

### Custom Dashboards

**Agent-Specific:**
- Agent run history
- Success/failure rates
- Performance trends
- Cost impact

**Customer-Specific:**
- Deployments and status
- Runs and results
- Approvals pending
- Cost savings

---

## Alerting

### Alert Rules

**Availability:**
```
- API uptime < 99.9% for 5 minutes → Critical
- Database down → Critical
- Service restart > 3 in 1 hour → Warning
```

**Performance:**
```
- API latency p95 > 1000ms → Warning
- API latency p99 > 5000ms → Critical
- Database query > 10 seconds → Warning
```

**Errors:**
```
- Error rate > 5% → Warning
- Error rate > 10% → Critical
- Unhandled exceptions > 10/min → Critical
```

**Resources:**
```
- CPU > 80% for 10 minutes → Warning
- Memory > 90% → Critical
- Disk > 85% → Warning
```

**Business:**
```
- Revenue down 20% MoM → Warning
- Customer churn > 5% → Warning
- Agent failure rate > 1% → Warning
```

### Notification Channels

**Critical Alerts:**
- PagerDuty (on-call rotation)
- SMS (to on-call engineer)
- Slack (#critical-alerts)
- Email (to team)

**Warning Alerts:**
- Slack (#alerts)
- Email (to team)

**Info Alerts:**
- Slack (#info)
- Dashboard only

---

## SLOs & SLIs

### Service Level Objectives (SLOs)

**Availability:**
- Control Plane API: 99.9% uptime
- Data Plane (SaaS): 99.5% uptime
- Data Plane (BYOC): Customer responsibility

**Performance:**
- API latency p95: < 500ms
- API latency p99: < 2000ms
- Agent execution: < 5 minutes (typical)

**Reliability:**
- Agent success rate: 99%
- Approval latency: < 1 hour (90th percentile)
- Data consistency: 100%

### Service Level Indicators (SLIs)

**Availability SLI:**
```
Successful requests / Total requests
Target: 99.9%
```

**Latency SLI:**
```
Requests with latency < 500ms / Total requests
Target: 95%
```

**Error Rate SLI:**
```
Successful requests / Total requests
Target: 99%
```

### Error Budget

**Monthly Error Budget (99.9% SLO):**
```
Total minutes in month: 43,200
Allowed downtime: 43,200 × (1 - 0.999) = 43.2 minutes
```

**Usage:**
- Maintenance: 30 minutes/month
- Incident recovery: 10 minutes/month
- Buffer: 3.2 minutes/month

---

## Troubleshooting

### Common Issues

**High API Latency**
1. Check database performance
2. Review slow queries
3. Check cache hit rate
4. Review service logs
5. Check infrastructure metrics

**High Error Rate**
1. Check error logs
2. Review recent deployments
3. Check external service status
4. Review database connectivity
5. Check rate limiting

**Memory Leak**
1. Monitor memory growth over time
2. Check for unclosed connections
3. Review recent code changes
4. Use profiling tools
5. Check garbage collection

**Database Performance**
1. Check query performance
2. Review table statistics
3. Check index usage
4. Review connection pool
5. Check replication lag

### Debugging Tools

**Logs:**
```bash
# View recent logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50

# Search for errors
gcloud logging read "severity=ERROR" --limit 100

# Follow logs in real-time
gcloud logging read --follow
```

**Metrics:**
```bash
# Query Prometheus
curl http://localhost:9090/api/v1/query?query=up

# Export metrics
curl http://localhost:8000/metrics
```

**Traces:**
```bash
# Access Jaeger UI
http://localhost:16686

# Search traces by service
Service: control-plane
Operation: agent_run
```

---

## Best Practices

1. **Monitor Early** - Instrument code from day one
2. **Alert Wisely** - Avoid alert fatigue
3. **Document Runbooks** - Have playbooks for common issues
4. **Test Alerting** - Regularly test alert channels
5. **Review Metrics** - Weekly review of key metrics
6. **Optimize Queries** - Regularly optimize slow queries
7. **Capacity Planning** - Plan for growth
8. **Incident Review** - Post-mortem for every incident

---

**Next Steps:**
- [Operations Runbook](./OPERATIONS_RUNBOOK.md)
- [Security & Compliance](./SECURITY_COMPLIANCE.md)
- [Architecture Guide](./ARCHITECTURE.md)
