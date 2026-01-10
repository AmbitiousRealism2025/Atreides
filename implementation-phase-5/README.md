# Phase 5: Difficult Feature Adaptations (REVISED for Claude Code 2.1)

**Priority**: P3 Extended / High Effort
**Estimated Effort**: 12-15 hours → **10-12 hours** (reduced with 2.1 features)
**Dependencies**: Phase 4 Enhanced complete
**Claude Code Version**: 2.1.0+ (leverages new features)

## Overview

Phase 5 implements high-effort features that significantly enhance capability, now **leveraging Claude Code 2.1's forked context** for better isolation and cleaner patterns.

**Exit Criteria**: LSP operations available, AST-grep integrated, advanced context preservation working, **skill-based automation patterns** documented and tested.

**Target**: 80-85% OmO parity (up from 75-80%)

---

## What's New in This Revision

| Original Plan | Enhanced Plan | Source |
|---------------|---------------|--------|
| Manual automation patterns | Skill-based patterns with forked context | Claude Code 2.1 |
| CLAUDE.md-only documentation | + Distributable skill files | Claude Code 2.1 |
| Basic checkpoint system | Checkpoint + skill state isolation | Claude Code 2.1 |
| 75-80% parity target | 80-85% parity target | Enhanced scope |

---

## Task Groups

### Group 1: LSP MCP Integration (Tasks 5.1.1 - 5.1.5) **ENHANCED**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 5.1.1 | Research available LSP MCP servers | 2 hours | |
| 5.1.2 | Configure LSP MCP (if available) | 1 hour | |
| 5.1.3 | Document CLI-based LSP alternatives | 1 hour | |
| 5.1.4 | Test LSP operations | 1 hour | |
| **5.1.5** | **Create muaddib-lsp skill for semantic ops** | **30 min** | **NEW** |

**Dependencies**: Phase 4 complete
**Deliverables**:
- Working LSP operations via MCP or CLI fallback
- muaddib-lsp skill for semantic code operations

#### Sample Skill: muaddib-lsp.md

```yaml
---
name: muaddib-lsp
description: Semantic code operations using LSP or CLI fallbacks
context: fork
model: sonnet
allowed-tools:
  - Bash
  - Read
  - Grep
hooks:
  PostToolUse:
    - matcher: Bash
      hooks:
        - type: command
          command: echo "LSP operation completed"
---

# LSP Operations Skill

Provides semantic code operations with automatic fallback.

## Available Operations

### Go to Definition
```bash
# TypeScript/JavaScript
npx tsc --noEmit && grep -n "function NAME" src/**/*.ts

# Python
pyright src/ --outputjson | jq '.diagnostics'

# Go
go doc package.Function
```

### Find References
```bash
# Cross-language
grep -r "symbolName" --include="*.ts" --include="*.js" src/
```

## Fallback Chain
1. LSP MCP server (if available)
2. Language-specific CLI tools
3. Grep-based search (last resort)
```

---

### Group 2: AST-grep CLI Integration (Tasks 5.2.1 - 5.2.6) **ENHANCED**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 5.2.1 | Verify ast-grep installation | 15 min | |
| 5.2.2 | Document ast-grep search patterns | 30 min | |
| 5.2.3 | Document ast-grep replace patterns | 30 min | |
| 5.2.4 | Create ast-grep cheat sheet | 30 min | |
| 5.2.5 | Test ast-grep operations | 30 min | |
| **5.2.6** | **Create muaddib-refactor skill using ast-grep** | **30 min** | **NEW** |

**Dependencies**: ast-grep CLI installed
**Deliverables**:
- Comprehensive ast-grep documentation and patterns
- muaddib-refactor skill for structural code changes

#### Sample Skill: muaddib-refactor.md

