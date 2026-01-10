# OmO Task Management Patterns

## Executive Summary

Oh My OpenCode (OmO) utilizes a structured, multi-layered task management system orchestrated primarily by **Sisyphus**, an agent designed to manage complex workflows through systematic delegation and state tracking.

---

## 1. Task Decomposition

### Todo-Driven Breakdown
- Any task with **3+ steps** → Use `TodoWrite` tool
- Track progress visibly
- Break into manageable units

### Atomic Task Creation
- Each todo has **one clear deliverable**
- Single action per delegation
- Verifiable completion

### Delegation Template (7 Sections)

```markdown
## 1. TASK
[Specific atomic goal]

## 2. EXPECTED OUTCOME
[Concrete deliverables]

## 3. REQUIRED SKILLS
[Specific skills to invoke]

## 4. REQUIRED TOOLS
[Explicit tool whitelist]

## 5. MUST DO
[Exhaustive requirements]

## 6. MUST NOT DO
[Forbidden actions]

## 7. CONTEXT
[File paths, patterns, constraints]
```

---

## 2. Task Tracking and Lifecycle

### Background Task Lifecycle

```
┌──────────┐     ┌──────────┐     ┌────────────────┐
│ PENDING  │ ──► │ RUNNING  │ ──► │   COMPLETED    │
│          │     │          │     │   ERROR        │
│          │     │          │     │   CANCELLED    │
└──────────┘     └──────────┘     └────────────────┘
    │                │                    │
    │                │                    │
    ▼                ▼                    ▼
 Awaiting        Executing           Terminal
 concurrency                          state
 slot
```

### Ralph Loop State Machine

```
┌──────────┐
│ INACTIVE │
└────┬─────┘
     │
     ▼
┌──────────┐
│  ACTIVE  │◄─────────────────┐
└────┬─────┘                  │
     │                        │
     ▼                        │
┌────────────────┐            │
│    CHECK       │            │
│  COMPLETION/   │            │
│  ITERATIONS    │            │
└───────┬────────┘            │
        │                     │
   ┌────┼────────┬────────────┘
   │    │        │
   ▼    ▼        ▼
COMPLETE  CONTINUE  MAX REACHED
(promise   (loop)    (stop)
 found)
```

---

## 3. Task Prioritization

### Prioritization Strategies

| Strategy | Description |
|----------|-------------|
| **Convergent Search** | Evaluate results by relevance to task |
| **Context Preservation** | TODO states = Priority 3 (preserved during compaction) |
| **FIFO Queue** | Tasks queued first-in-first-out |

### Context Preservation Priority Levels

| Priority | Content Type |
|----------|--------------|
| 1 | System prompt |
| 2 | Recent exchanges |
| 3 | Current TODO state |
| 4 | Code content |
| 5 | Tool outputs |
| 6 | Conversation history |

### Concurrency Management
- Per-provider rate limits (e.g., 3 for Anthropic)
- Per-model limits (e.g., 1 for Claude Opus)
- FIFO execution within limits

---

## 4. Task Dependencies

### Parallel vs Sequential Execution

| Scenario | Execution Type |
|----------|---------------|
| Independent searches | Parallel (background tasks) |
| Implementation after research | Sequential (phase-based) |
| Multiple file analyses | Parallel |
| Code + documentation | Sequential (docs depend on code) |

### Recursion Prevention
- Background task spawning **disabled for subagents**
- Only primary orchestrator (Sisyphus) manages delegation
- Prevents infinite loops and tool sprawl

### Dependency Flow

```
Phase 0: Intent Gate
         │
         ▼
Phase 1: Codebase Assessment
         │
         ▼
Phase 2A: Exploration ─────► explore + librarian
         │                   (parallel)
         ▼
Phase 2B: Implementation
         │
         ▼
Phase 3: Completion
```

---

## 5. Progress Monitoring and Reporting

### Visibility Rules
- **Never stop with incomplete todos**
- Mark complete **only when fully verified**
- Progress visible to orchestrator and user

