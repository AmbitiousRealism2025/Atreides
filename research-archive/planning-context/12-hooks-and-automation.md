# OmO Hooks and Automation System

## Executive Summary

Oh My OpenCode (OmO) features a sophisticated automation architecture, extending the basic Claude Code hook system into a comprehensive lifecycle management framework with **31+ total hook events**.

---

## 1. Hook Types

### By Intervention Point

| Type | Description | Example |
|------|-------------|---------|
| **Pre-execution** | Intercept before action | `PreToolUse` - block/modify inputs |
| **Post-execution** | Fire after completion | `PostToolUse` - format outputs |
| **Session Lifecycle** | Manage session start/end | `SessionStart`, `SessionEnd`, `Stop` |
| **Management/Error** | State preservation, error handling | `PreCompact`, `session-recovery` |

---

## 2. Trigger Events

### Claude Code Compatible (8 Events)

| Event | Description |
|-------|-------------|
| `PreToolUse` | Before tool execution |
| `PostToolUse` | After tool execution |
| `UserPromptSubmit` | User sends message |
| `Stop` | Session goes idle |
| `SubagentStop` | Subagent completes |
| `SessionStart` | Session begins |
| `SessionEnd` | Session terminates |
| `PreCompact` | Before context compaction |
| `PermissionRequest` | Tool needs permission |

### OmO Native Events (32+ Total)

| OmO Event | Claude Code Mapping |
|-----------|-------------------|
| `tool.execute.before` | PreToolUse |
| `tool.execute.after` | PostToolUse |
| `session.idle` | Stop |
| `user.prompt` | UserPromptSubmit |
| `experimental.session.compacting` | Before summary generation |
| `tool.output.truncator` | Output size management |

---

## 3. Hook Configuration

### Configuration Files (Priority Order)

```
1. ./.claude/settings.local.json  (Git-ignored, highest priority)
2. ./.claude/settings.json        (Project-level)
3. ~/.claude/settings.json        (User-level, lowest priority)
```

### Configuration Format

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "eslint --fix $FILE"
          }
        ]
      }
    ]
  }
}
```

### Configuration Elements

| Element | Purpose |
|---------|---------|
| `matcher` | Regex to match tool names |
| `hooks` | Array of actions to execute |
| `type` | Action type (command, etc.) |
| `command` | Shell command to run |
| `$FILE` | Variable for current file |

### Disabling Hooks

```json
{
  "disabled_hooks": [
    "comment-checker",
    "verbose-output-truncator"
  ]
}
```

---

## 4. Built-in Hooks (25+)

### Workflow Hooks

| Hook | Purpose |
|------|---------|
| `todo-continuation-enforcer` | Force task completion |
| `ralph-loop` | Iterative development |

### Context Management Hooks

| Hook | Purpose |
|------|---------|
| `context-window-monitor` | Track token usage |
| `preemptive-compaction` | Trigger early compaction |
| `DCP` | Dynamic Context Pruning |

### Quality & Rules Hooks

| Hook | Purpose |
|------|---------|
| `comment-checker` | Validate comment necessity |
| `rules-injector` | Inject project rules |
| `thinking-block-validator` | Ensure reasoning format |

### Detection & Recovery Hooks

| Hook | Purpose |
|------|---------|
| `empty-task-response-detector` | Catch empty responses |
| `anthropic-context-window-limit-recovery` | Handle context overflow |
| `session-recovery` | Recover from crashes |

### Notification Hooks

| Hook | Purpose |
|------|---------|
| `session-notification` | Session status alerts |
| `background-notification` | Background task alerts |

### Output Management Hooks

| Hook | Purpose |
|------|---------|
| `grep-output-truncator` | Limit grep results |
| `tool-output-truncator` | General output limiting |

---

## 5. Custom Hook Creation

### Implementation Structure

```typescript
// src/hooks/my-custom-hook.ts
import { Hook, PluginInput } from '../types';

export const myCustomHook: Hook = {
  event: 'PostToolUse',

  execute: async (context: PluginInput) => {
    // Hook logic here

    return {
      additionalContext: 'Injected message to LLM'
    };
  }
};
```

### Hook Interface

| Property | Type | Purpose |
|----------|------|---------|
| `event` | string | Target event |
| `execute` | function | Hook logic |
| `matcher` | regex (optional) | Tool name filter |

### Registration

```typescript
// src/index.ts
import { myCustomHook } from './hooks/my-custom-hook';