```yaml
---
name: muaddib-refactor
description: Structural code refactoring using ast-grep
context: fork
model: opus
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: command
          command: git stash push -m "pre-refactor-backup" 2>/dev/null || true
  Stop:
    - type: command
      command: echo "Refactoring complete - verify changes before committing"
---

# Structural Refactoring Skill

Uses ast-grep for safe, structural code transformations.

## Pattern Library

### Find function definitions
```bash
ast-grep --pattern 'function $NAME($$$ARGS) { $$$BODY }' --lang javascript src/
```

### Rename function safely
```bash
ast-grep --pattern 'oldName($$$ARGS)' \
         --rewrite 'newName($$$ARGS)' \
         --lang typescript src/
```

### Convert callbacks to async/await
```bash
ast-grep --pattern '$FN($$$ARGS, function($ERR, $RESULT) { $$$BODY })' \
         --rewrite 'await $FN($$$ARGS)' \
         --lang javascript src/
```

## Safety Protocol
1. Always git stash before refactoring
2. Run tests after each file
3. Review diff before committing
```

---

### Group 3: Advanced Context Preservation (Tasks 5.3.1 - 5.3.4) **ENHANCED**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 5.3.1 | Create checkpoint system documentation | 30 min | |
| 5.3.2 | Create checkpoint.md template | 20 min | |
| 5.3.3 | Add checkpoint triggers to CLAUDE.md | 20 min | |
| **5.3.4** | **Create muaddib-checkpoint skill** | **25 min** | **NEW** |

**Dependencies**: Phase 4 context files
**Deliverables**:
- Checkpoint system for long-running tasks
- muaddib-checkpoint skill for state management

#### Sample Skill: muaddib-checkpoint.md

```yaml
---
name: muaddib-checkpoint
description: Session state checkpointing and recovery
context: main
model: haiku
allowed-tools:
  - Read
  - Write
  - TodoRead
---

# Checkpoint Skill

Captures and restores session state.

## Create Checkpoint

When invoked, I will:
1. Read current TodoWrite state
2. Summarize active work
3. Note key files being modified
4. Record critical decisions
5. Write to .claude/checkpoint.md

## Checkpoint Template

```markdown
# Session Checkpoint

**Created**: [timestamp]
**Objective**: [current goal]

## Active Todos
[list from TodoRead]

## Files in Progress
- file1.ts: [status]
- file2.ts: [status]

## Critical Decisions
- [decision 1]
- [decision 2]

## Recovery Instructions
1. [step 1]
2. [step 2]

## Next Steps
- [ ] [next action]
```
```

---

### Group 4: Skill-Based Automation Patterns (Tasks 5.4.1 - 5.4.6) **MAJOR REVISION**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 5.4.1 | Create muaddib-tdd skill (test-driven) | 30 min | **REVISED** |
| 5.4.2 | Create muaddib-parallel-explore skill | 30 min | **REVISED** |
| 5.4.3 | Create muaddib-incremental-refactor skill | 30 min | **REVISED** |
| 5.4.4 | Create muaddib-doc-sync skill | 25 min | **REVISED** |
| **5.4.5** | **Create muaddib-quality-gate skill** | **25 min** | **NEW** |
| **5.4.6** | **Document skill composition patterns** | **30 min** | **NEW** |

**Dependencies**: Phase 3 workflow phases, Phase 4 skills infrastructure
**Deliverables**: 6 automation skills with forked context where appropriate

#### Complete Skill Suite

```
.claude/skills/muaddib/
├── orchestrate.md           # Phase 4
├── explore.md               # Phase 4, forked context
├── validate.md              # Phase 4
├── lsp.md                   # Phase 5, forked context
├── refactor.md              # Phase 5, forked context
├── checkpoint.md            # Phase 5
├── tdd.md                   # Phase 5, forked context
├── parallel-explore.md      # Phase 5, forked context
├── incremental-refactor.md  # Phase 5, forked context
├── doc-sync.md              # Phase 5
└── quality-gate.md          # Phase 5
```

#### Sample Skill: muaddib-tdd.md

