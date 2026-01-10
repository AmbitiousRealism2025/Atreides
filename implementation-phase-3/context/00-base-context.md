# Phase 3 Base Context

## Always Load This Document First

This document provides foundational context for Phase 3: Full Workflow Implementation.

---

## Phase 3 Overview

**Goal**: Implement complete multi-phase workflow with parallel exploration, completion checking, and session continuity.

**Key Outcomes**:
1. All workflow phases (0-3) documented and operational
2. Parallel exploration agents working
3. Completion checking prevents premature stops
4. Session state persists appropriately
5. Context management strategies in use

**Builds On**:
- Phase 1: MVP foundation (TodoWrite, 3-strikes, basic delegation)
- Phase 2: Core orchestration (intent classification, 7-section template, model selection)

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW PHASES                           │
└─────────────────────────────────────────────────────────────┘

Phase 0: Intent Gate
├── Classify request
├── Route appropriately
└── Gate: Requirements understood

        ↓ (Complex tasks)

Phase 1: Codebase Assessment
├── Assess maturity
├── Identify patterns
└── Gate: Context gathered

        ↓ (Exploration needed)

Phase 2A: Exploration
├── Parallel agents
├── Convergent search
└── Gate: Sufficient context

        ↓

Phase 2B: Implementation
├── TodoWrite tracking
├── Quality checks
└── Gate: Implementation complete

        ↓ (Failures)

Phase 2C: Recovery (if needed)
├── 3-strikes protocol
├── STOP/REVERT/DOCUMENT
└── Gate: Resolution found

        ↓

Phase 3: Completion
├── Verify todos
├── Quality verification
└── Gate: Deliverables verified
```

---

## What We're Adding

### To CLAUDE.md

```
New Sections:
├── Workflow Phases
│   ├── Phase 0: Intent Gate
│   ├── Phase 1: Assessment
│   ├── Phase 2A: Exploration
│   ├── Phase 2B: Implementation
│   ├── Phase 2C: Recovery
│   └── Phase 3: Completion
├── Exploration Patterns
│   ├── Parallel Agent Pattern
│   └── Convergent Search Strategy
├── Completion Checking Protocol
│   └── Completion Rules
├── Session Continuity
│   ├── Session Start Protocol
│   └── Session End Protocol
└── Context Management
    └── Critical Context Preservation
```

---

## Key Concepts

### Phase Transitions

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

### Parallel Exploration

Launch multiple agents in a **single message**:
```
Task(Explore, haiku, "internal search")
Task(general-purpose, haiku, "external research")
```

### Completion Checking

Before ending:
1. All todos complete?
2. Quality checks pass?
3. Deliverables match requirements?
4. State is clean?

---

## Reference Documents

| Document | Location | Use For |
|----------|----------|---------|
| Master Plan | `/MASTER-PLAN.md` | Phase 3 specs |
| Workflow Phases | `/planning-context/08-workflow-phases-and-gates.md` | Phase details |
| Task Management | `/planning-context/10-task-management-patterns.md` | Todo patterns |
| Memory & State | `/planning-context/06-memory-and-session-state.md` | Continuity |

---

## Integration Notes

### CLAUDE.md Section Order (After Phase 3)

```
1. Core Identity (Phase 1)
2. Intent Classification (Phase 2)
3. Workflow Phases (Phase 3) ← NEW
4. Task Management (Phase 1)
5. Agent Delegation (Phase 1+2)
6. Exploration Patterns (Phase 3) ← NEW
7. Error Recovery (Phase 1)
8. Completion Checking (Phase 3) ← NEW
9. Quality Standards (Phase 1)
10. Codebase Maturity (Phase 2)
11. Session Continuity (Phase 3) ← NEW
12. Context Management (Phase 3) ← NEW
13. Project-Specific Context
```

---

## Quality Standards for Phase 3

### Workflow Documentation

- Each phase has clear purpose
- Triggers are unambiguous
- Actions are actionable
- Gate criteria are verifiable

### Pattern Documentation

- Examples are concrete
- Patterns are copy-paste ready
- Edge cases addressed

---

*Base context for Phase 3 implementation*
*Load task-specific context as needed*
