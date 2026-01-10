# Muad'Dib - OmO-Style Orchestration for Claude Code

## Project Overview

**Project**: muaddib-claude NPM package
**Phase**: Implementation (Coding)
**Goal**: Create distributable NPM package implementing OmO orchestration for Claude Code

---

## Directory Structure

```
OmO-conversion-research/
├── CLAUDE.md                    # This file - project orchestration
├── MASTER-PLAN.md              # Complete 6-phase implementation plan
├── progress.md                 # Progress tracking (UPDATE AFTER EACH PHASE)
├── muaddib-claude/             # NPM PACKAGE (coding target)
│   ├── bin/                    # CLI entry point
│   ├── src/
│   │   ├── cli/                # CLI commands
│   │   ├── lib/                # Core library
│   │   └── utils/              # Utilities
│   ├── templates/              # Handlebars templates
│   ├── scripts/                # Helper shell scripts
│   └── lib/                    # Static content
│       ├── core/               # Documentation files
│       └── skills/muaddib/     # Skill definition
├── implementation-phase-0/     # Phase 0 tasks & context
├── implementation-phase-1/     # Phase 1 tasks & context
├── implementation-phase-2/     # Phase 2 tasks & context
├── implementation-phase-3/     # Phase 3 tasks & context
├── implementation-phase-4/     # Phase 4 tasks & context
├── implementation-phase-5/     # Phase 5 tasks & context
└── research-archive/           # Original research (reference only)
```

---

## Orchestration Rules

### Task Management

1. **Use TodoWrite for any task with 3+ steps**
2. **Mark todos complete only when fully verified**
3. **Never stop with incomplete todos**
4. **Break complex work into atomic tasks**

### Implementation Workflow

For each phase:
1. **Read phase README.md** for task list
2. **Load context files** as needed via LOAD_CONTEXT markers
3. **Implement tasks** in order, respecting dependencies
4. **Validate** using phase validation checklist
5. **Update progress.md** with completion status
6. **Move to next phase** when exit criteria met

### Progress Tracking (MANDATORY)

**At the end of EVERY phase, you MUST update `progress.md`:**

1. Update the phase status in the Project Status table
2. Mark task groups as complete with completion counts
3. Check off exit criteria that were met
4. Add notes about any issues or decisions
5. Update the progress bars in Overall Progress section
6. Add an entry to the Change Log

**This is non-negotiable.** The progress.md file is the source of truth for project status.

### Agent Delegation

| Task Type | subagent_type | model |
|-----------|---------------|-------|
| Codebase exploration | `Explore` | sonnet |
| Research/documentation | `general-purpose` | sonnet |
| Architecture decisions | `Plan` | opus |
| Implementation | (direct) | - |

---

## Current Phase: RC Release Ready

All 6 phases (0-5) complete + Polish phase applied. **188 tests passing** across 5 test files. Package is ready for release.

### Phase 0 Status: COMPLETE (2026-01-08)

All Phase 0 exit criteria met:
- [x] `npm install -g muaddib-claude` works
- [x] `muaddib init` scaffolds project correctly
- [x] Templates generate valid files
- [x] All CLI commands functional

### Phase 1 Status: COMPLETE (2026-01-08)

All Phase 1 exit criteria met:
- [x] CLAUDE.md loads correctly at session start
- [x] TodoWrite used for 3+ step tasks (documented)
- [x] 3-strikes protocol documented with flow diagram
- [x] Basic Task delegation works with examples

Enhanced templates: orchestration-rules, agent-definitions, quality-standards, workflow-phases, CLAUDE.md, settings.json

### Phase 2 Status: COMPLETE (2026-01-08)

All Phase 2 exit criteria met:
- [x] Intent classification occurs before task start
- [x] 7-section delegation template in use
- [x] Cost-aware model selection
- [x] Basic quality hooks running

New templates: intent-classification.hbs, maturity-assessment.hbs

### Phase 3 Status: COMPLETE (2026-01-09)

All Phase 3 exit criteria met:
- [x] All 4 workflow phases operational
- [x] Parallel exploration agents working
- [x] Completion checking prevents early stops
- [x] Session state persists appropriately

New templates: exploration-patterns, completion-checking, session-continuity, context-management

### Phase 4 Status: COMPLETE (2026-01-08)

All Phase 4 exit criteria met:
- [x] All 5 supported hook types configured (PreToolUse, PostToolUse, SessionStart, Stop, PreCompact)
- [x] 3 Muad'Dib skills created (orchestrate, explore, validate)
- [x] Wildcard permissions implemented (Claude Code 2.1 syntax)
- [x] Context injection functional

New features: Forked context skills, wildcard permissions, skill frontmatter hooks

### Phase 5 Status: COMPLETE (2026-01-08)

All Phase 5 exit criteria met:
- [x] LSP operations available + skill
- [x] AST-grep fully integrated + skill
- [x] Checkpoint system working + skill
- [x] 8 automation skills created and tested
- [x] 80-85% OmO parity achieved

New skills (8): lsp, refactor, checkpoint, tdd, parallel-explore, incremental-refactor, doc-sync, quality-gate

### Test Suite

- **188 tests passing** across 5 test files
- Coverage: CLI commands, template engine, settings merge, file manager, Phase 4/5 features

### Polish Phase: COMPLETE (2026-01-08)

Applied 14 fixes from code reviews:
- [x] Jest watchman fix (`--watchman=false`)
- [x] Documentation URL corrected
- [x] Security: Added `Bash(env *)` to deny list
- [x] Object deduplication in config-merger
- [x] Hook array merging with signature-based deduplication
- [x] Lint errors fixed (unused variables)
- [x] New uninstall command added
- [x] 134 new tests (cli.test.js, file-manager.test.js)

---

## 3-Strikes Error Recovery

After **3 consecutive failures** on same operation:

1. **STOP** - Halt modifications
2. **REVERT** - `git checkout` to working state
3. **DOCUMENT** - Record failure details
4. **ASK** - Request user guidance

---

## Quality Standards

### Code Quality

- **Node.js 18+** with ES modules
- **commander.js** for CLI
- **handlebars** for templates
- **ESLint** for linting
- **Jest** for testing (53 tests passing)

### File Standards

- JavaScript (.js) with JSDoc comments
- JSON for configuration
- Shell scripts (.sh) for hooks
- Markdown for documentation

---

## Quick Reference

### Starting Work

```
1. Read this CLAUDE.md
2. Read implementation-phase-0/README.md
3. Load relevant context files
4. Create TodoWrite for current task group
5. Implement, validate, complete
```

### Package Commands (Target)

```bash
muaddib install     # Install global components
muaddib init        # Initialize in current project
muaddib update      # Update to latest version
muaddib doctor      # Check installation health
muaddib uninstall   # Remove global components
```

### Key Files to Create (Phase 0)

```
muaddib-claude/
├── package.json
├── bin/muaddib.js
├── src/cli/index.js
├── src/cli/install.js
├── src/cli/init.js
├── src/cli/update.js
├── src/cli/doctor.js
├── templates/CLAUDE.md.hbs
├── templates/settings.json.hbs
└── README.md
```

---

*Muad'Dib - OmO-style orchestration for Claude Code*
*Implementation Phase Started: January 2026*
