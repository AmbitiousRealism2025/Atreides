# OmO to Claude Code Implementation Priority Matrix

## Executive Summary

This document provides a prioritized implementation roadmap for converting OmO orchestration patterns to Claude Code, organized into phases with effort estimates and dependencies.

---

## 1. Priority Tiers

### P0: Critical (Must Have for MVP)

| Feature | Effort | Notes |
|---------|--------|-------|
| Basic CLAUDE.md orchestration rules | Small | Foundation for everything |
| TodoWrite integration | Small | Already available |
| 3-strikes error recovery protocol | Small | Critical for robustness |
| Agent delegation via Task tool | Small | Core orchestration |
| Intent classification rules | Medium | Phase 0 equivalent |

### P1: High Priority (Core Functionality)

| Feature | Effort | Notes |
|---------|--------|-------|
| 7-section delegation prompt template | Small | Improves delegation quality |
| Multi-phase workflow (simplified) | Medium | Exploration → Implementation |
| Model selection rules (haiku/sonnet/opus) | Small | Cost optimization |
| Codebase maturity documentation | Small | Per-project config |
| Basic quality hooks (linting) | Small | PostToolUse hooks |

### P2: Medium Priority (Enhanced Capability)

| Feature | Effort | Notes |
|---------|--------|-------|
| Ralph Loop equivalent (completion checking) | Medium | Iteration management |
| Context management strategies | Medium | Manual DCP equivalent |
| Agent permission simulation | Medium | MUST NOT DO in prompts |
| Parallel exploration pattern | Medium | Concurrent Task calls |
| Session continuity patterns | Medium | File-based state |

### P3: Nice-to-Have (Full Parity)

| Feature | Effort | Notes |
|---------|--------|-------|
| LSP operations via MCP | Large | Requires MCP setup |
| AST-grep integration via CLI | Medium | Bash-based |
| Extended automation patterns | Large | Limited by hooks |
| Advanced context preservation | Large | Complex implementation |

---

## 2. Quick Wins (Immediate Implementation)

### Day 1 Implementations

| Quick Win | Time | How |
|-----------|------|-----|
| Create project CLAUDE.md | 30 min | Copy template, customize |
| Add TodoWrite rules | 10 min | Add to CLAUDE.md |
| Add 3-strikes rule | 15 min | Add to CLAUDE.md |
| Configure lint hooks | 20 min | settings.json |
| Document maturity level | 10 min | Add to CLAUDE.md |

### Template: Minimal CLAUDE.md

```markdown
# Project Orchestration Rules

## Task Management
- Use TodoWrite for tasks with 3+ steps
- Each todo = one atomic deliverable
- Mark complete only when verified
- Never stop with incomplete todos

## Error Recovery (3-Strikes)
After 3 consecutive failures on same operation:
1. STOP - Halt all modifications
2. REVERT - git checkout to last working state
3. DOCUMENT - Record what failed and why
4. CONSULT - Use Task(Plan, opus) for guidance
5. ESCALATE - AskUserQuestion if still stuck

## Agent Delegation
- Exploration: Task(Explore, haiku)
- Research: Task(general-purpose, haiku)
- Architecture: Task(Plan, opus)
- Frontend: Task(frontend-architect, sonnet)

## Codebase Maturity: [DISCIPLINED]
Follow existing patterns exactly.
```

---

## 3. Implementation Sequence

### Recommended Order

```
PHASE 1: Foundation (Week 1)
├── 1.1 Create CLAUDE.md with core rules
├── 1.2 Configure basic hooks (lint)
├── 1.3 Test TodoWrite integration
└── 1.4 Test 3-strikes protocol

PHASE 2: Orchestration (Week 2)
├── 2.1 Implement intent classification
├── 2.2 Add delegation prompt template
├── 2.3 Configure model selection rules
└── 2.4 Test parallel Task execution

PHASE 3: Workflow (Week 3)
├── 3.1 Implement exploration phase
├── 3.2 Add completion checking
├── 3.3 Create session continuity patterns
└── 3.4 Test full workflow

PHASE 4: Enhancement (Week 4+)
├── 4.1 Evaluate LSP MCP options
├── 4.2 Integrate ast-grep CLI
├── 4.3 Refine context management
└── 4.4 Polish and document
```

---

## 4. Feature Dependencies

### Dependency Graph

```
CLAUDE.md Foundation
         │
    ┌────┴────┬────────────────┐
    │         │                │
    ▼         ▼                ▼
TodoWrite   3-Strikes      Intent
Integration  Protocol    Classification
    │         │                │
    └────┬────┴────────────────┘
         │
         ▼
   Task Delegation
   (with templates)
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  Model     Parallel
Selection  Execution
    │         │
    └────┬────┘
         │
         ▼
   Completion
   Checking
         │
         ▼
   Full Workflow
         │
    ┌────┴────┐
    │         │
    ▼         ▼
  LSP       Context
  MCP       Management
```

