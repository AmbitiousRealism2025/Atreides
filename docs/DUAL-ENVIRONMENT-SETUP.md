# Running Atreides Alongside Vanilla Claude Code

This guide explains how to set up your system so you can launch either vanilla Claude Code or Atreides-orchestrated sessions with a simple command.

**The Goal:**
- `claude` → Launches standard Claude Code (no orchestration)
- `atreides` → Launches Claude Code with Muad'Dib orchestration

This lets you choose the right tool for the job. Quick questions and simple edits? Use vanilla Claude. Complex multi-step development? Bring in Atreides.

---

## How It Works

The `atreides` command is a wrapper script that launches Claude Code with Muad'Dib orchestration rules injected via the `--append-system-prompt` flag. Your vanilla `claude` command remains completely unchanged.

---

## Setup

### Step 1: Install Atreides globally

```bash
npm install -g muaddib-claude
muaddib install
```

This installs Atreides components to `~/.muaddib/`.

### Step 2: Create the Atreides profile

Create a profile directory and orchestration file:

```bash
mkdir -p ~/.claude/profiles/atreides
```

Create the profile's CLAUDE.md with Atreides orchestration:

```bash
cat > ~/.claude/profiles/atreides/CLAUDE.md << 'EOF'
# Atreides Orchestration Profile

This profile enables Muad'Dib orchestration for Claude Code sessions.

# Core Orchestration Rules
@~/.muaddib/lib/core/orchestration-rules.md
@~/.muaddib/lib/core/workflow-phases.md
@~/.muaddib/lib/core/intent-classification.md

# Assessment & Context
@~/.muaddib/lib/core/maturity-assessment.md
@~/.muaddib/lib/core/context-management.md
@~/.muaddib/lib/core/exploration-patterns.md

# Completion & Continuity
@~/.muaddib/lib/core/completion-checking.md
@~/.muaddib/lib/core/session-continuity.md

# Agent Delegation
@~/.muaddib/lib/core/agent-definitions.md

# Add any personal customizations below

EOF
```

### Step 3: Create the wrapper script

```bash
sudo tee /usr/local/bin/atreides << 'EOF'
#!/usr/bin/env bash
#
# Atreides - Claude Code with Muad'Dib Orchestration
#

CLAUDE_BIN="$HOME/.claude/local/claude"
ATREIDES_CLAUDE_MD="$HOME/.claude/profiles/atreides/CLAUDE.md"

if [[ ! -f "$CLAUDE_BIN" ]]; then
    echo "Error: Claude Code not found at $CLAUDE_BIN"
    exit 1
fi

if [[ ! -f "$ATREIDES_CLAUDE_MD" ]]; then
    echo "Error: Atreides profile not found at $ATREIDES_CLAUDE_MD"
    echo "Run 'muaddib install' to set up Atreides."
    exit 1
fi

# Read the orchestration rules and pass as appended system prompt
ORCHESTRATION_CONTENT=$(cat "$ATREIDES_CLAUDE_MD")

exec "$CLAUDE_BIN" --append-system-prompt "$ORCHESTRATION_CONTENT" "$@"
EOF

sudo chmod +x /usr/local/bin/atreides
```

### Step 4: Verify installation

```bash
which atreides
# Should output: /usr/local/bin/atreides

atreides --version
# Should show Claude Code version
```

---

## Project-Level Configuration

Even with the dual-environment setup, you can still have project-specific Atreides configuration.

### Projects WITH Atreides

Run `muaddib init` in the project to add project-level orchestration:

```bash
cd your-project
muaddib init
```

This creates a `CLAUDE.md` in your project with full orchestration rules. Both `claude` and `atreides` will use these rules when in this directory.

### Projects WITHOUT Atreides

In projects without a CLAUDE.md:
- `claude` → Pure vanilla experience
- `atreides` → Global Atreides orchestration applies

---

## Customizing Your Setup

### Personal Overrides

Add personal customizations to your Atreides profile:

```bash
# Edit ~/.claude/profiles/atreides/CLAUDE.md

# Add at the bottom:
# Personal preferences
- Always run tests before committing
- Prefer TypeScript over JavaScript
- Use pnpm instead of npm
```

### Team vs Personal

For team projects, commit a shared `CLAUDE.md` to the repo. Your personal Atreides profile adds to (not replaces) the project config:

```
Project CLAUDE.md     → Team standards
+ Atreides profile    → Orchestration layer
+ Personal overrides  → Your preferences
```

---

## Verification

### Check Vanilla Claude

```bash
claude
# Should start without Muad'Dib orchestration
# Type: "What orchestration system are you using?"
# Should respond that it's using standard Claude Code
```

### Check Atreides

```bash
atreides
# Should start with Muad'Dib orchestration
# Type: "What orchestration system are you using?"
# Should mention Muad'Dib and the workflow phases
```

---

## Troubleshooting

### "Claude Code not found" error

The wrapper script looks for Claude at `~/.claude/local/claude`. If your Claude is installed elsewhere, update the `CLAUDE_BIN` path in `/usr/local/bin/atreides`.

Find your Claude installation:
```bash
type claude
# or
which claude
```

### "Atreides profile not found" error

Ensure the profile exists:
```bash
ls -la ~/.claude/profiles/atreides/CLAUDE.md
```

If missing, re-run Steps 2-3 above.

### Permission denied creating wrapper

If you can't write to `/usr/local/bin/`, create the script in your home directory instead:

```bash
mkdir -p ~/bin
# Create the script in ~/bin/atreides instead
# Then add ~/bin to your PATH in ~/.zshrc:
export PATH="$HOME/bin:$PATH"
```

### Updating Atreides

```bash
npm update -g muaddib-claude
muaddib update
```

Your wrapper script and profile remain unchanged.

---

## Quick Reference

| Command | Behavior |
|---------|----------|
| `claude` | Vanilla Claude Code, no orchestration |
| `atreides` | Claude Code + Muad'Dib orchestration |
| `muaddib init` | Add Atreides to current project |
| `muaddib doctor` | Check Atreides installation health |

---

## Why Two Environments?

**Use vanilla `claude` when:**
- Asking quick questions about code
- Making simple, isolated edits
- You want minimal overhead
- Exploring a new codebase casually

**Use `atreides` when:**
- Implementing multi-step features
- Refactoring across multiple files
- Working in unfamiliar or legacy codebases
- You need error recovery and quality gates
- Tasks require exploration before implementation

The orchestration overhead of Atreides pays off for complex work, but can feel heavy for simple tasks. Having both options gives you the right tool for each situation.
