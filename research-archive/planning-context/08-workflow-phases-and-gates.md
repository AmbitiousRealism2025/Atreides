# OmO Workflow Phases and Gates

## Executive Summary

Oh My OpenCode (OmO) utilizes a multi-layered orchestration system led by **Sisyphus**, which follows a structured multi-phase workflow designed for intelligent task delegation, parallel execution, and robust error recovery.

---

## 1. Complete Workflow Phases

### Phase 0: Intent Gate

**Purpose:** Classify incoming request to determine appropriate workflow

**Classifications:**
| Category | Description | Action |
|----------|-------------|--------|
| **Trivial** | Simple questions | Direct answer |
| **Explicit** | Clear implementation request | Immediate execution |
| **Exploratory** | Requires investigation | Trigger research phase |
| **Open-ended** | Architectural decisions | Full codebase assessment |
| **GitHub Work** | Issue/PR specific | GitHub-focused workflow |
| **Ambiguous** | Unclear requirements | Clarification required |

---

### Phase 1: Codebase Assessment

**Purpose:** Evaluate codebase "maturity" for open-ended/complex tasks

**Maturity Classifications:**
| Level | Description | Approach |
|-------|-------------|----------|
| **Disciplined** | Well-organized, consistent | Strict pattern adherence |
| **Transitional** | Migrating to new patterns | Gradual migration |
| **Legacy/Chaotic** | Inconsistent, technical debt | Propose cleanups |
| **Greenfield** | New project | Establish new practices |

---

### Phase 2A: Exploration & Research

**Purpose:** Gather context through parallel research

**Actions:**
- Launch `explore` agent (internal "contextual grep")
- Launch `librarian` agent (external "reference grep")
- Run both as parallel background tasks

**Completion Criteria:**
- Sufficient context gathered
- Information converges across sources
- Iteration limit reached (2 searches with no new data)

---

### Phase 2B: Implementation

**Purpose:** Execute the actual development work

**Actions:**
- Create detailed TODO lists
- Handle core logic directly (Sisyphus)
- Delegate specialized work to implementation agents
- Track progress via TodoWrite

**Delegation Targets:**
| Task Type | Agent |
|-----------|-------|
| Visual UI/UX | `frontend-ui-ux-engineer` |
| Documentation | `document-writer` |
| Complex logic | Sisyphus (direct) |

---

### Phase 2C: Failure Recovery

**Purpose:** Handle persistent failures

**Trigger:** 3 consecutive failures on same operation

**Protocol:**
1. STOP all modifications
2. REVERT via git checkout
3. DOCUMENT failure details
4. CONSULT Oracle agent
5. ESCALATE to user if needed

---

### Phase 3: Completion

**Purpose:** Verify and deliver results

**Actions:**
- Verify all tasks finished via `lsp_diagnostics`
- Cancel lingering background processes
- Mark all TODOs complete
- Deliver final result

---

## 2. Phase Transition Triggers

```
┌─────────────────┐
│   Phase 0:      │
│   Intent Gate   │
└────────┬────────┘
         │
         ├── Trivial/Explicit ───────────────────┐
         │                                       │
         ├── Open-ended ──► Phase 1: Assessment  │
         │                       │               │
         │                       ▼               │
         │               Maturity Assessed       │
         │                       │               │
         └── Exploratory ────────┴───────────────┤
                                                 │
                              ┌──────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    Phase 2A:    │
                    │   Exploration   │
                    └────────┬────────┘
                             │
                    Context Sufficient OR
                    Info Converges OR
                    Iteration Limit
                             │
                             ▼
                    ┌─────────────────┐
                    │    Phase 2B:    │
                    │ Implementation  │◄─────────┐
                    └────────┬────────┘          │
                             │                   │
                    3 Failures ──► Phase 2C ─────┘
                             │     (Recovery)
                             │
                    All Tasks Complete
                             │
                             ▼
                    ┌─────────────────┐
                    │    Phase 3:     │
                    │   Completion    │
                    └─────────────────┘
```

---

## 3. Gates and Validation Checks

### Intent Gate Validation (Phase 0)

**Purpose:** Classify scope and boundaries

**If Ambiguous:**
- Trigger `AskUserQuestion`
- Clarify: outcomes, constraints, scope
- No work until clarified

### Skill-First Check

**Priority Gate:** Before standard classification
- Check if request matches a skill trigger
- If yes: invoke skill immediately
- Bypasses normal classification

### Verification Gate (Phase 3)

**Final Validation:**
- Run `lsp_diagnostics`
- Check for errors/warnings
- Must pass before delivery

---

## 4. Quality Checks

### Todo Continuation Enforcer
- Prevents stopping with incomplete TODOs
- Forces all steps to be verified
- "Bouldering mode" - must reach the top

