# Muad'Dib Context Management

## Overview

Context management prevents information loss during long tasks and context compaction.

---

## Why Context Management Matters

Without proactive management:
- Important information gets lost during compaction
- Long tasks lose track of objectives
- Session continuity breaks down

---

## Proactive Context Preservation

### Strategy 1: Summarize Early

Don't wait for context pressure. Summarize proactively.

**After Exploration**:
```markdown
## Exploration Summary
- Found auth code in: src/auth/
- Key files: login.ts, session.ts
- Pattern: JWT with refresh tokens
```

**After Implementation**:
```markdown
## Implementation Summary
- Added validation to src/api/users.ts
- All tests passing
```

### Strategy 2: File-Based Memory

Store important information in project files, not conversation.

**Memory Hierarchy**:
| Location | Use For | Survives |
|----------|---------|----------|
| Response text | Immediate communication | No |
| TodoWrite | Task tracking | Yes |
| .claude/context.md | Session context | Yes |
| .claude/critical-context.md | Critical info | Compaction |
| CLAUDE.md | Permanent project rules | Always |

### Strategy 3: Structured Responses

Keep responses focused and scannable with clear sections.

---

## Context Pressure Signs

| Sign | Action |
|------|--------|
| Responses truncated | Summarize immediately |
| Losing track of objectives | Write objectives to file |
| Forgetting earlier decisions | Document decisions in file |
| Repeated exploration | Note results in context.md |

---

## Critical Context Preservation

### What MUST Be Preserved

| Item | How to Preserve |
|------|-----------------|
| Current objectives | Write to context.md |
| File paths being modified | Note in responses |
| Key decisions made | Document rationale |
| Error history | Log in context.md |
| User requirements | Reference in todos |

### Preservation Hierarchy

```
CLAUDE.md
└── Permanent project rules (survives everything)

.claude/critical-context.md
└── Injected during PreCompact hook (survives compaction)

.claude/context.md
└── Injected at session start (survives new sessions)

TodoWrite
└── Task tracking (persists across conversation)

Response text
└── Immediate communication (may be compacted)
```

---

## Recovery After Context Loss

1. **Check Files First**: Read CLAUDE.md, context.md, critical-context.md
2. **Check Todos**: What was in progress? What was completed?
3. **Check Git**: git status, git log, git diff
4. **Ask User**: If critical info was lost
5. **Re-establish**: Write recovered context to file

---

*Muad'Dib Context Management v1.0.0*
