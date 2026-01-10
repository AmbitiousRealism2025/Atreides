# Phase 4: Enhanced Capabilities (REVISED for Claude Code 2.1)

**Priority**: P3 Nice-to-Have → **P2 High Value** (upgraded)
**Estimated Effort**: 5-6 hours → **7-8 hours** (expanded scope)
**Dependencies**: Phase 3 complete
**Claude Code Version**: 2.1.0+ (leverages new features)

## Overview

Phase 4 now **maximizes Claude Code 2.1 capabilities** with:

1. **Extended Hook Configurations** - All 8 hook types + skill frontmatter hooks
2. **Muad'Dib Skill Package** - NEW: Packaged skill with forked context
3. **Advanced Permission Patterns** - Wildcard permissions (new 2.1 feature)
4. **Helper Script Ecosystem** - 5 shell scripts for automation
5. **Context Injection Files** - SessionStart and PreCompact content

**Exit Criteria**: 75%+ OmO parity achieved (up from 70%) with operational hook ecosystem, skill package, and helper scripts.

---

## What's New in This Revision

| Original Plan | Enhanced Plan | Source |
|---------------|---------------|--------|
| Basic hook configuration | + Skill frontmatter hooks | Claude Code 2.1 |
| Pattern-based permissions | Wildcard permissions (`Bash(npm *)`) | Claude Code 2.1 |
| Global settings only | + Muad'Dib skill with `context: fork` | Claude Code 2.1 |
| No skill package | Distributable skill directory | Claude Code 2.1 |
| 70% parity target | 75% parity target | Enhanced scope |

---

## Task Groups

### Group 1: Extended Hook Configurations (Tasks 4.1.1 - 4.1.6)

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 4.1.1 | Expand hooks configuration structure | 30 min | |
| 4.1.2 | Add PreToolUse hooks for Bash and Edit/Write | 20 min | |
| 4.1.3 | Add SessionStart hook for context injection | 10 min | |
| 4.1.4 | Add Stop hook for notifications | 10 min | |
| 4.1.5 | Add PreCompact hook for critical context | 10 min | |
| **4.1.6** | **Document skill frontmatter hook patterns** | **20 min** | **NEW** |

**Dependencies**: Phase 3 complete
**Deliverables**:
- Complete settings.json with all 8 hook types
- Skill frontmatter hook documentation

---

### Group 2: Muad'Dib Skill Package (Tasks 4.2.1 - 4.2.5) **NEW GROUP**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| **4.2.1** | **Create skill directory structure** | **15 min** | **NEW** |
| **4.2.2** | **Create muaddib-orchestrate skill** | **30 min** | **NEW** |
| **4.2.3** | **Create muaddib-explore skill with forked context** | **25 min** | **NEW** |
| **4.2.4** | **Create muaddib-validate skill** | **20 min** | **NEW** |
| **4.2.5** | **Add skill frontmatter hooks** | **20 min** | **NEW** |

**Dependencies**: 4.1.x
**Deliverables**: `.claude/skills/muaddib/` with 3 skills

#### Skill Structure

```
.claude/skills/muaddib/
├── orchestrate.md           # Main orchestration skill
├── explore.md               # Forked context exploration
└── validate.md              # Pre-completion validation
```

#### Sample Skill: muaddib-explore.md

```yaml
---
name: muaddib-explore
description: Isolated codebase exploration that doesn't pollute main context
context: fork                    # NEW: Forked context
agent: Explore
model: sonnet
allowed-tools:
  - Read
  - Glob
  - Grep
  - Task
hooks:
  Stop:
    - type: command
      command: echo "Exploration complete - returning summary only"
---

# Muad'Dib Exploration Skill

You are an exploration specialist. Your findings will be summarized
and returned to the main session without polluting its context.

## Your Task
1. Thoroughly explore the codebase for the requested information
2. Identify patterns, structures, and relevant files
3. Create a CONCISE summary of findings
4. Return only the essential information

## Output Format
Provide a structured summary:
- Key files found
- Patterns identified
- Recommendations
```

