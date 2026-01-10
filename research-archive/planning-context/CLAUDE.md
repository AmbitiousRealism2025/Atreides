# OmO-to-Claude Code Conversion: Master Planning Context

## Executive Summary

This is a comprehensive research project analyzing the migration of **Oh My OpenCode (OmO)** orchestration patterns to **Claude Code**. The planning context folder contains 17 sequential analysis documents covering architecture, agents, workflows, tools, and implementation strategy.

**Migration Complexity: 7/10** (Moderate-to-High)

| Category | Status |
|----------|--------|
| Research Phase | Complete (~211 KB analysis) |
| Feature Parity | 25% Native, 40% Workaround, 25% Difficult, 10% Impossible |
| MVP Effort | 5-6 days |
| Full Conversion | 8-11 days |

---

## Codebase Mental Model

### Architecture Overview

```
OmO-conversion-research/
├── CLAUDE.md                    → Project orchestration rules (operational)
├── planning-context/            → This folder (17 sequential analyses)
│   ├── 01-03: Architecture & Comparison
│   ├── 04-07: Agents & State
│   ├── 08-12: Workflow & Tools
│   └── 13-17: Features & Implementation
├── *.md (14 research docs)      → Deep dives on specific systems
└── .claude/settings.local.json  → MCP permissions
```

**Project Type**: Research documentation and conversion planning knowledge base

**Not an application** - This is a systematic analysis of migrating OmO's multi-agent orchestration to Claude Code's native capabilities.

---

## Key Systems Being Analyzed

### Source System: OmO (Oh My OpenCode)

| Component | Description |
|-----------|-------------|
| **Sisyphus Orchestrator** | 504-line dynamic system prompt managing 9 workflow phases |
| **7 Built-in Agents** | Hierarchical delegation with permission matrices |
| **31+ Lifecycle Hooks** | Comprehensive event-driven automation |
| **BackgroundManager** | Parallel task execution with provider-tiered concurrency |
| **DCP Algorithm** | Dynamic Context Pruning at 70%/85% thresholds |
| **Ralph Loop** | Iterative development cycle tracking |
| **11 LSP Tools** | Semantic code intelligence operations |
| **AST-grep** | 25-language structural pattern matching |

### Target System: Claude Code

| Component | Description |
|-----------|-------------|
| **Task Tool** | Agent delegation with subagent_type routing |
| **TodoWrite** | Multi-step task tracking |
| **8 Hook Events** | PreToolUse, PostToolUse, Notification, Stop, PreCompact, CompactComplete |
| **MCP Servers** | Pre-configured external tools |
| **Flat Concurrency** | 10 parallel tasks maximum |
| **Native Context** | Automatic summarization (no direct control) |

---

## Document Sequence Guide

### Foundation Layer (Read First)

| Doc | File | Purpose | Key Content |
|-----|------|---------|-------------|
| 01 | `01-omo-architecture-overview.md` | OmO system design | 4-layer architecture, initialization flow, tool categories |
| 02 | `02-claude-code-architecture-comparison.md` | Side-by-side analysis | Capability matrix, architectural differences, gap analysis |

### Agent Analysis Layer

| Doc | File | Purpose | Key Content |
|-----|------|---------|-------------|
| 03 | `03-agent-hierarchy-and-types.md` | Agent inventory | 7 agents, models, permissions, roles |
| 04 | `04-agent-delegation-patterns.md` | Delegation mechanics | 7-section template, routing rules, context transfer |
| 05 | `05-agent-communication-protocols.md` | Inter-agent messaging | Tool-driven mandate, state isolation |

### State Management Layer

| Doc | File | Purpose | Key Content |
|-----|------|---------|-------------|
| 06 | `06-memory-and-session-state.md` | State systems | 3-tier memory, DCP algorithm, persistence |
| 07 | `07-cross-session-continuity.md` | Session persistence | Todo recovery, context restoration |

### Workflow & Operations Layer

| Doc | File | Purpose | Key Content |
|-----|------|---------|-------------|
| 08 | `08-workflow-phases-and-gates.md` | Phase definitions | Intent Gate, Assessment, Exploration, Implementation, Completion |
| 09 | `09-error-recovery-protocols.md` | Failure handling | 3-strikes rule, rollback, escalation |
| 10 | `10-task-management-patterns.md` | Task decomposition | Atomic tasks, lifecycle, prioritization |
| 11 | `11-tool-selection-matrix.md` | Tool optimization | Selection logic, cost tiers, fallback chains |
| 12 | `12-hooks-and-automation.md` | Event system | 31 OmO hooks vs 8 Claude Code hooks |

