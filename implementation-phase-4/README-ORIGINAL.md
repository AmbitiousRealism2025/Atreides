# Phase 4: Enhanced Capabilities

**Priority**: P3 Nice-to-Have
**Estimated Effort**: 5-6 hours
**Dependencies**: Phase 3 complete

## Overview

Phase 4 maximizes OmO feature parity by implementing extended hooks, helper scripts, advanced permissions, and context injection files.

**Exit Criteria**: 70%+ OmO parity achieved with operational hook ecosystem and helper scripts.

---

## Task Groups

### Group 1: Extended Hook Configurations (Tasks 4.1.1 - 4.1.5)

<!-- LOAD_CONTEXT: context/01-extended-hooks.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 4.1.1 | Expand hooks configuration structure | 30 min |
| 4.1.2 | Add PreToolUse hooks for Bash and Edit/Write | 20 min |
| 4.1.3 | Add SessionStart hook for context injection | 10 min |
| 4.1.4 | Add Stop hook for notifications | 10 min |
| 4.1.5 | Add PreCompact hook for critical context | 10 min |

**Dependencies**: Phase 3 complete
**Deliverables**: Complete settings.json with all 8 hook types configured

---

### Group 2: Helper Script Ecosystem (Tasks 4.2.1 - 4.2.7)

<!-- LOAD_CONTEXT: context/02-helper-scripts.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 4.2.1 | Create .claude/scripts/ directory | 5 min |
| 4.2.2 | Create validate-bash-command.sh | 20 min |
| 4.2.3 | Create pre-edit-check.sh | 15 min |
| 4.2.4 | Create post-edit-log.sh | 10 min |
| 4.2.5 | Create error-detector.sh | 15 min |
| 4.2.6 | Create notify-idle.sh | 15 min |
| 4.2.7 | Make all scripts executable | 5 min |

**Dependencies**: 4.1.x (hooks reference these scripts)
**Deliverables**: 5 working shell scripts in .claude/scripts/

---

### Group 3: Advanced Permission Patterns (Tasks 4.3.1 - 4.3.2)

<!-- LOAD_CONTEXT: context/03-permission-patterns.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 4.3.1 | Create comprehensive allow list | 20 min |
| 4.3.2 | Create comprehensive deny list | 15 min |

**Dependencies**: Phase 3 complete
**Deliverables**: Refined permissions with comprehensive allow/deny patterns

---

### Group 4: Context Injection Files (Tasks 4.4.1 - 4.4.2)

<!-- LOAD_CONTEXT: context/04-context-files.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 4.4.1 | Create context.md template | 15 min |
| 4.4.2 | Create critical-context.md template | 15 min |

**Dependencies**: 4.1.3, 4.1.5 (hooks inject these files)
**Deliverables**: context.md and critical-context.md templates

---

### Group 5: Testing and Validation (Tasks 4.5.1 - 4.5.4)

<!-- LOAD_CONTEXT: context/05-validation.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 4.5.1 | Test all hooks fire correctly | 30 min |
| 4.5.2 | Test script execution | 20 min |
| 4.5.3 | Test permission enforcement | 20 min |
| 4.5.4 | Test context injection | 15 min |

**Dependencies**: All previous tasks
**Deliverables**: Validation report with all tests passing

---

## Dependencies Graph

```
Phase 3 Complete
       │
       ▼
┌──────────────────────────────────────────────────────┐
│                    PHASE 4                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────┐  │
│  │ Group 1     │   │ Group 3     │   │ Group 4   │  │
│  │ Hooks       │   │ Permissions │   │ Context   │  │
│  │ 4.1.1-4.1.5 │   │ 4.3.1-4.3.2 │   │ 4.4.1-4.4.2 │  │
│  └──────┬──────┘   └─────────────┘   └─────┬─────┘  │
│         │                                   │        │
│         ▼                                   │        │
│  ┌─────────────┐                           │        │
│  │ Group 2     │◄──────────────────────────┘        │
│  │ Scripts     │                                    │
│  │ 4.2.1-4.2.7 │                                    │
│  └──────┬──────┘                                    │
│         │                                           │
│         ▼                                           │
│  ┌─────────────┐                                    │
│  │ Group 5     │                                    │
│  │ Validation  │                                    │
│  │ 4.5.1-4.5.4 │                                    │
│  └─────────────┘                                    │
└──────────────────────────────────────────────────────┘
       │
       ▼
 Phase 5: Difficult Adaptations
```

---

## Validation Checklist

- [ ] All 8 hook types configured appropriately
- [ ] Helper scripts execute without errors
- [ ] Permissions block dangerous operations
- [ ] Permissions allow safe operations
- [ ] Context injected at session start
- [ ] Critical context preserved during compaction
- [ ] Notifications fire on session stop
- [ ] Edit logging tracks changes

---

## Files to Create/Modify

### New Files
- `.claude/scripts/validate-bash-command.sh`
- `.claude/scripts/pre-edit-check.sh`
- `.claude/scripts/post-edit-log.sh`
- `.claude/scripts/error-detector.sh`
- `.claude/scripts/notify-idle.sh`
- `.claude/context.md`
- `.claude/critical-context.md`

### Modified Files
- `.claude/settings.json` (expanded hooks and permissions)

---

## Quick Reference

### Hook Event Coverage

| Hook Event | Purpose | Script/Action |
|------------|---------|---------------|
| PreToolUse (Bash) | Validate commands | validate-bash-command.sh |
| PreToolUse (Edit/Write) | Validate file edits | pre-edit-check.sh |
| PostToolUse (Edit/Write) | Format + lint + log | prettier, eslint, post-edit-log.sh |
| PostToolUse (*) | Error detection | error-detector.sh |
| SessionStart | Context injection | cat context.md |
| Stop | Notifications | notify-idle.sh |
| PreCompact | Critical context | cat critical-context.md |

---

*Phase 4 Implementation Guide*
*Estimated completion: 5-6 hours*
