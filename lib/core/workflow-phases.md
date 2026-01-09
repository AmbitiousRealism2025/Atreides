# Muad'Dib Workflow Phases

## Phase Overview

Muad'Dib orchestration uses a multi-phase workflow to ensure systematic, high-quality work:

```
┌──────────────────────────────────────────────────────────────┐
│                    MUAD'DIB WORKFLOW                          │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   User Request                                                │
│        │                                                      │
│        ▼                                                      │
│   ┌─────────────────┐                                        │
│   │   PHASE 0       │ Intent Classification                 │
│   │   Intent Gate   │ Trivial? Explicit? Exploratory?       │
│   └────────┬────────┘                                        │
│            │                                                  │
│      ┌─────┴─────┐                                           │
│      │           │                                            │
│   Trivial?    Complex?                                        │
│      │           │                                            │
│      ▼           ▼                                            │
│   Answer    ┌─────────────────┐                              │
│   directly  │   PHASE 1       │ Codebase Assessment         │
│             │   Assessment    │ (if needed)                  │
│             └────────┬────────┘                              │
│                      │                                        │
│               ┌──────┴──────┐                                │
│               │             │                                 │
│               ▼             ▼                                 │
│   ┌─────────────────┐ ┌─────────────────┐                   │
│   │   PHASE 2A      │ │   PHASE 2B      │                   │
│   │   Exploration   │ │  Implementation │                   │
│   └────────┬────────┘ └────────┬────────┘                   │
│            │                   │                              │
│            └─────────┬─────────┘                             │
│                      │                                        │
│              If failures ──────┐                             │
│                      │         ▼                              │
│                      │  ┌─────────────────┐                  │
│                      │  │   PHASE 2C      │                  │
│                      │  │   Recovery      │                  │
│                      │  └────────┬────────┘                  │
│                      │           │                            │
│                      └─────┬─────┘                           │
│                            │                                  │
│                            ▼                                  │
│                    ┌─────────────────┐                       │
│                    │   PHASE 3       │ Verification          │
│                    │   Completion    │ & Delivery            │
│                    └─────────────────┘                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Phase Transitions

| From | To | Trigger |
|------|-----|---------|
| Phase 0 | Phase 1 | Open-ended request |
| Phase 0 | Phase 2B | Explicit request |
| Phase 0 | (answer) | Trivial request |
| Phase 1 | Phase 2A | Exploration needed |
| Phase 1 | Phase 2B | Sufficient context |
| Phase 2A | Phase 2B | Context gathered |
| Phase 2B | Phase 2C | 3 failures |
| Phase 2B | Phase 3 | Implementation done |
| Phase 2C | Phase 2B | Recovery successful |
| Phase 2C | Phase 3 | User intervention |
| Phase 3 | (done) | Verification passed |

---

## Phase 0: Intent Gate

### Purpose
Classify and validate the user's request before beginning work.

### Request Classification

| Type | Description | Action |
|------|-------------|--------|
| **Trivial** | Simple question, quick lookup | Answer directly |
| **Explicit** | Clear requirements, known solution | Skip to Phase 2B |
| **Exploratory** | Research needed, unclear scope | Phase 1 → Phase 2A |
| **Open-ended** | Complex, architectural decisions | Full workflow |
| **Ambiguous** | Unclear intent, multiple interpretations | Clarify first |

### Decision Flow

```
Receive Request
      │
      ▼
Is intent clear? ──No──► AskUserQuestion
      │                        │
     Yes                       ▼
      │                  Clarify intent
      ▼                        │
Classify type ◄────────────────┘
      │
      ├── Trivial ──────► Answer directly
      │
      ├── Explicit ─────► Skip to Phase 2B
      │
      ├── Exploratory ──► Phase 1 assessment
      │
      └── Open-ended ───► Full workflow
```

---

## Phase 1: Codebase Assessment

### Purpose
Evaluate the project state before diving into complex tasks.

### When to Use
- Open-ended requests
- Unfamiliar codebase
- Architectural decisions
- Cross-cutting changes

### Assessment Areas

1. **Project Structure**
   - File organization
   - Module boundaries
   - Configuration locations

2. **Code Patterns**
   - Naming conventions
   - Error handling style
   - Testing patterns

3. **Dependencies**
   - External libraries
   - Version constraints
   - Compatibility requirements

4. **Technical Debt**
   - Known issues
   - Deprecated patterns
   - Migration status

### Tools

| Task | Tool | Model |
|------|------|-------|
| Find patterns | Task(Explore) | sonnet |
| Analyze structure | Task(Explore) | sonnet |
| Architectural review | Task(Plan) | opus |

---

## Phase 2A: Exploration & Research

### Purpose
Gather context through systematic investigation.

### Exploration Patterns

**Parallel Exploration**
```
Launch multiple exploration agents simultaneously:
├── Task(Explore): Find all API endpoints
├── Task(Explore): Locate test patterns
└── Task(Explore): Identify configuration
```

**Iterative Deepening**
```
1. Broad search → identify key areas
2. Focused search → understand specifics
3. Context synthesis → make decisions
```

### Completion Criteria
- Sufficient context to proceed with confidence
- No major unknown areas remaining
- Clear understanding of constraints

---

## Phase 2B: Implementation

### Purpose
Execute the actual development work.

### Implementation Flow

```
1. Create TodoWrite
   └── Break work into atomic tasks

2. For each todo:
   ├── Mark in_progress
   ├── Implement
   ├── Validate
   └── Mark complete

3. Quality checks
   └── Run tests, lint, format

4. Verification
   └── Confirm requirements met
```

### Key Rules

1. **One todo at a time** - Focus on single deliverable
2. **Verify before marking complete** - Actually test it
3. **Match existing patterns** - Don't introduce new styles
4. **Document decisions** - Update context as needed

### Delegation

| Task Type | Delegate To |
|-----------|-------------|
| Complex algorithms | Direct implementation |
| UI components | Task(frontend-architect) |
| Security review | Task(security-engineer) |
| Performance | Task(performance-engineer) |

---

## Phase 2C: Failure Recovery

### Purpose
Handle persistent failures gracefully.

### Trigger
3 consecutive failures on the same operation.

### Recovery Protocol

```
1. STOP
   └── Immediately halt modifications

2. REVERT
   └── git checkout to last working state

3. DOCUMENT
   ├── What was attempted
   ├── Error messages
   └── Approaches tried

4. CONSULT
   └── Task(Plan, opus) for guidance

5. ESCALATE
   └── AskUserQuestion if still blocked
```

### After Recovery

- Resume with new approach
- Or escalate to user
- Never repeat failed approach

---

## Phase 3: Completion

### Purpose
Verify and deliver results.

### Completion Checklist

```
[ ] All TodoWrite items marked complete
[ ] Quality checks passed
    ├── Tests pass
    ├── Lint clean
    └── Types check
[ ] Requirements verified
[ ] Documentation updated (if needed)
[ ] Temporary files cleaned
[ ] Summary provided to user
```

### Verification Steps

1. **Re-read requirements** - Did we address everything?
2. **Check todos** - Are any incomplete?
3. **Run tests** - Do they pass?
4. **Review changes** - Match expectations?
5. **Clean up** - Remove debug code, temp files

### Deliverables

- Clear summary of what was accomplished
- Any caveats or known limitations
- Suggestions for follow-up (if any)

---

*Muad'Dib Workflow Phases v1.0.0*
