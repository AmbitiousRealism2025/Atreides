# OmO Agent Hierarchy and Types

## Executive Summary

The Oh My OpenCode (OmO) system features seven built-in agents, each categorized by their role in the development lifecycle as either an orchestrator, an analytical (read-only) agent, or an implementation (write-enabled) agent.

---

## Complete Agent Inventory

### 1. Sisyphus (Primary Orchestrator)

| Attribute | Value |
|-----------|-------|
| **Role** | Central brain of the system; plans, delegates, and executes complex tasks |
| **Model** | `anthropic/claude-opus-4-5` |
| **Type** | **Write-Enabled** (Full orchestration/file access) |
| **Mode** | `primary` |

**Specialization & Capabilities:**
- Manages the multi-phase workflow (intent gate, codebase assessment, research, implementation)
- Uses a 504-line dynamic system prompt to coordinate other agents
- Classifies requests into Trivial, Explicit, Exploratory, Open-ended, or Ambiguous

**When to Use:**
- Default entry point for all complex, multi-step software engineering tasks

**Configuration:**
- Configured as the `primary` mode agent
- Model and reasoning parameters defined in `agents` section of OmO JSON configuration

---

### 2. Oracle (Technical Advisor)

| Attribute | Value |
|-----------|-------|
| **Role** | Expert advisor for high-level architectural decisions and deep code reviews |
| **Model** | `openai/gpt-5.2` |
| **Type** | **Write-Enabled** (Full tool access, used primarily for advisory) |
| **Mode** | `subagent` or `all` |

**Specialization & Capabilities:**
- Strategic reasoning and complex debugging
- Consulted when system hits "3-strikes" failure recovery limit

**When to Use:**
- Architecture design
- Multi-component analysis
- Resolving logic failures that Sisyphus cannot handle alone

**Configuration:**
- High `reasoningEffort` typically applied

---

### 3. Librarian (Research Specialist)

| Attribute | Value |
|-----------|-------|
| **Role** | External documentation and open-source research specialist |
| **Model** | `anthropic/claude-sonnet-4-5` |
| **Type** | **Read-Only** (Analytical) |
| **Mode** | `subagent` |

**Specialization & Capabilities:**
- Conducts "reference greps" across multiple repositories
- Searches external documentation sources

**When to Use:**
- External documentation lookups
- Research on third-party libraries
- Gathering context from external sources

**Configuration:**
- Tool whitelist: `websearch`, `webfetch`, `git`
- `edit` and `write` permissions explicitly denied

---

### 4. Explore (Codebase Specialist)

| Attribute | Value |
|-----------|-------|
| **Role** | Specialist for internal codebase exploration and pattern matching |
| **Model** | `opencode/grok-code` |
| **Type** | **Read-Only** (Analytical) |
| **Mode** | `subagent` |

**Specialization & Capabilities:**
- Executes "contextual greps" to find files
- Understands project structure
- Identifies coding patterns quickly

**When to Use:**
- Start of a task to locate relevant files
- Verify dependencies
- Understand how existing logic is implemented

**Configuration:**
- Denied `edit` and `write` tools
- Utilizes `grep`, `glob`, and LSP tools for discovery

---

### 5. Frontend-UI-UX-Engineer

| Attribute | Value |
|-----------|-------|
| **Role** | Specialist for UI and UX component development |
| **Model** | `google/gemini-3-pro-preview` |
| **Type** | **Write-Enabled** (Implementation) |
| **Mode** | `all` |

**Specialization & Capabilities:**
- Creates visually stunning components
- Implements frontend-specific logic

**When to Use:**
- UI/UX implementation
- Styling and visual design tasks
- Tasks delegated by Sisyphus for frontend work

**Configuration:**
- Full implementation tool access
- Recursion is disabled (cannot spawn other agents)

---

### 6. Document-Writer

| Attribute | Value |
|-----------|-------|
| **Role** | Technical writing specialist |
| **Model** | `google/gemini-3-pro-preview` |
| **Type** | **Write-Enabled** (Implementation) |
| **Mode** | `subagent` |

**Specialization & Capabilities:**
- Generates technical documentation
- Creates README files
- Writes API guides

