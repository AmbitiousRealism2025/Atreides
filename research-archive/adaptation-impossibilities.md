# OmO to Claude Code: Adaptation Impossibilities Analysis

## Executive Summary

This document provides a comprehensive classification of Oh My OpenCode (OmO) features by their adaptability to Claude Code, categorizing them as **IMPOSSIBLE**, **DIFFICULT**, **WORKAROUND**, or **NATIVE**.

**Classification Breakdown:**
- **IMPOSSIBLE (4 features):** Require fundamental architectural changes
- **DIFFICULT (6 features):** Achievable with significant effort/compromise
- **WORKAROUND (4 features):** Achievable with alternative approaches
- **NATIVE (3 features):** Direct equivalents exist

---

## Classification System

| Classification | Definition |
|---------------|------------|
| **IMPOSSIBLE** | No Claude Code equivalent exists; no viable workaround available |
| **DIFFICULT** | Possible but requires significant effort, external tools, or accepts compromises |
| **WORKAROUND** | Achievable through alternative Claude Code approaches |
| **NATIVE** | Direct equivalent or superior implementation exists in Claude Code |

---

## IMPOSSIBLE Features

These features **cannot be replicated** in Claude Code without fundamental architectural changes.

### 1. Dynamic MCP Server Spawning

**OmO Capability:**
```typescript
// SkillMcpManager spawns MCP servers on-demand per skill
class SkillMcpManager {
  async getConnection(skill: Skill): Promise<McpConnection> {
    // Lazy loading - only connects when skill is invoked
    if (!this.connections.has(skill.name)) {
      const connection = await this.createConnection(skill)
      this.connections.set(skill.name, connection)
    }
    return this.connections.get(skill.name)
  }
}
```

**Claude Code Reality:**
- MCP servers must be pre-configured in `settings.json`
- All servers start at session initialization
- Cannot dynamically spawn servers mid-session
- No lazy loading capability

**Impact:** HIGH - Skills that require specialized MCP servers must have those servers always running, increasing resource usage and potential conflicts.

---

### 2. Provider-Tiered Concurrency Control

**OmO Capability:**
```typescript
interface ConcurrencyConfig {
  defaultConcurrency: 5              // Global default
  providerConcurrency: {
    anthropic: 3                     // Per-provider limits
    openai: 5
    google: 10
  }
  modelConcurrency: {
    "claude-opus-4-5": 1             // Per-model limits
    "claude-sonnet-4-5": 3
  }
}
```

**Claude Code Reality:**
- Flat 10-concurrent task limit via Task tool
- No per-provider differentiation
- No per-model rate limiting
- No cost-aware routing

**Impact:** HIGH - Cannot optimize API costs or respect provider-specific rate limits automatically.

---

### 3. DCP (Dynamic Context Pruning) Algorithm Control

**OmO Capability:**
- **70% threshold**: Warning phase with user notification
- **85% threshold**: Preemptive compaction with DCP algorithm
- **Configurable pruning**: Selective removal of duplicate tool calls, old outputs
- **Importance scoring**: Messages scored by recency, tool outputs, code content, references

**Claude Code Reality:**
- Only ~95% auto-compact trigger
- PreCompact hook fires but cannot prevent compaction
- No multi-stage recovery
- No configurable thresholds
- No importance-based pruning

**Impact:** HIGH - Context loss is unpredictable; cannot implement sophisticated context preservation strategies.

---

### 4. Agent Demotion Logic

**OmO Capability:**
```
Sisyphus (Primary Orchestrator)
├── Oracle (GPT-5.2): Architecture decisions
├── Librarian (Sonnet/Gemini): Documentation research
└── Explore (Haiku/Grok): Fast exploration

On failure: Agent automatically demotes to faster/cheaper model
On repeated failure: 3-strikes rule triggers fallback
```

**Claude Code Reality:**
- Single model per session
- Task agents inherit parent model
- No automatic demotion
- No cross-provider fallback

**Impact:** HIGH - Cannot implement sophisticated agent hierarchies or adaptive delegation.

---

## DIFFICULT Features

These features require **significant effort or compromise** to implement.

### 1. Hook Event Coverage Gap (31 vs 8 Events)

