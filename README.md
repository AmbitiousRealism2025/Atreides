# Muad'Dib

OmO-style orchestration for Claude Code - systematic workflows, intelligent agent delegation, and robust error recovery.

## Features

- **Systematic Workflows** - Phase-based approach to task execution
- **Intelligent Delegation** - Use the right agent and model for each task
- **Robust Error Recovery** - 3-strikes rule with graceful escalation
- **Context Preservation** - Maintain state across sessions and compaction
- **Project Templates** - Quick initialization with best practices

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
- Project name and type
- Orchestration level (minimal/standard/full)
- Hook preferences

### 3. Start Using Claude Code

Your project now has Muad'Dib orchestration! Claude Code will automatically:
- Follow systematic workflow phases
- Use TodoWrite for multi-step tasks
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
├── CLAUDE.md              # Orchestration rules
├── .claude/
│   ├── settings.json      # Hooks and permissions
│   ├── context.md         # Session context
│   └── critical-context.md # Compaction-safe context
└── .muaddib/
    └── config.json        # Project configuration
```

## Orchestration Phases

### Phase 0: Intent Gate
Classify requests as Trivial, Explicit, Exploratory, or Open-ended.

### Phase 1: Assessment
Evaluate codebase for complex tasks.

### Phase 2A: Exploration
Gather context through parallel investigation.

### Phase 2B: Implementation
Execute work with TodoWrite tracking.

### Phase 2C: Recovery
Handle failures with 3-strikes protocol.

### Phase 3: Completion
Verify and deliver results.

## Agent Delegation

| Agent | Model | Use For |
|-------|-------|---------|
| Explore | haiku | File searches, structure analysis |
| general-purpose | haiku | Research, documentation |
| Plan | opus | Architecture, complex design |
| security-engineer | sonnet | Security review |
| performance-engineer | sonnet | Optimization |

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