**When to Use:**
- Maintaining project documentation
- Writing specifications
- Explaining complex logic in text

**Configuration:**
- Restricted from spawning background tasks to prevent tool sprawl

---

### 7. Multimodal-Looker

| Attribute | Value |
|-----------|-------|
| **Role** | Visual content analyst |
| **Model** | `google/gemini-3-flash` |
| **Type** | **Read-Only** (Analytical) |
| **Mode** | `subagent` |

**Specialization & Capabilities:**
- Interprets non-textual data (PDFs, images, diagrams)
- Analyzes UI screenshots

**When to Use:**
- Analyzing diagrams
- Reading documentation in PDF format
- Reviewing visual content

**Configuration:**
- No access to implementation tools like `bash` or `edit`

---

## Agent Hierarchy and Spawning Rules

### Hierarchical Model

```
                    ┌─────────────────┐
                    │    SISYPHUS     │
                    │   (Primary)     │
                    │  Claude Opus    │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  ANALYTICAL   │    │IMPLEMENTATION │    │   ADVISORY    │
│  (Read-Only)  │    │(Write-Enabled)│    │   (Expert)    │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ • explore     │    │ • frontend-   │    │ • oracle      │
│ • librarian   │    │   ui-ux-eng   │    │               │
│ • multimodal- │    │ • document-   │    │               │
│   looker      │    │   writer      │    │               │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Spawning Rules

1. **Primary Orchestrator:** Sisyphus is the only agent operating in `primary` mode
2. **Delegation Flow:** Sisyphus can spawn any of the other six agents as subagents:
   - **Phase 2A (Exploration):** Spawns `explore` and `librarian` in parallel
   - **Phase 2B (Implementation):** Spawns `frontend-ui-ux-engineer` or `document-writer`
   - **Phase 2C (Recovery):** Spawns `oracle` to resolve persistent errors

3. **Recursion Prevention:** Subagents are **forbidden from spawning other subagents**
   - The `call_omo_agent` tool is disabled for subagents
   - Prevents infinite loops and resource exhaustion

4. **Communication:** Subagents return results directly to Sisyphus, who synthesizes information for user

---

## Agent Configuration Reference

### Configuration Location
- User-level: `~/.config/opencode/oh-my-opencode.json`
- Project-level: `.opencode/oh-my-opencode.json`

### AgentConfig Interface

```json
{
  "agents": {
    "agent-name": {
      "model": "provider/model-name",
      "temperature": 0.7,
      "top_p": 0.9,
      "mode": "primary|subagent|all",
      "permissions": {
        "bash": "allow|ask|deny",
        "edit": "allow|ask|deny",
        "webfetch": "allow|ask|deny"
      }
    }
  }
}
```

### Mode Definitions
| Mode | Description |
|------|-------------|
| `primary` | Direct user interaction, top-level orchestration |
| `subagent` | Called only by other agents, no direct user access |
| `all` | Flexible, can operate in either mode |

---

## Agent Type Summary Table

| Agent | Model | Type | Mode | Key Tools |
|-------|-------|------|------|-----------|
| sisyphus | claude-opus-4-5 | Write | primary | All |
| oracle | gpt-5.2 | Write | subagent | All (advisory focus) |
| librarian | claude-sonnet-4-5 | Read-Only | subagent | websearch, webfetch, git |
| explore | grok-code | Read-Only | subagent | grep, glob, LSP |
| frontend-ui-ux-engineer | gemini-3-pro | Write | all | All (no recursion) |
| document-writer | gemini-3-pro | Write | subagent | Write tools (no background) |
| multimodal-looker | gemini-3-flash | Read-Only | subagent | Read-only, vision |

---

## Analogy

Think of Sisyphus as the **General Contractor** of a construction site. Sisyphus doesn't just swing hammers; they hire specialized **Subcontractors**:
- **Architect** (oracle)
- **Building Inspector** (explore)
- **Interior Designer** (frontend-engineer)

To keep things organized, these subcontractors are not allowed to hire their own assistants, ensuring the General Contractor always knows exactly who is working on what.

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
