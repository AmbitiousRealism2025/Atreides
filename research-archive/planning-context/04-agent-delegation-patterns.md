# OmO Agent Delegation Patterns

## Executive Summary

Oh My OpenCode (OmO) employs a sophisticated multi-agent system orchestrated by **Sisyphus**, which manages task delegation, parallel execution, and error recovery across seven specialized built-in agents.

---

## 1. Rules and Heuristics for Delegation

OmO uses a "Phase 0: Intent Gate" to classify incoming requests and determine whether Sisyphus should handle them directly or delegate.

### Handle Directly
- **Trivial** questions
- **Explicit** implementation requests
- Pure business logic

### Delegate When
- Tasks classified as **Exploratory** (requiring investigation)
- Tasks classified as **Open-ended** (architectural decisions)
- Task requires 3+ steps (must be tracked via `TodoWrite`)

### Specialization Rules (Automatic Routing)

| Task Type | Delegated To |
|-----------|--------------|
| Visual UI/UX work | `frontend-ui-ux-engineer` |
| Technical writing | `document-writer` |
| Internal codebase search | `explore` |
| External documentation | `librarian` |
| Complex debugging/architecture | `oracle` |

---

## 2. Task Routing Mechanism

Task routing is managed by Sisyphus based on the **Agent Hierarchy** and specialized roles.

### Role-Based Routing

```
User Request → Sisyphus (Intent Gate)
                    │
    ┌───────────────┼───────────────┬───────────────┐
    │               │               │               │
    ▼               ▼               ▼               ▼
 Internal      External        Complex         UI/UX
 Codebase      Research        Analysis        Work
    │               │               │               │
    ▼               ▼               ▼               ▼
 explore       librarian        oracle      frontend-
                                            ui-ux-eng
```

### Cost-Aware Routing

The system uses cost-tier annotations to optimize resource usage:

| Agent | Cost Tier |
|-------|-----------|
| sisyphus, oracle | EXPENSIVE |
| librarian, frontend-ui-ux-engineer, document-writer | MODERATE |
| explore, multimodal-looker | CHEAP |

### Convergence Strategy

For research tasks, Sisyphus uses a **convergent search strategy**:
1. Gather data from multiple sources
2. Continue until information from sources aligns
3. Or until iteration limit is reached

---

## 3. Delegation Prompt Structure

When Sisyphus delegates, it uses a dynamically constructed **7-section template**:

```markdown
## 1. TASK
[Atomic, specific goal]

## 2. EXPECTED OUTCOME
[Concrete deliverables and success criteria]

## 3. REQUIRED SKILLS
[Specific skills to be invoked]

## 4. REQUIRED TOOLS
[Explicit tool whitelist to prevent "tool sprawl"]

## 5. MUST DO
[Exhaustive requirements]

## 6. MUST NOT DO
[Forbidden actions to prevent rogue behavior]

## 7. CONTEXT
[Relevant file paths, existing code patterns, constraints]
```

### Example Delegation Prompt

```markdown
## TASK
Find all authentication-related files and document their relationships

## EXPECTED OUTCOME
- List of all auth files with paths
- Dependency graph showing imports
- Summary of authentication flow

## REQUIRED SKILLS
- codebase_exploration

## REQUIRED TOOLS
- grep
- glob
- lsp_references

## MUST DO
- Search for "auth", "login", "session" patterns
- Document all file relationships found
- Report confidence level for findings

## MUST NOT DO
- Modify any files
- Execute any code
- Access external resources

## CONTEXT
- Project uses JWT authentication
- Main entry point: src/auth/index.ts
- Framework: Express.js
```

---

## 4. Context Transfer During Delegation

### Isolated Sessions
- Background agents run in **isolated child sessions**
- Prevents parent context bloat
- Each agent has clean context window

### Explicit Injection
Sisyphus passes critical information directly into delegation prompt:
- Current TODO states
- File paths being modified
- Prior decisions made
- Relevant constraints

### State Persistence
Critical project context is preserved and injected:
- `AGENTS.md` content
- Directory-level rules
- Project configuration

