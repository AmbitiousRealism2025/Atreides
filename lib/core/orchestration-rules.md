# Muad'Dib Orchestration Rules

## Core Principles

Muad'Dib orchestration is built on four core principles:

1. **Systematic Workflows** - Every task follows a defined phase-based process
2. **Intelligent Delegation** - Right tool for the right job, right model for the right complexity
3. **Robust Error Recovery** - Failures are handled gracefully with clear escalation paths
4. **Context Preservation** - Critical information survives session boundaries

---

## Task Management Rules

### Rule 1: TodoWrite for Multi-Step Tasks

Any task with 3 or more distinct steps MUST use TodoWrite:

```
✅ CORRECT:
   1. Create TodoWrite with task breakdown
   2. Mark each todo in_progress as you work
   3. Mark complete only when fully verified

❌ WRONG:
   - Proceeding without tracking
   - Marking complete before verification
   - Leaving todos incomplete
```

### Rule 2: Atomic Task Decomposition

Break complex tasks into atomic, verifiable units:

```
✅ CORRECT:
   - "Add login form with email/password fields"
   - "Create user authentication API endpoint"
   - "Write tests for login flow"

❌ WRONG:
   - "Implement authentication system" (too broad)
   - "Fix stuff" (not specific)
   - Multiple deliverables in one todo
```

### Rule 3: Progress Tracking

Maintain continuous awareness of progress:

- Update todo status immediately upon completion
- Never have more than one todo "in_progress"
- Don't batch completions - mark done as you go
- If blocked, document why and continue with others

---

## Error Recovery Protocol

### The 3-Strikes Rule

After 3 consecutive failures on the same operation:

```
FAILURE COUNT:
│
├─ Strike 1 → Attempt operation
│              └─ If fails, adjust and retry
│
├─ Strike 2 → Retry with adjustments
│              └─ If fails, try different approach
│
├─ Strike 3 → Final attempt
│              └─ If fails, enter recovery mode
│
└─ 3rd Failure → RECOVERY PROTOCOL
```

### Recovery Protocol

Execute in order:

1. **STOP** - Immediately halt all modifications
2. **REVERT** - Return to last known working state (`git checkout`)
3. **DOCUMENT** - Record what was attempted and why it failed
4. **CONSULT** - Use Task(Plan, opus) for architectural guidance
5. **ESCALATE** - If still stuck, AskUserQuestion

### What Counts as a "Strike"

A strike is counted when:
- The same operation fails consecutively
- "Same operation" = same file + same type of change
- Different files = separate strike counters
- Different change types = separate strike counters

### Strike Counter Reset

The counter resets when:
- Operation succeeds
- Moving to different file
- User provides new instructions
- Starting new task

---

## Context Management Rules

### Session Start

1. Read CLAUDE.md for project context
2. Check .claude/checkpoint.md for in-progress work
3. Review .claude/context.md for recent decisions
4. Verify git status for uncommitted changes

### During Work

- Update checkpoint.md every 30 minutes on long tasks
- Update checkpoint before risky operations
- Keep context.md current with key decisions
- Document blockers immediately

### Session End / Context Compaction

- Critical-context.md survives compaction
- Keep checkpoint.md updated for recovery
- Summarize session accomplishments
- Clear checkpoint when task complete

---

## Implementation Rules

### Rule: Read Before Write

Never modify a file without reading it first:

```
✅ CORRECT:
   1. Read target file
   2. Understand existing patterns
   3. Make changes that match style

❌ WRONG:
   - Assuming file contents
   - Ignoring existing conventions
   - Blind edits
```

### Rule: No Placeholders

Never leave incomplete implementations:

```
✅ CORRECT:
   - Fully implement the feature
   - Or don't start it

❌ WRONG:
   - TODO comments in core functionality
   - "not implemented" errors
   - Placeholder values
```

### Rule: Test Preservation

Never modify tests to make them pass:

```
✅ CORRECT:
   - Fix the code to pass existing tests
   - Add new tests for new functionality

❌ WRONG:
   - Changing test expectations to match broken code
   - Deleting failing tests
   - Skipping tests to avoid failures
```

---

## Model Selection Guidelines

| Complexity | Model | Use When |
|------------|-------|----------|
| Low | haiku | Simple searches, quick lookups, routine tasks |
| Medium | sonnet | Standard implementation, code review, testing |
| High | opus | Architecture, complex debugging, critical decisions |

### Complexity Indicators

**Low Complexity (haiku)**:
- Single-file searches
- Pattern matching
- Documentation lookup
- Simple file operations

**Medium Complexity (sonnet)**:
- Multi-file changes
- Code implementation
- Test writing
- Refactoring

**High Complexity (opus)**:
- Architectural decisions
- Cross-cutting concerns
- Performance optimization
- Security analysis
- Legacy code understanding

---

*Muad'Dib Orchestration Rules v1.0.0*
