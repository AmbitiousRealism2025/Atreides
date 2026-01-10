# Claude Code vs OmO Architecture Comparison

## Executive Summary

The comparison between Oh My OpenCode (OmO) and Claude Code reveals two distinct philosophies: OmO is a highly customizable, multi-model orchestration framework, whereas Claude Code is a secure, first-party, integrated development environment.

---

## 1. Capability Comparison Matrix

| Feature Area | Oh My OpenCode (OmO) | Claude Code (Native) |
|:---|:---|:---|
| **Model Support** | Multi-model (7+ providers); per-task optimization | Single model per session; tasks inherit parent model |
| **Hooks** | 31+ lifecycle hooks | 8 hook events |
| **LSP Operations** | 11 operations (including rename and call hierarchy) | 5 core operations (hover, definition, etc.) |
| **Context Management** | Dynamic Context Pruning (DCP) at 70%/85% thresholds | Auto-compact at ~95% threshold |
| **Concurrency** | Tiered per-provider/model rate limiting | Flat 10-concurrent task limit |
| **Security** | Depends on base environment | OS-level sandboxing (macOS Seatbelt, Linux Bubblewrap) |
| **Browser Integration** | Playwright skill | Native Chrome browser integration (v2.0.73+) |

---

## 2. Fundamental Architectural Differences

### OmO Architecture
- Built around **Sisyphus**, a sophisticated 504-line orchestration prompt
- Manages a hierarchy of specialized agents (oracle, librarian, explore, etc.)
- Each agent has specific cost-tier and permission profiles
- Designed for **provider flexibility** - routes tasks to most cost-effective or capable model

### Claude Code Architecture
- More **monolithic first-party architecture**
- Task agents are generally flat and inherit the model of the primary session
- Prioritizes **security and enterprise compliance**
- Built-in sandbox that filters network requests and monitors syscalls

---

## 3. Tool Availability

### Common Tools (Both Systems)
- `Grep`
- `Glob`
- `Read`
- `Write`
- `Edit`
- `Bash`

### OmO-Specific Semantic Tools
- `ast_grep` - Structural code search (supports 25 languages)
- `lsp_workspace_symbols` - Advanced symbol search
- `lsp_rename` - Semantic renaming

### Claude Code Specialized Tools
- Native LSP support for 11 languages (as of December 2025)
- `WebFetch` tool for web content retrieval
- "Ultrathink" mode for deep reasoning (up to 32K tokens)

---

## 4. Extension Mechanisms

### OmO Plugins & Skills
- Directory-based discovery system for skills and commands
- Skills are Markdown files with YAML frontmatter
- Can **dynamically spawn MCP servers** on-demand via `SkillMcpManager`
- Highly flexible runtime configuration

### Claude Code Marketplace
- Plugin marketplace for slash commands, agents, and hooks
- Relies heavily on `CLAUDE.md` for project-specific orchestration rules
- Uses `settings.json` for static MCP configurations
- **Cannot dynamically spawn MCP servers** mid-session - must be pre-configured at initialization

---

## 5. Execution Models

### Agent Delegation

| Aspect | OmO | Claude Code |
|--------|-----|-------------|
| Request Classification | "Intent Gate" (Phase 0) - Trivial, Exploratory, etc. | No built-in classification |
| Background Agents | Proactively fires background agents for research | Task tool supports background (v2.0.64+) |
| Agent Types | 7 specialized built-in agents | Generic subagent_types |

### Parallelism

| Aspect | OmO | Claude Code |
|--------|-----|-------------|
| Concurrency Control | `BackgroundManager` with sophisticated per-provider control | Basic parallel execution |
| Rate Limiting | Per-provider and per-model rate limiting | Flat 10-concurrent limit |
| Cost-Aware Routing | Yes, routes to cost-effective models | No |

### Iteration (The Ralph Loop)
- **OmO**: Implements the "Ralph Loop" - detects completion signals (like `DONE`) for iterative development
- **Claude Code**: Lacks native marker detection, requires prompt-based detection (less precise)

---

## 6. System Strengths and Limitations

### Oh My OpenCode (OmO)

**Strengths:**
- Context efficiency through Dynamic Context Pruning (DCP)
- Multi-model cost optimization
- Deep semantic code navigation
- 31+ lifecycle hooks for customization
- Flexible provider switching

**Limitations:**
- Lacks native OS-level sandboxing
- High architectural complexity
- Relies on external infrastructure for many features
- Steeper learning curve

### Claude Code

**Strengths:**
- Security and sandboxing (enterprise-grade)
- Native browser automation
- First-party ecosystem integration
- Simpler mental model
- Built-in Ultrathink reasoning mode

**Limitations:**
- Rigid context management (95% auto-compact)
- Single-model sessions
- Limited hook events (8 vs 31+)
- Cannot dynamically spawn MCP servers
- No cost-aware routing

---

## Architectural Analogy

| System | Analogy |
|--------|---------|
| **Claude Code** | High-security corporate campus with built-in facilities and strict rules |
| **OmO** | Highly customized modular laboratory where you can swap any equipment or bring in outside specialists |

---

## Key Conversion Implications

1. **Multi-model routing** → Must be simulated via model parameter in Task tool
2. **31 hooks** → Map to 8 available Claude Code hooks where possible
3. **Dynamic MCP spawning** → Pre-configure all MCP servers at startup
4. **DCP context management** → Rely on Claude Code's 95% auto-compact or implement manual strategies
5. **Cost-tier awareness** → Implement via model selection in Task tool (haiku vs sonnet vs opus)

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