```yaml
---
name: muaddib-tdd
description: Test-driven development workflow automation
context: fork
model: sonnet
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
hooks:
  PreToolUse:
    - matcher: Write
      hooks:
        - type: command
          command: "echo 'TDD: Writing test file'"
  PostToolUse:
    - matcher: Bash
      hooks:
        - type: command
          command: "echo 'TDD: Test execution complete'"
---

# Test-Driven Development Skill

Enforces TDD workflow in an isolated context.

## Workflow

1. **Write Test First**
   - Create failing test for expected behavior
   - Verify test fails (proves test works)

2. **Implement Minimum Code**
   - Write just enough to pass
   - No over-engineering

3. **Verify Pass**
   - Run test, confirm green

4. **Refactor (Optional)**
   - Improve code quality
   - Tests protect against regression

5. **Final Verification**
   - Full test suite
   - Type check
   - Lint

## Return Format

I will return a summary:
- Test file created/modified
- Implementation file created/modified
- Test results (pass/fail)
- Any issues encountered
```

#### Sample Skill: muaddib-quality-gate.md

```yaml
---
name: muaddib-quality-gate
description: Pre-completion quality verification
context: main
model: sonnet
allowed-tools:
  - Bash
  - Read
  - TodoRead
hooks:
  Stop:
    - type: command
      command: echo "Quality gate evaluation complete"
---

# Quality Gate Skill

Verifies work meets quality standards before completion.

## Quality Checks

### 1. TodoWrite Audit
- Are ALL todos complete?
- Any abandoned in-progress items?

### 2. Test Verification
```bash
npm test 2>&1 | tail -20
# OR
pytest -v 2>&1 | tail -20
```

### 3. Type Check
```bash
npx tsc --noEmit 2>&1 | head -20
# OR
mypy . 2>&1 | head -20
```

### 4. Lint Check
```bash
npm run lint 2>&1 | head -20
# OR
ruff check . 2>&1 | head -20
```

### 5. Git Status
```bash
git status --short
```

## Gate Decision

**PASS**: All checks green, todos complete
**FAIL**: Any check red, incomplete todos

If FAIL, provide specific remediation steps.
```

---

### Group 5: Integration Testing (Tasks 5.5.1 - 5.5.6) **EXPANDED**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 5.5.1 | Integration test: LSP operations | 45 min | |
| 5.5.2 | Integration test: ast-grep workflow | 30 min | |
| 5.5.3 | Integration test: checkpoint system | 30 min | |
| 5.5.4 | Integration test: automation skills | 45 min | |
| **5.5.5** | **Test skill hot reload in Phase 5 skills** | **20 min** | **NEW** |
| **5.5.6** | **Test skill composition (chaining skills)** | **30 min** | **NEW** |

**Dependencies**: All previous tasks
**Deliverables**: Validation report, maximum parity achieved

---

## Dependencies Graph

```
Phase 4 Enhanced Complete
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    PHASE 5 (ENHANCED)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ Group 1       │  │ Group 2       │  │ Group 3         │  │
│  │ LSP           │  │ AST-grep      │  │ Checkpoints     │  │
│  │ + lsp skill   │  │ + refactor    │  │ + checkpoint    │  │
│  │ 5.1.1-5.1.5   │  │   skill       │  │   skill         │  │
│  │               │  │ 5.2.1-5.2.6   │  │ 5.3.1-5.3.4     │  │
│  └───────┬───────┘  └───────┬───────┘  └────────┬────────┘  │
│          │                  │                   │            │
│          └──────────────────┼───────────────────┘            │
│                             │                                │
│                             ▼                                │
│                  ┌─────────────────────┐                     │
│                  │ Group 4             │                     │
│                  │ Skill-Based         │                     │
│                  │ Automation          │                     │
│                  │ 5.4.1-5.4.6         │                     │
│                  │ ★ MAJOR REVISION ★  │                     │
│                  └──────────┬──────────┘                     │
│                             │                                │
│                             ▼                                │
│                  ┌─────────────────────┐                     │
│                  │ Group 5             │                     │
│                  │ Integration Testing │                     │
│                  │ 5.5.1-5.5.6         │                     │
│                  └─────────────────────┘                     │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
 IMPLEMENTATION COMPLETE
 (~80-85% OmO Parity)
```

