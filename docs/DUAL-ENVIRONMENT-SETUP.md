# Running Atreides Alongside Vanilla Claude Code

This guide explains how to set up your system so you can launch either vanilla Claude Code or Atreides-orchestrated sessions with a simple command.

**The Goal:**
- `claude` → Launches standard Claude Code (no orchestration)
- `atreides` → Launches Claude Code with Muad'Dib orchestration

This lets you choose the right tool for the job. Quick questions and simple edits? Use vanilla Claude. Complex multi-step development? Bring in Atreides.

---

## How It Works

Claude Code reads instructions from `CLAUDE.md` files in two locations:
1. **Global**: `~/.claude/CLAUDE.md` (applies to all sessions)
2. **Project**: `./CLAUDE.md` in your current directory (project-specific)

The trick is to keep your global `~/.claude/CLAUDE.md` empty (or minimal) for vanilla sessions, and have the `atreides` command inject Atreides orchestration via a profile or environment configuration.

---

## Setup Options

### Option 1: Shell Alias with Profile (Recommended)

Claude Code supports profiles that can load different configurations. Create an Atreides profile and alias.

**Step 1: Install Atreides globally**

```bash
npm install -g muaddib-claude
muaddib install
```

This installs Atreides components to `~/.muaddib/`.

**Step 2: Create the Atreides profile**

Create a profile directory:

```bash
mkdir -p ~/.claude/profiles/atreides
```

Create the profile's CLAUDE.md with Atreides orchestration:

```bash
cat > ~/.claude/profiles/atreides/CLAUDE.md << 'EOF'
# Atreides Orchestration Profile

@~/.muaddib/lib/CLAUDE.md

# Add any personal customizations below
EOF
```

**Step 3: Add the shell alias**

Add to your shell configuration (`~/.bashrc`, `~/.zshrc`, or `~/.config/fish/config.fish`):

**Bash/Zsh:**
```bash
# Vanilla Claude Code (default)
alias claude='claude'

# Atreides-orchestrated Claude Code
alias atreides='claude --profile atreides'
```

**Fish:**
```fish
# Atreides-orchestrated Claude Code
alias atreides 'claude --profile atreides'
```

**Step 4: Reload your shell**

```bash
source ~/.zshrc  # or ~/.bashrc
```

---

### Option 2: Wrapper Script (More Control)

If you need more control over the environment, use a wrapper script.

**Step 1: Create the wrapper script**

```bash
sudo tee /usr/local/bin/atreides << 'EOF'
#!/usr/bin/env bash
#
# Atreides - Claude Code with Muad'Dib Orchestration
#
# This wrapper launches Claude Code with Atreides orchestration enabled.
# Your vanilla 'claude' command remains unchanged.
#

set -e

# Atreides installation directory
ATREIDES_HOME="${ATREIDES_HOME:-$HOME/.muaddib}"

# Verify Atreides is installed
if [[ ! -d "$ATREIDES_HOME" ]]; then
    echo "Error: Atreides not found at $ATREIDES_HOME"
    echo "Run 'npm install -g muaddib-claude && muaddib install' first."
    exit 1
fi

# Launch Claude Code with Atreides profile
exec claude --profile atreides "$@"
EOF

sudo chmod +x /usr/local/bin/atreides
```

**Step 2: Verify installation**

```bash
which atreides
# Should output: /usr/local/bin/atreides

atreides --help
# Should show Claude Code help
```

---

### Option 3: Environment Variable Toggle

For users who want a single command with a toggle:

**Add to your shell config:**

```bash
# Toggle Atreides orchestration with environment variable
claude-env() {
    if [[ "$1" == "--atreides" ]] || [[ "$1" == "-a" ]]; then
        shift
        claude --profile atreides "$@"
    else
        claude "$@"
    fi
}

alias cc='claude-env'
```

**Usage:**
```bash
cc                    # Vanilla Claude Code
cc --atreides         # With Atreides orchestration
cc -a                 # Shorthand for Atreides
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

Now both `claude` and `atreides` will use project-level orchestration in this directory (the project CLAUDE.md takes precedence).

### Projects WITHOUT Atreides

In projects without a CLAUDE.md:
- `claude` → Pure vanilla experience
- `atreides` → Global Atreides orchestration applies

---

## Customizing Your Setup

### Personal Overrides

Add personal customizations that apply only to your Atreides sessions:

```bash
# ~/.claude/profiles/atreides/CLAUDE.md

@~/.muaddib/lib/CLAUDE.md

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
# Should start without Muad'Dib orchestration messages
# Type: "What orchestration system are you using?"
# Should respond that it's using standard Claude Code
```

### Check Atreides

```bash
atreides
# Should start with Muad'Dib orchestration
# Type: "What orchestration system are you using?"
# Should mention Muad'Dib and Atreides
```

---

## Troubleshooting

### "Profile not found" error

Ensure the profile directory exists:
```bash
ls -la ~/.claude/profiles/atreides/
```

### Atreides not applying in project

Check the load order:
```bash
# In an atreides session, ask:
"Show me what CLAUDE.md files are loaded"
```

### Alias not working after shell restart

Ensure your alias is in the correct shell config file:
- **Zsh**: `~/.zshrc`
- **Bash**: `~/.bashrc` or `~/.bash_profile`
- **Fish**: `~/.config/fish/config.fish`

### Updating Atreides

```bash
npm update -g muaddib-claude
muaddib update
```

Your profile and aliases remain unchanged.

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
