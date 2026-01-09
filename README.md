# Muad'Dib

OmO-style orchestration for Claude Code - systematic workflows, intelligent agent delegation, and robust error recovery.

## Features

- **Systematic Workflows** - Phase-based approach to task execution
- **Intelligent Delegation** - Use the right agent and model for each task
- **Robust Error Recovery** - 3-strikes rule with graceful escalation
- **Context Preservation** - Maintain state across sessions and compaction
- **Project Templates** - Quick initialization with best practices
- **Quality Guardrails** - Comprehensive permission controls and quality checks

## Installation

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

## Generated Files

After `muaddib init`, your project will have:

```
your-project/
├── CLAUDE.md              # Orchestration rules (~570 lines)
├── .claude/
│   ├── settings.json      # Hooks and permissions
│   ├── context.md         # Session context
│   └── critical-context.md # Compaction-safe context
└── .muaddib/
    └── config.json        # Project configuration
```

## Orchestration Phases

### Phase 0: Intent Gate
Classify requests as Trivial, Explicit, Exploratory, Open-ended, or Ambiguous.

### Phase 1: Assessment
Evaluate codebase maturity for complex tasks (greenfield/transitional/mature/legacy).

### Phase 2A: Exploration
Gather context through parallel investigation with Explore agents.

### Phase 2B: Implementation
Execute work with TodoWrite tracking and quality checks.

### Phase 2C: Recovery
Handle failures with 3-strikes protocol (see below).

### Phase 3: Completion
Verify deliverables, run quality checks, and summarize accomplishments.

## 3-Strikes Error Recovery

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

- **sonnet**: Quick searches, simple lookups, single-file operations
- **opus**: Implementation, code review, multi-file changes, architecture, complex debugging

## Quality Standards

Before marking any task complete:

1. Save all files
2. Run formatter (prettier, black, gofmt, rustfmt)
3. Run linter (eslint, ruff, golint, clippy)
4. Run type checker (tsc, mypy, go vet)
5. Run tests (jest, pytest, go test, cargo test)
6. Verify no regressions

## Security

### Allowed Operations
- Git commands
- Package managers (npm, pip, cargo, go)
- Build tools and test runners
- Common utilities (ls, cat, grep, find)

### Blocked Operations
- Destructive commands (rm -rf /, sudo)
- Remote code execution (curl | sh)
- Secret file access (.env, credentials, .ssh, .aws)
- Dangerous permissions (chmod 777)

## Configuration

### Global Configuration
Located at `~/.muaddib/config.json`

### Project Configuration
Located at `.muaddib/config.json`

Project config overrides global config with smart merging.

## Requirements

- Node.js 18+
- Claude Code CLI

## License

MIT

## Credits

Inspired by OmO (OpenCode Multi-agent Orchestration) framework.

---

*"The spice must flow" - Muad'Dib orchestrates the flow of development*
