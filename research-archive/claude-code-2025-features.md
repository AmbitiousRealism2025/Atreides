# Claude Code 2025 Feature Analysis

## Executive Summary

Claude Code has evolved significantly throughout 2025, transforming from a basic CLI coding assistant into a sophisticated agentic development platform. Key milestones include:

- **v2.0.74 (December 2025)**: Native LSP support for 11 languages
- **v2.0.64**: Background agents with async notification system
- **v2.0.45**: PermissionRequest hooks
- **v2.0.13**: Plugin marketplace introduction
- **October 2025**: Sandboxing for safer autonomous execution
- **June 2025**: Remote MCP server support with OAuth

Claude Code achieves an industry-leading **80.9% SWE-bench score** with a **200K context window**.

---

## Feature Catalog

### 1. Native LSP Support (December 2025, v2.0.74)

**Status:** Generally Available

#### Activation
```bash
ENABLE_LSP_TOOL=1 claude
```

#### Supported Languages (11 Native)

| Language | Server | File Extensions |
|----------|--------|-----------------|
| Python | pyright | .py |
| TypeScript | vtsls | .ts, .tsx |
| JavaScript | vtsls | .js, .jsx |
| Go | gopls | .go |
| Rust | rust-analyzer | .rs |
| Java | jdtls | .java |
| C/C++ | clangd | .c, .cpp, .h |
| C# | OmniSharp | .cs |
| PHP | intelephense | .php |
| Kotlin | kotlin-language-server | .kt |
| Ruby | solargraph | .rb |
| HTML/CSS | html-lsp | .html, .css |

#### LSP Operations Available

| Operation | Description |
|-----------|-------------|
| `goToDefinition` | Jump to symbol definition |
| `findReferences` | Find all references to symbol |
| `hover` | Get hover information |
| `getDiagnostics` | Get file/workspace diagnostics |
| `documentSymbol` | List symbols in document |

#### Performance
- ~900x faster than text search (~50ms vs ~45 seconds)
- Semantic understanding of code structure
- Type-aware navigation

