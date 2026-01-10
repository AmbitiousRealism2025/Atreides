# OmO Tool Selection Matrix

## Executive Summary

Oh My OpenCode (OmO) employs a multi-layered tool selection and orchestration system centered around **Sisyphus**, the primary orchestrator. This system manages specialized agents, semantic analysis tools, and background processes through a structured workflow.

---

## 1. Complete Tool Inventory

### General-Purpose Tools

| Tool | Purpose |
|------|---------|
| `grep` | Search code content using regex |
| `glob` | Find files by name or pattern |
| `read` | View file contents |
| `write` | Create new files |
| `edit` | Modify existing files |
| `bash` | Execute shell commands |
| `skill` | Invoke specialized workflows |

### Semantic Code Tools (LSP - 11 Operations)

| Tool | Purpose |
|------|---------|
| `lsp_hover` | Type info, signatures, documentation |
| `lsp_goto_definition` | Locate symbol definition |
| `lsp_find_references` | Find all workspace usages |
| `lsp_document_symbols` | File outline |
| `lsp_workspace_symbols` | Fuzzy project-wide symbol search |
| `lsp_diagnostics` | Pre-build errors and warnings |
| `lsp_prepare_rename` | Validate rename safety |
| `lsp_rename` | Workspace-wide symbol renaming |
| `lsp_code_actions` | IDE-style quick fixes |
| `lsp_code_action_resolve` | Apply quick fixes |
| `lsp_servers` | List active language servers |

### Structural Tools (AST-Grep)

| Tool | Purpose | Language Support |
|------|---------|-----------------|
| `ast_grep_search` | Structural code pattern matching | 25 languages |
| `ast_grep_replace` | Structural code transformations | 25 languages |

### Background & Meta-Orchestration Tools

| Tool | Purpose |
|------|---------|
| `call_omo_agent` | Spawn specialized agents |
| `background_task` | Start asynchronous execution |
| `background_output` | Retrieve results from background tasks |
| `background_cancel` | Terminate background processes |
| `task` | Multi-step analysis / subagent spawning |

---

## 2. Tool Selection Criteria

### Primary Selection Factors

| Factor | Description |
|--------|-------------|
| **Cost Tier** | EXPENSIVE vs CHEAP operation |
| **Capability Matching** | Match tool to specific need |
| **Workflow Phase** | Different tools for exploration vs implementation |
| **Complexity** | Simple edits vs multi-step analysis |

### Cost Tier Annotations

| Tier | Examples |
|------|----------|
| **EXPENSIVE** | Sisyphus, Oracle (Opus models) |
| **MODERATE** | Librarian, Frontend-engineer (Sonnet) |
| **CHEAP** | Explore, Multimodal-looker (Haiku/Flash) |

---

## 3. Tool Selection Decision Logic

### Decision Flow

```
User Request
      │
      ▼
┌─────────────────┐
│ Skill-First     │ ──► Match? ──► Invoke skill immediately
│ Check           │
└────────┬────────┘
         │ (no match)
         ▼
┌─────────────────┐
│ Intent Gate     │
│ Classification  │
└────────┬────────┘
         │
    ┌────┴────────────────────┐
    │         │               │
    ▼         ▼               ▼
 Trivial   Exploratory    Open-ended
    │         │               │
    ▼         ▼               ▼
 Direct    Trigger        Codebase
 Answer    Research       Assessment
```

### Intent Classification → Tool Selection

| Classification | Primary Tools |
|----------------|---------------|
| **Trivial** | Direct response (no tools) |
| **Explicit** | `edit`, `write`, `bash` |
| **Exploratory** | `explore` agent, `grep`, `glob` |
| **Open-ended** | Full assessment, multiple agents |
| **GitHub Work** | GitHub-specific tools |
| **Ambiguous** | `AskUserQuestion` |

### Specialization Deployment

| Need | Agent/Tool |
|------|------------|
| Architecture decisions | `oracle` agent |
| Visual/UI work | `frontend-ui-ux-engineer` |
| Documentation | `document-writer` |
| Internal code search | `explore` agent |
| External research | `librarian` agent |

---

## 4. Tool Combinations

### Parallel Execution Patterns

```
Sisyphus
    │
    ├── explore (internal) ─────┐
    │   background              │
    │                           ├──► Convergent results
    └── librarian (external) ───┘
        background
```

### Multi-Step Workflow Combinations

| Combination | Use Case |
|-------------|----------|
| `TodoWrite` + implementation tools | 3+ step tasks |
| `grep` + `lsp_references` | Comprehensive code search |
| `ast_grep_search` + `ast_grep_replace` | Structural refactoring |

### Convergent Search Strategy
1. Gather from multiple agents/tools
2. Continue until convergence (same info from multiple sources)
3. Or until iteration limit reached