---

### Group 3: Helper Script Ecosystem (Tasks 4.3.1 - 4.3.7)

*Renumbered from original 4.2.x*

| Task ID | Task | Effort |
|---------|------|--------|
| 4.3.1 | Create .claude/scripts/ directory | 5 min |
| 4.3.2 | Create validate-bash-command.sh | 20 min |
| 4.3.3 | Create pre-edit-check.sh | 15 min |
| 4.3.4 | Create post-edit-log.sh | 10 min |
| 4.3.5 | Create error-detector.sh | 15 min |
| 4.3.6 | Create notify-idle.sh | 15 min |
| 4.3.7 | Make all scripts executable | 5 min |

**Dependencies**: 4.1.x (hooks reference these scripts)
**Deliverables**: 5 working shell scripts in .claude/scripts/

---

### Group 4: Advanced Permission Patterns (Tasks 4.4.1 - 4.4.3) **ENHANCED**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 4.4.1 | Create comprehensive allow list with **wildcards** | 25 min | **ENHANCED** |
| 4.4.2 | Create comprehensive deny list with **wildcards** | 20 min | **ENHANCED** |
| **4.4.3** | **Document wildcard permission patterns** | **15 min** | **NEW** |

**Dependencies**: Phase 3 complete
**Deliverables**: Refined permissions with comprehensive wildcard patterns

#### New Wildcard Patterns (Claude Code 2.1)

**Before (2.0 style):**
```json
{
  "allow": [
    "Bash(npm:*)",
    "Bash(npm run:*)",
    "Bash(npm test:*)",
    "Bash(npm install:*)"
  ]
}
```

**After (2.1 wildcards):**
```json
{
  "allow": [
    "Bash(npm *)",           // All npm commands
    "Bash(git *)",           // All git commands
    "Bash(cargo *)",         // All cargo commands
    "Bash(*--help)",         // Any help command
    "Bash(*--version)",      // Any version check
    "Bash(go *)"             // All go commands
  ],
  "deny": [
    "Bash(rm -rf *)",        // Block recursive delete
    "Bash(sudo *)",          // Block privilege escalation
    "Bash(curl * | sh)",     // Block pipe to shell
    "Bash(wget * | sh)"      // Block pipe to shell
  ]
}
```

---

### Group 5: Context Injection Files (Tasks 4.5.1 - 4.5.2)

*Renumbered from original 4.4.x*

| Task ID | Task | Effort |
|---------|------|--------|
| 4.5.1 | Create context.md template | 15 min |
| 4.5.2 | Create critical-context.md template | 15 min |

**Dependencies**: 4.1.3, 4.1.5 (hooks inject these files)
**Deliverables**: context.md and critical-context.md templates

---

### Group 6: Testing and Validation (Tasks 4.6.1 - 4.6.6) **EXPANDED**

| Task ID | Task | Effort | NEW |
|---------|------|--------|-----|
| 4.6.1 | Test all hooks fire correctly | 30 min | |
| 4.6.2 | Test script execution | 20 min | |
| 4.6.3 | Test permission enforcement | 20 min | |
| 4.6.4 | Test context injection | 15 min | |
| **4.6.5** | **Test skill hot reload** | **15 min** | **NEW** |
| **4.6.6** | **Test forked context isolation** | **20 min** | **NEW** |

**Dependencies**: All previous tasks
**Deliverables**: Validation report with all tests passing

---

## Dependencies Graph

