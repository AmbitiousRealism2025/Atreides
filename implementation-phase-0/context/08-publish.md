# Context: Documentation and Publish (Tasks 8.1 - 8.2)

## Task Group Overview

This context covers final documentation and npm publication:
- Task 8.1: Write README documentation
- Task 8.2: Prepare for npm publish

---

## Task 8.1: Write README Documentation

### README Structure

The README should be comprehensive yet scannable. Include:

1. Hero section (name, tagline, badges)
2. Quick start
3. Installation
4. Usage
5. Configuration
6. Commands reference
7. Troubleshooting
8. Contributing
9. License

---

### Complete README.md

```markdown
# muaddib-claude

[![npm version](https://badge.fury.io/js/muaddib-claude.svg)](https://www.npmjs.com/package/muaddib-claude)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**OmO-style orchestration for Claude Code** - Systematic workflows, intelligent agent delegation, and robust error recovery.

Muad'Dib brings the powerful orchestration patterns from [Oh My OpenCode (OmO)](https://github.com/anthropics/oh-my-opencode) to Claude Code, enabling:

- 🎯 **Intent Classification** - Automatically categorize requests for optimal handling
- 🤖 **Intelligent Agent Delegation** - Route tasks to specialized agents (Explore, Plan, etc.)
- 🔄 **3-Strikes Error Recovery** - Robust failure handling with automatic rollback
- 📋 **Systematic Task Management** - TodoWrite integration for multi-step operations
- 🛡️ **Quality Automation** - Pre/post hooks for formatting, linting, and validation

## Quick Start

```bash
# Install globally
npm install -g muaddib-claude

# Initialize in your project
cd your-project
muaddib init

# That's it! Start Claude Code and enjoy structured orchestration
```

## Installation

### Prerequisites

- Node.js 18 or higher
- Claude Code CLI installed

### Global Installation

```bash
npm install -g muaddib-claude
```

After installation, run:

```bash
muaddib install
```

This creates the global Muad'Dib directory at `~/.muaddib/` with:
- Template files for project initialization
- Helper scripts for hooks
- Core orchestration documentation
- Claude Code skill definition

### Verify Installation

```bash
muaddib doctor
```

## Usage

### Initialize a Project

Navigate to your project directory and run:

```bash
muaddib init
```

You'll be prompted for:
- **Project name** - Used in generated documentation
- **Project type** - Node.js, Python, Go, Rust, or Other
- **Codebase maturity** - Affects orchestration strictness
- **Strict mode** - Enables additional guardrails

### Initialization Options

```bash
# Accept all defaults (non-interactive)
muaddib init --yes

# Minimal setup (CLAUDE.md only)
muaddib init --minimal

# Full setup with hook scripts
muaddib init --full

# Overwrite existing files
muaddib init --force
```

### Generated Files

After initialization, your project will have:

```
your-project/
├── CLAUDE.md              # Orchestration rules for Claude Code
├── .claude/
│   ├── settings.json      # Hooks and permissions
│   ├── context.md         # Session context
│   └── critical-context.md # Preserved during compaction
└── .muaddib/
    ├── config.json        # Project configuration
    └── state/             # Session state
```

## Configuration

### Project Configuration

Located in `.muaddib/config.json`:

```json
{
  "projectName": "my-project",
  "projectType": "node",
  "maturity": "transitional",
  "strictMode": false,
  "muaddibVersion": "1.0.0"
}
```

### Maturity Levels

| Level | Description | Orchestration Behavior |
|-------|-------------|----------------------|
| `disciplined` | Consistent patterns, good tests | Follow existing patterns EXACTLY |
| `transitional` | Mix of old/new patterns | Gradual migration approach |
| `legacy` | Technical debt, few tests | Propose cleanups when relevant |
| `greenfield` | New project | Establish best practices |

### Strict Mode

When enabled, strict mode adds:
- Require tests for all changes
- Enhanced validation on every edit
- Conservative change approach
- Explicit confirmation for destructive operations

## Commands Reference

### `muaddib install`

Install or repair global Muad'Dib components.

```bash
muaddib install           # Standard installation
muaddib install --force   # Force reinstall
muaddib install --no-skills # Skip skill symlink
```

### `muaddib init`

Initialize Muad'Dib in the current project.

```bash
muaddib init              # Interactive setup
muaddib init --yes        # Accept defaults
muaddib init --minimal    # CLAUDE.md only
muaddib init --full       # Include all scripts
muaddib init --force      # Overwrite existing
```

### `muaddib update`

Update Muad'Dib components.

```bash
muaddib update            # Update global components
muaddib update --project  # Update current project
muaddib update --no-backup # Skip backup creation
```

### `muaddib doctor`

Check installation health.

```bash
muaddib doctor            # Run health checks
muaddib doctor --verbose  # Detailed output
muaddib doctor --fix      # Attempt repairs
```

### `muaddib config`

View or modify configuration.

```bash
muaddib config --list     # Show all config
muaddib config key        # Get specific value
muaddib config key value  # Set value
```

### `muaddib reset`

Reset project to default state.

```bash
muaddib reset             # Interactive reset
muaddib reset --yes       # Skip confirmation
muaddib reset --hard      # Reset all files
```

## How It Works

### Workflow Phases

Muad'Dib implements a structured workflow:

```
Phase 0: Intent Gate
├── Classify request (Trivial/Explicit/Exploratory/Ambiguous)
└── Ask for clarification if needed

