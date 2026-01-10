# OmO Error Recovery Protocols

## Executive Summary

Oh My OpenCode (OmO) employs a multi-layered error recovery protocol managed primarily by the **Sisyphus orchestrator** and a suite of specialized hooks. This system is designed to handle failures autonomously before escalating to the user.

---

## 1. Error Detection Methods

### Workflow Monitoring
- Sisyphus tracks task execution through specific phases
- Explicitly identifies failures in Phase 2C

### Specialized Hooks

| Hook | Purpose |
|------|---------|
| `empty-task-response-detector` | Identifies when task tool returns no data |
| `empty-message-sanitizer` | Catches empty response strings |

### Validation Tools
- `lsp_diagnostics` for pre-build validation
- Catches errors, warnings, and hints from language server

### Subagent Error Propagation
- Errors from subagents propagate back to parent orchestrator
- Logged in session for review

---

## 2. The 3-Strikes Rule (Complete Protocol)

### Trigger
**Three consecutive failures** on the same operation

### Protocol Sequence

```
Strike 1 → Attempt operation
              │
              ▼ (failure)

Strike 2 → Retry with adjustments
              │
              ▼ (failure)

Strike 3 → Retry again
              │
              ▼ (failure)

        ┌─────────────────┐
        │   RECOVERY      │
        │   PROTOCOL      │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
    ▼            ▼            ▼
  STOP        REVERT      DOCUMENT
    │            │            │
    └────────────┼────────────┘
                 │
                 ▼
            ┌─────────┐
            │ CONSULT │──► Oracle Agent
            └────┬────┘
                 │
                 ▼ (if Oracle fails)
            ┌─────────┐
            │ESCALATE │──► User
            └─────────┘
```

### Step Details

| Step | Action |
|------|--------|
| **STOP** | Immediately halt all modifications and edits |
| **REVERT** | Execute `git checkout` to last known working state |
| **DOCUMENT** | Record what was attempted and specific failure details |
| **CONSULT** | Call Oracle agent with full failure context |
| **ESCALATE** | Request user guidance if Oracle cannot resolve |

---

## 3. Rollback Mechanisms

### Primary Mechanism: Git Checkout
- On third strike: `git checkout` to last working state
- Ensures codebase never left in broken/inconsistent state

### Rollback Scope
- All file modifications since last known good state
- Preserves documentation of what was attempted

---

## 4. Recovery Strategies by Error Type

| Error Type | Recovery Strategy |
|------------|-------------------|
| **Edit Failures** (string not found) | Re-read file to verify current content, retry edit |
| **Build Failures** | Analyze error message, apply fixes incrementally |
| **Test Failures** | Read test file to understand expectation, then modify code |
| **Timeouts** | Simplify operation or reduce scope |
| **Context Limit Exceeded** | 4-stage recovery (see below) |

### Context Limit Recovery (4 Stages)

```
Stage 1: Dynamic Context Pruning (DCP)
              │
              ▼ (if insufficient)

Stage 2: Aggressive tool output truncation
              │
              ▼ (if insufficient)

Stage 3: Summarization / Reversion
              │
              ▼ (if insufficient)

Stage 4: Forced compaction
         (preserve system prompt + TODO state)
```

---

## 5. Graceful Degradation

### Agent Demotion
- On repeated failure: auto-demote to faster/cheaper model
- Example: Opus → Sonnet → Haiku
- Maintains operation at reduced capability

### Context Threshold Tiers

| Usage Level | Action |
|-------------|--------|
| 0-70% | Normal operation |
| 70-85% | Warning phase, agent notification |
| 85-100% | Preemptive compaction via DCP |
| 100% | Emergency recovery mode |

### Emergency Recovery Priorities
1. Preserve system prompt
2. Preserve current TODO state
3. Preserve recent exchanges
4. Prune everything else

### Pruning Fallback Chain
```
DCP Algorithm
      │
      ▼ (if insufficient)
Aggressive Truncation
      │
      ▼ (if insufficient)
Summarization
      │
      ▼ (if insufficient)
Stay within token limits (forced)
```

---

## 6. User Escalation Triggers

### When Escalation Occurs

| Scenario | Trigger |
|----------|---------|
| **Oracle Failure** | Oracle cannot provide viable path after 3-strikes |
| **Ambiguity** | Phase 0 Intent Gate classifies request as "Ambiguous" |
| **Permissions** | Tool requires "ask" permission or request is denied |
| **Critical Failure** | System cannot recover autonomously |

### Escalation Format
- Clear explanation of what was attempted
- Specific failure details
- Context for user decision
- Actionable options when possible

---

## 7. Error Logging

### Documentation Phase
- System records all attempts during recovery protocol
- Failure details captured for review

### Subagent Error Capture
- Crashes explicitly captured
- Reported to parent session
- Available for review

### Log Contents
- What was attempted
- Specific error messages
- State at time of failure
- Recovery actions taken

---

## 8. Prevention Patterns

### Proactive Patterns

| Pattern | Purpose |
|---------|---------|
| **Codebase Assessment** | Evaluate maturity before modifications |
| **Recursion Blocking** | Disable background tasks for subagents |
| **Dry Runs** | Preview changes before applying |
| **Todo Enforcer** | Prevent stopping until all tasks verified |

### Codebase Assessment
- Evaluates maturity: Disciplined, Legacy, etc.
- Ensures changes match existing patterns
- Prevents pattern mismatches

### Recursion Blocking
- Background tasks disabled for all subagents
- Only primary orchestrator spawns parallel tasks
- Prevents infinite recursive spawning

### Dry Run Support
- Tools like `ast_grep_replace` require dry run
- Preview changes before application
- Reduce risk of unintended modifications

### Todo Continuation Enforcer
- Prevents agents from stopping with incomplete todos
- Every atomic task must be verified complete
- "Bouldering mode" - must reach the top

---

## Mapping to Claude Code

### Direct Mappings

| OmO Feature | Claude Code Equivalent |
|-------------|----------------------|
| 3-strikes rule | Implement in CLAUDE.md rules |
| Git revert | Bash tool with git commands |
| Oracle consultation | Task tool with Plan/system-architect agent |
| User escalation | AskUserQuestion tool |

### Implementation Strategy

```markdown
## In CLAUDE.md:

### Error Recovery Protocol
After 3 consecutive failures on the same operation:
1. STOP - Halt all modifications
2. REVERT - `git checkout` to last working state
3. DOCUMENT - Record failure in response
4. CONSULT - Use Task tool with Plan agent
5. ESCALATE - Use AskUserQuestion tool
```

### Hooks Mapping

| OmO Hook | Claude Code Alternative |
|----------|------------------------|
| `empty-task-response-detector` | Implement in PreToolUse hook |
| `session-recovery` | Limited hook support |
| `context-window-monitor` | Not directly available |

---

## Analogy

Think of OmO's error recovery like a **commercial pilot's flight computer**:

| Component | Aviation Equivalent |
|-----------|-------------------|
| LSP diagnostics | Constant monitoring |
| Context limits | Weather conditions |
| Retry attempts | Engine restart attempts |
| 3-strikes protocol | Fail-safe checklist |
| Git revert | Return to stable altitude |
| Oracle consultation | Co-pilot advice |
| User escalation | Air Traffic Control |

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