---

## Validation Checklist (Enhanced)

### Original Criteria
- [ ] LSP operations work (MCP or CLI)
- [ ] AST-grep search patterns function
- [ ] AST-grep replace patterns function
- [ ] Checkpoint system documents state
- [ ] Advanced patterns documented and usable
- [ ] All integration tests pass

### New Criteria (Claude Code 2.1)
- [ ] **All Phase 5 skills load correctly**
- [ ] **Forked context skills return clean summaries**
- [ ] **Skill hot reload works for all new skills**
- [ ] **Skill composition (chaining) works**
- [ ] **Quality gate skill catches issues**

---

## Files to Create/Modify

### New Files (Skills)
- `.claude/skills/muaddib/lsp.md`
- `.claude/skills/muaddib/refactor.md`
- `.claude/skills/muaddib/checkpoint.md`
- `.claude/skills/muaddib/tdd.md`
- `.claude/skills/muaddib/parallel-explore.md`
- `.claude/skills/muaddib/incremental-refactor.md`
- `.claude/skills/muaddib/doc-sync.md`
- `.claude/skills/muaddib/quality-gate.md`

### New Files (Documentation)
- `.claude/checkpoint.md` (template)
- AST-grep pattern documentation (in CLAUDE.md)
- LSP alternatives documentation (in CLAUDE.md)
- Skill composition patterns (in CLAUDE.md)

### Modified Files
- `CLAUDE.md` (add all new sections + skill usage)
- `.claude/settings.json` (add LSP MCP if available)

---

## OmO Parity Assessment (Enhanced)

### After Phase 5 (Enhanced)

| Category | OmO Feature | Claude Code | Parity | Change |
|----------|-------------|-------------|--------|--------|
| Workflow | 4 phases | 4 phases | 100% | - |
| Delegation | 7-section template | 7-section + skills | 100% | - |
| Error Recovery | 3-strikes | 3-strikes | 100% | - |
| Hooks | 31 events | 8 events + skill hooks | ~35% | +5% |
| Permissions | Pattern matching | Wildcards | 95% | - |
| LSP | 11 operations | CLI/MCP + skill | ~55% | +5% |
| AST | ast-grep | ast-grep CLI + skill | 100% | - |
| Context | DCP algorithm | Manual + skills + forked | ~50% | +10% |
| Parallelism | Multi-provider | Single + forked skills | 40% | +10% |
| **Automation** | Built-in patterns | **Skill-based patterns** | **85%** | **+35%** |

**Overall Estimated Parity**: 80-85% (up from 75-80%)

---

## Quick Reference

### Skill Context Strategy

| Skill | Context | Rationale |
|-------|---------|-----------|
| orchestrate | main | Needs full session access |
| explore | **fork** | Isolate exploration results |
| validate | main | Needs to check main session state |
| lsp | **fork** | Semantic ops don't need main context |
| refactor | **fork** | Isolate refactoring changes |
| checkpoint | main | Needs to capture main session |
| tdd | **fork** | Isolate test-driven workflow |
| parallel-explore | **fork** | Multiple isolated explorations |
| incremental-refactor | **fork** | Isolate per-file refactoring |
| doc-sync | main | Needs to sync with main work |
| quality-gate | main | Needs to verify main session |

### Forked Context Benefits

1. **Context Isolation**: Exploration doesn't pollute main session
2. **Clean Summaries**: Only essential info returns to main
3. **Parallel Safety**: Multiple forked skills can run safely
4. **Hot Reload**: Changes take effect immediately

---

*Phase 5 Enhanced Implementation Guide*
*Revised: 2026-01-08 for Claude Code 2.1*
*Estimated completion: 10-12 hours*
*Target: 80-85% OmO Parity*
