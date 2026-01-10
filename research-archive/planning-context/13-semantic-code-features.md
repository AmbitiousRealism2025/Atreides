# OmO Semantic Code Features and LSP Integration

## Executive Summary

OmO provides deep semantic code understanding through Language Server Protocol (LSP) integration with 11 specialized operations, plus structural code manipulation via AST-Grep tools supporting 25 programming languages.

---

## 1. LSP Integration

### How LSP Works in OmO
- OmO interfaces with external language servers (e.g., `pyright`, `gopls`, `typescript-language-server`)
- Language servers connected via MCP protocol
- Provides real-time type checking, navigation, and refactoring

### Enabled Capabilities
- Type information and documentation
- Symbol navigation across workspace
- Safe refactoring operations
- Pre-build error detection
- Code intelligence features

---

## 2. Complete LSP Operations (11 Tools)

### Navigation Tools

| Tool | Purpose | Use Case |
|------|---------|----------|
| `lsp_hover` | Type info, signatures, documentation | Understand what a symbol does |
| `lsp_goto_definition` | Locate where symbol is defined | Jump to implementation |
| `lsp_find_references` | Find all workspace usages | Impact analysis before changes |

### Symbol Tools

| Tool | Purpose | Use Case |
|------|---------|----------|
| `lsp_document_symbols` | File outline/structure | Understand file organization |
| `lsp_workspace_symbols` | Fuzzy project-wide symbol search | Find symbols across codebase |

### Diagnostics

| Tool | Purpose | Use Case |
|------|---------|----------|
| `lsp_diagnostics` | Pre-build errors, warnings, hints | Quality validation before execution |

### Refactoring Tools

| Tool | Purpose | Use Case |
|------|---------|----------|
| `lsp_prepare_rename` | Validate rename safety | Check before renaming |
| `lsp_rename` | Workspace-wide symbol renaming | Safe, semantic rename |

### Code Actions

| Tool | Purpose | Use Case |
|------|---------|----------|
| `lsp_code_actions` | IDE-style quick fixes | Auto-fix common issues |
| `lsp_code_action_resolve` | Apply specific quick fix | Execute the fix |

### Server Management

| Tool | Purpose | Use Case |
|------|---------|----------|
| `lsp_servers` | List active language servers | Check available languages |

---

## 3. AST-Grep Tools (Structural Code Operations)

### Available Tools

| Tool | Purpose |
|------|---------|
| `ast_grep_search` | Structural code pattern matching |
| `ast_grep_replace` | Structural code transformations |

### Language Support
- **25 programming languages** supported
- Pattern-based matching using AST nodes
- Language-agnostic structural queries

### Capabilities
- Find code by structure, not just text
- Refactor patterns across files
- Language-aware transformations

### Dry Run Requirement
- `ast_grep_replace` requires **dry run** preview
- Shows changes before applying
- Prevents unintended modifications

---

## 4. Code Intelligence Features

### Type Information
- Hover over symbols for type signatures
- Function parameter documentation
- Return type information

### Navigation
- Go to definition (even across files)
- Find all references
- Symbol hierarchy exploration

### Diagnostics
- Real-time error detection
- Warning identification
- Hint suggestions
- Pre-build validation

### Refactoring Support
- Safe rename operations
- Workspace-wide changes
- Validation before execution

---

## 5. Multi-Language Support

### LSP Language Servers
OmO connects to external language servers per language:

| Language | Typical Server |
|----------|---------------|
| Python | pyright, pylsp |
| TypeScript/JavaScript | typescript-language-server |
| Go | gopls |
| Rust | rust-analyzer |
| Java | jdtls |
| C/C++ | clangd |

### AST-Grep Languages (25)
Structural search/replace across:
- JavaScript, TypeScript
- Python, Go, Rust
- Java, C, C++
- Ruby, PHP
- And 16 more...

---

## 6. AST Operations

### How AST-Grep Works
- Parses code into Abstract Syntax Tree
- Matches patterns against tree structure
- Can transform matched nodes

### Pattern Matching
```
// Find all console.log calls
pattern: console.log($ARG)

// Find all async functions
pattern: async function $NAME($PARAMS) { $BODY }
```

### Structural Transforms
```
// Replace deprecated API
from: oldApi.method($X)
to: newApi.method($X)
```

---

## 7. Semantically-Aware Refactoring

### Safe Rename (`lsp_rename`)
- Renames across entire workspace
- Updates all references
- Respects scope and shadowing
- Validates before execution

### Structural Replace (`ast_grep_replace`)
- Pattern-based transformation
- Preserves code structure
- Language-aware changes

### Code Actions
- IDE-style quick fixes
- Import organization
- Auto-fix linter errors

---

## 8. Limitations

### LSP Limitations

| Limitation | Description |
|------------|-------------|
| **Server Dependency** | Requires language server to be installed and configured |
| **Startup Time** | Language servers need initialization |
| **Memory Usage** | Large projects = more memory |
| **Language Coverage** | Not all languages have quality LSP servers |

### AST-Grep Limitations

| Limitation | Description |
|------------|-------------|
| **Pattern Complexity** | Complex patterns can be hard to write |
| **Cross-file Context** | Limited understanding of imports/dependencies |
| **Semantic Understanding** | Structure-based, not full semantic analysis |

### General Limitations

| Limitation | Description |
|------------|-------------|
| **External Infrastructure** | Relies on external servers |
| **Configuration Overhead** | Each language needs setup |
| **Consistency** | Quality varies by language server |

---

## Mapping to Claude Code

### Direct Equivalents

| OmO Feature | Claude Code Status |
|-------------|-------------------|
| Basic file operations | ✅ Available (Read, Write, Edit) |
| Text search (grep) | ✅ Available (Grep tool) |
| File search (glob) | ✅ Available (Glob tool) |

### Partial Equivalents

| OmO Feature | Claude Code Approach |
|-------------|---------------------|
| `lsp_hover` | WebFetch for documentation |
| `lsp_goto_definition` | Grep + Read for definitions |
| `lsp_find_references` | Grep for usages |

### Not Available

| OmO Feature | Workaround |
|-------------|------------|
| `lsp_rename` | Manual multi-file Edit |
| `lsp_diagnostics` | Bash with language linter |
| `lsp_code_actions` | Manual fixes |
| `ast_grep_search` | Bash with ast-grep CLI |
| `ast_grep_replace` | Bash with ast-grep CLI |

### MCP Server Options

| Feature | MCP Solution |
|---------|--------------|
| LSP operations | Custom LSP MCP server |
| AST operations | AST-grep MCP server |
| Code intelligence | Serena MCP (if available) |

---

## Claude Code Implementation Strategy

### Immediate (Native Tools)
1. Use Grep for reference finding
2. Use Bash with linters for diagnostics
3. Use Edit for manual refactoring

### Short-term (CLI Integration)
1. Install ast-grep CLI
2. Run via Bash tool
3. Parse results manually

### Long-term (MCP Integration)
1. Configure LSP MCP server
2. Enable full semantic operations
3. Achieve near-parity with OmO

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
