# Context: Extended Hook Configurations (Tasks 4.1.1 - 4.1.5)

## Task Group Overview

- Task 4.1.1: Expand hooks configuration structure
- Task 4.1.2: Add PreToolUse hooks for Bash and Edit/Write
- Task 4.1.3: Add SessionStart hook for context injection
- Task 4.1.4: Add Stop hook for notifications
- Task 4.1.5: Add PreCompact hook for critical context

---

## Task 4.1.1: Expand Hooks Configuration Structure

### Complete settings.json Template

```json
{
  "hooks": {
    "PreToolUse": [],
    "PostToolUse": [],
    "SessionStart": [],
    "Stop": [],
    "PreCompact": [],
    "PostCompact": [],
    "PreSubagent": [],
    "PostSubagent": []
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

### Hook Structure Pattern

Each hook event contains an array of matchers:

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "ToolPattern|AnotherTool",
        "hooks": [
          {
            "type": "command",
            "command": "command1"
          },
          {
            "type": "command",
            "command": "command2"
          }
        ]
      }
    ]
  }
}
```

---

## Task 4.1.2: Add PreToolUse Hooks

### PreToolUse for Bash Commands

**Purpose**: Validate bash commands before execution

```json
{
  "matcher": "Bash",
  "hooks": [{
    "type": "command",
    "command": "scripts/validate-bash-command.sh \"$COMMAND\""
  }]
}
```

**Variables Available**:
- `$COMMAND`: The bash command being executed

### PreToolUse for Edit/Write

**Purpose**: Validate file edits before execution

```json
{
  "matcher": "Edit|Write",
  "hooks": [{
    "type": "command",
    "command": "scripts/pre-edit-check.sh \"$FILE\""
  }]
}
```

**Variables Available**:
- `$FILE`: The file being edited/written

### Complete PreToolUse Configuration

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "scripts/validate-bash-command.sh \"$COMMAND\""
      }]
    },
    {
      "matcher": "Edit|Write",
      "hooks": [{
        "type": "command",
        "command": "scripts/pre-edit-check.sh \"$FILE\""
      }]
    }
  ]
}
```

---

## Task 4.1.3: Add SessionStart Hook

### Purpose

Inject project context at the start of every session.

### Configuration

```json
{
  "SessionStart": [{
    "hooks": [{
      "type": "command",
      "command": "cat .claude/context.md 2>/dev/null || true"
    }]
  }]
}
```

### Notes

- No matcher needed (fires once at session start)
- Uses `|| true` to prevent failure if file doesn't exist
- Output is injected into Claude's context
- Keep context.md concise to avoid context bloat

### context.md Integration

This hook reads `.claude/context.md`:
- Created in Task 4.4.1
- Contains project overview, current state, patterns
- Updated manually or by session end scripts

---

## Task 4.1.4: Add Stop Hook

### Purpose

Notify user when Claude pauses or stops.

### Configuration

```json
{
  "Stop": [{
    "hooks": [{
      "type": "command",
      "command": "scripts/notify-idle.sh"
    }]
  }]
}
```

### Notes

- Fires when Claude stops responding (waiting for input or done)
- Script handles OS-specific notification
- Useful for long-running tasks

### notify-idle.sh Integration

This hook calls `.claude/scripts/notify-idle.sh`:
- Created in Task 4.2.6
- Sends desktop notification
- Supports macOS (osascript) and Linux (notify-send)

---

## Task 4.1.5: Add PreCompact Hook

### Purpose

Preserve critical context before automatic compaction.

### Configuration

```json
{
  "PreCompact": [{
    "hooks": [{
      "type": "command",
      "command": "cat .claude/critical-context.md 2>/dev/null || true"
    }]
  }]
}
```

### Notes

- Fires before Claude compacts context (~95% full)
- Critical for preserving important information
- Content is injected into compacted context
- Keep critical-context.md very concise

### critical-context.md Integration

This hook reads `.claude/critical-context.md`:
- Created in Task 4.4.2
- Contains ONLY must-not-forget information
- Should be updated during work, before compaction

### Critical Context vs Regular Context

| File | When Injected | Size | Content |
|------|---------------|------|---------|
| context.md | SessionStart | Medium | Project overview, patterns |
| critical-context.md | PreCompact | Small | Current objective, key decisions |

---

## Complete PostToolUse Configuration (Reference)

From Phase 2 + extensions:

```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "prettier --write \"$FILE\" 2>/dev/null || true"
        },
        {
          "type": "command",
          "command": "eslint --fix \"$FILE\" 2>/dev/null || true"
        },
        {
          "type": "command",
          "command": "scripts/post-edit-log.sh \"$FILE\""
        }
      ]
    },
    {
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "scripts/error-detector.sh \"$TOOL_OUTPUT\" 2>/dev/null || true"
      }]
    }
  ]
}
```

---

## Full settings.json (Complete)

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{
          "type": "command",
          "command": "scripts/validate-bash-command.sh \"$COMMAND\""
        }]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [{
          "type": "command",
          "command": "scripts/pre-edit-check.sh \"$FILE\""
        }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {"type": "command", "command": "prettier --write \"$FILE\" 2>/dev/null || true"},
          {"type": "command", "command": "eslint --fix \"$FILE\" 2>/dev/null || true"},
          {"type": "command", "command": "scripts/post-edit-log.sh \"$FILE\""}
        ]
      },
      {
        "matcher": "*",
        "hooks": [{
          "type": "command",
          "command": "scripts/error-detector.sh \"$TOOL_OUTPUT\" 2>/dev/null || true"
        }]
      }
    ],
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "cat .claude/context.md 2>/dev/null || true"
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "scripts/notify-idle.sh"
      }]
    }],
    "PreCompact": [{
      "hooks": [{
        "type": "command",
        "command": "cat .claude/critical-context.md 2>/dev/null || true"
      }]
    }]
  },
  "permissions": {
    "allow": [],
    "deny": []
  }
}
```

---

## Acceptance Criteria

### Task 4.1.1
- [ ] All 8 hook event types in settings.json structure
- [ ] Valid JSON format

### Task 4.1.2
- [ ] PreToolUse hook for Bash configured
- [ ] PreToolUse hook for Edit|Write configured
- [ ] Script paths match Task 4.2.x deliverables

### Task 4.1.3
- [ ] SessionStart hook configured
- [ ] Points to context.md file
- [ ] Graceful failure if file missing

### Task 4.1.4
- [ ] Stop hook configured
- [ ] Points to notify-idle.sh script

### Task 4.1.5
- [ ] PreCompact hook configured
- [ ] Points to critical-context.md file
- [ ] Graceful failure if file missing

---

*Context for Tasks 4.1.1 - 4.1.5*
