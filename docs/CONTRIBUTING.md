# Contributing Guide

Thank you for your interest in contributing to the Agent Marketplace Platform! This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)
8. [Reporting Issues](#reporting-issues)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to:

- Be respectful and inclusive
- Welcome diverse perspectives
- Assume good intent
- Address concerns constructively
- Focus on what is best for the community

### Expected Behavior

- Use welcoming and inclusive language
- Be respectful of differing opinions
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Offensive language or comments
- Trolling or personal attacks
- Publishing private information
- Other conduct that is inappropriate

---

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.10+
- Git
- Docker (optional)
- Google Cloud account (for deployment)

### Fork & Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/agent-marketplace
cd agent-marketplace

# Add upstream remote
git remote add upstream https://github.com/mabhishe/agent-marketplace
```

### Install Dependencies

```bash
# Install Node dependencies
pnpm install

# Install Python dependencies (optional)
pip install -r requirements.txt
```

### Set Up Development Environment

```bash
# Create .env.local file
cp .env.example .env.local

# Update with your values
# GOOGLE_PROJECT_ID=...
# DATABASE_URL=...
# etc.
```

### Start Development Server

```bash
# Start frontend and backend
pnpm dev

# In another terminal, start Data Plane (optional)
python -m uvicorn data_plane.main:app --reload --port 8000
```

---

## Development Workflow

### Create a Branch

```bash
# Update main branch
git fetch upstream
git checkout main
git rebase upstream/main

# Create feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### Make Changes

1. Make your changes in the feature branch
2. Write tests for new functionality
3. Update documentation if needed
4. Ensure code follows style guide

### Commit Changes

```bash
# Stage changes
git add .

# Commit with clear message
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"
git commit -m "docs: update documentation"
git commit -m "test: add test cases"
```

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style (no logic change)
- `refactor:` Refactoring
- `test:` Adding tests
- `chore:` Build, dependencies, etc.

**Example:**
```
feat(marketplace): add agent search functionality

- Implement full-text search on agent names and descriptions
- Add search filters for category and price
- Update API endpoint /api/v1/agents/search

Closes #123
```

### Push Changes

```bash
# Push to your fork
git push origin feature/your-feature-name
```

---

## Coding Standards

### TypeScript

**Style Guide:**
- Use `const` and `let`, avoid `var`
- Use arrow functions
- Use explicit types
- Use interfaces for object types
- Use enums for constants

**Example:**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = (id: number): User | null => {
  // Implementation
};
```

### Python

**Style Guide:**
- Follow PEP 8
- Use type hints
- Use docstrings
- Use meaningful variable names
- Max line length: 100 characters

**Example:**
```python
from typing import Optional

class Agent:
    """Represents an AI agent."""
    
    def __init__(self, agent_id: str, name: str) -> None:
        """Initialize an agent.
        
        Args:
            agent_id: Unique agent identifier
            name: Human-readable agent name
        """
        self.agent_id = agent_id
        self.name = name
    
    def run(self, inputs: dict) -> dict:
        """Execute the agent.
        
        Args:
            inputs: Agent input parameters
            
        Returns:
            Agent output results
        """
        # Implementation
        pass
```

### React Components

**Style Guide:**
- Use functional components
- Use hooks for state management
- Use TypeScript for type safety
- Use descriptive component names
- Keep components small and focused

**Example:**
```typescript
interface AgentCardProps {
  agentId: string;
  name: string;
  description: string;
  onInstall: (agentId: string) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agentId,
  name,
  description,
  onInstall,
}) => {
  return (
    <div className="agent-card">
      <h3>{name}</h3>
      <p>{description}</p>
      <button onClick={() => onInstall(agentId)}>Install</button>
    </div>
  );
};
```

### Code Formatting

```bash
# Format code
pnpm format

# Check formatting
pnpm format --check

# Lint code
pnpm lint
```

---

## Testing

### Unit Tests

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

### Writing Tests

**Example (Vitest):**
```typescript
import { describe, it, expect } from 'vitest';
import { getAgent } from './agent';

describe('getAgent', () => {
  it('returns agent by id', async () => {
    const agent = await getAgent(1);
    expect(agent).toBeDefined();
    expect(agent.name).toBe('Billing Normalizer');
  });

  it('returns null for non-existent agent', async () => {
    const agent = await getAgent(999);
    expect(agent).toBeNull();
  });
});
```

### Test Coverage

- Aim for 80%+ code coverage
- Test happy path and error cases
- Test edge cases
- Test integration between components

---

## Documentation

### Code Comments

**Good Comments:**
```typescript
// Fetch agent details from database
const agent = await db.query.agents.findFirst({
  where: eq(agents.id, agentId),
});
```

**Avoid:**
```typescript
// Get agent
const agent = await getAgent(agentId); // This is obvious
```

### Documentation Files

**Update if you:**
- Add new features
- Change API endpoints
- Change database schema
- Add new configuration options
- Change deployment process

**Files to Update:**
- `README.md` - Overview
- `docs/API_SPECIFICATION.md` - API changes
- `docs/ARCHITECTURE.md` - Architecture changes
- `docs/DEVELOPER_GUIDE.md` - Development guide
- `docs/AGENT_DEVELOPMENT.md` - Agent development

---

## Pull Request Process

### Before Submitting

1. **Update your branch:**
```bash
git fetch upstream
git rebase upstream/main
```

2. **Run tests:**
```bash
pnpm test
```

3. **Check formatting:**
```bash
pnpm format --check
```

4. **Build the project:**
```bash
pnpm build
```

### Submit Pull Request

1. **Push your branch:**
```bash
git push origin feature/your-feature-name
```

2. **Create Pull Request:**
- Go to GitHub
- Click "New Pull Request"
- Select your branch
- Fill in PR template

3. **PR Description:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #123

## Testing
Describe testing performed

## Checklist
- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No breaking changes
```

### Code Review

- Address feedback constructively
- Push changes to same branch
- Don't force push after review starts
- Respond to all comments
- Request re-review when done

### Merge

- Squash commits if needed
- Ensure CI passes
- Get approval from maintainers
- Merge to main branch

---

## Reporting Issues

### Bug Reports

**Template:**
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS]
- Node version: [e.g., 18.0.0]
- Python version: [e.g., 3.10]

## Logs
Relevant error logs or stack traces
```

### Feature Requests

**Template:**
```markdown
## Description
Clear description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should it work?

## Alternatives
Other approaches considered
```

---

## Getting Help

- **Documentation:** See [README.md](./README.md)
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Slack:** Community Slack channel
- **Email:** developers@aicloudguard.com

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in community

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