```
Phase 3 Complete
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    PHASE 4 (ENHANCED)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────────┐  │
│  │ Group 1     │   │ Group 4     │   │ Group 5           │  │
│  │ Hooks       │   │ Permissions │   │ Context Files     │  │
│  │ 4.1.1-4.1.6 │   │ 4.4.1-4.4.3 │   │ 4.5.1-4.5.2       │  │
│  └──────┬──────┘   └─────────────┘   └─────────┬─────────┘  │
│         │                                       │            │
│         ▼                                       │            │
│  ┌─────────────┐   ┌─────────────┐              │            │
│  │ Group 2     │   │ Group 3     │◄─────────────┘            │
│  │ Skills      │   │ Scripts     │                          │
│  │ 4.2.1-4.2.5 │   │ 4.3.1-4.3.7 │                          │
│  │ ★ NEW ★     │   └──────┬──────┘                          │
│  └──────┬──────┘          │                                 │
│         │                 │                                 │
│         └────────┬────────┘                                 │
│                  │                                          │
│                  ▼                                          │
│         ┌─────────────────┐                                 │
│         │ Group 6         │                                 │
│         │ Validation      │                                 │
│         │ 4.6.1-4.6.6     │                                 │
│         └─────────────────┘                                 │
└──────────────────────────────────────────────────────────────┘
       │
       ▼
 Phase 5: Difficult Adaptations (ENHANCED)
```

---

## Validation Checklist (Enhanced)

### Original Criteria
- [ ] All 8 hook types configured appropriately
- [ ] Helper scripts execute without errors
- [ ] Permissions block dangerous operations
- [ ] Permissions allow safe operations
- [ ] Context injected at session start
- [ ] Critical context preserved during compaction
- [ ] Notifications fire on session stop
- [ ] Edit logging tracks changes

### New Criteria (Claude Code 2.1)
- [ ] **Muad'Dib skills load correctly**
- [ ] **Skill hot reload works** (modify skill, immediately available)
- [ ] **Forked context isolation works** (explore skill doesn't pollute main)
- [ ] **Wildcard permissions function correctly**
- [ ] **Skill frontmatter hooks fire**

---

## Files to Create/Modify

### New Files (Original)
- `.claude/scripts/validate-bash-command.sh`
- `.claude/scripts/pre-edit-check.sh`
- `.claude/scripts/post-edit-log.sh`
- `.claude/scripts/error-detector.sh`
- `.claude/scripts/notify-idle.sh`
- `.claude/context.md`
- `.claude/critical-context.md`

### New Files (Enhanced - Claude Code 2.1)
- **`.claude/skills/muaddib/orchestrate.md`** - Main orchestration skill
- **`.claude/skills/muaddib/explore.md`** - Forked exploration skill
- **`.claude/skills/muaddib/validate.md`** - Validation skill

### Modified Files
- `.claude/settings.json` (expanded hooks, wildcard permissions)
- `CLAUDE.md` (skill frontmatter documentation)

---

## Quick Reference

### Hook Event Coverage (Enhanced)

| Hook Event | Purpose | Implementation |
|------------|---------|----------------|
| PreToolUse (Bash) | Validate commands | settings.json + script |
| PreToolUse (Edit/Write) | Validate file edits | settings.json + script |
| PostToolUse (Edit/Write) | Format + lint + log | settings.json |
| PostToolUse (*) | Error detection | settings.json + script |
| SessionStart | Context injection | settings.json |
| Stop | Notifications | settings.json + script |
| PreCompact | Critical context | settings.json |
| **Skill hooks** | Per-skill automation | **skill frontmatter** |

### Skill Capabilities (NEW)

| Skill | Context | Purpose |
|-------|---------|---------|
| muaddib-orchestrate | main | Workflow coordination |
| muaddib-explore | **forked** | Isolated codebase exploration |
| muaddib-validate | main | Pre-completion checks |

---

## Estimated Parity After Phase 4

| Category | Before | After Phase 4 (Enhanced) |
|----------|--------|--------------------------|
| Hooks | 25% | 35% (+skill hooks) |
| Context Isolation | 60% | 85% (forked context) |
| Permissions | 80% | 95% (wildcards) |
| Automation | 50% | 70% (skills) |
| **Overall** | **~68%** | **~75%** |

---

*Phase 4 Enhanced Implementation Guide*
*Revised: 2026-01-08 for Claude Code 2.1*
*Estimated completion: 7-8 hours*
