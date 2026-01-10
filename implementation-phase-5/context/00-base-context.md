# Phase 5 Base Context (Always Loaded)

## Phase Overview

Phase 5: Difficult Feature Adaptations represents the final push toward maximum OmO parity, implementing high-effort features that significantly enhance capability.

**Target**: 75-80% OmO feature parity

---

## Features in This Phase

### 1. LSP MCP Integration

**Goal**: Provide semantic code operations (go-to-definition, find-references, rename)

**OmO Equivalent**: OmO has 11 built-in LSP operations
**Claude Code Approach**: MCP server or CLI alternatives

### 2. AST-grep CLI Integration

**Goal**: Structural code search and replace across 25+ languages

**OmO Equivalent**: Native ast-grep integration
**Claude Code Approach**: CLI wrapper via Bash

### 3. Advanced Context Preservation

**Goal**: Maintain state across long sessions and risky operations

**OmO Equivalent**: DCP with configurable thresholds
**Claude Code Approach**: Checkpoint files + manual triggers

### 4. Extended Automation Patterns

**Goal**: Document advanced workflows for complex tasks

**OmO Equivalent**: Built-in workflow patterns
**Claude Code Approach**: CLAUDE.md documentation

---

## Why These Features Are "Difficult"

| Feature | Difficulty Source |
|---------|------------------|
| LSP | Requires MCP server or CLI workarounds |
| AST-grep | External tool dependency |
| Context | No DCP control, manual preservation |
| Automation | No built-in workflow engine |

---

## Integration with Previous Phases

Phase 5 builds on:

- **Phase 1-2**: Core CLAUDE.md, delegation, model selection
- **Phase 3**: Workflow phases, completion checking
- **Phase 4**: Hooks, scripts, permissions, context files

Extends:
- Semantic operations (LSP/AST for refactoring)
- Context preservation (checkpoint system)
- Workflow automation (advanced patterns)

---

## Key Concepts

### LSP (Language Server Protocol)

Protocol for editor-language communication:
- **Hover**: Type information at cursor
- **Definition**: Go to symbol definition
- **References**: Find all usages
- **Rename**: Safe symbol renaming
- **Diagnostics**: Errors and warnings

### AST (Abstract Syntax Tree)

Structural representation of code:
- **Parsing**: Code → Tree structure
- **Pattern matching**: Find code patterns
- **Transformation**: Modify code structurally
- **Language-agnostic**: Works across 25+ languages

### Checkpointing

Snapshot of current state:
- **When**: Before risky operations, periodically
- **What**: Objective, files, decisions, next steps
- **Why**: Survive context loss, enable recovery

---

## MCP Server Context

### What is MCP?

Model Context Protocol - allows Claude to connect to external tools.

### LSP via MCP

Some MCP servers provide LSP capabilities:
```json
{
  "mcpServers": {
    "lsp-server": {
      "command": "npx",
      "args": ["@some/lsp-mcp-server"]
    }
  }
}
```

### Fallback Strategy

If no MCP server available, use CLI tools:
- `tsc --noEmit` for TypeScript
- `mypy` or `pyright` for Python
- `go vet` for Go
- `cargo check` for Rust

---

## AST-grep Overview

### What is ast-grep?

Structural code search/replace tool:
- Understands code syntax (not just text)
- Pattern-based matching
- Safe transformations
- 25+ language support

### Installation

```bash
# npm
npm install -g @ast-grep/cli

# cargo
cargo install ast-grep

# homebrew
brew install ast-grep
```

### Basic Usage

```bash
# Search
ast-grep --pattern '$PATTERN' --lang typescript src/

# Replace
ast-grep --pattern '$OLD' --rewrite '$NEW' --lang typescript src/
```

---

## Checkpoint System Overview

### Purpose

Preserve state for:
- Long-running tasks
- Risky operations
- Session recovery

### Checkpoint File

`.claude/checkpoint.md`:
- Current objective
- Files being modified
- Decisions made
- Next steps
- Recovery instructions

### Triggers

- Before multi-file refactoring
- Before architectural changes
- Every 30 minutes of active work
- Before risky operations

---

## Automation Patterns Overview

### What Are Automation Patterns?

Structured workflows for complex tasks:
1. **Test-Driven**: Write test → fail → implement → pass
2. **Parallel+Sequential**: Explore in parallel → implement sequentially
3. **Incremental Refactoring**: File by file with validation
4. **Documentation Sync**: Update docs after implementation

### Why Document Patterns?

- No built-in workflow engine
- CLAUDE.md-based guidance
- Consistent approach across sessions

---

## Success Criteria for Phase 5

| Criterion | Measurement |
|-----------|-------------|
| LSP operational | Can find references, go to definition |
| AST-grep working | Can search and replace patterns |
| Checkpoints functional | Can recover from interruption |
| Patterns documented | 4 patterns in CLAUDE.md |
| Integration tests pass | All 4 tests successful |
| ~75-80% parity | Feature comparison audit |

---

## Known Limitations (Even After Phase 5)

These cannot be achieved:

1. **Dynamic MCP spawning**: All servers pre-configured
2. **Multi-provider**: Single provider (Anthropic)
3. **DCP control**: No threshold configuration
4. **Agent demotion**: No automatic fallback
5. **Full hook coverage**: 8 vs 31 events

---

## File Structure After Phase 5

```
project-root/
├── CLAUDE.md                    # Complete orchestration document
├── .claude/
│   ├── settings.json            # Full hook + permission config
│   ├── context.md               # Session context
│   ├── critical-context.md      # Compaction-safe context
│   ├── checkpoint.md            # Session checkpoint
│   ├── edit-log.txt             # Edit history
│   ├── error-log.txt            # Error history
│   └── scripts/                 # Helper scripts
│       ├── validate-bash-command.sh
│       ├── pre-edit-check.sh
│       ├── post-edit-log.sh
│       ├── error-detector.sh
│       └── notify-idle.sh
└── .muaddib/
    ├── config.json              # Project config
    └── state/                   # Session state
```

---

*Base context for all Phase 5 tasks*