### Feature Implementation Layer

| Doc | File | Purpose | Key Content |
|-----|------|---------|-------------|
| 13 | `13-semantic-code-features.md` | Code intelligence | LSP operations, AST-grep capabilities |
| 14 | `14-direct-feature-mappings.md` | Quick wins | Tool equivalents, direct translations |
| 15 | `15-adaptation-requirements.md` | Adaptation work | Features requiring modification |
| 16 | `16-impossible-features-and-workarounds.md` | Limitations | Infeasible features, mitigations |
| 17 | `17-implementation-priority-matrix.md` | Execution plan | MVP definition, phases, effort estimates |

---

## Supporting Research Documents

Located in project root, these provide deep technical analysis:

| Document | Size | Focus |
|----------|------|-------|
| `agents.md` | 30KB | Complete 7-agent system analysis |
| `omo-internals-deep-dive.md` | 38KB | Sisyphus prompt, BackgroundManager, Ralph Loop, DCP |
| `feature-interaction-map.md` | 35KB | Multi-agent coordination flows |
| `semantic-code-tools.md` | 28KB | LSP operations, AST-grep, language support |
| `omo-to-claude-code-migration-guide.md` | 20KB | 4-phase implementation roadmap |
| `skills.md` | 18KB | OmO skill system, MCP embedding |
| `adaptation-impossibilities.md` | 17KB | Detailed constraint analysis |
| `claude-code-2025-features.md` | 21KB | Claude Code January 2026 capabilities |
| `hooks.md` | 8KB | Complete hooks catalog |

---

## Feature Classification Matrix

### By Feasibility

| Classification | Count | Description |
|----------------|-------|-------------|
| **NATIVE** | ~6 | Direct equivalent exists in Claude Code |
| **WORKAROUND** | ~10 | Achievable with adaptation patterns |
| **DIFFICULT** | ~6 | High effort, possible with limitations |
| **IMPOSSIBLE** | ~4 | Cannot be replicated in Claude Code |

### Critical Constraints (IMPOSSIBLE)

| Feature | Impact | Mitigation Strategy |
|---------|--------|---------------------|
| Dynamic MCP spawning | HIGH | Pre-configure all required servers |
| Multi-model orchestration | HIGH | Single-session design limitation |
| Provider-tiered concurrency | MEDIUM | Accept flat 10-task limit |
| Direct DCP control | MEDIUM | Use PreCompact hook + structured prompts |

### High-Value Adaptations

| Feature | OmO Implementation | Claude Code Adaptation |
|---------|-------------------|----------------------|
| Agent delegation | `call_omo_agent()` | `Task(subagent_type="...")` |
| Task tracking | OmO TodoWrite | Native TodoWrite tool |
| Error recovery | 3-strikes + Oracle | 3-strikes + manual escalation |
| Workflow phases | Sisyphus phases | CLAUDE.md procedural rules |
| Tool selection | Intent → Agent → Tools | Decision matrix in CLAUDE.md |

---

## Implementation Roadmap

### Phase 1: Foundation (Days 1-2)

**Goal**: Establish core orchestration infrastructure

- [ ] Create project CLAUDE.md with base rules
- [ ] Configure settings.json with basic hooks
- [ ] Implement TodoWrite integration patterns
- [ ] Establish 3-strikes error recovery protocol

**Success Criteria**: Tasks tracked, errors handled, basic workflow operational

### Phase 2: Orchestration (Days 3-4)

**Goal**: Implement agent delegation and classification

- [ ] Intent classification rules (5 request types)
- [ ] 7-section delegation template
- [ ] Model selection guidelines (haiku/sonnet/opus routing)
- [ ] Parallel task execution patterns

**Success Criteria**: >80% delegation accuracy, correct model routing

### Phase 3: Workflow (Days 5-7)

**Goal**: Complete multi-phase workflow implementation

- [ ] Exploration phase with Task(Explore) agents
- [ ] Completion checking mechanism
- [ ] Session continuity patterns
- [ ] Full workflow validation suite

**Success Criteria**: All 4 phases operational, state preserved across sessions

### Phase 4: Enhancement (Days 8+)

**Goal**: Achieve maximum feature parity

- [ ] LSP MCP evaluation and setup
- [ ] AST-grep CLI integration
- [ ] Advanced context management strategies
- [ ] Complete documentation and validation