### Notification System
- BackgroundManager alerts parent on completion
- Asynchronous notifications
- Pull-based result retrieval

### Phase Tracking

| Phase | Progress Indicator |
|-------|-------------------|
| Intent Gate | Classification complete |
| Codebase Assessment | Maturity determined |
| Exploration | Context gathered |
| Implementation | Tasks executed |
| Completion | All verified |

---

## 6. Task Completion Validation

### Multi-Step Validation

```
Task Execution
      │
      ▼
Quality Checks
├── Linters pass?
├── Type checks pass?
└── Tests pass?
      │
      ▼
Semantic Verification
├── lsp_diagnostics clean?
└── No errors/warnings?
      │
      ▼
Completion Markers
├── DONE signal detected?
└── Convergence achieved?
      │
      ▼
Mark TODO Complete
```

### Quality Checks Required
- Linters (e.g., eslint)
- Type checks (e.g., TypeScript)
- Tests (if applicable)

### Semantic Verification
- `lsp_diagnostics` for pre-build validation
- Check for errors, warnings, hints

### Completion Markers
- Default: word `DONE` signals completion
- Also: information convergence across sources
- Stops iterative loops

---

## 7. Task Metadata

### Delegation Metadata

| Field | Purpose |
|-------|---------|
| Task Description | What to accomplish |
| Expected Outcome | Success criteria |
| Required Tools | Allowed tool whitelist |
| Required Skills | Skills to invoke |
| Constraints | MUST/MUST NOT rules |
| Context | File paths, patterns |

### Operational Metadata

| Field | Purpose |
|-------|---------|
| Cost Tier | EXPENSIVE / MODERATE / CHEAP |
| Concurrency Config | Provider/model limits |
| Phase | Current workflow phase |
| Status | pending/running/completed/error |

### Cost Tier Examples

| Tier | Agents/Operations |
|------|-------------------|
| EXPENSIVE | Opus-driven architecture review |
| MODERATE | Sonnet-driven implementation |
| CHEAP | Haiku-driven exploration |

---

## 8. Atomic Task Unit Definition

### Characteristics
- **Single action** per delegation
- **One clear deliverable** per todo item
- **Verifiable** completion
- Smallest manageable piece of work

### Examples

| Atomic | Non-Atomic |
|--------|------------|
| "Find all auth middleware files" | "Implement authentication system" |
| "Add error handling to login function" | "Fix all bugs" |
| "Write test for calculateTotal" | "Add comprehensive tests" |

### Verification Requirement
- Must be verifiable as complete
- Cannot be partially done
- Clear success/failure criteria

---

## Mapping to Claude Code

### TodoWrite Integration

```markdown
## Task Management Rules (CLAUDE.md)

1. Use TodoWrite for any task with 3+ steps
2. Each todo = one atomic deliverable
3. Mark complete only when verified
4. Never stop with incomplete todos
```

### Task Tool Delegation

| OmO Pattern | Claude Code Equivalent |
|-------------|----------------------|
| call_omo_agent | Task tool with subagent_type |
| Background tasks | Task tool with run_in_background |
| Parallel execution | Multiple Task calls in one message |

### Metadata Tracking

```markdown
## For each delegated task, specify:
1. TASK: [Atomic goal]
2. EXPECTED OUTCOME: [Deliverables]
3. CONTEXT: [File paths, constraints]
4. MUST DO: [Requirements]
5. MUST NOT DO: [Forbidden actions]
```

---

## Analogy

Think of OmO's task management like a **professional kitchen**:

| Component | Kitchen Equivalent |
|-----------|-------------------|
| Sisyphus | Head Chef |
| Atomic tasks | Individual prep tasks |
| TODO board | Kitchen ticket system |
| Parallel execution | Multiple stations working |
| Validation | Final taste test |
| Completion | Plating for service |

The Chef doesn't consider a dish finished just because it's cooked—it must pass a final taste test against the original recipe before being "plated" for the user.

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