### LSP Integration (11 Tools)
| Tool | Purpose |
|------|---------|
| `lsp_diagnostics` | Error/warning detection |
| `lsp_hover` | Type information |
| `lsp_definition` | Go to definition |
| `lsp_references` | Find references |
| `lsp_rename` | Semantic rename |
| `lsp_symbols` | Document symbols |
| `lsp_workspace_symbols` | Project-wide symbols |
| `lsp_call_hierarchy` | Call tree |
| `lsp_type_hierarchy` | Type inheritance |
| `lsp_implementations` | Interface implementations |
| `lsp_code_actions` | Quick fixes |

### Code Quality Hooks

| Hook | Purpose |
|------|---------|
| Comment Checker | Validate comment necessity |
| Thinking Block Validator | Ensure reasoning format |

### Standard Tooling Enforcement
- Linters (eslint) during `PostToolUse`
- Formatters (prettier) during `PostToolUse`

---

## 5. Agent Behavior by Phase

### Behavioral Changes

| Phase | Sisyphus Behavior | Subagent Behavior |
|-------|-------------------|-------------------|
| 0-2A | High-level manager, classifier, delegator | N/A or research only |
| 2B | Expert engineer, handles logic directly | Implementation enabled |
| 2C | Recovery coordinator | Diagnostic support |
| 3 | Verifier, deliverer | Cleanup support |

### Agent Type Permissions by Phase

| Phase | Analytical Agents | Implementation Agents |
|-------|-------------------|----------------------|
| 2A | **Read-Only** | Inactive |
| 2B | Read-Only | **Write-Enabled** |
| 2C | Diagnostic | Limited |
| 3 | Verification | Cleanup |

### Subagent Constraints
- Background task spawning **disabled** for all subagents
- Only primary orchestrator manages parallel tasks
- Prevents infinite loops

---

## 6. Progress Checkpointing

### TODO System
- Multi-step work tracked via `TodoWrite`
- State stored: `~/.claude/todos/{sessionId}`
- Persists across iterations

### Ralph Loop State
- Iteration counts saved to file system
- Enables long-running autonomous development
- Survives session interruptions

### Context Preservation
At 85%+ token usage:
- **Injectors** ensure critical data preserved:
  - AGENTS.md content
  - Current TODO state
  - Recent decisions

### Checkpoint Triggers

| Event | Action |
|-------|--------|
| Task completion | Update TODO status |
| Phase transition | Save phase state |
| 85% context usage | Context compaction |
| Before risky operation | Create checkpoint |

---

## 7. Phase Rollbacks

### Supported via Error Recovery Protocol (Phase 2C)

**Trigger:** 3 consecutive failures

**Rollback Process:**
```
Failure 3 Detected
        │
        ▼
   ┌─────────┐
   │  STOP   │ ──► Halt all modifications
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ REVERT  │ ──► git checkout (last working state)
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │DOCUMENT │ ──► Record failure details
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │ CONSULT │ ──► Oracle agent for new strategy
   └────┬────┘
        │
        ▼
   Roll back to exploration/planning state
```

### What Gets Rolled Back
- Code changes (via git)
- Task state (reset affected TODOs)
- Strategy (new approach via Oracle)

### What's Preserved
- Failure documentation
- Lessons learned
- Overall goal

---

## Mapping to Claude Code

### Phase Mapping

| OmO Phase | Claude Code Equivalent |
|-----------|----------------------|
| Phase 0 (Intent Gate) | Manual classification in CLAUDE.md rules |
| Phase 1 (Assessment) | Task tool with Explore agent |
| Phase 2A (Research) | Parallel Task tool calls |
| Phase 2B (Implementation) | Direct implementation |
| Phase 2C (Recovery) | 3-strikes rule in CLAUDE.md |
| Phase 3 (Completion) | Manual verification checklist |

### Gate Implementation

| OmO Gate | Claude Code Approach |
|----------|---------------------|
| Intent validation | AskUserQuestion tool |
| Skill-first check | Skill tool invocation |
| Verification gate | Bash tool (lint, test) |
| Todo enforcer | TodoWrite + CLAUDE.md rules |

---

## Analogy

Think of the OmO workflow as a **high-end construction project**:

| Phase | Construction Equivalent |
|-------|------------------------|
| Phase 0 | **Contract Review** (Intent Gate) - Can we do this job? |
| Phase 1 | **Site Inspection** (Codebase Assessment) |
| Phase 2A | **Sourcing Materials** (Research) - Parallel specialists |
| Phase 2B | **Actual Building** (Implementation) |
| Phase 2C | **Safety Trigger** - Foundation cracked 3x, clear site |
| Phase 3 | **Final Inspection** (Completion) |

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