export const hooks = [
  myCustomHook,
  // ... other hooks
];
```

---

## 6. Hook Execution Order

### Lifecycle Sequence

```
1. INITIALIZATION
   └── Plugin and hook registration

2. STARTUP
   └── SessionStart hooks fire

3. TOOL LIFECYCLE
   ├── a. PreToolUse (can block)
   ├── b. Tool execution
   └── c. PostToolUse (can modify)

4. IDLE
   └── Stop hooks fire

5. MAINTENANCE
   ├── PreCompact
   └── experimental.session.compacting
```

### PreToolUse Behavior
- Can **block** tool execution
- Can **modify** tool arguments
- Runs before any tool action

### PostToolUse Behavior
- Can **modify** tool output
- Can **add context** to result
- Runs after tool completes

---

## 7. Hook Communication with Main Process

### Context Object
- Passed to every hook
- Contains current session state
- Allows reading/modifying state

### Communication Methods

| Method | Description |
|--------|-------------|
| `additionalContext` | Inject string into LLM conversation |
| Argument modification | Modify tool inputs (PreToolUse) |
| Shell execution | Run external commands |
| `$FILE` variable | Pass file path to scripts |

### Return Values

```typescript
// Inject context into conversation
return {
  additionalContext: 'Message injected to LLM'
};

// Block execution (PreToolUse only)
return {
  block: true,
  reason: 'Operation not allowed'
};
```

---

## 8. Automation Patterns

### Ralph Loop (Iterative Development)

```
┌──────────────┐
│ Start Task   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Execute Work │◄───────────────┐
└──────┬───────┘                │
       │                        │
       ▼                        │
┌──────────────┐                │
│ Check for    │                │
│ DONE marker  │                │
└──────┬───────┘                │
       │                        │
   ┌───┴───┐                    │
   │       │                    │
   ▼       ▼                    │
 FOUND   NOT FOUND ─────────────┘
   │
   ▼
┌──────────────┐
│   Complete   │
└──────────────┘
```

### Bouldering Mode (Todo Enforcer)

- Prevents "halfway quitting"
- Forces agent to stay active
- Until every TODO verified complete

```
Agent wants to stop
        │
        ▼
Check TODO list
        │
   ┌────┴────┐
   │         │
   ▼         ▼
All done   Pending items
   │         │
   ▼         ▼
 STOP     CONTINUE
          (forced)
```

### 3-Strikes Recovery Pattern

```
Failure Count: 0 → 1 → 2 → 3
                          │
                          ▼
              ┌───────────────────┐
              │ STOP-REVERT-      │
              │ DOCUMENT-CONSULT  │
              └───────────────────┘
```

### Multi-Stage Context Recovery

```
Context > 85%
      │
      ▼
Stage 1: DCP Pruning
      │
      ▼ (if insufficient)
Stage 2: Aggressive Truncation
      │
      ▼ (if insufficient)
Stage 3: Summarization
      │
      ▼ (if insufficient)
Stage 4: Forced Compaction
```

---

## Mapping to Claude Code

### Hook Event Mapping

| OmO Event | Claude Code Equivalent |
|-----------|----------------------|
| PreToolUse | PreToolUse ✓ |
| PostToolUse | PostToolUse ✓ |
| UserPromptSubmit | UserPromptSubmit ✓ |
| Stop | Stop ✓ |
| SessionStart | Limited support |
| SessionEnd | Limited support |
| PreCompact | Not available |

### Available in Claude Code (8 Events)
- PreToolUse ✓
- PostToolUse ✓
- UserPromptSubmit ✓
- Stop ✓
- SubagentStop ✓
- Notification hooks (limited)

### Not Available in Claude Code
- 23+ OmO-specific events
- context-window-monitor
- preemptive-compaction
- DCP algorithm

### Implementation Strategy

**What can be implemented:**
```json
// .claude/settings.json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "eslint --fix $FILE"
      }]
    }]
  }
}
```

**What needs CLAUDE.md rules:**
- Todo continuation enforcement
- 3-strikes recovery protocol
- Context management strategies

---

## Analogy

Think of OmO's hook system like a **highly advanced assembly line**:

| Component | Assembly Line Equivalent |
|-----------|-------------------------|
| Standard hooks | Basic conveyor belt |
| PreToolUse | Quality inspectors at each station |
| 3-Strikes Recovery | Automated repair bots |
| DCP/PreCompact | Logistics managers compressing packaging |
| Todo Enforcer | Final QA checkpoint |

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