**OmO Hooks (31 total):**
```
Session Lifecycle: SessionStart, SessionEnd, SessionRecovery
Tool Lifecycle: PreToolUse, PostToolUse, ToolOutputTruncator
Context Management: PreCompact, ContextWindowMonitor, CompactionContextInjector
Error Handling: EditErrorRecovery, AnthropicContextWindowLimitRecovery, ThinkingBlockValidator
Agent Coordination: SisyphusOrchestrator, RalphLoop, TaskResumeInfo
Notification: SessionNotification, BackgroundNotification
Content Injection: DirectoryAgentsInjector, DirectoryReadmeInjector, RulesInjector
Quality Control: CommentChecker, EmptyTaskResponseDetector, AgentUsageReminder
User Interaction: KeywordDetector, AutoSlashCommand, InteractiveBashSession
Utility: AutoUpdateChecker, NonInteractiveEnv, EmptyMessageSanitizer, StartWork
```

**Claude Code Hooks (8 events):**
```
PreToolUse, PostToolUse, UserPromptSubmit, Stop, SubagentStop,
SessionStart, SessionEnd, PreCompact
```

**Gap Analysis:**
- Missing: ToolOutputTruncator, ContextWindowMonitor (real-time), ErrorRecovery variants
- Missing: DirectoryAgentsInjector, RulesInjector (dynamic)
- Missing: BackgroundNotification, KeywordDetector, AutoSlashCommand

**Workaround Approach:**
Combine available hooks with external scripts:
- Use PostToolUse + external script for output monitoring
- Use SessionStart for context injection
- Use Stop/SubagentStop for notification triggers

**Difficulty:** HIGH - Requires building an external orchestration layer.

---

### 2. Ralph Loop Marker Detection

**OmO Capability:**
```javascript
// Ralph Loop detects:
<promise>DONE</promise>  // Task completion signal
// Configurable max iterations (default: 100)
// /cancel-ralph command to abort
// Cross-language support
```

**Claude Code Reality:**
- No marker detection system
- No iteration counting
- No programmatic completion signals

**Workaround Approach:**
Use Stop hook with prompt-based evaluation:

```json
{
  "hooks": {
    "Stop": [{
      "hooks": [{
        "type": "prompt",
        "prompt": "Check if the agent output contains completion signals like 'DONE', 'COMPLETE', or explicit task finish. Return 'block' if not complete."
      }]
    }]
  }
}
```

**Difficulty:** MEDIUM - Prompt-based detection is imprecise and consumes tokens.

---

### 3. Multi-Model Orchestration

**OmO Capability:**
```
Sisyphus (Claude Opus 4.5): Primary orchestrator with 32k thinking budget
Oracle (GPT-5.2): Architecture, code review, strategy
Librarian (Claude Sonnet 4.5 / Gemini 3 Flash): Documentation, research
Explore (Grok-code / Gemini 3 Flash / Claude Haiku 4.5): Fast exploration
Frontend Engineer: UI/UX specialized tasks
```

**Claude Code Reality:**
- Single model per session (Opus 4.5, Sonnet 4.5, or Haiku 4.5)
- Task agents inherit parent model
- No cross-provider routing
- No cost-based model selection

**Workaround Approach:**
1. Use MCP servers to call different providers
2. Build external routing logic
3. Accept higher complexity and latency

**Difficulty:** HIGH - Requires external infrastructure and loses native integration benefits.

---

### 4. Skill-Embedded MCP (Static Alternative)

**Workaround Approach:**
Pre-configure all MCP servers that skills might need:

```json
{
  "mcpServers": {
    "skill-playwright": { "command": "npx", "args": ["playwright-mcp"] },
    "skill-database": { "command": "npx", "args": ["database-mcp"] },
    "skill-websearch": { "command": "npx", "args": ["exa-mcp"] },
    "skill-context7": { "command": "npx", "args": ["context7-mcp"] }
  }
}
```

**Limitations:**
- All servers start at session init (resource overhead)
- Cannot add new MCPs mid-session
- Server conflicts possible with broad configurations

**Difficulty:** MEDIUM - Works but loses dynamic capability.

---

### 5. Background Task TTL and Polling Control

**OmO Capability:**
- 30-minute TTL with automatic cleanup
- 2-second polling intervals
- Configurable per-task timeouts

**Claude Code Reality:**
- No TTL management
- Fixed execution model
- 10-minute max timeout for Task tool

**Workaround:** Use `run_in_background: true` with Bash tool for long operations, but loses task coordination.

**Difficulty:** MEDIUM - Partial functionality achievable.

---

### 6. Preemptive Compaction Thresholds

**OmO Capability:**
- 70% warning threshold
- 85% preemptive action threshold
- Configurable responses per threshold

