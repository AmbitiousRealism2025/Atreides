# Context: Settings and Structure (Tasks 2.1 - 2.2)

## Task Group Overview

This context covers creating the settings and directory structure:
- Task 2.1: Create Directory Structure Template
- Task 2.2: Create settings.json Template Content

---

## Task 2.1: Directory Structure Template

### Purpose

Define the project structure that `muaddib init` creates, documenting each file and directory's purpose.

### Content Template

```markdown
## Project Structure

After running `muaddib init`, your project will have:

```
project-root/
├── CLAUDE.md                    # Orchestration rules (main configuration)
├── .claude/
│   ├── settings.json            # Hooks and permissions
│   ├── context.md               # Session context (optional)
│   └── critical-context.md      # Preserved during compaction
└── .muaddib/
    ├── config.json              # Project configuration
    └── state/                   # Session state directory
```

### File Purposes

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Main orchestration rules - loaded at session start |
| `.claude/settings.json` | Hook configurations and permission rules |
| `.claude/context.md` | Project context injected at session start |
| `.claude/critical-context.md` | Context preserved during compaction |
| `.muaddib/config.json` | Project-specific Muad'Dib configuration |
| `.muaddib/state/` | Session state, checkpoints, logs |

### Directory Purposes

| Directory | Purpose |
|-----------|---------|
| `.claude/` | Claude Code configuration directory |
| `.muaddib/` | Muad'Dib-specific files |
| `.muaddib/state/` | Persistent state across sessions |
```

### Minimal vs Full Installation

```markdown
### Installation Modes

**Minimal (`muaddib init --minimal`)**:
```
project-root/
└── CLAUDE.md
```

**Standard (`muaddib init`)**:
```
project-root/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── context.md
│   └── critical-context.md
└── .muaddib/
    ├── config.json
    └── state/
```

**Full (`muaddib init --full`)**:
```
project-root/
├── CLAUDE.md
├── .claude/
│   ├── settings.json
│   ├── context.md
│   ├── critical-context.md
│   └── scripts/
│       ├── validate-bash-command.sh
│       ├── pre-edit-check.sh
│       ├── post-edit-log.sh
│       ├── error-detector.sh
│       └── notify-idle.sh
└── .muaddib/
    ├── config.json
    └── state/
```
```

---

## Task 2.2: settings.json Template Content

### Purpose

Define the base settings.json that controls hooks and permissions.

### Phase 1 Content (Basic)