**Sources:**
- [Claude Code LSP Guide](https://www.aifreeapi.com/en/posts/claude-code-lsp)
- [Claude Code December 2025 Changelog](https://code.claude.com/changelog)

---

### 2. Async Background Agents (v2.0.64+)

**Status:** Generally Available

#### Overview
Background agents transform Claude Code from a turn-based assistant into a parallel development environment.

#### Features

| Feature | Description |
|---------|-------------|
| **Async Execution** | Task agents run without blocking main session |
| **Notifications** | Async updates when agents complete (no polling) |
| **Context Isolation** | Each background agent has isolated context |
| **Parallel Work** | Continue working while agents run |

#### Architecture
```
Main Session
├── Background Agent 1 (isolated context)
├── Background Agent 2 (isolated context)
└── Background Agent 3 (isolated context)
    └── Notification on completion
```

#### Task Tool Parameters

```typescript
interface TaskParams {
  prompt: string           // Task instructions
  subagent_type: string    // Agent specialization
  model?: string           // sonnet | opus | haiku
  run_in_background?: boolean  // Async execution
  resume?: string          // Resume previous agent
}
```

#### Git Worktree Integration
For file-modifying background agents:
- Each agent gets isolated git worktree
- Prevents file conflicts between parallel agents
- Changes can be merged back to main branch

#### Current Limitation
- Task tool executes synchronously by default
- `run_in_background: true` enables async but with limited coordination
- Feature request pending for full async agent orchestration (#9905)

**Sources:**
- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Background Agent Feature Request](https://github.com/anthropics/claude-code/issues/9905)

---

### 3. Remote MCP Servers (June 2025)

**Status:** Generally Available

#### Overview
Connect to MCP servers hosted remotely with OAuth 2.0 authentication.

#### Supported Transports

| Transport | Description |
|-----------|-------------|
| HTTP (Streamable) | Standard HTTP-based transport |
| SSE | Server-Sent Events for real-time |

#### Configuration

```json
{
  "mcpServers": {
    "remote-server": {
      "type": "url",
      "url": "https://mcp.example.com/api",
      "transport": {
        "type": "streamable-http"
      },
      "auth": {
        "type": "oauth2"
      }
    }
  }
}
```

#### OAuth Flow
1. Claude Code initiates OAuth authorization
2. User approves in browser
3. Token stored securely
4. Callback: `https://claude.ai/api/mcp/auth_callback`

#### Security Recommendations
- Use OAuth 2.0 for authentication (not IP allowlisting alone)
- Revoke permissions via Claude settings or third-party service
- Only add trusted remote servers

#### Known Issues
- GitHub remote MCP server connection issues at `https://api.githubcopilot.com/mcp/`
- Works in VS Code but may fail in Claude Code

**Sources:**
- [Remote MCP Support Announcement](https://www.anthropic.com/news/claude-code-remote-mcp)
- [MCP Documentation](https://code.claude.com/docs/en/mcp)

---

### 4. Plugin Marketplace (October 2025, v2.0.13+)

**Status:** Public Beta

#### Overview
Plugins are custom collections of slash commands, agents, MCP servers, and hooks that install with a single command.

#### Plugin Components

| Component | Directory | Description |
|-----------|-----------|-------------|
| Slash Commands | `commands/` | Custom commands |
| Subagents | `agents/` | Specialized agents |
| Skills | `skills/` | Reusable skill sets |
| Hooks | `hooks/` | Lifecycle hooks |
| MCP Servers | `.mcp.json` | Server configs |

#### Installation Methods

```bash
# Add a marketplace
/plugin marketplace add anthropics/claude-code

# Install from marketplace
/plugin install plugin-name
/plugin install plugin-name@marketplace-name

# Install from GitHub
/plugin install https://github.com/user/plugin-name

# Install local plugin
/plugin install ./my-local-plugin
```

#### Plugin Management

```bash
# Interactive plugin manager
/plugin

# CLI commands
claude plugin list              # List installed plugins
claude plugin enable <name>     # Enable a plugin
claude plugin disable <name>    # Disable a plugin
claude plugin uninstall <name>  # Remove a plugin
```

#### Plugin Structure

```
.claude-plugin/
  plugin.json         # Required metadata
commands/             # Slash commands
agents/               # Subagents
skills/               # Skills
hooks/                # Hooks
.mcp.json            # MCP server configs
```

#### Community Marketplaces
Notable community marketplaces include:
- **claudebase/marketplace**: 24 skills + 14 agents + 21 commands for full-stack development
- **Piebald-AI/claude-code-lsps**: LSP servers for additional languages
- **Dan Avila's marketplace**: DevOps, documentation, project management, testing

**Sources:**
- [Plugin Documentation](https://code.claude.com/docs/en/discover-plugins)
- [Plugin Announcement](https://www.anthropic.com/news/claude-code-plugins)
- [claudebase/marketplace](https://github.com/claudebase/marketplace)

---

### 5. Ultrathink Mode (Extended Thinking)

**Status:** Available with Claude Opus 4.5

#### Overview
Ultrathink is a hard-coded keyword system that triggers extended reasoning mode when detected in prompts. Only works in Claude Code CLI, not web/mobile/API.

#### Thinking Levels

| Keyword | Token Budget | Use Case |
|---------|--------------|----------|
| `think` | ~4K tokens | Standard analysis |
| `megathink` | ~10K tokens | Architectural analysis |
| `ultrathink` | ~32K tokens | Maximum depth reasoning |
| `think harder` | Variable | Intensity modifier |
| `think intensely` | Variable | Intensity modifier |

#### Claude Opus 4.5 Specifications
- **Release**: November 24, 2025
- **Model ID**: `claude-opus-4-5-20251101`
- **Strengths**: Complex, ambiguous tasks; scientific research; novel architecture design; high-stakes analysis
- **Efficiency**: Dramatically fewer tokens than predecessors for similar outcomes

#### Usage

```bash
# Start Claude Code with Opus 4.5
claude --model opus-4.5

# In prompt, add ultrathink for complex tasks
"ultrathink: Design a microservices architecture for..."
```

#### Best Practices

| Task Type | Recommended Level |
|-----------|-------------------|
| Architecture design | `ultrathink` + plan first |
| Stuck in loop | `ultrathink` |
| New feature | `think hard` + plan first |
| Simple edits | No keyword needed |
| Prototyping | No keyword needed |

**Sources:**
- [ClaudeLog Ultrathink Guide](https://claudelog.com/mechanics/ultrathink/)
- [Introducing Claude Opus 4.5](https://www.anthropic.com/news/claude-opus-4-5)

---

### 6. Chrome Browser Integration (v2.0.73+, Beta)

**Status:** Beta

#### Overview
Claude Code integrates with the Claude in Chrome extension for browser automation capabilities directly from the terminal.

#### Requirements
- Chrome extension version 1.0.36+
- Claude Code version 2.0.73+
- Visible browser window (no headless mode)
- Paid Claude subscription

#### Activation

```bash
# Start Claude Code with Chrome integration
claude --chrome

# Check connection status within session
/chrome
```

#### Capabilities

| Feature | Description |
|---------|-------------|
| Navigation | Navigate pages, click buttons, fill forms |
| Console Access | Read console logs and errors |
| Network Monitoring | Monitor network requests |
| GIF Recording | Record browser interactions |
| Authenticated Access | Access sites you're logged into |

#### Supported Sites
- Google Docs, Gmail, Notion, CRM systems
- Any site you're already logged into
- No additional API connectors needed

#### Limitations
- **Visible window required**: No headless mode
- **Browser support**: Chrome only (no Brave, Arc, or other Chromium browsers)
- **WSL**: Not supported

**Sources:**
- [Chrome Integration Documentation](https://code.claude.com/docs/en/chrome)
- [Claude in Chrome](https://claude.com/chrome)

---

### 7. Enhanced Sandboxing (October 2025)

**Status:** Generally Available

#### Overview
OS-level sandboxing isolates code execution with filesystem and network controls, reducing permission prompts by 84% while maintaining security.

#### Architecture

##### Filesystem Isolation

| Access Type | Default Behavior |
|-------------|------------------|
| Write | Current working directory and subdirectories |
| Read | Entire computer (except denied directories) |
| Denied | Sensitive system files |

##### Network Isolation

| Behavior | Description |
|----------|-------------|
| Default | All network access denied |
| Allow List | Must explicitly allow domains |
| Empty List | No network access |

#### OS-Level Implementation

| Platform | Technology |
|----------|------------|
| macOS | Seatbelt |
| Linux | Bubblewrap + seccomp BPF |

#### Security Features
- Coverage extends to scripts, programs, and subprocesses
- Network filtering via Unix domain socket proxy
- Syscall-level blocking for unauthorized socket creation

#### Configuration

```json
{
  "sandbox": {
    "allowedDomains": ["api.example.com", "github.com"],
    "deniedDirectories": ["/etc", "/var/secrets"]
  }
}
```

#### Limitations and Considerations
- Docker environments require `enableWeakerNestedSandbox` (security tradeoff)
- Domain fronting may bypass network filtering
- Broad domains (github.com) could enable data exfiltration
- Traffic content not inspected, only domains filtered

#### Open Source
Anthropic open-sourced the sandboxing runtime at [anthropic-experimental/sandbox-runtime](https://github.com/anthropic-experimental/sandbox-runtime).

**Sources:**
- [Sandboxing Documentation](https://code.claude.com/docs/en/sandboxing)
- [Making Claude Code More Secure](https://www.anthropic.com/engineering/claude-code-sandboxing)

---

### 8. Hook System (8 Events)

**Status:** Generally Available

#### Available Hook Events

| Hook | Trigger | Version |
|------|---------|---------|
| `PreToolUse` | Before tool execution | Base |
| `PostToolUse` | After tool completion | Base |
| `UserPromptSubmit` | User submits prompt | Base |
| `PermissionRequest` | Claude requests permission | v2.0.45+ |
| `Stop` | Agent finishes responding | Base |
| `SubagentStop` | Subagent finishes | v1.0.41+ |
| `SessionStart` | Session begins | Base |
| `SessionEnd` | Session terminates | Base |
| `PreCompact` | Before context compaction | Base |

#### Configuration Example

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "validate-command.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write $FILE"
          }
        ]
      }
    ]
  }
}
```

#### Hook Capabilities

| Feature | Description |
|---------|-------------|
| Matchers | Filter which tools trigger hooks (case-sensitive) |
| Input Modification | PreToolUse can modify tool inputs (v2.0.10+) |
| Exit Code Control | Return code 2 to deny action |
| JSON Decision | Return "deny/ask/allow" via JSON |

#### Common Use Cases

| Use Case | Hook Type | Description |
|----------|-----------|-------------|
| Notifications | Stop | Customize idle notifications |
| Auto-formatting | PostToolUse | Run prettier/gofmt after edits |
| Logging | PostToolUse | Track executed commands |
| Feedback | PreToolUse | Validate code against conventions |
| Custom permissions | PreToolUse | Block sensitive file modifications |

**Sources:**
- [Hooks Documentation](https://code.claude.com/docs/en/hooks-guide)
- [How to Configure Hooks](https://claude.com/blog/how-to-configure-hooks)

---

### 9. Slash Commands & Settings

#### Built-in Slash Commands

| Command | Description |
|---------|-------------|
| `/init` | Generate CLAUDE.md for new projects |
| `/review` | Code review for changes |
| `/compact` | Compress conversation context |
| `/clear` | Clear conversation (fresh start) |
| `/help` | Get help |
| `/context` | View context usage |
| `/memory` | Edit CLAUDE.md |
| `/agents` | Manage agents |
| `/permissions` | Manage permissions |
| `/cost` | View token usage |
| `/status` | View status |
| `/config` | Open settings interface |
| `/mcp` | Manage MCP servers |
| `/chrome` | Browser integration settings |
| `/plugin` | Plugin manager |
| `/allowed-tools` | Manage allowed tools |

#### Permission Modes

| Mode | Description |
|------|-------------|
| `default` | Allows reads, asks before other operations |
| `plan` | Analyze but not modify/execute |
| `acceptEdits` | Bypass permission prompts for file edits |
| `bypassPermissions` | No permission prompts |

#### Settings Configuration

```json
// ~/.claude/settings.json (user-level)
// .claude/settings.json (project-level)
{
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test:*)",
      "Read(~/.zshrc)"
    ],
    "deny": [
      "Bash(curl:*)",
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  }
}
```

**Sources:**
- [Slash Commands Documentation](https://code.claude.com/docs/en/slash-commands)
- [Claude Code Settings](https://code.claude.com/docs/en/settings)

---

## Comparison with Oh My OpenCode

### Feature Parity Matrix

| Feature Area | Claude Code | OmO | Parity Status |
|--------------|-------------|-----|---------------|
| **LSP Support** | 11 languages native, env var activation | 11 tools via LSP, integrated | Parity |
| **LSP Operations** | 5 operations | 9+ operations (includes callHierarchy) | OmO Ahead |
| **Hook System** | 8 hook events | 31 lifecycle hooks | OmO Ahead |
| **Background Agents** | Yes (v2.0.64+) | Yes (BackgroundManager) | Parity |
| **Plugin System** | Plugin marketplace | Config-based | Claude Code Ahead |
| **Multi-Model Support** | Single model per session | Multi-model orchestration | OmO Ahead |
| **Sandboxing** | OS-level filesystem + network | Depends on base | Claude Code Ahead |
| **Browser Integration** | Chrome extension | Not available | Claude Code Ahead |
| **Remote MCP** | OAuth-authenticated | Local only | Claude Code Ahead |
| **Extended Thinking** | Ultrathink (32K tokens) | Not available | Claude Code Ahead |
| **Context Management** | Auto-compact, /compact | DCP (70%/85%), aggressive truncation | OmO Ahead |
| **AST Tools** | Via MCP servers | Native AST-grep | OmO Ahead |
| **Token Optimization** | Basic truncation | Aggressive tool output truncation | OmO Ahead |
| **Model Providers** | Anthropic only | 7+ providers | OmO Ahead |

### Hook System Comparison

**Claude Code (8 hooks)**:
- PreToolUse, PostToolUse
- UserPromptSubmit, PermissionRequest
- Stop, SubagentStop
- SessionStart, SessionEnd
- PreCompact

**Oh My OpenCode (31+ hooks)**:
- Tool Output Truncator
- Anthropic Context Window Limit Recovery (multi-stage)
- Dynamic Context Pruning (DCP)
- Auto Update Checker
- Todo Continuation Enforcer
- Comment Checker
- Background Notification
- Session Notification
- Empty Task Response Detector
- Auto Session Resume
- Rules Injector
- Keyword Detector
- And 19+ more...

### LSP Operations Comparison

**Claude Code (5 operations)**:
- goToDefinition
- findReferences
- hover
- getDiagnostics
- documentSymbol

**Oh My OpenCode (11 operations)**:
- goToDefinition
- findReferences
- hover
- documentSymbol
- workspaceSymbol
- goToImplementation
- prepareCallHierarchy
- incomingCalls
- outgoingCalls
- prepareRename
- rename

---

## Key Advantages: Claude Code

### 1. Enterprise-Grade Security
- OS-level sandboxing (macOS Seatbelt, Linux Bubblewrap)
- Network isolation via proxy
- Permission system with deny/allow rules
- Open-sourced sandbox runtime

### 2. Ecosystem Integration
- Plugin marketplace with community contributions
- Chrome browser integration for end-to-end testing
- Remote MCP servers with OAuth
- Native CLAUDE.md project context

### 3. Thinking Depth
- Ultrathink mode for complex reasoning (32K tokens)
- Claude Opus 4.5 for frontier intelligence
- 80.9% SWE-bench score

### 4. First-Party Support
- Direct Anthropic development and maintenance
- Regular updates and changelogs
- Official documentation and support channels

---

## Key Advantages: Oh My OpenCode

### 1. Multi-Model Orchestration
- Sisyphus agent for coordinated multi-model workflows
- Model-per-task optimization
- Support for 7+ AI providers

### 2. Deeper Hook System
- 31 lifecycle hooks vs Claude Code's 8
- Advanced recovery mechanisms (multi-stage context limit handling)
- Todo Continuation Enforcer
- Comment Checker

### 3. Enhanced LSP Integration
- 11 operations vs Claude Code's 5
- Call hierarchy support (incoming/outgoing calls)
- Workspace-wide symbol search
- Go to implementation

### 4. Aggressive Context Optimization
- Dynamic Context Pruning (DCP)
- Multi-stage context limit recovery
- Aggressive tool output truncation
- AGENTS.md context preservation

### 5. Production Workflow Features
- Session resume after errors
- Empty task response detection
- Background notification system
- Auto-update checking

---

## Recommendations

### Use Claude Code When:
- Security is paramount (production environments)
- You need browser automation
- Working in large enterprises with compliance requirements
- Deep reasoning tasks requiring ultrathink
- You want a supported, first-party tool

### Use Oh My OpenCode When:
- Multi-model workflows are essential
- Maximum hook customization needed
- Context efficiency is critical
- You need full LSP capabilities (call hierarchy)
- Budget constraints require provider flexibility

### Hybrid Approach:
Many teams successfully use both tools:
- **Claude Code**: For secure, complex reasoning tasks and browser automation
- **OmO/OpenCode**: For multi-model orchestration and cost optimization

---

## Sources

### Claude Code Official
- [Claude Code Documentation](https://code.claude.com/docs/en/)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Sandboxing Engineering Blog](https://www.anthropic.com/engineering/claude-code-sandboxing)
- [Remote MCP Announcement](https://www.anthropic.com/news/claude-code-remote-mcp)
- [Plugin Announcement](https://www.anthropic.com/news/claude-code-plugins)

### Oh My OpenCode
- [GitHub Repository](https://github.com/code-yeongyu/oh-my-opencode)
- [OpenCode Documentation](https://opencode.ai/docs/)
- [OpenCode LSP Servers](https://opencode.ai/docs/lsp/)

### Third-Party Analysis
- [AI Coding Tools Comparison December 2025](https://www.digitalapplied.com/blog/ai-coding-tools-comparison-december-2025)
- [Claude Code vs Cursor Comparison](https://www.qodo.ai/blog/claude-code-vs-cursor/)

---

*Document generated: January 2026*
*Research scope: Claude Code December 2025 features vs Oh My OpenCode capabilities*