### Blockers

| Feature | Blocked By |
|---------|-----------|
| Delegation templates | CLAUDE.md foundation |
| Parallel execution | Task delegation working |
| Completion checking | TodoWrite integration |
| Full workflow | All P0 + P1 features |

---

## 5. Effort Estimates

### By Feature

| Feature | Effort | Time Estimate |
|---------|--------|---------------|
| CLAUDE.md foundation | Small | 2-4 hours |
| TodoWrite integration | Small | 1-2 hours |
| 3-strikes protocol | Small | 1-2 hours |
| Basic hooks | Small | 1-2 hours |
| Intent classification | Medium | 4-8 hours |
| Delegation templates | Small | 2-4 hours |
| Model selection | Small | 1-2 hours |
| Parallel execution | Medium | 4-8 hours |
| Completion checking | Medium | 4-8 hours |
| Session continuity | Medium | 4-8 hours |
| LSP MCP setup | Large | 1-2 days |
| AST-grep integration | Medium | 4-8 hours |

### By Phase

| Phase | Total Effort |
|-------|-------------|
| Phase 1: Foundation | 1 day |
| Phase 2: Orchestration | 2 days |
| Phase 3: Workflow | 2-3 days |
| Phase 4: Enhancement | 3-5 days |
| **Total MVP** | **5-6 days** |
| **Total Full** | **8-11 days** |

---

## 6. Minimum Viable Conversion (MVP)

### MVP Definition

The conversion is "viable" when:

1. ✅ CLAUDE.md contains core orchestration rules
2. ✅ TodoWrite used for multi-step tasks
3. ✅ 3-strikes error recovery implemented
4. ✅ Agent delegation works via Task tool
5. ✅ Basic quality hooks configured
6. ✅ Intent classification documented

### MVP Excludes

- LSP/semantic operations
- Advanced context management
- Full hook parity (8 vs 31+)
- Multi-provider model routing
- Dynamic MCP spawning

### MVP Value Proposition

With MVP, you get:
- **70% of OmO's orchestration value**
- Systematic task management
- Error recovery protocol
- Agent delegation patterns
- Quality enforcement

---

## 7. Project Phases

### Phase 1: Foundation (Days 1-2)

**Goal:** Establish core infrastructure

**Deliverables:**
- [ ] Project CLAUDE.md with all core rules
- [ ] settings.json with basic hooks
- [ ] TodoWrite integration verified
- [ ] 3-strikes protocol documented

**Exit Criteria:**
- Can execute multi-step task with tracking
- Error recovery protocol triggers correctly

---

### Phase 2: Orchestration (Days 3-4)

**Goal:** Enable intelligent delegation

**Deliverables:**
- [ ] Intent classification rules
- [ ] 7-section delegation template
- [ ] Model selection guidelines
- [ ] Agent type mappings

**Exit Criteria:**
- Can classify request types
- Can delegate to appropriate agents
- Cost-aware model selection working

---

### Phase 3: Workflow (Days 5-7)

**Goal:** Implement full workflow phases

**Deliverables:**
- [ ] Exploration phase (parallel agents)
- [ ] Implementation phase rules
- [ ] Completion checking mechanism
- [ ] Session continuity patterns

**Exit Criteria:**
- Can execute exploration → implementation flow
- Completion validation working
- State persists appropriately

---

### Phase 4: Enhancement (Days 8+)

**Goal:** Approach full parity

**Deliverables:**
- [ ] LSP MCP evaluation/setup
- [ ] AST-grep CLI integration
- [ ] Advanced context strategies
- [ ] Documentation and refinement

**Exit Criteria:**
- Semantic operations available
- Full workflow documented
- Edge cases handled

---

## 8. Success Metrics

### MVP Success

| Metric | Target |
|--------|--------|
| Task completion rate | >90% |
| Error recovery triggered appropriately | 100% |
| Multi-step tasks tracked | 100% |
| Delegation working | >80% |

### Full Conversion Success

| Metric | Target |
|--------|--------|
| OmO feature coverage | >70% |
| Semantic operations available | Yes (via MCP) |
| Workflow phases implemented | All 4 |
| Context management effective | >80% |

---

## Next Steps

1. **Immediate:** Create CLAUDE.md with MVP rules
2. **This Week:** Complete Phase 1 + 2
3. **Next Week:** Complete Phase 3
4. **Ongoing:** Phase 4 enhancements

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
