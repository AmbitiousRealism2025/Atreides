# Claude Code Adaptation Notes

## Overview

This document contains additional insights specifically relevant for adapting Oh My Opencode's orchestration patterns to work with Claude Code.

## Key Architectural Mappings

### OmO → Claude Code Concept Mapping

| Oh My Opencode | Claude Code Equivalent | Notes |
|----------------|------------------------|-------|
| `Sisyphus` agent | Primary orchestrator prompt | Inject via CLAUDE.md or system prompt |
| `call_omo_agent` | `Task` tool | Background agent spawning |
| `skill` tool | `Skill` tool | Slash command execution |
| `oh-my-opencode.json` | `CLAUDE.md` + `settings.json` | Configuration split |
| Hooks (OpenCode native) | `settings.json` hooks | Limited to 4 events |
| LSP tools | MCP servers | Need external MCP |
| AST-grep tools | MCP servers | Need external MCP |

## Agent Mode Types (Critical for Adaptation)

Oh My Opencode defines three agent modes:

| Mode | Description | Claude Code Equivalent |
|------|-------------|------------------------|
| `primary` | Main orchestrator agent | Default agent |
| `subagent` | Called by other agents | Task tool agents |
| `all` | Both primary and subagent | Flexible agents |

**Key Insight**: When Sisyphus is enabled, native `build` and `plan` agents are demoted to `subagent` mode.

## Tool Permission System

### Full Permission Matrix

| Agent | call_omo_agent | task | look_at | bash | edit |
|-------|----------------|------|---------|------|------|
| OmO (Sisyphus) | ✅ | ✅ | ✅ | ✅ | ✅ |
| oracle | ✅ | ✅ | ✅ | ✅ | ✅ |
| explore | ❌ | ✅ | ✅ | ✅ | ❌ |
| librarian | ❌ | ✅ | ✅ | ✅ | ❌ |
| frontend-ui-ux-engineer | ✅ | ✅ | ✅ | ✅ | ✅ |
| document-writer | ✅ | ✅ | ✅ | ✅ | ✅ |
| multimodal-looker | ❌ | ❌ | ❌ | ❌ | ❌ |

### Claude Code Implementation

```json
// In .claude/settings.json or agent definitions
{
  "agents": {
    "explore": {
      "tools": {
        "Write": false,
        "Edit": false,
        "Task": true,
        "Bash": true
      }
    }
  }
}
```

## Preventing Agent Recursion

**Critical Design Decision**: `background_task` is disabled for ALL subagents to prevent recursive spawning.

In Claude Code, enforce via:
1. Agent prompts explicitly stating "DO NOT spawn background agents"
2. Tool restrictions in agent definitions
3. Hook validation on `PreToolUse`

## Available Tool Categories

### General Purpose Tools (Direct Claude Code Equivalents)
- `grep` → `Grep` tool
- `glob` → `Glob` tool
- `read` → `Read` tool
- `write` → `Write` tool
- `edit` → `Edit` tool
- `bash` → `Bash` tool

### Background Task Management
```
background_task    → Task tool (run_in_background: true)
background_output  → TaskOutput tool
background_cancel  → KillShell tool
```

### LSP Tools (Need MCP)
Oh My Opencode provides 11 LSP tools:
- `lsp_hover` - Type info/documentation
- `lsp_goto_definition` - Navigate to definition
- `lsp_find_references` - Find all usages
- `lsp_document_symbols` - File outline
- `lsp_workspace_symbols` - Project-wide symbol search
- `lsp_diagnostics` - Errors/warnings
- `lsp_servers` - List servers
- `lsp_prepare_rename` - Validate rename
- `lsp_rename` - Execute rename
- `lsp_code_actions` - Quick fixes
- `lsp_code_action_resolve` - Apply action

**Adaptation**: Need to implement via MCP server or external tool

### AST-Grep Tools (Need MCP)
- `ast_grep_search` - Structural code search (25 languages)
- `ast_grep_replace` - Structural code replacement

### Built-in MCP Integrations
- `websearch` (Exa AI) → `mcp__exa__web_search_exa`
- `context7` → `mcp__storm-mcp---defaultc__query-docs`
- `grep_app` → External MCP needed
- `webfetch` → `WebFetch` tool

## Agent-Specific Tool Access

### Oracle Agent
- **Purpose**: Pure reasoning, no tool access
- **Claude Code**: Define as research-only agent with all tools disabled

### Librarian Agent
**Tools**: bash, read, websearch, grep_app, context7, gh, git, webfetch
**NO**: write, edit

```markdown
<!-- In CLAUDE.md for librarian-style agent -->
## Librarian Agent Rules
- You are READ-ONLY
- You may search the web and read files
- You MUST NOT write or edit any files
- Use for external documentation research only
```

