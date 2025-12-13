# Agent Development Guide

Learn how to build and publish agents for the Agent Marketplace Platform.

---

## Table of Contents

1. [Agent Basics](#agent-basics)
2. [Agent Structure](#agent-structure)
3. [Agent Manifest](#agent-manifest)
4. [Building Your First Agent](#building-your-first-agent)
5. [Testing Agents](#testing-agents)
6. [Publishing to Marketplace](#publishing-to-marketplace)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## Agent Basics

### What is an Agent?

An **agent** is an AI-powered automation tool that:
- Performs specific tasks (e.g., cost optimization, compliance checking)
- Takes inputs and produces outputs
- Uses tools to interact with external systems
- Learns from past executions
- Requires explicit permissions

### Agent Capabilities

**Input Processing:**
- Accept structured inputs (JSON, YAML)
- Validate input schemas
- Support multiple input types

**Tool Execution:**
- Call external tools (APIs, cloud services)
- Handle tool responses
- Manage permissions and access

**Output Generation:**
- Produce structured outputs
- Generate recommendations
- Create reports

**Learning:**
- Store execution history
- Learn from past runs
- Improve over time

### Agent Lifecycle

```
1. Development
   ├─ Create manifest
   ├─ Build container image
   ├─ Write tests
   └─ Local testing

2. Submission
   ├─ Submit to marketplace
   ├─ Automated security scan
   └─ Manual review

3. Certification
   ├─ Approval by marketplace
   ├─ Publish to marketplace
   └─ Version tracking

4. Deployment
   ├─ User installs agent
   ├─ Agent runs in SaaS or BYOC
   └─ Continuous execution

5. Maintenance
   ├─ Monitor performance
   ├─ Update agent
   ├─ Release new versions
   └─ Collect feedback
```

---

## Agent Structure

### Directory Layout

```
my-agent/
├── agent.py                 # Main agent code
├── manifest.yaml            # Agent metadata
├── tools.py                 # Tool definitions
├── prompts.py               # LLM prompts
├── memory.py                # Memory handling
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container image
├── tests/
│   ├── test_agent.py
│   ├── test_tools.py
│   └── test_integration.py
├── examples/
│   ├── sample_input.json
│   └── sample_output.json
└── README.md                # Documentation
```

### Core Files

**agent.py** - Main agent logic
```python
from langchain.agents import AgentExecutor
from langgraph.graph import StateGraph

class MyAgent:
    def __init__(self, config):
        self.config = config
        self.tools = self.load_tools()
        self.graph = self.build_graph()

    def load_tools(self):
        # Load tools from tools.py
        pass

    def build_graph(self):
        # Build LangGraph workflow
        pass

    async def run(self, inputs):
        # Execute agent
        pass
```

**manifest.yaml** - Agent metadata
```yaml
agent_id: com.mycompany.my-agent
name: My Agent
version: 1.0.0
description: "Agent description"
# ... more fields
```

**tools.py** - Tool definitions
```python
from langchain.tools import Tool

def get_tools():
    return [
        Tool(
            name="tool_name",
            func=tool_function,
            description="Tool description"
        ),
    ]
```

---

## Agent Manifest

### Complete Manifest Example

```yaml
# Basic Information
agent_id: com.mycompany.cost-optimizer
name: Cost Optimizer
version: 1.0.0
description: "Identify and remediate cloud cost waste"

# Author Information
author:
  name: "My Company"
  contact: "support@mycompany.com"
  website: "https://mycompany.com"

# Categorization
category: finops
tags: ["cost", "optimization", "aws"]
icon: "https://cdn.example.com/icons/cost-optimizer.png"

# Input/Output Contract
inputs:
  - name: cloud_provider
    type: enum
    enum: ["aws", "gcp", "azure"]
    required: true
    description: "Cloud provider to analyze"

  - name: time_window
    type: string
    format: "YYYY-MM-DD/YYYY-MM-DD"
    required: true
    description: "Date range for analysis"

  - name: include_recommendations
    type: boolean
    required: false
    default: true
    description: "Include cost optimization recommendations"

outputs:
  - name: cost_analysis
    type: json
    description: "Detailed cost analysis"

  - name: recommendations
    type: array
    items:
      type: object
      properties:
        action: string
        savings: number
        risk_level: string

  - name: report_url
    type: uri
    description: "URL to detailed report"

# Tools & Permissions
tools:
  - name: aws-ce
    vendor: aws
    permissions:
      - ce:GetCostAndUsage
      - ce:GetDimensionValues

  - name: aws-ec2
    vendor: aws
    permissions:
      - ec2:DescribeInstances
      - ec2:DescribeTags

permissions:
  - resource: "billing_read"
    scope: "read-only"
    description: "Read access to billing data"

  - resource: "compute_read"
    scope: "read-only"
    description: "Read access to compute resources"

  - resource: "compute_write"
    scope: "optional"
    description: "Terminate unused resources (optional)"

# Constraints & Safety
constraints:
  - "no-destructive-operations"
  - "log-every-action"
  - "requires-human-approval-for-remediation"
  - "max-concurrent-runs: 5"
  - "max-execution-time: 3600"

# Runtime Configuration
runtime:
  default: "vendor-hosted"
  supported: ["vendor-hosted", "in-customer-k8s"]
  container_image: "gcr.io/mycompany/cost-optimizer:1.0.0"
  helm_chart: "https://repo.example.com/charts/cost-optimizer-1.0.0.tgz"

  memory_requirements:
    level_1_session: "100MB"
    level_2_task: "500MB"
    level_3_vector: "1GB"
    level_4_episode: "500MB"
    level_5_preference: "100MB"

  compute_requirements:
    cpu: "2"
    memory: "4Gi"
    disk: "10Gi"

# Observability
logging: true
tracing: true
metrics:
  - name: run_duration_seconds
  - name: resources_analyzed
  - name: cost_savings_total

# Risk & Certification
risk_level: "medium"
certification:
  automated_scans_passed: true
  manual_review_id: "rev-2025-001"
  certified_date: "2025-12-01"

# Versioning
release_notes: "v1.0 - Initial release"
changelog:
  - version: 1.0.0
    date: 2025-12-01
    changes:
      - "Initial release"
      - "Support for AWS"

# Pricing
pricing:
  model: "per-run"
  base_price: 1.00
  per_unit: 0.001
  monthly_subscription: 299.00

# SLA
sla:
  uptime_percent: 99.5
  response_time_seconds: 300
  support_level: "standard"
```

---

## Building Your First Agent

### Step 1: Create Project Structure

```bash
mkdir my-agent
cd my-agent

# Create directories
mkdir -p tests examples

# Create files
touch agent.py manifest.yaml tools.py prompts.py memory.py
touch requirements.txt Dockerfile README.md
```

### Step 2: Write the Manifest

```yaml
# manifest.yaml
agent_id: com.mycompany.my-agent
name: My Agent
version: 1.0.0
description: "My first agent"
author:
  name: "My Company"
  contact: "support@mycompany.com"
category: devops
tags: ["automation"]
inputs:
  - name: action
    type: string
    required: true
outputs:
  - name: result
    type: json
constraints:
  - "log-every-action"
runtime:
  container_image: "gcr.io/mycompany/my-agent:1.0.0"
```

### Step 3: Implement Tools

```python
# tools.py
from langchain.tools import Tool

def get_system_info():
    """Get system information"""
    return {
        "os": "linux",
        "memory": "8GB",
        "cpu": "4 cores"
    }

def log_action(action):
    """Log an action"""
    print(f"[LOG] {action}")
    return {"status": "logged"}

def get_tools():
    return [
        Tool(
            name="get_system_info",
            func=get_system_info,
            description="Get system information"
        ),
        Tool(
            name="log_action",
            func=log_action,
            description="Log an action"
        ),
    ]
```

### Step 4: Build the Agent

```python
# agent.py
from langgraph.graph import StateGraph
from tools import get_tools
import json

class MyAgent:
    def __init__(self):
        self.tools = get_tools()
        self.graph = self.build_graph()

    def build_graph(self):
        graph = StateGraph(dict)

        # Define nodes
        graph.add_node("start", self.start_node)
        graph.add_node("process", self.process_node)
        graph.add_node("end", self.end_node)

        # Define edges
        graph.add_edge("start", "process")
        graph.add_edge("process", "end")

        # Set entry point
        graph.set_entry_point("start")

        return graph.compile()

    def start_node(self, state):
        print("Starting agent...")
        return state

    def process_node(self, state):
        # Call tools
        system_info = self.tools[0].func()
        self.tools[1].func("Processing system info")
        state["system_info"] = system_info
        return state

    def end_node(self, state):
        print("Agent complete")
        return state

    async def run(self, inputs):
        """Execute the agent"""
        state = {"inputs": inputs}
        result = self.graph.invoke(state)
        return {
            "result": result,
            "status": "success"
        }

# Main entry point
async def main(inputs):
    agent = MyAgent()
    return await agent.run(inputs)
```

### Step 5: Write Tests

```python
# tests/test_agent.py
import pytest
from agent import MyAgent

@pytest.mark.asyncio
async def test_agent_runs():
    agent = MyAgent()
    result = await agent.run({"action": "test"})
    assert result["status"] == "success"

@pytest.mark.asyncio
async def test_agent_output():
    agent = MyAgent()
    result = await agent.run({"action": "test"})
    assert "result" in result
    assert "system_info" in result["result"]
```

### Step 6: Create Dockerfile

```dockerfile
# Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy agent code
COPY . .

# Run agent
CMD ["python", "-m", "uvicorn", "agent:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Step 7: Build & Test Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest tests/

# Build Docker image
docker build -t gcr.io/mycompany/my-agent:1.0.0 .

# Run locally
docker run -p 8000:8000 gcr.io/mycompany/my-agent:1.0.0
```

---

## Testing Agents

### Unit Tests

```python
# tests/test_tools.py
from tools import get_tools

def test_get_system_info():
    tools = get_tools()
    system_info = tools[0].func()
    assert "os" in system_info
    assert "memory" in system_info

def test_log_action():
    tools = get_tools()
    result = tools[1].func("Test action")
    assert result["status"] == "logged"
```

### Integration Tests

```python
# tests/test_integration.py
import pytest
from agent import MyAgent

@pytest.mark.asyncio
async def test_full_workflow():
    agent = MyAgent()
    
    # Test with sample input
    result = await agent.run({
        "action": "optimize_costs"
    })
    
    # Verify output
    assert result["status"] == "success"
    assert "result" in result
    assert "system_info" in result["result"]
```

### Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_agent.py

# Run with coverage
pytest --cov=.

# Run in watch mode
pytest-watch
```

---

## Publishing to Marketplace

### Step 1: Prepare for Submission

```bash
# Create submission package
mkdir submission
cp manifest.yaml submission/
cp Dockerfile submission/
cp requirements.txt submission/
cp README.md submission/
cp -r examples submission/
```

### Step 2: Submit Agent

```bash
# Via CLI (when available)
agent-marketplace submit ./submission

# Or via web UI
# 1. Go to Developer Portal
# 2. Click "Submit Agent"
# 3. Upload manifest.yaml
# 4. Upload Dockerfile
# 5. Upload requirements.txt
# 6. Add description and examples
# 7. Submit for review
```

### Step 3: Automated Scanning

The platform will automatically:
- Scan for security vulnerabilities
- Validate manifest schema
- Check container image
- Verify permissions
- Test basic functionality

### Step 4: Manual Review

A marketplace reviewer will:
- Review agent functionality
- Verify permissions are appropriate
- Check documentation
- Test with sample inputs
- Approve or request changes

### Step 5: Publication

Once approved:
- Agent appears in marketplace
- Users can install and use
- You receive revenue share
- Monitor performance metrics

---

## Best Practices

### 1. Security

**Never:**
- Store secrets in code
- Log sensitive data
- Use hardcoded credentials
- Skip input validation

**Always:**
- Use environment variables for secrets
- Validate all inputs
- Sanitize outputs
- Log important events

### 2. Performance

**Optimize:**
- Minimize API calls
- Cache results
- Use batch operations
- Implement timeouts

**Monitor:**
- Track execution time
- Monitor memory usage
- Log performance metrics
- Optimize slow operations

### 3. Reliability

**Handle:**
- Network failures
- Timeouts
- Invalid inputs
- Tool errors

**Test:**
- Happy path
- Error cases
- Edge cases
- Load testing

### 4. Documentation

**Include:**
- Clear manifest
- Usage examples
- Sample inputs/outputs
- Troubleshooting guide
- Release notes

---

## Examples

### Example 1: Simple Echo Agent

```python
# agent.py
async def main(inputs):
    return {
        "echo": inputs.get("message", ""),
        "timestamp": datetime.now().isoformat()
    }
```

### Example 2: Cost Analysis Agent

```python
# agent.py
async def main(inputs):
    provider = inputs.get("provider")
    
    # Fetch billing data
    billing_data = await fetch_billing(provider)
    
    # Analyze costs
    analysis = analyze_costs(billing_data)
    
    # Generate recommendations
    recommendations = generate_recommendations(analysis)
    
    return {
        "analysis": analysis,
        "recommendations": recommendations,
        "status": "success"
    }
```

### Example 3: Multi-Step Workflow

```python
# agent.py
from langgraph.graph import StateGraph

def build_workflow():
    graph = StateGraph(dict)
    
    graph.add_node("fetch_data", fetch_data_node)
    graph.add_node("analyze", analyze_node)
    graph.add_node("generate_report", report_node)
    
    graph.add_edge("fetch_data", "analyze")
    graph.add_edge("analyze", "generate_report")
    
    graph.set_entry_point("fetch_data")
    
    return graph.compile()
```

---

## Resources

- [Agent Manifest Spec](./PRD.md#agent-manifest-specification)
- [API Reference](./API_SPECIFICATION.md)
- [LangGraph Docs](https://langchain.com/langgraph)
- [Google ADK Docs](https://developers.google.com/agents)
- [Python Best Practices](https://pep8.org)

---

**Next Steps:**
- [Quick Start Guide](./QUICKSTART.md)
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Specification](./API_SPECIFICATION.md)
