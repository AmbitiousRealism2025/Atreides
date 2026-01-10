# Phase 4 Base Context (Always Loaded)

## Phase Overview

Phase 4: Enhanced Capabilities focuses on maximizing OmO feature parity through:

1. **Extended Hook Configurations**: All 8 available hook types
2. **Helper Script Ecosystem**: 5 shell scripts for automation
3. **Advanced Permission Patterns**: Comprehensive allow/deny lists
4. **Context Injection Files**: SessionStart and PreCompact content

---

## OmO Feature Parity Target

This phase aims to achieve **70%+ OmO parity** by implementing:

| OmO Feature | Claude Code Implementation |
|-------------|---------------------------|
| 31 hook events | 8 hook events (maximized) |
| Validator scripts | PreToolUse hooks + scripts |
| Error detection | PostToolUse hooks + scripts |
| Session state | SessionStart hook + context.md |
| Context preservation | PreCompact hook + critical-context.md |
| Notifications | Stop hook + notify script |

---

## Available Hook Types

Claude Code supports 8 hook events:

| Hook | Fires When | Use For |
|------|------------|---------|
| **PreToolUse** | Before tool executes | Validation, blocking dangerous ops |
| **PostToolUse** | After tool executes | Formatting, linting, logging |
| **SessionStart** | Session begins | Context injection |
| **Stop** | Claude pauses | Notifications |
| **PreCompact** | Before compaction | Critical context preservation |
| **PostCompact** | After compaction | State recovery |
| **PreSubagent** | Before Task agent | (Limited use) |
| **PostSubagent** | After Task agent | (Limited use) |

---

## Hook Configuration Format

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern",
        "hooks": [
          {
            "type": "command",
            "command": "shell command here"
          }
        ]
      }
    ]
  }
}
```

### Matcher Patterns

| Pattern | Matches |
|---------|---------|
| `"Edit"` | Edit tool only |
| `"Edit\|Write"` | Edit OR Write |
| `"Bash"` | Bash tool only |
| `"*"` | All tools |
| `"Read\|Glob\|Grep"` | Multiple read tools |

---

## Script Integration Points

Scripts are called from hooks:

```
PreToolUse (Bash)
      │
      ▼
scripts/validate-bash-command.sh
      │
      ├── Returns 0: Allow
      └── Returns 1: Block

PreToolUse (Edit|Write)
      │
      ▼
scripts/pre-edit-check.sh
      │
      ├── Returns 0: Allow
      └── Returns 1: Block

PostToolUse (Edit|Write)
      │
      ▼
prettier → eslint → scripts/post-edit-log.sh

PostToolUse (*)
      │
      ▼
scripts/error-detector.sh

Stop
      │
      ▼
scripts/notify-idle.sh
```

---

## Permission Syntax

```json
{
  "permissions": {
    "allow": [
      "Bash(command:pattern)",
      "Read(file-pattern)"
    ],
    "deny": [
      "Bash(dangerous:*)",
      "Write(sensitive-file)"
    ]
  }
}
```

### Pattern Examples

| Permission | Description |
|------------|-------------|
| `"Bash(git:*)"` | Allow all git commands |
| `"Bash(npm run:*)"` | Allow npm run scripts |
| `"Bash(rm -rf /*:*)"` | Deny recursive delete from root |
| `"Read(.env*)"` | Deny reading .env files |
| `"Write(**/secrets/**)"` | Deny writing to secrets directories |

---

## Context File Purposes

### context.md (SessionStart)

**Injected at every session start**
- Project overview
- Current development state
- Key patterns to follow
- Recent decisions
- Active work items

### critical-context.md (PreCompact)

**Injected before context compaction**
- Absolutely critical information
- Current objectives (must not forget)
- Key file paths being modified
- Important decisions
- Recovery instructions

---

## Quality Standards for Phase 4

1. **Scripts must be executable**: `chmod +x` all scripts
2. **Scripts must fail gracefully**: `|| true` for non-critical ops
3. **Permissions must not block legitimate work**: Test thoroughly
4. **Hooks must not break workflow**: Silent failures preferred
5. **Context files must be concise**: Don't inject too much

---

## Integration with Previous Phases

Phase 4 builds on:

- **Phase 1**: Basic settings.json structure
- **Phase 2**: PostToolUse formatting hooks
- **Phase 3**: Session continuity patterns, context management

Extends:
- Hook configuration (8 events vs 1)
- Permission patterns (comprehensive vs minimal)
- Context preservation (file-based vs conversation-only)

---

*Base context for all Phase 4 tasks*
