# Oh My Opencode - Hooks System

## Overview

Oh My Opencode implements a comprehensive hooks system with **25+ built-in lifecycle hooks** that intercept and modify agent behavior at various points in the execution lifecycle. The system is fully compatible with Claude Code's hook format.

## Hook Architecture

### Location
Hooks are implemented in `src/hooks/` directory as factory functions following the `createXXXHook()` naming convention.

### Factory Pattern

```typescript
// Hook factory function signature
function createMyHook(): Hook {
  return {
    name: 'my-hook',
    event: 'PostToolUse',
    execute: async (context) => {
      // Hook logic
    }
  };
}
```

## Supported Hook Events

Oh My Opencode supports four primary lifecycle hook events (Claude Code compatible):

| Event | When It Fires | Can Modify |
|-------|--------------|------------|
| **PreToolUse** | Before tool execution | Block or modify tool input |
| **PostToolUse** | After tool execution | Add warnings or context |
| **UserPromptSubmit** | When user submits prompt | Block or inject messages |
| **Stop** | When session goes idle | Inject follow-up prompts |

## Configuration Locations

Hooks are read from three locations (in priority order):

1. `~/.claude/settings.json` (user-level)
2. `./.claude/settings.json` (project-level)
3. `./.claude/settings.local.json` (local, git-ignored)

## Hook Configuration Format

### Basic Structure

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

### Matcher Patterns

The `matcher` field uses regex-style pattern matching:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "echo 'Running bash'" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [{ "type": "command", "command": "prettier --write $FILE" }]
      }
    ]
  }
}
```

## Built-in Hooks

### Workflow Management

| Hook | Description |
|------|-------------|
| `todo-continuation-enforcer` | Forces agents to complete all TODOs before stopping |
| `ralph-loop` | Self-referential development loop until task completion |

### Context Management

| Hook | Description |
|------|-------------|
| `context-window-monitor` | Tracks token usage and context limits |
| `compaction-context-injector` | Preserves critical context during session compaction |
| `preemptive-compaction` | Triggers compaction before hitting limits |

### Session Operations

| Hook | Description |
|------|-------------|
| `session-recovery` | Handles recovery from errors and crashes |
| `session-notification` | OS notifications when agents go idle |
| `auto-session-resume` | Automatically resumes after recovery |

### Code Quality

| Hook | Description |
|------|-------------|
| `comment-checker` | Validates comment necessity |
| `rules-injector` | Injects project-specific rules |
| `thinking-block-validator` | Validates thinking block format |

### Tool Optimization

| Hook | Description |
|------|-------------|
| `grep-output-truncator` | Truncates large grep outputs |
| `tool-output-truncator` | Aggressively truncates outputs when token limit exceeded |

### Context Injection

| Hook | Description |
|------|-------------|
| `directory-agents-injector` | Injects AGENTS.md content |
| `directory-readme-injector` | Injects README content |

### Error Detection

| Hook | Description |
|------|-------------|
| `empty-task-response-detector` | Catches when Task tool returns nothing |
| `empty-message-sanitizer` | Handles empty response messages |

### Monitoring

| Hook | Description |
|------|-------------|
| `think-mode` | Controls thinking block behavior |
| `anthropic-context-window-limit-recovery` | Multi-stage recovery for context limits |
| `auto-update-checker` | Checks for oh-my-opencode updates |
| `startup-toast` | Toast notifications on startup |
| `keyword-detector` | Detects special keywords in prompts |
| `agent-usage-reminder` | Reminds about agent capabilities |

### Environment

| Hook | Description |
|------|-------------|
| `non-interactive-env` | Handles non-interactive environments |
| `interactive-bash-session` | Manages interactive bash sessions |

### Integration

| Hook | Description |
|------|-------------|
| `claude-code-hooks` | Compatibility layer for Claude Code hooks |
| `background-notification` | Notifies when background tasks complete |

## Disabling Hooks

### Configuration Location
- `~/.config/opencode/oh-my-opencode.json`
- `.opencode/oh-my-opencode.json`

### Syntax

```json
{
  "disabled_hooks": [
    "comment-checker",
    "agent-usage-reminder",
    "auto-update-checker"
  ]
}
```

### Disabling Sub-features

Some hooks have sub-features that can be disabled independently:

```json
{
  "disabled_hooks": [
    "startup-toast"  // Disables only toast, keeps auto-update-checker
  ]
}
```

## Special Hooks

### Ralph Loop

Implements continuous development iteration until task completion.

```json
{
  "ralph_loop": {
    "enabled": true,
    "default_max_iterations": 100
  }
}
```

**Key Features:**
- Self-referential development loop
- Continues until all tasks complete
- Configurable iteration limit
- Completion promise detection

### Todo Continuation Enforcer

Forces agents to complete all TODOs before stopping.

**Features:**
- "Kills the chronic LLM habit of quitting halfway"
- 500ms grace period for countdown cancellation
- Forces "bouldering mode" until completion

### Context Window Limit Recovery

Multi-stage recovery when context limits are exceeded:

```
Stage 1: Attempt context pruning (DCP)
Stage 2: Truncate tool outputs aggressively
Stage 3: Summarize and revert if needed
Stage 4: Force compaction
```

## Creating Custom Hooks

### Basic Hook Structure

```typescript
import { PluginInput } from '@opencode-ai/plugin';

export function createMyCustomHook(): PluginInput {
  return {
    onSessionStart: async (context) => {
      // Run when session starts
    },
    hooks: {
      'tool.execute.before': async (event) => {
        // PreToolUse equivalent
      },
      'tool.execute.after': async (event) => {
        // PostToolUse equivalent
      }
    }
  };
}
```

### OpenCode Native Events

OpenCode provides 32+ native events beyond Claude Code's 4:

```typescript
// Event mappings
'tool.execute.before'  // Claude: PreToolUse
'tool.execute.after'   // Claude: PostToolUse
'session.idle'         // Claude: Stop
'experimental.session.compacting'  // Before compaction
```

### Hook Registration

```typescript
// In src/index.ts
import { createMyCustomHook } from './hooks/my-custom-hook';

export default {
  hooks: [
    createMyCustomHook(),
    // ... other hooks
  ]
};
```

## Claude Code Compatibility

The `claude-code-hooks` hook provides a compatibility layer that:

1. Reads Claude Code's `settings.json` format
2. Maps events to OpenCode equivalents
3. Executes PreToolUse, PostToolUse, UserPromptSubmit, and Stop hooks

### Important Differences

| Aspect | Claude Code | OpenCode |
|--------|-------------|----------|
| Event count | 4 hooks | 32+ events |
| Hook format | JSON in settings | JS/TS modules |
| Execution | Shell commands | Programmatic |

## Hook Execution Order

```
1. Plugin initialization
2. Hook registration
3. Session start hooks
4. For each tool call:
   a. PreToolUse hooks (can block)
   b. Tool execution
   c. PostToolUse hooks (can add context)
5. On idle: Stop hooks
6. On compaction: Compaction hooks
```

## Experimental Hooks

### `experimental.session.compacting`

Fires before the LLM generates a continuation summary:

```typescript
{
  'experimental.session.compacting': async (context) => {
    // Inject domain-specific context
    // that default compaction would miss
    return {
      additionalContext: 'Project uses custom auth...'
    };
  }
}
```

## Sources

- [GitHub - code-yeongyu/oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- [OpenCode Plugins Documentation](https://opencode.ai/docs/plugins/)
- [DeepWiki - Oh My Opencode](https://deepwiki.com/code-yeongyu/oh-my-opencode)
