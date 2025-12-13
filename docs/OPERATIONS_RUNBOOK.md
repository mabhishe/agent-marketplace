# Operations Runbook

Day-to-day operational procedures and incident response playbooks for the Agent Marketplace Platform.

---

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Incident Response](#incident-response)
3. [Deployment Procedures](#deployment-procedures)
4. [Backup & Recovery](#backup--recovery)
5. [Scaling Operations](#scaling-operations)
6. [Maintenance Windows](#maintenance-windows)
7. [Troubleshooting Procedures](#troubleshooting-procedures)

---

## Daily Operations

### Morning Checklist (9:00 AM)

**1. System Health Check**
```bash
# Check service status
gcloud run services list

# Check database status
gcloud sql instances describe agent-marketplace-db

# Check uptime
curl https://api.agentmarketplace.com/health
```

**2. Review Alerts**
- Check PagerDuty for overnight incidents
- Review Slack #alerts channel
- Check error logs from last 24 hours

**3. Review Metrics**
- API latency (p95, p99)
- Error rate
- Agent run success rate
- Active users
- Revenue metrics

**4. Review Customer Issues**
- Check support tickets
- Review GitHub issues
- Check community Slack

### Hourly Checks (During Business Hours)

**1. Monitor Key Metrics**
```bash
# Check API latency
curl http://localhost:9090/api/v1/query?query=api_latency_p95

# Check error rate
curl http://localhost:9090/api/v1/query?query=error_rate

# Check agent runs
curl http://localhost:9090/api/v1/query?query=agent_runs_total
```

**2. Review Recent Deployments**
- Check if any deployments failed
- Verify rollback if needed

**3. Check Infrastructure**
- CPU and memory usage
- Disk usage
- Network I/O

### End of Day Checklist (5:00 PM)

**1. Review Daily Metrics**
- Daily active users
- Agent runs completed
- Revenue generated
- Errors and issues

**2. Prepare for Tomorrow**
- Review scheduled maintenance
- Check forecast for issues
- Prepare incident response if needed

**3. Update Status Page**
- Publish daily status
- Note any incidents
- Communicate with customers

---

## Incident Response

### Incident Severity Levels

| Level | Definition | Response Time | Escalation |
|-------|-----------|---------------|-----------|
| Critical | Service down, data loss | 15 minutes | CEO, VP Eng, CTO |
| High | Partial outage, security issue | 1 hour | VP Eng, On-call Lead |
| Medium | Degraded performance | 4 hours | Engineering Lead |
| Low | Minor bug, non-urgent | 24 hours | Team Lead |

### Critical Incident Playbook

**Step 1: Declare Incident (0-5 min)**
```
1. Page on-call engineer via PagerDuty
2. Create incident in Slack (#critical-incidents)
3. Assign incident commander
4. Create war room (Zoom link in Slack)
5. Notify stakeholders
```

**Step 2: Initial Assessment (5-15 min)**
```
1. Assess impact (# users affected, revenue impact)
2. Determine scope (which services affected)
3. Check recent changes (deployments, config changes)
4. Review logs and metrics
5. Identify potential root cause
```

**Step 3: Mitigation (15-60 min)**
```
1. Implement immediate workaround
2. Isolate affected systems
3. Rollback recent changes if needed
4. Scale up resources if needed
5. Update status page every 15 minutes
```

**Step 4: Resolution (60+ min)**
```
1. Implement permanent fix
2. Test in staging environment
3. Deploy to production
4. Verify resolution
5. Monitor for 30 minutes
6. Close incident
```

**Step 5: Post-Incident (24 hours)**
```
1. Write incident report
2. Conduct root cause analysis
3. Identify preventive measures
4. Schedule follow-up meeting
5. Communicate with customers
```

### Common Incident Scenarios

**API Latency Spike**
```
1. Check database performance
2. Review slow queries
3. Check cache hit rate
4. Scale up Cloud Run instances
5. Check for DDoS attack
6. Review recent deployments
```

**Database Connection Pool Exhausted**
```
1. Check active connections
2. Kill idle connections
3. Increase connection pool size
4. Review connection leaks
5. Scale database if needed
```

**Memory Leak in Service**
```
1. Identify affected service
2. Restart service
3. Monitor memory usage
4. Review recent code changes
5. Deploy fix
```

**Agent Execution Failures**
```
1. Check agent logs
2. Verify tool availability
3. Check permissions
4. Review recent agent updates
5. Rollback if needed
```

---

## Deployment Procedures

### Pre-Deployment Checklist

**1. Code Review**
```
- [ ] All tests pass
- [ ] Code review approved
- [ ] No security issues
- [ ] Database migrations tested
- [ ] Documentation updated
```

**2. Testing**
```
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] Security scan passes
```

**3. Staging Validation**
```
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Verify database migrations
- [ ] Check metrics
- [ ] Verify alerts
```

### Deployment Steps

**1. Create Release**
```bash
# Tag release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Create GitHub release
gh release create v1.0.0 --generate-notes
```

**2. Build & Push Image**
```bash
# Build Docker image
docker build -t gcr.io/agent-marketplace/control-plane:1.0.0 .

# Push to registry
docker push gcr.io/agent-marketplace/control-plane:1.0.0
```

**3. Deploy to Production**
```bash
# Update Cloud Run service
gcloud run deploy control-plane \
  --image gcr.io/agent-marketplace/control-plane:1.0.0 \
  --region us-central1

# Verify deployment
gcloud run services describe control-plane
```

**4. Post-Deployment Verification**
```bash
# Check service status
curl https://api.agentmarketplace.com/health

# Monitor metrics
watch -n 5 'curl http://localhost:9090/api/v1/query?query=up'

# Check logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

### Rollback Procedure

**If Deployment Fails:**
```bash
# Identify previous version
gcloud run revisions list --service control-plane

# Rollback to previous version
gcloud run services update-traffic control-plane \
  --to-revisions PREVIOUS_REVISION=100

# Verify rollback
curl https://api.agentmarketplace.com/health
```

---

## Backup & Recovery

### Backup Schedule

**Database Backups:**
- Hourly: Last 24 hours
- Daily: Last 7 days
- Weekly: Last 4 weeks
- Monthly: Last 12 months

**Configuration Backups:**
- Daily: All configuration files
- Weekly: Encrypted backup to Cloud Storage

### Backup Verification

**Daily Verification:**
```bash
# List recent backups
gcloud sql backups list --instance agent-marketplace-db

# Verify backup integrity
gcloud sql backups describe BACKUP_ID \
  --instance agent-marketplace-db

# Test restore (monthly)
gcloud sql backups restore BACKUP_ID \
  --backup-instance agent-marketplace-db-test
```

### Recovery Procedures

**Database Recovery:**
```bash
# List available backups
gcloud sql backups list --instance agent-marketplace-db

# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance agent-marketplace-db

# Verify recovery
gcloud sql connect agent-marketplace-db
```

**Service Recovery:**
```bash
# If service is down
gcloud run deploy control-plane \
  --image gcr.io/agent-marketplace/control-plane:LAST_KNOWN_GOOD

# If database is corrupted
# Follow database recovery steps above

# If data is lost
# Restore from backup and replay transaction log
```

---

## Scaling Operations

### Horizontal Scaling

**Cloud Run Auto-scaling:**
```yaml
# gcloud run services update control-plane \
#   --min-instances 5 \
#   --max-instances 100 \
#   --cpu 2 \
#   --memory 2Gi
```

**Database Scaling:**
```bash
# Increase database machine type
gcloud sql instances patch agent-marketplace-db \
  --tier db-custom-4-16384

# Add read replicas
gcloud sql instances create agent-marketplace-db-read-1 \
  --master-instance-name agent-marketplace-db
```

### Vertical Scaling

**Increase Service Resources:**
```bash
gcloud run services update control-plane \
  --memory 4Gi \
  --cpu 4
```

**Increase Database Resources:**
```bash
gcloud sql instances patch agent-marketplace-db \
  --tier db-custom-8-32768
```

### Load Testing

**Before Scaling:**
```bash
# Run load test
ab -n 10000 -c 100 https://api.agentmarketplace.com/health

# Monitor metrics during test
watch -n 1 'gcloud monitoring time-series list'

# Analyze results
# - Response time
# - Error rate
# - Resource usage
```

---

## Maintenance Windows

### Scheduled Maintenance

**Database Maintenance (Monthly)**
```
Window: Sunday 2:00 AM - 4:00 AM UTC
Activities:
- Database optimization
- Index maintenance
- Backup verification
- Security patches
```

**Infrastructure Maintenance (Quarterly)**
```
Window: First Sunday of quarter, 2:00 AM - 6:00 AM UTC
Activities:
- OS patches
- Security updates
- Infrastructure upgrades
- Disaster recovery testing
```

### Maintenance Communication

**1. Announce (2 weeks before)**
```
Email: All customers
Slack: #announcements
Status Page: Scheduled maintenance notice
```

**2. Remind (1 week before)**
```
Email: Reminder email
Slack: #announcements
Status Page: Updated notice
```

**3. During Maintenance**
```
Status Page: "Maintenance in progress"
Slack: Real-time updates
Email: Summary after completion
```

---

## Troubleshooting Procedures

### Service Won't Start

**Diagnosis:**
```bash
# Check service logs
gcloud logging read "resource.type=cloud_run_revision" --limit 100

# Check configuration
gcloud run services describe control-plane

# Check environment variables
gcloud run services describe control-plane --format json | grep env
```

**Resolution:**
```bash
# Fix configuration
gcloud run services update control-plane \
  --set-env-vars KEY=VALUE

# Restart service
gcloud run services update control-plane \
  --image gcr.io/agent-marketplace/control-plane:CURRENT

# Verify startup
curl https://api.agentmarketplace.com/health
```

### High Memory Usage

**Diagnosis:**
```bash
# Check memory metrics
gcloud monitoring time-series list \
  --filter 'metric.type="run.googleapis.com/container_memory_utilizations"'

# Check for memory leaks
# Review application logs for leak indicators
```

**Resolution:**
```bash
# Increase memory allocation
gcloud run services update control-plane \
  --memory 4Gi

# Identify memory leak
# Review code changes
# Deploy fix

# Monitor memory after fix
watch -n 5 'gcloud monitoring time-series list'
```

### Database Connection Issues

**Diagnosis:**
```bash
# Check connection pool
gcloud sql instances describe agent-marketplace-db

# Check active connections
gcloud sql connect agent-marketplace-db
SELECT count(*) FROM pg_stat_activity;

# Check for idle connections
SELECT * FROM pg_stat_activity WHERE state = 'idle';
```

**Resolution:**
```bash
# Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < now() - interval '1 hour';

# Increase connection pool
# Update database configuration

# Verify connections
SELECT count(*) FROM pg_stat_activity;
```

---

## On-Call Procedures

### On-Call Rotation

**Schedule:**
- Weekly rotation
- Monday 9:00 AM - Friday 5:00 PM (business hours)
- Friday 5:00 PM - Monday 9:00 AM (on-call)

**Responsibilities:**
- Respond to critical incidents within 15 minutes
- Triage and assess incidents
- Implement mitigations
- Escalate if needed
- Document incidents

### On-Call Handoff

**Friday 5:00 PM:**
```
1. Review current status
2. Check for pending issues
3. Review recent changes
4. Verify monitoring is working
5. Confirm on-call contact info
```

**Monday 9:00 AM:**
```
1. Review incidents from weekend
2. Document lessons learned
3. Update runbooks if needed
4. Debrief with team
```

---

## Emergency Contacts

**On-Call Engineer:** PagerDuty  
**VP Engineering:** [contact]  
**CEO:** [contact]  
**Security Team:** security@aicloudguard.com  
**Support Team:** support@aicloudguard.com  

---

**Last Updated:** December 2025  
**Next Review:** March 2026  
**Owner:** VP Engineering