**Success Criteria**: >70% OmO feature coverage, semantic ops available

---

## Quick Wins (Day 1 Implementations)

| Task | Effort | Value |
|------|--------|-------|
| Basic CLAUDE.md with orchestration rules | 30 min | HIGH |
| TodoWrite for 3+ step tasks | 10 min | HIGH |
| 3-strikes error recovery | 15 min | HIGH |
| Lint check hooks (PostToolUse) | 20 min | MEDIUM |
| Codebase maturity documentation | 10 min | MEDIUM |

**Total MVP Time: ~85 minutes** → Achieves 70% of OmO orchestration value

---

## Planning Agent Instructions

When working with this research:

### Primary Objectives

1. **Synthesize** the 17 planning documents into actionable implementation guidance
2. **Prioritize** based on value/effort ratio (see doc 17)
3. **Identify** dependencies between implementation items
4. **Create** concrete deliverables: CLAUDE.md rules, hook configs, templates

### Reading Strategy

**For Architecture Understanding**: Docs 01, 02, 08
**For Agent System**: Docs 03, 04, 05 + `agents.md`
**For Implementation Planning**: Docs 14, 15, 16, 17
**For Deep Technical Reference**: Root-level research documents

### Key Decision Points

1. **Which features to include in MVP?**
   - Reference: `17-implementation-priority-matrix.md` (P0 critical, P1 high)

2. **How to handle impossible features?**
   - Reference: `16-impossible-features-and-workarounds.md`

3. **What patterns to follow?**
   - Reference: `08-workflow-phases-and-gates.md`, `09-error-recovery-protocols.md`

4. **Agent delegation strategy?**
   - Reference: `04-agent-delegation-patterns.md`

### Output Expectations

The master plan should produce:

1. **Updated root CLAUDE.md** with complete orchestration rules
2. **settings.json template** with hook configurations
3. **Agent delegation templates** for common scenarios
4. **Validation checklist** for implementation verification
5. **Risk mitigation strategies** for high-impact constraints

---

## Conventions Used in This Project

### File Naming

- **Root research**: `descriptive-kebab-case.md`
- **Planning context**: `[NN]-descriptive-name.md` (01-17)
- **Configuration**: Standard names (CLAUDE.md, settings.json)

### Document Structure