Phase 1: Codebase Assessment
├── Evaluate maturity level
├── Identify patterns
└── Understand dependencies

Phase 2A: Exploration
├── Launch parallel search agents
└── Gather necessary context

Phase 2B: Implementation
├── Create TodoWrite items
├── Execute with quality checks
└── Delegate specialized work

Phase 2C: Failure Recovery (if needed)
└── STOP → REVERT → DOCUMENT → CONSULT → ESCALATE

Phase 3: Completion
├── Verify all todos complete
├── Run quality checks
└── Summarize accomplishments
```

### 3-Strikes Error Recovery

After 3 consecutive failures on the same operation:

1. **STOP** - Halt all modifications
2. **REVERT** - Return to last working state
3. **DOCUMENT** - Record failure details
4. **CONSULT** - Ask Task(Plan, opus) for guidance
5. **ESCALATE** - Ask user for help if still stuck

### Agent Delegation

Tasks are routed to specialized agents:

| Agent | Use For |
|-------|---------|
| Explore | Codebase navigation, file search |
| Plan | Architecture decisions, complex analysis |
| security-engineer | Vulnerability assessment |
| performance-engineer | Optimization |
| frontend-architect | UI/UX work |
| backend-architect | API design |

## Troubleshooting

### "Muad'Dib is not installed globally"

Run:
```bash
muaddib install
```

### "Command not found: muaddib"

Ensure npm global bin is in your PATH:
```bash
export PATH="$PATH:$(npm config get prefix)/bin"
```

### Scripts not executing

Verify scripts are executable:
```bash
muaddib doctor --fix
```

### Hooks not working

Check `.claude/settings.json` is valid JSON:
```bash
cat .claude/settings.json | python3 -m json.tool
```

### Config merge issues

Run doctor to diagnose:
```bash
muaddib doctor --verbose
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

### Development Setup

```bash
git clone https://github.com/yourusername/muaddib-claude.git
cd muaddib-claude
npm install
npm link  # Make 'muaddib' command available
```

### Running Tests

```bash
npm test
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Muad'Dib is inspired by the orchestration patterns in [Oh My OpenCode (OmO)](https://github.com/anthropics/oh-my-opencode), adapted for Claude Code's capabilities.

The name "Muad'Dib" is a reference to Frank Herbert's *Dune*, symbolizing wisdom and guidance in navigating complex systems.

---

Made with ❤️ for the Claude Code community
```

---

## Task 8.2: Prepare for NPM Publish

### Pre-Publish Checklist

1. **Version Check**
   ```bash
   # Ensure version in package.json is correct
   grep '"version"' package.json
   ```

2. **Files Included**
   ```bash
   # Check what will be published
   npm pack --dry-run
   ```

3. **Test Installation**
   ```bash
   # Create tarball
   npm pack

   # Install in test directory
   mkdir /tmp/test-install
   cd /tmp/test-install
   npm install /path/to/muaddib-claude-1.0.0.tgz

   # Test commands
   ./node_modules/.bin/muaddib --version
   ```

4. **Verify npm Account**
   ```bash
   npm whoami
   ```

### .npmignore

```
# Development files
tests/
coverage/
.github/
.eslintrc.json
jest.config.js

# Documentation sources
docs/
*.md
!README.md
!LICENSE

# Build artifacts
*.log
*.tgz

# Git
.git/
.gitignore

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Environment
.env
.env.*
```

### Package.json Final Check

```json
{
  "name": "muaddib-claude",
  "version": "1.0.0",
  "description": "OmO-style orchestration for Claude Code - systematic workflows, intelligent agent delegation, and robust error recovery",
  "keywords": [
    "claude",
    "claude-code",
    "ai",
    "orchestration",
    "omo",
    "opencode",
    "ai-assistant",
    "developer-tools",
    "cli"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/muaddib-claude.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/muaddib-claude/issues"
  },
  "homepage": "https://github.com/yourusername/muaddib-claude#readme"
}
```

### Publish Steps

```bash
# 1. Login to npm
npm login

# 2. Verify package contents
npm pack --dry-run

# 3. Publish (first time)
npm publish

# 4. Verify on npm
open https://www.npmjs.com/package/muaddib-claude
```

### Post-Publish Verification

```bash
# 1. Install from npm
npm install -g muaddib-claude

# 2. Verify installation
muaddib --version

# 3. Test init
mkdir /tmp/test-project
cd /tmp/test-project
muaddib init --yes

# 4. Verify files
ls -la CLAUDE.md .claude/ .muaddib/
```

### Version Management

For updates:

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major

# Publish update
npm publish
```

---

## Acceptance Criteria

### Task 8.1 (README)
- [ ] Hero section with badges
- [ ] Quick start (3 commands)
- [ ] Complete installation guide
- [ ] All commands documented
- [ ] Configuration explained
- [ ] Troubleshooting section
- [ ] Contributing guidelines
- [ ] License information

### Task 8.2 (npm publish)
- [ ] .npmignore configured
- [ ] package.json metadata complete
- [ ] npm pack produces clean tarball
- [ ] Test installation works
- [ ] npm publish succeeds
- [ ] Package visible on npmjs.com
- [ ] Global install works

---

*Context for Tasks 8.1, 8.2*