**Claude Code Reality:**
- Only ~95% auto-compact trigger
- PreCompact hook fires *before* compaction but cannot prevent it

**Workaround:**
Use PreCompact hook to inject critical context that survives summarization:

```json
{
  "hooks": {
    "PreCompact": [{
      "hooks": [{
        "type": "command",
        "command": "cat /project/.claude/critical-context.md"
      }]
    }]
  }
}
```

**Difficulty:** MEDIUM - Cannot prevent compaction, only influence what's preserved.

---

## WORKAROUND Features

These features can be achieved with **alternative approaches**.

### 1. Per-Command Bash Permissions

**OmO Approach:**
```
bash_permissions:
  git: allow
  rm: deny
  npm: ask
  curl: deny
```

**Claude Code Approach:**
```json
{
  "permissions": {
    "allow": ["Bash(git:*)", "Bash(npm run:*)"],
    "deny": ["Bash(rm:*)", "Bash(curl:*)", "Bash(wget:*)"],
    "ask": ["Bash(npm install:*)"]
  }
}
```

**Parity:** ~90% - Claude Code supports wildcard patterns achieving similar granularity.

---

### 2. Session Notifications

**OmO Approach:**
- OS-level notifications when agents go idle
- Works on macOS, Linux, Windows

**Claude Code Approach:**
```json
{
  "hooks": {
    "SessionEnd": [{
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"Claude session ended\" with title \"Claude Code\"'"
      }]
    }],
    "Stop": [{
      "hooks": [{
        "type": "command",
        "command": "/path/to/notify-idle.sh"
      }]
    }]
  }
}
```

**Parity:** ~80% - Requires external notification script but achievable.

---

### 3. Error Recovery Hooks

**OmO Hooks:**
- EditErrorRecovery
- AnthropicContextWindowLimitRecovery
- ThinkingBlockValidator