### Explore Agent
**Tools**: bash, read, grep, glob, ast_grep_search, lsp_*, grep_app
**NO**: write, edit

### Frontend UI/UX Engineer
**Tools**: ALL except background_task
**Use**: Visual design, UI implementation

### Document Writer
**Tools**: ALL except background_task
**Use**: Technical documentation, README files

## Skill vs Agent Comparison

| Aspect | Skills | Agents |
|--------|--------|--------|
| **Nature** | Prompt templates | AI entities |
| **Model** | Inherits or specified | Dedicated |
| **Permissions** | Inherits | Own config |
| **Invocation** | `/skill-name` | `@agent` or delegation |
| **State** | Stateless | Can maintain context |
| **MCP** | Can embed own MCPs | Uses shared MCPs |

## Directory Discovery Hierarchy

### Commands (highest to lowest priority)
1. `.opencode/command/` (project OpenCode)
2. `.claude/commands/` (project Claude Code)
3. `~/.config/opencode/command/` (user OpenCode)
4. `~/.claude/commands/` (user Claude Code)

### Skills (highest to lowest priority)
1. `.opencode/skill/` (project OpenCode)
2. `.claude/skills/` (project Claude Code)
3. `~/.config/opencode/skill/` (user OpenCode)
4. `~/.claude/skills/` (user Claude Code)

## Hook Event Mapping

| OpenCode Event | Claude Code Hook |
|----------------|------------------|
| `tool.execute.before` | `PreToolUse` |
| `tool.execute.after` | `PostToolUse` |
| `session.idle` | `Stop` |
| `user.prompt` | `UserPromptSubmit` |

**Limitation**: Claude Code has only 4 hooks vs OpenCode's 32+

## LoadedSkill Interface

When implementing skill loading in Claude Code:

```typescript
interface LoadedSkill {
  name: string;
  path: string;          // Path to SKILL.md
  resolvedPath: string;  // Directory path
  definition: {
    name: string;
    description: string;
    template: string;
    model?: string;
    agent?: string;
    subtask?: boolean;
    argumentHint?: string;
  };
  scope: 'builtin' | 'user' | 'project' | 'opencode' | 'opencode-project';
  license?: string;
  compatibility?: string;
  metadata?: Record<string, string>;
  allowedTools?: string[];
  mcpConfig?: SkillMcpConfig;  // Embedded MCP servers
  lazyContent?: LazyContentLoader;  // Defer loading
}
```

## Key Implementation Patterns

### 1. Intent Gate Pattern (Phase 0)

```markdown
Before any task, classify the request:
- TRIVIAL: Answer directly
- EXPLICIT: Execute immediately
- EXPLORATORY: Fire background agents first
- OPEN-ENDED: Assess codebase maturity first
- AMBIGUOUS: Ask clarifying questions
```

### 2. Background Agent Spawning

```typescript
// OmO pattern
await call_omo_agent({
  agent: "explore",
  task: "Find all API endpoints",
  run_in_background: true
});

// Claude Code equivalent
await Task({
  subagent_type: "Explore",
  prompt: "Find all API endpoints",
  run_in_background: true
});
```

### 3. Skill-First Checking

```markdown
## Sisyphus Behavior
When receiving a request:
1. CHECK SKILLS FIRST (BLOCKING)
2. If skill trigger matches → INVOKE skill tool IMMEDIATELY
3. Otherwise → Proceed with intent classification
```

### 4. Todo Continuation Enforcement

Ensure agents complete all tasks:
```markdown
## Task Completion Rules
- You MUST NOT stop until all TODOs are marked complete
- If you find yourself stopping with pending tasks, CONTINUE
- Create detailed TODO lists for all multi-step operations
```

## Recommended Adaptation Strategy

1. **Phase 1**: Implement core orchestration in CLAUDE.md
   - Intent gate classification
   - Task delegation patterns
   - Todo enforcement

2. **Phase 2**: Create specialized agents
   - explore (read-only codebase search)
   - librarian (external research)
   - frontend-ui-ux-engineer (UI implementation)

3. **Phase 3**: Add skill support
   - Skill loading from directories
   - Slash command invocation
   - MCP embedding (if needed)

4. **Phase 4**: Implement hooks
   - PreToolUse validation
   - PostToolUse enhancements
   - Todo continuation enforcer

## Sources

- [GitHub - code-yeongyu/oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)
- [DeepWiki - Agent System](https://deepwiki.com/code-yeongyu/oh-my-opencode#4)
- [DeepWiki - Agent Configuration](https://deepwiki.com/code-yeongyu/oh-my-opencode#4.3)
- [DeepWiki - Specialized Agents](https://deepwiki.com/code-yeongyu/oh-my-opencode#4.2)
- [DeepWiki - Slash Commands and Skills](https://deepwiki.com/code-yeongyu/oh-my-opencode#5.6)
