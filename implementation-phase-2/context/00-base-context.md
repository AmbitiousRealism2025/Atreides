# Phase 2 Base Context

## Always Load This Document First

This document provides foundational context for Phase 2: Core Orchestration.

---

## Phase 2 Overview

**Goal**: Enable intelligent task routing with intent classification and optimized delegation.

**Key Outcomes**:
1. Request classification before action
2. 7-section delegation template for all agents
3. Cost-aware model selection
4. Automated quality hooks
5. Codebase maturity assessment

**Builds On Phase 1**: Phase 1 created the MVP foundation (basic CLAUDE.md, TodoWrite, 3-strikes, basic delegation). Phase 2 adds intelligence to the orchestration.

---

## What We're Adding

### To CLAUDE.md

```
New Sections:
├── Intent Classification
│   ├── 5 request categories
│   └── Classification decision rules
├── 7-Section Delegation Template
│   └── Example delegations
├── Model Selection Rules
│   └── Cost tier documentation
└── Codebase Maturity Assessment
    └── Assessment checklist
```

### To settings.json

```
Enhanced Hooks:
├── PostToolUse
│   ├── Formatting (prettier/black/gofmt)
│   └── Linting (eslint/ruff/golint)
└── [Placeholder for Phase 4 hooks]
```

---

## Key Concepts

### Intent Classification

| Category | Description | Action |
|----------|-------------|--------|
| Trivial | Simple questions | Direct answer |
| Explicit | Clear implementation | Execute immediately |
| Exploratory | Requires investigation | Explore first |
| Open-ended | Architectural | Full assessment |
| Ambiguous | Unclear | AskUserQuestion |

### 7-Section Delegation Template

1. **TASK** - What to do
2. **EXPECTED OUTCOME** - Deliverables
3. **CONTEXT** - Files, patterns, constraints
4. **MUST DO** - Required actions
5. **MUST NOT DO** - Forbidden actions
6. **TOOLS ALLOWED** - Optional whitelist
7. **SUCCESS CRITERIA** - Completion definition

### Model Selection Tiers

| Tier | Model | Use For |
|------|-------|---------|
| Economy | haiku | Exploration, simple research |
| Standard | sonnet | Implementation, code generation |
| Premium | opus | Architecture, complex analysis |

---

## OmO Patterns Being Adapted

### From OmO's Intent Gate

| OmO Feature | Phase 2 Adaptation |
|-------------|-------------------|
| Intent classification | 5 category system |
| Confidence scoring | Simplified to categories |
| Automatic routing | Manual decision tree |

### From OmO's Agent Templates

| OmO Feature | Phase 2 Adaptation |
|-------------|-------------------|
| Structured prompts | 7-section template |
| Permission matrices | MUST DO / MUST NOT DO |
| Tool restrictions | TOOLS ALLOWED section |

---

## Reference Documents

| Document | Location | Use For |
|----------|----------|---------|
| Master Plan | `/MASTER-PLAN.md` | Phase 2 specs |
| Delegation Patterns | `/planning-context/04-agent-delegation-patterns.md` | Template details |
| Tool Selection | `/planning-context/11-tool-selection-matrix.md` | Model selection |
| Workflow Phases | `/planning-context/08-workflow-phases-and-gates.md` | Intent gate |

---

## Integration Notes

### With Phase 1 Content

Phase 2 content should **enhance** Phase 1, not replace:

- Intent classification goes **before** task management
- 7-section template **extends** basic delegation
- Model selection **refines** agent matrix
- Quality hooks go in **settings.json**, not CLAUDE.md

### CLAUDE.md Section Order (After Phase 2)

```
1. Core Identity (Phase 1)
2. Intent Classification (Phase 2) ← NEW
3. Task Management (Phase 1)
4. Agent Delegation (Phase 1, enhanced in Phase 2)
   - 7-Section Template (Phase 2) ← NEW
   - Model Selection (Phase 2) ← NEW
5. Error Recovery (Phase 1)
6. Quality Standards (Phase 1)
7. Codebase Maturity (Phase 2) ← NEW
8. Project-Specific Context
```

---

## Quality Standards for Phase 2

### Documentation Quality

- Tables for matrices
- Examples for each concept
- Decision trees for routing
- No ambiguous instructions

### Hook Quality

- Fail gracefully (2>/dev/null || true)
- Work across project types
- Don't block on errors
- Log useful information

---

*Base context for Phase 2 implementation*
*Load task-specific context as needed*