**Claude Code Approach:**
Combine PostToolUse with error detection:

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "*",
      "hooks": [{
        "type": "command",
        "command": "/path/to/error-detector.sh"
      }]
    }]
  }
}
```

**Parity:** ~60% - Manual implementation required, less integrated.

---

### 4. Context Injection

**OmO Hooks:**
- DirectoryAgentsInjector
- DirectoryReadmeInjector
- CompactionContextInjector

**Claude Code Approach:**
Use SessionStart hook:

```json
{
  "hooks": {
    "SessionStart": [{
      "hooks": [{
        "type": "command",
        "command": "cat .claude/AGENTS.md .claude/CONTEXT.md 2>/dev/null || true"
      }]
    }]
  }
}
```

**Parity:** ~70% - Static injection works, but no dynamic per-directory discovery.

---

## NATIVE Features

These features have **direct equivalents** in Claude Code.

### 1. LSP Integration

**Status:** NATIVE (as of December 2025)

Claude Code now provides native LSP support including:
- Hover information
- Go-to-definition navigation
- Symbol search
- Diagnostics integration
- Refactoring support

**Note:** OmO has 11 LSP-related tools; Claude Code's implementation covers 5 core operations. Verify specific LSP operations needed.

---

### 2. Task Agents / Subagents

**Status:** NATIVE

Claude Code provides:
- Task tool for spawning subagents
- 10-concurrent operation limit
- Parallel execution support
- Isolated context per subagent (~20k token overhead)

**Limitations vs OmO:**
- No nested subagents
- No demotion logic
- Batch execution (not streaming)
- No cost-based routing

---

### 3. Basic Hook System

**Status:** NATIVE

Claude Code provides 8 hook events:
- PreToolUse (allow/deny/ask)
- PostToolUse (context injection)
- UserPromptSubmit (prompt modification)
- Stop/SubagentStop (continuation control)
- SessionStart/SessionEnd (lifecycle)
- PreCompact (context preservation)

---

## Impact Assessment

### Critical Losses (Business Impact)

| Lost Capability | Impact | Mitigation |
|-----------------|--------|------------|
| Provider-tiered concurrency | API costs uncontrolled | External rate limiting |
| DCP algorithm control | Context loss unpredictable | Frequent manual compaction |
| Multi-model orchestration | Single-model limitations | MCP-based routing (complex) |
| Agent demotion logic | Cannot adapt to failures | Manual intervention |

### Moderate Losses (Workflow Impact)

| Lost Capability | Impact | Mitigation |
|-----------------|--------|------------|
| Ralph Loop markers | No completion detection | Stop hook + prompts |
| 31 hook events | Less automation points | Combine available hooks |
| Background TTL | Resource management manual | External monitoring |
| Dynamic MCP | All MCPs always loaded | Pre-configure needed servers |

### Minor Losses (Convenience Impact)

| Lost Capability | Impact | Mitigation |
|-----------------|--------|------------|
| Per-command permissions | Slightly coarser control | Wildcard patterns |
| Session notifications | Manual checking | Hook + OS scripts |
| Auto slash commands | Manual invocation | UserPromptSubmit hook |

---

## Recommendations

### Priority 1: Accept as Limitations (IMPOSSIBLE)

These features require fundamental Claude Code architectural changes:

1. **Dynamic MCP Spawning** - Pre-configure all needed MCP servers
2. **Provider-Tiered Concurrency** - Build external orchestration layer if critical
3. **DCP Algorithm Control** - Use PreCompact hook for preservation, accept auto-compact
4. **Agent Demotion Logic** - Design simpler agent hierarchies

### Priority 2: Implement Workarounds (DIFFICULT)

Worth the effort for significant value:

1. **Ralph Loop Detection** - Build Stop hook with completion prompts
2. **Preemptive Compaction** - PreCompact hook with critical context injection
3. **Error Recovery** - PostToolUse monitoring with external scripts

### Priority 3: Leverage Native Features

Already available in Claude Code:

1. **LSP Integration** - Use native support, verify coverage
2. **Task Agents** - Design within single-level hierarchy constraints
3. **Hook System** - Maximize 8 available events

### Priority 4: Consider External Tools

For missing orchestration capabilities:

1. **Claude Flow** - External multi-agent coordination
2. **Custom MCP Servers** - Route to multiple providers
3. **Monitoring Scripts** - External context window tracking

---

## Feature Comparison Quick Reference

```
OmO Feature                    Claude Code Equivalent       Status
─────────────────────────────────────────────────────────────────────
31 Hook Events                 8 Hook Events                DIFFICULT
BackgroundManager              Task tool (10 concurrent)    IMPOSSIBLE
DCP (70%/85%)                  Auto-compact (95%)           IMPOSSIBLE
Ralph Loop                     Stop hook + prompt           DIFFICULT
SkillMcpManager               Static MCP config             IMPOSSIBLE
Per-Command Bash              Wildcard patterns             WORKAROUND
LSP Tools (11)                Native LSP (5 operations)     NATIVE
Agent Modes                   Flat Task tool                IMPOSSIBLE
Sisyphus Orchestrator         Manual coordination           DIFFICULT
Session Notification          Hook + OS script              WORKAROUND
Error Recovery Hooks          PostToolUse + scripts         WORKAROUND
Context Injection             SessionStart hook             WORKAROUND
Tool Output Truncation        Automatic only                DIFFICULT
```

---

## Sources

### Claude Code Documentation
- [Hooks Reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Subagents - Claude Code Docs](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)

### Claude Code Community Resources
- [Understanding Claude Code Permissions](https://www.petefreitag.com/blog/claude-code-permissions/)
- [Claude Code Context Compaction](https://stevekinney.com/courses/ai-development/claude-code-compaction)
- [Task Tool vs Subagents](https://amitkoth.com/claude-code-task-tool-vs-subagents/)
- [Background Agent Execution Request - GitHub Issue #9905](https://github.com/anthropics/claude-code/issues/9905)

### Oh My OpenCode
- [GitHub Repository](https://github.com/code-yeongyu/oh-my-opencode)
- [DeepWiki - Sisyphus Orchestrator](https://deepwiki.com/code-yeongyu/oh-my-opencode/4.1-sisyphus-orchestrator)
- [DeepWiki - Specialized Agents](https://deepwiki.com/code-yeongyu/oh-my-opencode/4.2-specialized-agents)
- [Official Website](https://ohmyopencode.com/)

### Additional Resources
- [How Claude Code Got Better by Protecting More Context](https://hyperdev.matsuoka.com/p/how-claude-code-got-better-by-protecting)
- [Context Compaction Research](https://gist.github.com/badlogic/cd2ef65b0697c4dbe2d13fbecb0a0a5f)
- [Claude Code Hooks Power User Guide](https://claude.com/blog/how-to-configure-hooks)

---

*Document generated: 2026-01-08*
*Research methodology: Web search, GitHub analysis, documentation review*
*Classification criteria: Architectural feasibility, workaround viability, impact assessment*
