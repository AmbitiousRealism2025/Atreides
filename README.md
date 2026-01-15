# Atreides

**Transform Claude Code into a disciplined, self-orchestrating development partner.**

Atreides brings systematic workflows, intelligent agent delegation, and robust error recovery to your Claude Code sessions. At its core is **Muad'Dib**—the orchestration agent that manages your development workflow from start to finish. Instead of ad-hoc prompting, Muad'Dib provides a structured methodology that knows when to explore, when to implement, and when to stop and recover from errors—automatically.

Whether you're navigating a legacy codebase or building from scratch, Muad'Dib adapts to your project's maturity level and applies the right approach for each task. Complex multi-step operations are broken down and tracked. Failures trigger automatic recovery protocols. Specialized agents are delegated to with clear instructions and success criteria.

**The result?** More reliable AI-assisted development with fewer dead ends and wasted context.

---

### Inspired By

Atreides was inspired by [Oh My Opencode](https://github.com/code-yeongyu/oh-my-opencode), created by **YeonGyu Kim** ([@code-yeongyu](https://github.com/code-yeongyu)). Oh My Opencode pioneered the concept of batteries-included agent orchestration, demonstrating how pre-built tools, specialized agents, and intelligent workflows can dramatically improve AI coding assistants. Atreides builds on these ideas with a focus on Claude Code's unique capabilities.

---

## Features

- **Systematic Workflows** — Move through intent classification, exploration, implementation, and completion phases automatically. No more wondering "what should I do next?"
- **Intelligent Delegation** — Muad'Dib selects the right agent and model for each task. Quick lookups use fast models; complex architecture decisions get the heavy hitters.
- **Robust Error Recovery** — The 3-strikes rule automatically halts, reverts, and escalates when things go wrong. No more runaway failures corrupting your codebase.
- **Context Preservation** — Session state persists across conversations and survives context compaction. Pick up exactly where you left off.
- **Project Templates** — Initialize new projects with sensible defaults, or configure existing ones to match your team's standards.
- **Quality Guardrails** — Built-in permission controls prevent dangerous operations while allowing the flexibility you need for real development work.
- **Muad'Dib Skills** (Claude Code 2.1+) — 11 specialized skills with forked context isolation. Explore 50+ files without bloating your main session.
- **Wildcard Permissions** — Flexible patterns like `Bash(npm *)` give you fine-grained control over what operations are allowed.

## Installation

You have two options for installing Atreides:

1. **As your main Claude environment** — Atreides orchestration applies to all your Claude Code sessions. Follow the directions below.
2. **As a separate custom environment** — Keep vanilla `claude` untouched and launch Atreides with a dedicated `atreides` command. See the [Dual Environment Setup Guide](docs/DUAL-ENVIRONMENT-SETUP.md).

### Standard Installation

```bash
# Install globally
npm install -g muaddib-claude

# Set up global components
muaddib install

# Initialize in your project
cd your-project
muaddib init
```

## Quick Start

### 1. Install Muad'Dib

```bash
npm install -g muaddib-claude
muaddib install
```

### 2. Initialize Your Project

```bash
cd your-project
muaddib init
```

Follow the prompts to configure:
- Project name and type (node/typescript/python/go/rust)
- Orchestration level (minimal/standard/full)
- Codebase maturity (GREENFIELD/TRANSITIONAL/DISCIPLINED/LEGACY)
- Hook preferences

### 3. Start Using Claude Code

Your project now has Muad'Dib orchestration! Claude Code will automatically:
- Follow systematic workflow phases
- Use TodoWrite for multi-step tasks (3+ steps)
- Apply 3-strikes error recovery
- Delegate to specialized agents

## Commands

| Command | Description |
|---------|-------------|
| `muaddib install` | Install global components to ~/.muaddib |
| `muaddib init` | Initialize in current project |
| `muaddib init --minimal` | Minimal setup (CLAUDE.md only) |
| `muaddib init --full` | Full setup with all features |
| `muaddib update` | Update global components |
| `muaddib update --project` | Update project files |
| `muaddib doctor` | Check installation health |
| `muaddib uninstall` | Remove global components |
| `muaddib uninstall --project` | Also remove project files |

## Generated Files

After `muaddib init --full`, your project will have:

```
your-project/
├── CLAUDE.md                    # Orchestration rules (~2600 lines)
├── .claude/
│   ├── settings.json            # Hooks and permissions
│   ├── context.md               # Session context
│   ├── critical-context.md      # Compaction-safe context
│   ├── scripts/                 # Helper scripts for hooks
│   │   ├── validate-bash-command.sh
│   │   ├── pre-edit-check.sh
│   │   ├── post-edit-log.sh
│   │   ├── error-detector.sh
│   │   └── notify-idle.sh
│   └── skills/
│       └── muaddib/             # Muad'Dib skill package (11 skills)
│           ├── orchestrate.md   # Main workflow coordination
│           ├── explore.md       # Forked context exploration
│           ├── validate.md      # Pre-completion validation
│           ├── lsp.md           # Semantic code operations
│           ├── refactor.md      # AST-grep transformations
│           ├── checkpoint.md    # Session state management
│           ├── tdd.md           # Test-driven development
│           ├── parallel-explore.md  # Multi-angle exploration
│           ├── incremental-refactor.md  # Per-file refactoring
│           ├── doc-sync.md      # Documentation sync
│           └── quality-gate.md  # Pre-completion verification
└── .muaddib/
    └── config.json              # Project configuration
```

## Intent Classification

Not every request needs the same level of rigor. Asking "what does this function do?" shouldn't trigger a full codebase assessment. But "refactor the auth system" absolutely should.

Muad'Dib classifies your requests before acting, ensuring simple questions get quick answers while complex tasks receive the thorough treatment they deserve:

| Category | Examples | Action |
|----------|----------|--------|
| **Trivial** | "What does this function do?" | Direct answer |
| **Explicit** | "Add a login button" | Execute immediately |
| **Exploratory** | "Find where auth is handled" | Explore first, then implement |
| **Open-ended** | "Refactor the auth system" | Full assessment, planning required |
| **Ambiguous** | "Make it better" | Clarify before proceeding |

## Codebase Maturity Assessment

A battle-tested codebase with 90% test coverage deserves different treatment than a scrappy prototype. Muad'Dib assesses your project's maturity level and adjusts its approach accordingly—following established patterns exactly in disciplined codebases, while being more flexible in greenfield projects where patterns are still being established.

Projects are assessed on a 4-level scale:

| Level | Description | Approach |
|-------|-------------|----------|
| **DISCIPLINED** | High test coverage, consistent patterns | Follow patterns EXACTLY |
| **TRANSITIONAL** | Mixed patterns, evolving | Respect existing, introduce carefully |
| **LEGACY** | Technical debt, inconsistent | Be conservative, propose improvements |
| **GREENFIELD** | New project | Establish best practices |

## Orchestration Phases

Muad'Dib orchestrates your development workflow through a series of intelligent phases. Rather than jumping straight into code changes, the agent first understands what you're asking for, assesses your codebase, and gathers the context needed to succeed. This methodical approach prevents the common pitfalls of AI-assisted development: incomplete understanding, missed edge cases, and changes that break existing functionality.

When you give Muad'Dib a task, it automatically routes your request through the appropriate phases. Simple questions get immediate answers. Implementation requests trigger exploration and planning. Complex refactoring engages the full workflow with quality gates and recovery protocols. You don't need to manage this process—Muad'Dib handles the orchestration while keeping you informed of progress through each phase.

### Phase 0: Intent Gate
Classify requests using the Intent Classification matrix above.

### Phase 1: Assessment
Evaluate codebase maturity for complex tasks using the Maturity Assessment checklist.

### Phase 2A: Exploration
Gather context through **parallel investigation** with multiple agents launched in a single message.

**Parallel Agent Pattern**:
```
Task(Explore, sonnet, "Search codebase for [pattern]")
Task(general-purpose, sonnet, "Research [topic]")
→ Both execute in parallel, results returned together
```

### Phase 2B: Implementation
Execute work with TodoWrite tracking and quality checks.

### Phase 2C: Recovery
Handle failures with 3-strikes protocol (see below).

### Phase 3: Completion
Verify deliverables, run quality checks, and summarize accomplishments.

## 3-Strikes Error Recovery

One of the most frustrating aspects of AI-assisted development is watching an agent repeatedly fail at the same operation, consuming context and making things worse with each attempt. Muad'Dib implements a strict 3-strikes protocol: after three consecutive failures, it stops, reverts to a known-good state, and escalates—either consulting a more capable agent or asking you for guidance.

After 3 consecutive failures on the same operation:

```
STOP     → Halt all modifications immediately
REVERT   → git checkout to last working state
DOCUMENT → Record what was attempted and failed
CONSULT  → Task(Plan, opus) for alternative approach
ESCALATE → AskUserQuestion if still stuck
```

**What counts as a failure:**
- Edit operation fails (string not found)
- Build/compile fails
- Tests fail after changes
- Type checking fails
- Lint errors not resolvable

## Agent Delegation

Muad'Dib doesn't try to do everything itself. When a task calls for specialized expertise—security analysis, performance optimization, frontend architecture—it delegates to purpose-built agents with the right capabilities and model selection. This team-based approach means you get the right level of intelligence for each subtask without burning expensive tokens on simple operations.

| Agent | Model | Use For |
|-------|-------|---------|
| Explore | sonnet | File searches, structure analysis, code patterns |
| general-purpose | sonnet | Research, documentation, external lookups |
| Plan | opus | Architecture, complex design, critical decisions |
| Plan | opus | Feature design, refactoring strategy |
| security-engineer | opus | Vulnerability analysis, auth design |
| performance-engineer | opus | Optimization, bottleneck analysis |
| frontend-architect | opus | UI/UX implementation, components |
| backend-architect | opus | API design, data modeling |

### Model Selection

- **sonnet**: Quick searches, simple lookups, codebase exploration
- **opus**: Implementation, code review, multi-file changes, architecture, complex debugging

### 7-Section Delegation Template

When delegating to agents, use this structure:

1. **TASK** - Specific, atomic goal
2. **EXPECTED OUTCOME** - Concrete deliverables
3. **CONTEXT** - Files, patterns, constraints
4. **MUST DO** - Explicit requirements
5. **MUST NOT DO** - Forbidden actions
6. **TOOLS ALLOWED** - Optional whitelist
7. **SUCCESS CRITERIA** - Completion verification

## Completion Checking

"Done" doesn't mean "I stopped working." Muad'Dib enforces a strict completion protocol that verifies all todos are complete, quality checks pass, and deliverables match requirements before declaring victory. No more prematurely ended sessions with half-finished features and failing tests.

Before ending any multi-step task, this protocol runs:

1. **TodoWrite Audit** - Are ALL todos complete?
2. **Quality Verification** - Did linters/tests/builds pass?
3. **Deliverable Check** - Does output match requirements?
4. **State Verification** - Is codebase clean?

**NEVER rules** (absolute):
- NEVER stop with incomplete todos
- NEVER stop with failing tests
- NEVER stop without verifying deliverables

## Session Continuity

Development rarely happens in a single sitting. Muad'Dib maintains context across sessions so you can pick up exactly where you left off—even after context compaction. Critical information is preserved in dedicated files that survive conversation resets.

**Session Start Protocol**:
- Read CLAUDE.md (project rules)
- Check for existing todos
- Review git status
- Understand current state

**Session End Protocol**:
- All work complete or documented
- Summary provided
- Pending work noted
- State is clean

**State Persistence**:
- TodoWrite persists across conversation
- `.claude/context.md` for session context
- `.claude/critical-context.md` survives compaction

## Quality Standards

Code that doesn't pass linting, type checking, and tests isn't done—it's a liability. Muad'Dib runs your project's quality checks before marking tasks complete, catching issues while the context is still fresh rather than leaving them for future debugging sessions.

Before marking any task complete:

1. Save all files
2. Run formatter (prettier, black, gofmt, rustfmt)
3. Run linter (eslint, ruff, golint, clippy)
4. Run type checker (tsc, mypy, go vet)
5. Run tests (jest, pytest, go test, cargo test)
6. Verify no regressions

## Muad'Dib Skills (Claude Code 2.1+)

Beyond orchestration, Muad'Dib provides 11 specialized skills that extend Claude Code's capabilities. These skills leverage forked context—a powerful feature that lets you explore dozens of files without consuming your main session's context window. The results come back as concise summaries, keeping your working memory clean while giving you deep codebase insights.

Invoke any skill with `/muaddib-<skill>`:

### Core Skills

| Skill | Context | Purpose |
|-------|---------|---------|
| `muaddib-orchestrate` | main | Main workflow coordination and task management |
| `muaddib-explore` | **forked** | Isolated codebase exploration (doesn't pollute context) |
| `muaddib-validate` | main | Pre-completion quality gates and verification |

### Extended Skills

| Skill | Context | Purpose |
|-------|---------|---------|
| `muaddib-lsp` | **forked** | Semantic code operations (go-to-definition, find references) |
| `muaddib-refactor` | **forked** | AST-grep structural code transformations |
| `muaddib-checkpoint` | main | Session state checkpointing and recovery |
| `muaddib-tdd` | **forked** | Test-driven development workflow |
| `muaddib-parallel-explore` | **forked** | Multiple parallel exploration queries |
| `muaddib-incremental-refactor` | **forked** | Per-file refactoring with verification |
| `muaddib-doc-sync` | main | Documentation synchronization with code |
| `muaddib-quality-gate` | main | Pre-completion quality verification |

### Forked Context

Skills marked with **forked** use Claude Code 2.1's forked context feature:

- Exploration doesn't consume main session context
- Can read 50+ files without bloat
- Only summarized results return to main session
- Perfect for research, analysis, and parallel investigations

### LSP Integration

The `muaddib-lsp` skill supports semantic code operations via MCP or CLI:
- **MCP option**: [mcp-language-server](https://github.com/isaacphi/mcp-language-server)
- **CLI fallbacks**: Language-specific tools (pyright, gopls, rust-analyzer)

### AST-grep Integration

The `muaddib-refactor` skill uses [ast-grep](https://ast-grep.github.io/) for structural transformations:
```bash
ast-grep --pattern 'console.log($$$ARGS)' --rewrite '' --lang javascript src/
```

## Security

Giving an AI agent access to your terminal requires trust—and guardrails. Atreides ships with a carefully designed permission system that allows productive development workflows while blocking destructive operations. You can customize these permissions for your team's needs, but the defaults are designed to keep you safe out of the box.

### Wildcard Permissions (Claude Code 2.1)

Muad'Dib uses flexible wildcard patterns:

```json
{
  "allow": [
    "Bash(npm *)",      // All npm commands
    "Bash(git *)",      // All git commands
    "Bash(*--help)",    // Any help flag
    "Bash(*--version)"  // Any version check
  ],
  "deny": [
    "Bash(rm -rf *)",   // Block recursive delete
    "Bash(sudo *)",     // Block privilege escalation
    "Bash(curl * | sh)" // Block remote code execution
  ]
}
```

### Allowed Operations
- Git commands
- Package managers (npm, pip, cargo, go)
- Build tools and test runners
- Common utilities (ls, cat, grep, find)
- Help and version flags

### Blocked Operations
- Destructive commands (rm -rf /, sudo)
- Remote code execution (curl | sh)
- Secret file access (.env, credentials, .ssh, .aws)
- Dangerous permissions (chmod 777)

## Configuration

Atreides uses a layered configuration system. Global settings apply across all your projects, while project-specific settings let you customize behavior for individual codebases. Project config takes precedence, with smart merging that preserves your customizations during updates.

### Global Configuration
Located at `~/.muaddib/config.json`

### Project Configuration
Located at `.muaddib/config.json`

Project config overrides global config with smart merging.

### Update Behavior

When running `muaddib update --project`:
- **New hook types** are added without overwriting your customizations
- **Permissions** are merged with deduplication
- **Existing settings** are preserved

## Running Alongside Vanilla Claude Code

Want to keep your standard `claude` command untouched while having `atreides` available for orchestrated sessions? See the [Dual Environment Setup Guide](docs/DUAL-ENVIRONMENT-SETUP.md) for instructions on configuring both:

```bash
claude     # Vanilla Claude Code
atreides   # Claude Code + Muad'Dib orchestration
```

This lets you choose the right level of structure for each task.

## Requirements

Atreides has minimal dependencies—just Node.js and Claude Code:

- Node.js 18+
- Claude Code CLI

## Development

Contributions are welcome! The codebase is thoroughly tested and follows consistent patterns.

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint
```

### Test Suite

The project includes a comprehensive test suite with 466 tests across 9 test files:
- `cli.test.js` - CLI command integration tests
- `e2e.test.js` - End-to-end workflow tests
- `file-manager.test.js` - File operations, backup, restore, symlinks
- `hooks.test.js` - Hook system configuration and validation
- `init.test.js` - Template generation, hooks, skills, permissions
- `security-verification.test.js` - Security patterns and injection prevention
- `settings-merge.test.js` - Deep merge logic for updates
- `shell-scripts.test.js` - Shell script validation
- `template-engine.test.js` - Handlebars helpers and rendering

## License

MIT

## Credits

Inspired by [Oh My Opencode](https://github.com/code-yeongyu/oh-my-opencode) by [YeonGyu Kim](https://github.com/code-yeongyu).

---

*"The spice must flow" — Atreides orchestrates the flow of development*
