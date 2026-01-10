# Oh My Opencode (OmO) Agent System - Comprehensive Research Report

This document provides a complete analysis of the agent system in Oh My Opencode (code-yeongyu/oh-my-opencode), including all built-in agents, their configurations, hierarchies, and customization options.

---

## Table of Contents

1. [Overview](#overview)
2. [Built-in Agents](#built-in-agents)
3. [Agent Hierarchy and Roles](#agent-hierarchy-and-roles)
4. [Agent Factory Pattern](#agent-factory-pattern)
5. [Model Assignments](#model-assignments)
6. [Agent Configuration and Customization](#agent-configuration-and-customization)
7. [Creating Custom Agents](#creating-custom-agents)
8. [Agent Communication and Coordination](#agent-communication-and-coordination)
9. [Agent Tools and Capabilities](#agent-tools-and-capabilities)
10. [Permission Matrix](#permission-matrix)
11. [Agent Prompts](#agent-prompts)
12. [Configuration Examples](#configuration-examples)

---

## Overview

Oh My Opencode includes a sophisticated multi-agent system with **seven built-in agents**, each designed for specific tasks within the development workflow. These agents are orchestrated by `Sisyphus` and can be explicitly invoked or automatically delegated tasks based on their specialized roles.

The agent system follows these core principles:
- **Hierarchical orchestration** - Sisyphus acts as the primary orchestrator
- **Specialized roles** - Each agent has a distinct purpose and capability set
- **Configurable permissions** - Fine-grained control over tool access
- **Dynamic delegation** - Background task execution and parallel processing

---

## Built-in Agents

### Complete List of All Built-in Agents

| Agent Name | Purpose | Default Model | Category |
|------------|---------|---------------|----------|
| **Sisyphus** | Primary orchestrator - plans, delegates, and executes complex tasks | `anthropic/claude-opus-4-5` | Orchestrator |
| **oracle** | Expert technical advisor for architecture decisions and code review | `openai/gpt-5.2` | Analytical |
| **librarian** | Multi-repository analysis, external documentation lookup, open-source research | `anthropic/claude-sonnet-4-5` | Research |
| **explore** | Fast codebase exploration and pattern matching | `opencode/grok-code` | Exploration |
| **frontend-ui-ux-engineer** | Creating visually stunning UI/UX components | `google/gemini-3-pro-preview` | Implementation |
| **document-writer** | Technical writing and documentation generation | `google/gemini-3-pro-preview` | Implementation |
| **multimodal-looker** | Visual content analysis - PDFs, images, diagrams | `google/gemini-3-flash` | Analysis |

### Additional Overridable Agent Names

The system also recognizes these specialized variants:
- `OpenCode-Builder` - Specialized build agent variant
- `Planner-Sisyphus` - Planning-focused variant of Sisyphus

---

## Agent Hierarchy and Roles

### Visual Hierarchy

```
                    ┌─────────────────┐
                    │    Sisyphus     │  Primary Orchestrator
                    │ (claude-opus-4-5)│
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
  ┌──────┴──────┐    ┌──────┴──────┐    ┌──────┴──────┐
  │ Analytical  │    │Implementation│    │   Utility   │
  │ (Read-Only) │    │(Write-Enabled)│    │             │
  └─────────────┘    └─────────────┘    └─────────────┘
        │                   │                   │
   ┌────┴────┐         ┌────┴────┐         ┌───┴───┐
   │ oracle  │         │frontend-│         │multi- │
   │librarian│         │ui-ux-   │         │modal- │
   │ explore │         │engineer │         │looker │
   └─────────┘         │document-│         └───────┘
                       │writer   │
                       └─────────┘
```

### Analytical Agents (Read-Only)

These agents focus on analysis and research without modifying files:

1. **oracle** - Strategic technical advisor with deep reasoning
2. **librarian** - External documentation and open-source research
3. **explore** - Fast codebase search and pattern matching
4. **multimodal-looker** - Visual content interpretation

### Implementation Agents (Write-Enabled)

These agents can create and modify files:

1. **Sisyphus** - Full orchestration capabilities
2. **frontend-ui-ux-engineer** - UI/UX implementation
3. **document-writer** - Documentation generation

### Agent Mode Types

| Mode | Description | Usage |
|------|-------------|-------|
| `subagent` | Called by other agents for specialized tasks | `explore`, `librarian`, `oracle`, `document-writer`, `multimodal-looker` |
| `primary` | Main orchestrator handling tasks directly | `Planner-Sisyphus` when enabled |
| `all` | Functions as both primary and subagent | Flexible agents |

---

## Agent Factory Pattern

### How Agents Are Created

Agents are created through a factory pattern implemented in `src/agents/utils.ts`:

```typescript
// Agent factory type
type AgentFactory = (model?: string) => AgentConfig;

// Agent sources map
const agentSources: Record<BuiltinAgentName, AgentFactory | AgentConfig> = {
  Sisyphus: createSisyphusAgent,
  oracle: createOracleAgent,
  librarian: createLibrarianAgent,
  explore: createExploreAgent,
  "frontend-ui-ux-engineer": createFrontendUiUxEngineerAgent,
  "document-writer": createDocumentWriterAgent,
  "multimodal-looker": createMultimodalLookerAgent,
};
```

### createBuiltinAgents Function

The `createBuiltinAgents` function orchestrates agent creation:

```typescript
export function createBuiltinAgents({
  disabledAgents,
  agentOverrides,
  directory,
  systemDefaultModel,
}: CreateBuiltinAgentsOptions): Record<string, AgentConfig> {
  const agents: Record<string, AgentConfig> = {};

  for (const [name, source] of Object.entries(agentSources)) {
    // Skip disabled agents
    if (disabledAgents.includes(name)) continue;

    // Resolve model from overrides or defaults
    const model = agentOverrides[name]?.model ?? systemDefaultModel;

    // Build agent configuration
    const config = buildAgent(source, model);

    // Inject environment context for specific agents
    if (name === "librarian" && directory) {
      config.prompt += createEnvContext(directory);
    }

    // Apply user overrides with deep merge
    if (agentOverrides[name]) {
      mergeAgentConfig(config, agentOverrides[name]);
    }

    agents[name] = config;
  }

  return agents;
}
```

### Agent Registration in builtinAgents

All agents are registered in `src/agents/index.ts`:

```typescript
import { sisyphusAgent } from "./sisyphus";
import { oracleAgent } from "./oracle";
import { librarianAgent } from "./librarian";
import { exploreAgent } from "./explore";
import { frontendUiUxEngineerAgent } from "./frontend-ui-ux-engineer";
import { documentWriterAgent } from "./document-writer";
import { multimodalLookerAgent } from "./multimodal-looker";

export const builtinAgents: Record<string, AgentConfig> = {
  Sisyphus: sisyphusAgent,
  oracle: oracleAgent,
  librarian: librarianAgent,
  explore: exploreAgent,
  "frontend-ui-ux-engineer": frontendUiUxEngineerAgent,
  "document-writer": documentWriterAgent,
  "multimodal-looker": multimodalLookerAgent,
};
```

### Helper Functions

```typescript
// Check if agent source is a factory
function isFactory(source: AgentSource): source is AgentFactory {
  return typeof source === 'function';
}

// Build agent from factory or static config
function buildAgent(source: AgentSource, model?: string): AgentConfig {
  if (isFactory(source)) {
    return source(model);
  }
  return source;
}
```

---

## Model Assignments

### Default Model Assignments

| Agent | Default Model | Fallback Models |
|-------|---------------|-----------------|
| **Sisyphus** | `anthropic/claude-opus-4-5` | `opencode/glm-4.7-free` |
| **oracle** | `openai/gpt-5.2` | `anthropic/claude-opus-4-5`, `opencode/glm-4.7-free` |
| **librarian** | `anthropic/claude-sonnet-4-5` | `google/gemini-3-flash`, `opencode/glm-4.7-free` |
| **explore** | `opencode/grok-code` | `google/gemini-3-flash`, `anthropic/claude-haiku-4-5` |
| **frontend-ui-ux-engineer** | `google/gemini-3-pro-preview` | `google/gemini-3-pro-high`, `anthropic/claude-opus-4-5` |
| **document-writer** | `google/gemini-3-pro-preview` | `google/gemini-3-flash` |
| **multimodal-looker** | `google/gemini-3-flash` | - |

### Dynamic Model Configuration

The `generateOmoConfig` function in `src/cli/config-manager.ts` dynamically assigns models based on available subscriptions (Claude, Gemini, ChatGPT):

```typescript
// Example dynamic model resolution
function resolveModel(agent: string, subscriptions: Subscriptions): string {
  if (agent === "Sisyphus") {
    return subscriptions.claude
      ? "anthropic/claude-opus-4-5"
      : "opencode/glm-4.7-free";
  }
  // ... other agents
}
```

---

## Agent Configuration and Customization

### AgentConfig Type Definition

```typescript
interface AgentConfig {
  // AI model identifier
  model: string;

  // Sampling temperature (0.0 - 2.0)
  temperature: number;

  // Nucleus sampling threshold (0.0 - 1.0)
  top_p?: number;

  // System prompt
  prompt: string;

  // Append to system prompt (without replacing)
  prompt_append?: string;

  // Tool availability (tool_name: boolean)
  tools?: Record<string, boolean>;

  // Completely disable the agent
  disable?: boolean;

  // Human-readable description
  description: string;

  // Agent operational mode
  mode: "subagent" | "primary" | "all";

  // UI display color (hex)
  color?: string;

  // Fine-grained permissions
  permission?: {
    edit?: PermissionValue;
    bash?: PermissionValue | Record<string, PermissionValue>;
    webfetch?: PermissionValue;
    doom_loop?: PermissionValue;
    external_directory?: PermissionValue;
  };
}

type PermissionValue = "ask" | "allow" | "deny";
```

### Configuration File Locations

1. **User-level**: `~/.config/opencode/oh-my-opencode.json`
2. **Project-level**: `.opencode/oh-my-opencode.json`

Project-level configurations override user-level configurations.

### Environment Context Injection

Sisyphus and librarian agents receive runtime environment information:

```typescript
interface EnvironmentContext {
  workingDirectory: string;
  platform: 'darwin' | 'linux' | 'windows';
  date: string;
  time: string;
  timezone: string;
  locale: string;
}

function createEnvContext(directory: string): string {
  return `
<environment>
  <working_directory>${directory}</working_directory>
  <platform>${process.platform}</platform>
  <date>${new Date().toISOString().split('T')[0]}</date>
  <time>${new Date().toISOString().split('T')[1]}</time>
  <timezone>${Intl.DateTimeFormat().resolvedOptions().timeZone}</timezone>
  <locale>${process.env.LANG || 'en_US'}</locale>
</environment>`;
}
```

---

## Creating Custom Agents

### Step 1: Create Agent Definition File

```typescript
// src/agents/my-agent.ts
import type { AgentConfig } from "@opencode-ai/sdk";

export const myAgent: AgentConfig = {
  name: "my-agent",
  model: "anthropic/claude-sonnet-4-5",
  description: "Description of what this agent does",
  mode: "subagent",
  temperature: 0.1,
  prompt: `Your agent's system prompt here.

## Role
Define the agent's role and expertise.

## Mission
Specify what the agent should accomplish.

## Constraints
List any limitations or restrictions.

## Response Format
Define how the agent should structure responses.`,
};

// Or use a factory function for dynamic configuration
export function createMyAgent(model?: string): AgentConfig {
  return {
    name: "my-agent",
    model: model ?? "anthropic/claude-sonnet-4-5",
    description: "Description of what this agent does",
    mode: "subagent",
    temperature: 0.1,
    prompt: `Your system prompt...`,
  };
}
```

### Step 2: Register in builtinAgents

```typescript
// src/agents/index.ts
import { myAgent } from "./my-agent";

export const builtinAgents: Record<string, AgentConfig> = {
  // ... existing agents
  "my-agent": myAgent,
};
```

### Step 3: Update Types (if needed)

```typescript
// src/agents/types.ts
export type BuiltinAgentName =
  | "Sisyphus"
  | "oracle"
  | "librarian"
  | "explore"
  | "frontend-ui-ux-engineer"
  | "document-writer"
  | "multimodal-looker"
  | "my-agent"; // Add new agent
```

### Step 4: Build Schema

```bash
bun run build:schema
```

### Alternative: JSON Configuration

You can also define custom agents via `oh-my-opencode.json`:

```json
{
  "agents": {
    "my-custom-agent": {
      "model": "anthropic/claude-sonnet-4-5",
      "description": "Custom agent for specific tasks",
      "mode": "subagent",
      "temperature": 0.2,
      "prompt": "You are a specialized agent...",
      "permission": {
        "edit": "allow",
        "bash": "ask"
      }
    }
  }
}
```

---

## Agent Communication and Coordination

### Hierarchical Orchestration Model

Sisyphus acts as the primary orchestrator, delegating tasks to specialized subagents:

```
User Request
     │
     ▼
  Sisyphus (Orchestrator)
     │
     ├──► oracle (architecture advice)
     │
     ├──► explore (codebase search) [background]
     │
     ├──► librarian (documentation) [background]
     │
     ├──► frontend-ui-ux-engineer (UI work)
     │
     ├──► document-writer (documentation)
     │
     └──► multimodal-looker (visual analysis)
```

### call_omo_agent Tool

The `call_omo_agent` tool spawns `explore` and `librarian` agents:

```typescript
// Synchronous execution
call_omo_agent({
  subagent_type: "explore",
  prompt: "Find all authentication implementations",
});

// Asynchronous background execution
call_omo_agent({
  subagent_type: "librarian",
  prompt: "Research React 18 concurrent features",
  run_in_background: true, // Returns task_id immediately
});
```

### Background Task Management

```typescript
// Launch background task
const taskId = await call_omo_agent({
  subagent_type: "explore",
  prompt: "Find all API endpoints",
  run_in_background: true,
});

// Retrieve results later
const results = await background_output({ task_id: taskId });

// Cancel if needed
await background_cancel({ task_id: taskId });
```

### Sisyphus Workflow Phases

1. **Intent Gate (Phase 0)**: Classifies requests
   - Trivial, Explicit, Exploratory, Open-ended, GitHub Work, Ambiguous

2. **Codebase Assessment (Phase 1)**: Assesses codebase maturity
   - Disciplined, Transitional, Legacy/Chaotic, Greenfield

3. **Exploration & Research (Phase 2A)**: Launches parallel agents
   - Uses `explore` for contextual grep
   - Uses `librarian` for reference grep

4. **Implementation (Phase 2B)**: Creates TODOs and delegates
   - Delegates visual work to `frontend-ui-ux-engineer`
   - Handles pure logic directly

5. **Failure Recovery (Phase 2C)**: Handles failures
   - Stop, revert, document, consult Oracle after 3 failures

6. **Completion (Phase 3)**: Validates and delivers results

### Delegation Prompt Structure

```markdown
## Task Delegation to [Agent Name]

**Task**: [Specific task description]
**Expected Outcome**: [Success criteria]
**Required Skills and Tools**: [List of tools]

### MUST DO:
- [Requirement 1]
- [Requirement 2]

### MUST NOT DO:
- [Restriction 1]
- [Restriction 2]
```

---

## Agent Tools and Capabilities

### Core Tools Available to Agents

| Tool Category | Tools | Description |
|---------------|-------|-------------|
| **File System** | `read`, `write`, `edit`, `grep`, `glob` | File operations |
| **Shell** | `bash`, `interactive_bash` | Command execution |
| **Background** | `background_task`, `background_output`, `background_cancel` | Async task management |
| **Session** | `session_list`, `session_read`, `session_search`, `session_info` | Session management |
| **Agent** | `call_omo_agent`, `look_at` | Agent delegation |
| **Skills** | `skill`, `skill_mcp` | Skill execution |

### LSP Tools

| Tool | Description |
|------|-------------|
| `lsp_hover` | Type information, documentation, signatures |
| `lsp_goto_definition` | Navigate to symbol definition |
| `lsp_find_references` | Find all symbol usages |
| `lsp_document_symbols` | File symbol outline |
| `lsp_workspace_symbols` | Project-wide symbol search |
| `lsp_diagnostics` | Errors and warnings |
| `lsp_prepare_rename` | Validate rename operation |
| `lsp_rename` | Rename symbol across workspace |
| `lsp_code_actions` | Quick fixes and refactorings |
| `lsp_code_action_resolve` | Apply code action |
| `lsp_servers` | List available LSP servers |

### AST-Grep Tools

| Tool | Description |
|------|-------------|
| `ast_grep_search` | AST-aware code pattern search (25 languages) |
| `ast_grep_replace` | AST-aware code replacement |

### MCP Tools

| Tool | Description |
|------|-------------|
| `websearch` | Real-time web search (Exa AI) |
| `context7` | Official library documentation |
| `grep_app` | GitHub repository search |
| `webfetch` | URL content retrieval |

### Agent-Specific Tool Access

| Agent | Key Tools |
|-------|-----------|
| **Sisyphus** | All tools available |
| **oracle** | Reasoning only (no tools, or limited to analysis) |
| **librarian** | `bash`, `read`, `websearch_exa`, `grep_app`, `context7`, `gh`, `git`, `webfetch` |
| **explore** | `bash`, `read`, `grep`, `glob`, `ast_grep_search`, `lsp_*`, `grep_app` |
| **frontend-ui-ux-engineer** | Full access except `background_task` |
| **document-writer** | Full access except `background_task` |
| **multimodal-looker** | `read`, `look_at` only |

---

## Permission Matrix

### Agent Tool Access Matrix

| Agent | `call_omo_agent` | `task` | `look_at` | `bash` | `edit` | `write` |
|-------|------------------|--------|-----------|--------|--------|---------|
| **Sisyphus (OmO)** | Full | Full | Full | Full | Full | Full |
| **oracle** | Full | Full | Full | Full | Full | Full |
| **explore** | Disabled | Full | Full | Full | Denied | Denied |
| **librarian** | Disabled | Full | Full | Full | Denied | Denied |
| **frontend-ui-ux-engineer** | Full | Full | Full | Full | Full | Full |
| **document-writer** | Full | Full | Full | Full | Full | Full |
| **multimodal-looker** | Disabled | Disabled | Disabled | Denied | Denied | Denied |

### Read-Only vs Write-Enabled

**Read-Only Agents** (cannot modify files):
- `explore` - Codebase search only
- `librarian` - External research only
- `multimodal-looker` - Media analysis only

**Write-Enabled Agents** (full file access):
- `Sisyphus` - Primary orchestrator
- `oracle` - Technical advisor (typically advisory)
- `frontend-ui-ux-engineer` - UI implementation
- `document-writer` - Documentation generation

### createAgentToolRestrictions Function

```typescript
export function createAgentToolRestrictions(
  denyTools: string[]
): VersionAwareRestrictions {
  if (supportsNewPermissionSystem()) {
    return {
      permission: Object.fromEntries(
        denyTools.map((tool) => [tool, "deny" as const])
      ),
    };
  }

  return {
    tools: Object.fromEntries(denyTools.map((tool) => [tool, false])),
  };
}

// Usage examples:
// oracle: createAgentToolRestrictions(["write", "edit", "task"])
// librarian: createAgentToolRestrictions(["write", "edit"])
// explore: createAgentToolRestrictions(["write", "edit"])
// multimodal-looker: createAgentToolRestrictions(["write", "edit", "bash"])
```

### Permission Migration

```typescript
// Migrate from legacy boolean format to new permission format
function migrateToolsToPermission(
  tools: Record<string, boolean>
): Record<string, PermissionValue> {
  return Object.fromEntries(
    Object.entries(tools).map(([key, value]) => [
      key,
      value ? "allow" : "deny",
    ])
  );
}

// Migrate from permission format to legacy boolean
function migratePermissionToTools(
  permission: Record<string, PermissionValue>
): Record<string, boolean> {
  return Object.fromEntries(
    Object.entries(permission)
      .filter(([_, value]) => value !== "ask")
      .map(([key, value]) => [key, value === "allow"])
  );
}
```

---

## Agent Prompts

### Sisyphus System Prompt (Summary)

The Sisyphus prompt is dynamically built via `buildDynamicSisyphusPrompt` and includes:

1. **Role Definition**: Powerful AI orchestrator with delegation emphasis
2. **Intent Gate (Phase 0)**: Request classification system
3. **Codebase Assessment (Phase 1)**: Maturity evaluation
4. **Exploration & Research (Phase 2A)**: Tool selection and parallel execution
5. **Implementation (Phase 2B)**: TODO management and delegation
6. **Code Changes and Verification**: LSP diagnostics and evidence requirements
7. **Failure Recovery (Phase 2C)**: Rollback and consultation protocols
8. **Completion (Phase 3)**: Task validation
9. **Task Management**: Mandatory TODO usage
10. **Communication Style**: Concise, professional output

### Oracle System Prompt

```
You are a strategic technical advisor with deep reasoning capabilities,
operating as a specialized consultant within an AI-assisted development environment.

## Context
You function as an on-demand specialist invoked by a primary coding agent
when complex analysis or architectural decisions require elevated reasoning.

## What You Do
- Dissecting codebases to understand structural patterns
- Formulating concrete, implementable technical recommendations
- Architecting solutions and mapping out refactoring roadmaps
- Resolving intricate technical questions through systematic reasoning

## Decision Framework
- Bias toward simplicity
- Leverage what exists
- Prioritize developer experience
- One clear path
- Match depth to complexity
- Signal the investment (Quick/Short/Medium/Large)

## Response Structure
**Essential**: Bottom line, Action plan, Effort estimate
**Expanded**: Why this approach, Watch out for
**Edge cases**: Escalation triggers, Alternative sketch
```

### Explore System Prompt

```
You are a codebase search specialist.

## Mission
Answer: "Where is X?", "Which files contain Y?", "Find the code that does Z"

## Critical Deliverables
1. Intent Analysis (wrapped in <analysis> tags)
2. Parallel Execution (3+ tools simultaneously)
3. Structured Results (<results>, <files>, <answer>, <next_steps>)

## Constraints
- Read-only (cannot create, modify, or delete files)
- No emojis
- Absolute paths only

## Tool Strategy
- LSP tools for semantic search
- ast_grep_search for structural patterns
- grep for text patterns
- glob for file patterns
```

### Librarian System Prompt (Summary)

```
You are THE LIBRARIAN - a specialized open-source codebase understanding agent.

## Phased Research Approach
- Phase 0: Assess before searching
- Phase 1: Execute by request type (Conceptual/Implementation/Context/Comprehensive)
- Phase 2: Evidence synthesis with permalinks

## Tool Reference
- context7: Official docs
- grep_app: Fast code search
- gh CLI: Deep code search, cloning, issues/PRs

## Citation Format
Every claim requires: permalink, code snippet, explanation

## Date Awareness
CRITICAL: Always verify current date, never search for 2024
```

### Frontend-UI-UX-Engineer System Prompt

```
You are a Designer-Turned-Developer.

## Work Principles
- Complete what's asked
- Leave it better
- Study before acting
- Blend seamlessly

## Aesthetic Guidelines
- Bold typography choices
- Non-default color palettes
- Purposeful motion
- Thoughtful spatial composition

## Anti-Patterns (NEVER)
- Generic fonts
- Clichéd color schemes
- Predictable layouts
```

### Document-Writer System Prompt

```
You are a technical writer with deep engineering background.

## Core Mission
Create accurate, comprehensive, and useful documentation.

## Workflow
1. Read todo list
2. Identify current task
3. Update todo list
4. Execute documentation (README/API/Architecture/User Guides)
5. Mandatory verification
6. Mark complete
7. Generate completion report

## Critical Rules
- Never ask for confirmation
- Execute only one task per invocation
- Use maximum parallelism for read-only operations
```

### Multimodal-Looker System Prompt

```
You interpret media files that cannot be read as plain text.

Your job: examine the attached file and extract ONLY what was requested.

When to use you:
- Media files the Read tool cannot interpret
- Extracting specific information from documents
- Describing visual content in images or diagrams

For PDFs: extract text, structure, tables, data
For images: describe layouts, UI elements, text, diagrams
For diagrams: explain relationships, flows, architecture

Response rules:
- Return extracted information directly, no preamble
- If info not found, state clearly what's missing
- Be thorough on the goal, concise on everything else
```

---

## Configuration Examples

### Complete oh-my-opencode.json Example

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/code-yeongyu/oh-my-opencode/master/assets/oh-my-opencode.schema.json",

  // Disable specific MCPs
  "disabled_mcps": ["websearch", "context7"],

  // Disable specific agents
  "disabled_agents": ["oracle"],

  // Disable specific skills
  "disabled_skills": ["playwright"],

  // Disable specific hooks
  "disabled_hooks": ["comment-checker"],

  // Disable specific commands
  "disabled_commands": ["init-deep"],

  // Agent configurations
  "agents": {
    "Sisyphus": {
      "model": "anthropic/claude-sonnet-4",
      "temperature": 0.3,
      "top_p": 0.9,
      "prompt_append": "Always prefer TypeScript over JavaScript.",
      "permission": {
        "edit": "allow",
        "bash": "ask",
        "webfetch": "allow"
      }
    },
    "explore": {
      "model": "anthropic/claude-haiku-4-5",
      "temperature": 0.5
    },
    "frontend-ui-ux-engineer": {
      "model": "google/gemini-3-pro-high"
    },
    "librarian": {
      "prompt_append": "Always use elisp-dev-mcp for Emacs Lisp lookups."
    },
    "document-writer": {
      "model": "google/gemini-3-flash"
    }
  },

  // Claude Code compatibility settings
  "claude_code": {
    "mcp": false,
    "commands": false,
    "skills": false,
    "agents": false,
    "hooks": false,
    "plugins": false
  },

  // Background task concurrency
  "background_task": {
    "defaultConcurrency": 5,
    "providerConcurrency": {
      "anthropic": 3,
      "google": 10
    },
    "modelConcurrency": {
      "anthropic/claude-opus-4-5": 2,
      "google/gemini-3-flash": 10
    }
  },

  // Sisyphus settings
  "sisyphus_agent": {
    "disabled": false,
    "default_builder_enabled": false,
    "planner_enabled": true,
    "replace_plan": true
  },

  // Ralph Loop settings
  "ralph_loop": {
    "enabled": true,
    "default_max_iterations": 100
  },

  // Comment checker
  "comment_checker": {
    "enabled": true,
    "ignore_patterns": ["BDD", "docstring"]
  },

  // Google authentication
  "google_auth": false,

  // LSP configuration
  "lsp": {
    "typescript-language-server": {
      "command": ["typescript-language-server", "--stdio"],
      "extensions": [".ts", ".tsx"],
      "priority": 10
    },
    "pylsp": {
      "disabled": true
    }
  }
}
```

### Disabling an Agent

```jsonc
{
  "agents": {
    "frontend-ui-ux-engineer": {
      "disable": true
    }
  }
}
```

### Changing Agent Model

```jsonc
{
  "agents": {
    "explore": {
      "model": "anthropic/claude-haiku-4-5"
    }
  }
}
```

### Appending to Agent Prompt

```jsonc
{
  "agents": {
    "librarian": {
      "prompt_append": "Always cite sources with GitHub permalinks."
    }
  }
}
```

### Custom Permission Configuration

```jsonc
{
  "agents": {
    "explore": {
      "permission": {
        "edit": "deny",
        "bash": "ask",
        "webfetch": "allow"
      }
    }
  }
}
```

### Per-Command Bash Permissions

```jsonc
{
  "agents": {
    "Sisyphus": {
      "permission": {
        "bash": {
          "git": "allow",
          "rm": "deny",
          "npm": "ask"
        }
      }
    }
  }
}
```

### Disabling Multiple Components

```jsonc
{
  "disabled_mcps": ["websearch", "context7", "grep_app"],
  "disabled_agents": ["oracle", "frontend-ui-ux-engineer"],
  "disabled_skills": ["playwright"],
  "disabled_hooks": ["comment-checker", "agent-usage-reminder"],
  "disabled_commands": ["init-deep"]
}
```

---

## Summary

The Oh My Opencode agent system provides a sophisticated multi-agent architecture with:

- **7 built-in agents** with specialized roles
- **Hierarchical orchestration** via Sisyphus
- **Configurable permissions** for fine-grained tool access
- **Background task support** for parallel execution
- **Deep customization** through oh-my-opencode.json
- **Factory pattern** for dynamic agent creation
- **Read-only vs write-enabled** distinction for safety
- **Environment context injection** for time/platform awareness
- **Model fallback system** based on available subscriptions

The system enables powerful AI-assisted development workflows while maintaining control over agent capabilities and file system access.

---

## Sources

- [GitHub - code-yeongyu/oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- [DeepWiki - Agent System](https://deepwiki.com/code-yeongyu/oh-my-opencode#4)
- [DeepWiki - Specialized Agents](https://deepwiki.com/code-yeongyu/oh-my-opencode#4.2)
- [DeepWiki - Agent Configuration](https://deepwiki.com/code-yeongyu/oh-my-opencode#4.3)
- [DeepWiki - Background Task Tools](https://deepwiki.com/code-yeongyu/oh-my-opencode#5.3)