For Phase 1, we keep hooks minimal and focus on permissions.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'File modified: $FILE'"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(which:*)",
      "Bash(pwd:*)",
      "Bash(echo:*)"
    ],
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(rm -rf ~:*)",
      "Bash(rm -rf $HOME:*)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(chmod 777:*)",
      "Bash(sudo:*)",
      "Bash(su:*)",
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/**)",
      "Read(**/.git/config)",
      "Write(.env)",
      "Write(.env.*)",
      "Write(**/secrets/**)"
    ]
  }
}
```

### Permission Categories

#### Safe Operations (Allow)

| Pattern | Purpose |
|---------|---------|
| `Bash(git:*)` | All git operations |
| `Bash(npm:*)` | Package management |
| `Bash(npx:*)` | Package execution |
| `Bash(node:*)` | Node.js execution |
| `Bash(ls:*)` | Directory listing |
| `Bash(cat:*)` | File reading |
| `Bash(grep:*)` | Text searching |
| `Bash(find:*)` | File finding |

#### Dangerous Operations (Deny)

| Pattern | Risk |
|---------|------|
| `Bash(rm -rf /*:*)` | System destruction |
| `Bash(rm -rf ~:*)` | Home directory deletion |
| `Bash(curl:*)` | Arbitrary downloads |
| `Bash(wget:*)` | Arbitrary downloads |
| `Bash(sudo:*)` | Privilege escalation |
| `Read(.env)` | Secret exposure |
| `Read(**/secrets/**)` | Secret exposure |

### Project Type Variations

The settings.json should vary based on project type:

#### Node.js Projects
```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(yarn:*)",
      "Bash(pnpm:*)"
    ]
  }
}
```

#### Python Projects
```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(pip:*)",
      "Bash(pip3:*)",
      "Bash(pytest:*)",
      "Bash(poetry:*)"
    ]
  }
}
```

#### Go Projects
```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(go:*)",
      "Bash(make:*)"
    ]
  }
}
```

#### Rust Projects
```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(cargo:*)",
      "Bash(rustc:*)",
      "Bash(rustfmt:*)"
    ]
  }
}
```

### Handlebars Template

```handlebars
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
{{#if (eq projectType "node")}}
          {"type": "command", "command": "npx prettier --write \"$FILE\" 2>/dev/null || true"},
          {"type": "command", "command": "npx eslint --fix \"$FILE\" 2>/dev/null || true"}
{{else if (eq projectType "python")}}
          {"type": "command", "command": "black \"$FILE\" 2>/dev/null || true"},
          {"type": "command", "command": "ruff check --fix \"$FILE\" 2>/dev/null || true"}
{{else if (eq projectType "go")}}
          {"type": "command", "command": "gofmt -w \"$FILE\" 2>/dev/null || true"}
{{else if (eq projectType "rust")}}
          {"type": "command", "command": "rustfmt \"$FILE\" 2>/dev/null || true"}
{{else}}
          {"type": "command", "command": "echo 'Edited: $FILE'"}
{{/if}}
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
{{#if (eq projectType "node")}}
      "Bash(git:*)",
      "Bash(npm:*)",
      "Bash(npx:*)",
      "Bash(node:*)",
      "Bash(yarn:*)",
      "Bash(pnpm:*)"
{{else if (eq projectType "python")}}
      "Bash(git:*)",
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(pip:*)",
      "Bash(pytest:*)"
{{else if (eq projectType "go")}}
      "Bash(git:*)",
      "Bash(go:*)",
      "Bash(make:*)"
{{else if (eq projectType "rust")}}
      "Bash(git:*)",
      "Bash(cargo:*)",
      "Bash(rustc:*)"
{{else}}
      "Bash(git:*)",
      "Bash(ls:*)",
      "Bash(cat:*)"
{{/if}}
    ],
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(rm -rf ~:*)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(sudo:*)",
      "Read(.env*)",
      "Read(**/secrets/**)",
      "Write(.env*)",
      "Write(**/secrets/**)"
    ]
  }
}
```

---

## Context Files

### context.md Template

```markdown
# Project Context - {{projectName}}

*Auto-injected at session start*

## Project Overview

[Brief description of project]

## Current State

- **Phase**: [Development/Testing/Production]
- **Active Work**: [Current focus]

## Key Patterns

[Document important patterns to follow]

## Recent Decisions

- [Date]: [Decision]

---

*Update this file to maintain session context*
```

### critical-context.md Template

```markdown
# Critical Context - {{projectName}}

*Preserved during context compaction*

## Never Forget

- This project uses Muad'Dib orchestration
- Follow existing code conventions
- Run quality checks after edits
{{#if strictMode}}
- STRICT MODE: All changes require tests
{{/if}}

## Current Objectives

[What we're working on]

## Key Files

[Important paths]

---

*Keep concise - only critical information*
```

### config.json Template

```json
{
  "projectName": "{{projectName}}",
  "projectType": "{{projectType}}",
  "maturity": "{{maturity}}",
  "strictMode": {{strictMode}},
  "muaddibVersion": "{{version}}",
  "initialized": "{{timestamp}}"
}
```

---

## Acceptance Criteria

### Task 2.1 (Directory Structure)
- [ ] Structure diagram complete
- [ ] All files documented
- [ ] Minimal/standard/full modes shown
- [ ] Purposes clearly explained

### Task 2.2 (settings.json)
- [ ] Valid JSON structure
- [ ] Hooks placeholder present
- [ ] Allow list comprehensive
- [ ] Deny list blocks dangerous ops
- [ ] Project type variations documented
- [ ] Handlebars template ready

---

*Context for Tasks 2.1, 2.2*
