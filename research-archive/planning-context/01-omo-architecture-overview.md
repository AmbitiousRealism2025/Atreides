# OmO Architecture Overview

## Executive Summary

The **Oh My OpenCode (OmO)** architecture is a sophisticated, multi-layered plugin system built around OpenCode that implements a systematic workflow for AI-driven development. It is designed to coordinate specialized agents, background tasks, and intensive context management through a centralized orchestration model.

---

## 1. Architectural Layers

The OmO ecosystem is structured into four primary tiers that govern how information and commands flow through the system:

### Plugin System Layer
- Serves as the foundation
- Provides **31 lifecycle hooks** and a specialized **skill system**
- Allows custom behaviors to be injected at events like `PreToolUse` or `SessionStart`

### Orchestration Layer
- Centered on **Sisyphus**, the primary orchestrator
- Manages the **four-phase workflow**:
  1. Intent Gate
  2. Codebase Assessment
  3. Research/Exploration
  4. Implementation
- Handles request classification and delegation of subtasks

### Agent Layer
- Consists of **seven built-in agents** with specialized roles
- Agents categorized as:
  - **Analytical (Read-Only)**: `explore`, `librarian`
  - **Implementation (Write-Enabled)**: `frontend-ui-ux-engineer`, `document-writer`

### Tool Layer
- Massive suite of semantic and functional tools:
  - **11 LSP tools** for code intelligence (hover, rename, etc.)
  - **AST-Grep tools** for structural search
  - **Background tools** for asynchronous execution

---

## 2. Major System Components and Modules

### Sisyphus Orchestrator
- Powered by a **504-line dynamic system prompt**
- Acts as the "brain" establishing:
  - Agent identities
  - Tool-driven communication mandates
  - Multi-phase instructions
- Uses **Claude Opus 4.5** model for maximum reasoning capability
- Functions as "general contractor" - assesses blueprints, delegates to specialists, ensures code compliance

### BackgroundManager
- Enables true **parallel execution** via asynchronous task queue
- Tracks task lifecycle through states:
  - `pending`
  - `running`
  - `completed`

### ConcurrencyManager
- Part of BackgroundManager
- Enforces **tiered rate limits**:
  - 3 concurrent for Anthropic
  - 10 concurrent for Google
  - 1 concurrent for Claude 4.5 Opus

### Context Management System (DCP)
- Implements **Dynamic Context Pruning (DCP)** algorithm
- Triggers:
  - Warning at 70% context usage
  - Preemptive compaction at 85%
- Uses importance scoring based on:
  - Recency
  - Code content
  - Tool outputs

### Ralph Loop
- Self-referential development module
- Detects completion signals (like `DONE` marker)
- Automatically continues session until:
  - All tasks finished, OR
  - Iteration limit reached

### SkillMcpManager
- Manages embedded **Model Context Protocol (MCP)** servers
- Implements **lazy loading** - servers only connect when skill is invoked

---

## 3. Configuration System

OmO uses a hierarchical configuration system where project-level settings override user-global settings.

### Primary Configuration Files

| Level | Path |
|-------|------|
| User-level | `~/.config/opencode/oh-my-opencode.json` |
| Project-level | `.opencode/oh-my-opencode.json` |

### Hook Configurations
- Loaded from `.claude/settings.json`
- Also from `.claude/settings.local.json`

### Key Customization Settings

#### AgentConfig
- `model` - Which model the agent uses
- `temperature` - Response randomness
- `system_prompt` - Agent behavior definition
- **Fine-grained permissions**: `allow`, `ask`, or `deny` for bash/edit tools

#### Ralph Loop Settings
- Toggle loop on/off
- Set `default_max_iterations`

#### Disabled Features
- `disabled_hooks` - Explicitly disable specific hooks
- `disabled_skills` - Disable specific skills

### Skill Definitions
- Defined in **SKILL.md** files
- Uses YAML frontmatter for metadata:
  - Required models
  - Allowed tools
  - Embedded MCP server configs

---

## 4. Initialization Sequence

When OmO starts up, it follows this sequence:

1. **Plugin Initialization**
   - Load core plugin architecture
   - Read configuration hierarchy

2. **Discovery & Priority Loading**
   - Scan for skills and commands in priority order:
     1. Project-specific OpenCode directories
     2. Project-specific Claude Code directories
     3. User-global directories

3. **Hook Registration**
   - Register all 31+ lifecycle hooks to event triggers
   - Examples: `tool.execute.before`, `session.idle`

4. **Session Start Hooks**
   - Specialized hooks fire (e.g., `directory-agents-injector`)
   - Inject content from `AGENTS.md` or `README.md` into initial context

5. **Dynamic Orchestrator Construction**
   - Sisyphus generates dynamic system prompt based on:
     - Currently loaded tools
     - Active agents
     - Cost tier annotations

6. **MCP Lazy Loading (On-Demand)**
   - MCP servers remain dormant until skill requiring them is invoked
   - Unlike standard environments where all servers start at once

---

## Architecture Analogy

Think of the OmO architecture like an **Advanced Research Ship**:

| Component | Ship Equivalent |
|-----------|-----------------|
| **Sisyphus** | Captain on the bridge |
| **System Prompt** | Complex navigation manual |
| **Agents** | Specialized crew members |
| **Analytical Agents** | Researchers who only observe |
| **Implementation Agents** | Engineers who make repairs |
| **Plugin/Tool Layers** | Ship's specialized equipment (sonar, robotic arms) |
| **BackgroundManager** | Automated engine room |

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