---

## 5. Fallback Tools and Logic

### 3-Strikes Fallback Chain

```
Primary Tool Fails (3x)
         │
         ▼
    STOP-REVERT-DOCUMENT
         │
         ▼
    Oracle Consultation
    (high-reasoning model)
         │
         ▼
    New Strategy
```

### Context Fallbacks

| Stage | Fallback Action |
|-------|-----------------|
| 1 | Dynamic Context Pruning (DCP) |
| 2 | Aggressive tool output truncation |
| 3 | Emergency summarization |
| 4 | Forced compaction |

### Tool-Specific Fallbacks

| Primary Tool | Fallback |
|--------------|----------|
| `lsp_rename` | Manual `edit` across files |
| `ast_grep_replace` | Pattern-based `edit` |
| Complex `bash` | Simplified commands |

---

## 6. Performance Optimization

### Tiered Concurrency Control

| Provider | Concurrent Limit |
|----------|-----------------|
| Anthropic | 3 |
| Google | 10 |
| Claude Opus | 1 |

### Lazy Loading (MCP)
- SkillMcpManager spawns servers on-demand
- Only when specific skill invoked
- Reduces baseline memory usage

### Output Truncation Hooks

| Hook | Purpose |
|------|---------|
| `grep-output-truncator` | Limit grep result size |
| `tool-output-truncator` | General output limiting |

### Dynamic Context Pruning (DCP)

**Importance Scoring:**
| Factor | Weight |
|--------|--------|
| Recency | 30% |
| Tool output content | 25% |
| User requests | 20% |
| Code content | 15% |
| External references | 10% |

---

## 7. Tool Configuration

### Configuration Hierarchy

```
Priority (highest to lowest):
┌─────────────────────────────────────┐
│ .opencode/oh-my-opencode.json      │ ◄── Project (highest)
├─────────────────────────────────────┤
│ ~/.config/opencode/oh-my-opencode  │
│ .json                               │ ◄── User (fallback)
└─────────────────────────────────────┘
```

### Skill Definitions
- Markdown files with YAML frontmatter
- Specify allowed tools
- Specify preferred models

### Permission Matrix

| Permission | Behavior |
|------------|----------|
| `allow` | Execute without prompt |
| `ask` | Prompt user for permission |
| `deny` | Block tool execution |

### Example Configuration

```json
{
  "agents": {
    "explore": {
      "model": "opencode/grok-code",
      "permissions": {
        "grep": "allow",
        "glob": "allow",
        "edit": "deny",
        "write": "deny"
      }
    }
  }
}
```

---

## 8. Native vs External/MCP Tools

### Native Tools
- General file operations: `read`, `write`, `edit`
- Search: `grep`, `glob`
- Core agent communication

### External/MCP Tools

| Category | Examples |
|----------|----------|
| **Browser Automation** | Playwright MCP |
| **Web Search** | Exa AI |
| **Skill-Embedded MCPs** | Auto-loaded per skill |
| **LSP/AST Integration** | pyright, gopls, etc. |

### Skill-Embedded MCPs
- Skills can bring own MCP servers
- Auto-loaded when skill active
- Isolated from other skills

---

## Tool Selection Quick Reference

### By Task Type

| Task | Best Tool(s) |
|------|--------------|
| Find files | `glob`, `explore` agent |
| Search code | `grep`, `ast_grep_search` |
| Read file | `read` |
| Edit file | `edit` |
| Create file | `write` |
| Run commands | `bash` |
| Symbol lookup | `lsp_*` tools |
| Structural refactor | `ast_grep_replace` |
| External research | `librarian` agent |
| Complex analysis | `task` / agents |

### By Complexity

| Complexity | Approach |
|------------|----------|
| Simple edit | `edit` directly |
| Multi-file edit | `ast_grep_replace` or parallel `edit` |
| Research needed | Deploy agents |
| Architecture decision | `oracle` agent |
| 3+ steps | `TodoWrite` + appropriate tools |

---

## Mapping to Claude Code

### Tool Equivalents

| OmO Tool | Claude Code Equivalent |
|----------|----------------------|
| `grep` | Grep tool |
| `glob` | Glob tool |
| `read` | Read tool |
| `write` | Write tool |
| `edit` | Edit tool |
| `bash` | Bash tool |
| `call_omo_agent` | Task tool |
| `background_task` | Task with run_in_background |
| `lsp_*` | Limited (WebFetch for docs) |
| `ast_grep_*` | Bash with ast-grep CLI |

### Key Differences

| Feature | OmO | Claude Code |
|---------|-----|-------------|
| LSP operations | 11 tools | Limited native |
| AST tools | Built-in | External CLI |
| MCP lazy loading | Yes | No (pre-configured) |
| Cost-tier routing | Yes | Manual (model param) |

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