- Executive Summary first
- Tables for structured data
- ASCII diagrams for architecture
- Code blocks with language tags
- Clear header hierarchy (## → ### → ####)

### Classification Terminology

- **NATIVE**: Direct Claude Code equivalent
- **WORKAROUND**: Achievable with adaptation
- **DIFFICULT**: High effort, possible with limitations
- **IMPOSSIBLE**: Cannot be replicated

### Priority Labels

- **P0**: Critical (MVP must-haves)
- **P1**: High priority (core functionality)
- **P2**: Medium priority (enhanced capability)
- **P3**: Nice-to-have (full parity, lower priority)

---

## Critical Paths

### Entry Points

| Purpose | Start Here |
|---------|------------|
| Understand OmO architecture | `01-omo-architecture-overview.md` |
| Compare systems | `02-claude-code-architecture-comparison.md` |
| Begin implementation | `17-implementation-priority-matrix.md` |
| Quick reference | Root `CLAUDE.md` |

### Core Logic Locations

| System | Primary Documents |
|--------|-------------------|
| Agent hierarchy | Docs 03, 04, 05 + `agents.md` |
| Workflow phases | Doc 08 + `omo-internals-deep-dive.md` |
| Error recovery | Doc 09 |
| Tool selection | Doc 11 |
| Feature mapping | Docs 14, 15, 16 |

### Data Flow

```
Research Documents (root *.md)
        ↓ analysis feeds
Planning Context (01-17 numbered docs)
        ↓ synthesizes into
Implementation Roadmap (doc 17)
        ↓ produces
Operational CLAUDE.md (root)
```

---

## Gotchas & Warnings

### Known Limitations

1. **No dynamic MCP spawning** - All MCP servers must be pre-configured
2. **Single model per session** - Cannot switch models mid-conversation
3. **Flat concurrency** - Maximum 10 parallel tasks (vs OmO's provider-tiered)
4. **No direct context control** - PreCompact hook is best option for intervention
5. **Hook coverage gap** - 8 events vs OmO's 31+

### Common Pitfalls

1. **Over-engineering** - Start with MVP (P0), add incrementally
2. **Ignoring constraints** - Document 16 lists what CANNOT be done
3. **Sequential reading** - Documents are numbered for dependency order
4. **Missing quick wins** - Check document 14 for immediate value items

### Risk Areas

| Risk | Mitigation |
|------|------------|
| Context overflow | Structured summaries in CLAUDE.md prompts |
| Agent confusion | Clear 7-section delegation templates |
| Error spirals | Strict 3-strikes with git rollback |
| Scope creep | MVP-first mentality, P0 only initially |

---

## Implementation Process

### Phase Folder Structure

Each implementation phase has its own folder with a standardized structure:

```
implementation-phase-X/
├── README.md                    # Task breakdown with context markers
├── context/
│   ├── 00-base-context.md       # Always loaded (phase overview, goals)
│   ├── 01-[topic]-context.md    # Task-specific context
│   ├── 02-[topic]-context.md    # Task-specific context
│   └── ...
└── [deliverables created during implementation]
```

### Context Loading Strategy: Layered

Context is loaded in layers:

```
┌─────────────────────────────────────────┐
│         ALWAYS LOADED (Base)            │
│  • 00-base-context.md                   │
│  • Phase goals, success criteria        │
│  • Key dependencies from prior phases   │
└─────────────────────────────────────────┘
              +
┌─────────────────────────────────────────┐
│      TASK-SPECIFIC (Progressive)        │
│  • Loaded via markers in README.md      │
│  • Only what's needed for current task  │
│  • Replaced as tasks progress           │
└─────────────────────────────────────────┘
```

### Context Markers

Tasks include HTML comment markers indicating when to load context:

```markdown
## Task 2.1: Implement CLI Router

<!-- LOAD_CONTEXT: context/02-cli-implementation.md -->

**Objective**: Create the main CLI entry point...
```

**Marker Format**: `<!-- LOAD_CONTEXT: context/[filename].md -->`

### Task Breakdown Principles

Tasks are sized with context window limitations in mind:

1. **Atomic Tasks**: Each task should be completable in a single agent session
2. **Clear Boundaries**: Tasks have explicit start/end criteria
3. **Checkpoint Points**: Larger tasks have save points for context refresh
4. **Self-Contained**: Each phase folder contains everything needed to execute

### Coding Agent Instructions

When working on an implementation phase:

1. **Start**: Read `README.md` and load `context/00-base-context.md`
2. **Per Task**: Load context indicated by `<!-- LOAD_CONTEXT: -->` marker
3. **Execute**: Complete the task as specified
4. **Checkpoint**: If context pressure builds, summarize progress and continue
5. **Complete**: Mark task done, proceed to next

### Progressive Disclosure Flow

```
Agent Starts Phase
        │
        ▼
Load 00-base-context.md (always)
        │
        ▼
Read README.md task list
        │
        ▼
┌───────────────────────────────┐
│ For each task:                │
│  1. See LOAD_CONTEXT marker   │
│  2. Load task-specific context│
│  3. Execute task              │
│  4. Mark complete             │
│  5. Move to next task         │
└───────────────────────────────┘
        │
        ▼
Phase Complete
```

### Phase Independence

Each phase folder is **self-contained**:

- A fresh agent (or different person) can pick up any phase
- No conversation history required
- All necessary context is in the folder
- Dependencies on prior phases are documented in base context

---

## Ready State

This planning context is **comprehensive and ready for implementation**.

**Current Status**: Master plan complete (MASTER-PLAN.md)

**Next Steps**:
1. Create `implementation-phase-0/` folder
2. Break Phase 0 into context-aware tasks
3. Generate context documents for progressive disclosure
4. Add context markers to task breakdown
5. Execute Phase 0 with coding agents
6. Repeat for Phases 1-5

**Total Research Content**: ~350 KB across 31 documents
**Confidence Level**: HIGH - Evidence-based analysis with clear recommendations

---

## Quick Reference: Implementation Phases

| Phase | Folder | Primary Deliverable |
|-------|--------|---------------------|
| 0 | `implementation-phase-0/` | NPM package (muaddib-claude) |
| 1 | `implementation-phase-1/` | Core CLAUDE.md templates |
| 2 | `implementation-phase-2/` | Orchestration features |
| 3 | `implementation-phase-3/` | Full workflow system |
| 4 | `implementation-phase-4/` | Enhanced capabilities |
| 5 | `implementation-phase-5/` | Difficult adaptations |

**Master Plan Location**: `/MASTER-PLAN.md`