### What Gets Transferred

| Transferred | NOT Transferred |
|-------------|-----------------|
| Task-specific context | Full conversation history |
| Relevant file paths | Unrelated prior discussions |
| Current TODO state | Raw tool outputs from other tasks |
| Decision rationale | Intermediate failed attempts |

---

## 5. Result Collection and Integration

### Notification Mechanism
- Parent session is alerted when background agent completes
- Asynchronous notification system

### Manual Retrieval
- Results are **NOT automatically merged**
- Parent must use `background_output` tool explicitly
- Allows for review before integration

### Synthesis Process
1. Sisyphus evaluates results independently
2. Cross-references with other agent outputs
3. Synthesizes findings based on relevance to primary task

### Completion Detection
- System looks for `DONE` marker (Ralph Loop completion signal)
- Identifies when subtask is finished
- Triggers result collection

---

## 6. Failure Handling and Recovery

### The 3-Strikes Rule

After 3 consecutive failures on the same operation:

```
Strike 1 → Retry with adjustments
Strike 2 → Retry with different approach
Strike 3 → Trigger recovery protocol
```

### Recovery Protocol Steps

1. **STOP** - Immediately halt all modifications
2. **REVERT** - Use `git checkout` to restore last working state
3. **DOCUMENT** - Record what was attempted and why it failed
4. **CONSULT** - Call `oracle` agent with full failure context
5. **ESCALATE** - If oracle fails, ask user for guidance

### Automatic Demotion
- Agents may auto-demote to faster/cheaper models
- Bypasses rate limits or model-specific errors
- Example: Claude Opus → Claude Sonnet on repeated failures

### Failure Context Passed to Oracle

```markdown
## FAILURE REPORT

### Attempted Operation
[What was tried]

### Error Messages
[Specific errors encountered]

### Attempted Fixes
[What was tried to resolve]

### Current State
[State of codebase/task]

### Request
Provide architectural guidance for resolving this issue
```

---

## 7. Parallel vs Sequential Delegation

### Parallel Delegation

**When:** Phase 2A (Exploration & Research)

**Pattern:**
```
Sisyphus
    │
    ├──► explore (background)     ─┐
    │                              ├─► Convergent results
    └──► librarian (background)   ─┘
```

**Criteria for Parallel Execution:**
- Multiple file searches are independent
- Performing simultaneous module analysis
- No dependencies between tasks

### Sequential Delegation

**When:** Phase 2B (Implementation)

**Pattern:**
```
Sisyphus
    │
    ├──► Task A (wait for completion)
    │         │
    │         ▼
    └──► Task B (depends on A)
```

**Criteria for Sequential Execution:**
- Tasks have dependencies
- Output of one task feeds into another
- Example: Write logic → Generate documentation

### Decision Matrix

| Scenario | Execution Type | Reason |
|----------|---------------|--------|
| Search internal + external docs | Parallel | Independent sources |
| Find files + analyze them | Sequential | Analysis needs file list |
| Multiple independent file edits | Parallel | No dependencies |
| Create feature + write tests | Sequential | Tests depend on feature |

---

## Mapping to Claude Code Task Tool

### OmO Agent → Claude Code Mapping

| OmO Agent | Claude Code subagent_type | Model Suggestion |
|-----------|---------------------------|------------------|
| explore | `Explore` | haiku |
| librarian | `general-purpose` | haiku |
| oracle | `Plan` or `system-architect` | opus |
| frontend-ui-ux-engineer | `frontend-architect` | sonnet |
| document-writer | `technical-writer` | sonnet |
| multimodal-looker | `general-purpose` | sonnet |

### Delegation Prompt Adaptation

```
Task(
  subagent_type="Explore",
  model="haiku",
  prompt="""
  1. TASK: [specific goal]
  2. EXPECTED OUTCOME: [deliverables]
  3. CONTEXT: [file paths, constraints]
  4. MUST DO: [requirements]
  5. MUST NOT DO: [forbidden actions]
  """
)
```

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
