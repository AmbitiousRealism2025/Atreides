# Oh My Opencode - Orchestration Features

## Overview

Oh My Opencode provides a sophisticated orchestration system centered around **Sisyphus**, the primary orchestrator agent. The system enables intelligent task delegation, parallel execution, and multi-agent coordination.

## Sisyphus Orchestrator

Sisyphus is the core orchestrating agent that manages the entire workflow. It uses Claude Opus 4.5 (`anthropic/claude-opus-4-5`) for maximum reasoning capability.

### Core Competencies
- Task delegation and parallel execution
- Agent coordination and management
- Codebase assessment and analysis
- Intelligent request classification

## Workflow Phases

### Phase 0: Intent Gate

Sisyphus first classifies incoming requests into categories:

| Category | Description | Action |
|----------|-------------|--------|
| **Trivial** | Simple, direct questions | Answer directly |
| **Explicit** | Clear implementation requests | Execute immediately |
| **Exploratory** | Needs investigation | Fire background agents |
| **Open-ended** | Architectural decisions | Assess codebase first |
| **GitHub Work** | Issues/PRs | Follow GitHub workflow |
| **Ambiguous** | Unclear requirements | Ask clarifying questions |

**Key Behavior**: When external libraries or multiple modules are mentioned, Sisyphus proactively triggers background agents.

### Phase 1: Codebase Assessment

For open-ended tasks, Sisyphus evaluates the codebase maturity:

| Maturity Level | Behavior |
|----------------|----------|
| **Disciplined** | Follow existing patterns strictly |
| **Transitional** | Migrate to better patterns gradually |
| **Legacy/Chaotic** | Propose cleanup alongside changes |
| **Greenfield** | Establish new best practices |

### Phase 2A: Exploration & Research

Sisyphus selects tools based on cost and complexity:

- **`explore`** agent - "Contextual grep" for internal codebase search
- **`librarian`** agent - "Reference grep" for external documentation

Both agents are fired **in parallel as background tasks**, allowing Sisyphus to continue working immediately.

### Phase 2B: Implementation

1. Creates detailed TODO lists
2. Delegates visual frontend work to `frontend-ui-ux-engineer`
3. Handles pure business logic directly
4. Uses verification with `lsp_diagnostics`

### Phase 2C: Failure Recovery

After three consecutive failures:
1. Stop current approach
2. Revert changes
3. Document the issue
4. Consult Oracle agent for advice

### Phase 3: Completion

- Verify all TODOs are complete
- Cancel any running background tasks
- Deliver final answer

## Task Delegation Mechanism

### Explicit Delegation Prompt Structure

When delegating to subagents, Sisyphus uses:

```
Task: [specific task description]
Expected Outcome: [what success looks like]
Required Skills/Tools: [list of needed capabilities]
MUST DO: [explicit requirements]
MUST NOT DO: [explicit restrictions]
```

### Background Task System

```typescript
// Spawn background agent
const result = await call_omo_agent({
  agent: "explore",
  task: "Find all authentication implementations",
  run_in_background: true
});
```

Background agents:
- Execute asynchronously
- Allow Sisyphus to continue immediately
- Results collected when needed

## Parallel Execution

### When to Use Parallel Execution
- Multiple independent file searches
- External documentation + internal codebase search
- Multiple module analysis

### Tool Selection Matrix

| Task Type | Agent/Tool | Cost |
|-----------|------------|------|
| Internal search | `explore` | Low |
| External docs | `librarian` | Medium |
| Code review | `oracle` | High |
| UI implementation | `frontend-ui-ux-engineer` | Medium |

## The `ultrawork` Magic Word

Including `ultrawork` or `ulw` in your prompt activates maximum capability mode:

```
ultrawork: Implement user authentication with OAuth
```

**Effects:**
- Automatically leverages all available features
- Enables parallel agent execution
- Activates deep exploration mode
- Uses background tasks optimally

## Configuration Options

### Main Configuration File

Location: `~/.config/opencode/oh-my-opencode.json` or `.opencode/oh-my-opencode.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/schema.json",
  "agents": {
    "sisyphus": {
      "model": "anthropic/claude-opus-4-5"
    }
  },
  "ralph_loop": {
    "enabled": true,
    "default_max_iterations": 100
  }
}
```

### Agent Overrides

```json
{
  "agents": {
    "overrides": {
      "sisyphus": {
        "model": "custom-model-id",
        "reasoningEffort": "high"
      }
    }
  }
}
```

### Model-Specific Configuration

- **GPT models**: Uses `reasoningEffort` parameter
- **Claude models**: Uses `thinking` budget

## Environment Context Injection

Sisyphus and librarian agents receive runtime environment information:

- Working directory
- Platform (darwin/linux/windows)
- Current date and time
- Timezone
- Locale

This enables time-aware and platform-aware decisions.

## Task Management Integration

### Todo Continuation Enforcer

The system includes a hook that forces agents to complete all TODOs:

- Prevents agents from "quitting halfway"
- Adds 500ms grace period for countdown cancellation
- Forces "bouldering mode" until task completion

## Orchestration Flow Diagram

```
User Request
     │
     ▼
┌─────────────────┐
│  Intent Gate    │  ◄── Phase 0: Classify request
│  (Sisyphus)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Codebase Assess │  ◄── Phase 1: Evaluate maturity
│  (if open-ended)│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌─────────┐
│explore│ │librarian│  ◄── Phase 2A: Parallel research
└───┬───┘ └────┬────┘
    │          │
    └────┬─────┘
         │
         ▼
┌─────────────────┐
│ Implementation  │  ◄── Phase 2B: Execute with TODOs
│   + Delegation  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Verification  │  ◄── lsp_diagnostics check
│   + Completion  │
└─────────────────┘
```

## Sources

- [GitHub - code-yeongyu/oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- [DeepWiki - Oh My Opencode](https://deepwiki.com/code-yeongyu/oh-my-opencode)
- [npm - oh-my-opencode](https://www.npmjs.com/package/oh-my-opencode)
