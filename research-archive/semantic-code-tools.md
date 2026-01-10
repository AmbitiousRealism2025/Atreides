# Semantic Code Tools Specification

## Overview

Oh My OpenCode (OmO) provides a comprehensive suite of semantic code tools that enable AI agents to perform intelligent code analysis, navigation, and refactoring. These tools are divided into two primary categories:

1. **LSP Tools (11 tools)**: Language Server Protocol integration for code intelligence, navigation, diagnostics, and refactoring
2. **AST-Grep Tools (2 tools)**: Abstract Syntax Tree-aware pattern matching and code transformation

These tools enable semantic understanding of code beyond simple text search, providing capabilities similar to modern IDEs.

---

## LSP Tools Reference

The LSP subsystem provides 11 tools that communicate with language servers to provide code intelligence features.

### lsp_hover

**Purpose**: Retrieve type information, documentation, and signatures for a symbol at a given position.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file |
| line | number | Yes | 1-based line number of the symbol |
| character | number | Yes | 0-based character position within the line |

**Response Format**:
```json
{
  "type": "string",
  "description": "Formatted hover information containing type info, documentation, and signatures"
}
```

The response is formatted from a `HoverResult` object containing:
- `contents`: String, object with `value` property, or array of strings/objects
- `range`: Optional range indicating the span of the hovered symbol

**Example Usage**:
```typescript
lsp_hover(filePath="src/utils.ts", line=15, character=8)
// Returns: "function calculateTotal(items: Item[]): number\n\nCalculates the total price of all items."
```

**Response on Failure**: "No hover information available"

---

### lsp_goto_definition

**Purpose**: Find the definition location of a symbol in the codebase.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file where the symbol is located |
| line | number | Yes | 1-based line number of the symbol |
| character | number | Yes | 0-based character position on the line |

**Response Format**:
```json
{
  "type": "string",
  "description": "Newline-separated list of location(s) formatted as uri:line:character"
}
```

**Example Usage**:
```typescript
lsp_goto_definition(filePath="src/app.ts", line=10, character=15)
// Returns: "/project/src/models/user.ts:25:0"
```

**Response on Failure**: "No definition found"

---

### lsp_find_references

**Purpose**: Find all usages and references of a symbol across the entire workspace.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file where the symbol is located |
| line | number | Yes | 1-based line number of the symbol |
| character | number | Yes | 0-based character offset within the line |
| includeDeclaration | boolean | No | If true, include the declaration in results |

**Response Format**:
```json
{
  "type": "string",
  "description": "Newline-separated list of formatted locations"
}
```

Results are limited to `DEFAULT_MAX_REFERENCES`. If exceeded, output includes a header with total count.

**Example Usage**:
```typescript
lsp_find_references(filePath="src/api/auth.ts", line=42, character=10, includeDeclaration=true)
// Returns:
// "Found 15 references (showing first 50):
// /project/src/api/auth.ts:42:10
// /project/src/routes/login.ts:15:4
// /project/src/middleware/session.ts:8:22
// ..."
```

**Response on Failure**: "No references found"

---

### lsp_document_symbols

**Purpose**: Retrieve a hierarchical outline of all symbols in a file (similar to IDE outline view).

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file to retrieve symbols from |

**Response Format**:
```json
{
  "type": "string",
  "description": "Hierarchical outline of symbols with names, kinds, and line numbers"
}
```

Each symbol includes:
- Symbol name
- Symbol kind (Function, Class, Variable, etc.)
- Line number
- Child symbols (for nested structures like class methods)

**Example Usage**:
```typescript
lsp_document_symbols(filePath="src/components/Button.tsx")
// Returns:
// "  Button (Class) - line 5
//     render (Method) - line 12
//     handleClick (Method) - line 25
//   ButtonProps (Interface) - line 1"
```

**Response on Failure**: "No symbols found"

---

### lsp_workspace_symbols

**Purpose**: Search for symbols by name across the entire workspace with fuzzy matching.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | File path to determine which LSP client to use |
| query | string | Yes | Symbol name to search for (supports fuzzy matching) |
| limit | number | No | Maximum number of results (default: DEFAULT_MAX_SYMBOLS) |

**Response Format**:
```json
{
  "type": "string",
  "description": "Newline-separated list of formatted symbol information"
}
```

Each symbol includes name, kind, location, and optional container name.

**Example Usage**:
```typescript
lsp_workspace_symbols(filePath=".", query="class")
lsp_workspace_symbols(filePath=".", query="interface")
lsp_workspace_symbols(filePath=".", query="function")
// Returns:
// "Found 25 symbols (showing first 50):
// UserService (Class) - /src/services/user.ts:10:0
// AuthService (Class) - /src/services/auth.ts:5:0
// ..."
```

**Response on Failure**: "No symbols found"

---

### lsp_diagnostics

**Purpose**: Retrieve errors, warnings, and hints from the language server (pre-build validation).

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file for diagnostics |
| severity | string | No | Filter by severity: "error", "warning", "information", "hint", or "all" |

**Response Format**:
```json
{
  "type": "string",
  "description": "Newline-separated diagnostic messages with severity, source, code, line, character, and message"
}
```

Results limited to `DEFAULT_MAX_DIAGNOSTICS`.

**Example Usage**:
```typescript
lsp_diagnostics(filePath="src/api/handler.ts")
lsp_diagnostics(filePath="src/api/handler.ts", severity="error")
// Returns:
// "error [typescript] TS2322 - line 15, char 5: Type 'string' is not assignable to type 'number'
// warning [typescript] TS6133 - line 8, char 10: 'unused' is declared but never used"
```

**Response on Failure**: "No diagnostics found"

---

### lsp_prepare_rename

**Purpose**: Validate if a rename operation is possible at a given position before executing.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file |
| line | number | Yes | 1-based line number of the symbol |
| character | number | Yes | 0-based character position |

**Response Format**:
```json
{
  "type": "string",
  "description": "Validation result with range and placeholder information"
}
```

Possible responses:
- "Cannot rename at this position"
- "Rename supported (using default behavior)"
- "Rename available at startLine:startChar-endLine:endChar (current: \"placeholder\")"
- "Rename available at startLine:startChar-endLine:endChar"

**Example Usage**:
```typescript
lsp_prepare_rename(filePath="src/utils.ts", line=10, character=15)
// Returns: "Rename available at 10:15-10:25 (current: \"oldFunctionName\")"
```

---

### lsp_rename

**Purpose**: Rename a symbol across the entire workspace, applying changes to all relevant files.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file where rename is initiated |
| line | number | Yes | 1-based line number of the symbol |
| character | number | Yes | 0-based character position |
| newName | string | Yes | New name for the symbol |

**Response Format**:
```json
{
  "type": "string",
  "description": "Result of applying the workspace edit"
}
```

Internally receives a `WorkspaceEdit` object describing changes across files.

**Example Usage**:
```typescript
// First validate with lsp_prepare_rename
lsp_prepare_rename(filePath="src/api/auth.ts", line=5, character=10)
// Then execute rename
lsp_rename(filePath="src/api/auth.ts", line=5, character=10, newName="authenticateUser")
// Returns: "Renamed symbol in 8 files: 15 occurrences updated"
```

---

### lsp_code_actions

**Purpose**: Retrieve available quick fixes and refactorings for a code range.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file |
| startLine | number | Yes | 1-based starting line of the range |
| startCharacter | number | Yes | 0-based starting character |
| endLine | number | Yes | 1-based ending line of the range |
| endCharacter | number | Yes | 0-based ending character |
| kind | string | No | Filter by action kind (see below) |

**Kind Options**:
- `"quickfix"` - Quick fixes for errors
- `"refactor"` - General refactorings
- `"refactor.extract"` - Extract method/variable
- `"refactor.inline"` - Inline method/variable
- `"refactor.rewrite"` - Rewrite code patterns
- `"source"` - Source-level actions
- `"source.organizeImports"` - Organize imports
- `"source.fixAll"` - Fix all auto-fixable issues

**Response Format**:
```json
{
  "type": "string",
  "description": "Numbered list of available code actions with kind and title"
}
```

Actions marked with star (⭐) if preferred; disabled actions include reason.

**Example Usage**:
```typescript
lsp_code_actions(filePath="src/api/handler.ts", startLine=10, startCharacter=0, endLine=15, endCharacter=50, kind="quickfix")
// Returns:
// "1. [quickfix] ⭐ Fix 'any' type usage
// 2. [quickfix] Add missing import for 'Response'
// 3. [refactor.extract] Extract to function"
```

**Response on Failure**: "No code actions available"

---

### lsp_code_action_resolve

**Purpose**: Apply a specific code action retrieved from lsp_code_actions.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| filePath | string | Yes | Path to the file |
| codeAction | string | Yes | JSON string of the code action to apply (from lsp_code_actions output) |

**Response Format**:
```json
{
  "type": "string",
  "description": "Summary including action title, kind, workspace edit result, and command info"
}
```

**Example Usage**:
```typescript
// First get code actions
const actions = lsp_code_actions(filePath="src/api/handler.ts", startLine=10, ...)
// Then resolve and apply
lsp_code_action_resolve(filePath="src/api/handler.ts", codeAction='{"title":"Add missing import","kind":"quickfix",...}')
// Returns: "Applied 'Add missing import for Response'\nKind: quickfix\nWorkspace edit applied: 1 file modified"
```

---

### lsp_servers

**Purpose**: List all available LSP servers, their installation status, and supported file extensions.

**Parameters**: None

**Response Format**:
```json
{
  "type": "string",
  "description": "List of LSP servers with ID, status, and extensions"
}
```

**Status Values**:
- `[installed]` - Server is available and ready
- `[not installed]` - Server configured but not installed
- `[disabled]` - Server explicitly disabled in configuration

**Example Usage**:
```typescript
lsp_servers()
// Returns:
// "typescript [installed] - .ts, .tsx, .js, .jsx, .mjs, .cjs, .mts, .cts
// pylsp [disabled] - .py, .pyi
// gopls [not installed] - .go
// rust-analyzer [installed] - .rs"
```

---

## AST-Grep Tools Reference

AST-Grep provides AST-aware code pattern matching and transformation, supporting 25 programming languages.

### ast_grep_search

**Purpose**: Search for structural code patterns across the filesystem using AST-aware matching.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pattern | string | Yes | AST pattern to search for (must be a complete AST node) |
| lang | string | Yes | Target language (see supported languages below) |
| paths | string[] | No | Paths to search (default: current directory) |
| globs | string[] | No | Include/exclude globs (prefix `!` to exclude) |
| context | number | No | Number of context lines around matches |

**Pattern Syntax**:
- `$VAR` - Matches a single AST node (any identifier)
- `$$$` - Matches multiple AST nodes (variadic)
- Patterns must represent complete AST nodes, not fragments

**Response Format**:
```json
{
  "type": "string",
  "description": "Formatted search results with file paths, line/column, and matched code"
}
```

**Example Usage**:
```typescript
// Find all async function declarations
ast_grep_search(pattern="async function $NAME($$$) { $$$ }", lang="typescript", paths=["src/"])
// Returns:
// "Found 12 matches:
//
// src/api/auth.ts:15:0
// async function authenticateUser(token: string) { ... }
//
// src/api/data.ts:42:0
// async function fetchData(id: number, options: Options) { ... }"

// Find console.log calls
ast_grep_search(pattern="console.log($MSG)", lang="javascript", paths=["src/"])

// Find React useState hooks
ast_grep_search(pattern="const [$STATE, $SETTER] = useState($$$)", lang="tsx", paths=["src/components/"])
```

**Response on Failure**: "No matches found" (may include hints for common pattern issues)

---

### ast_grep_replace

**Purpose**: Replace code patterns across the filesystem using AST-aware matching and transformation.

**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| pattern | string | Yes | AST pattern to match |
| rewrite | string | Yes | Replacement pattern (can use meta-variables from pattern) |
| lang | string | Yes | Target language |
| paths | string[] | No | Paths to search |
| globs | string[] | No | Include/exclude globs |
| dryRun | boolean | No | Preview changes without applying (default: true) |

**Response Format**:
```json
{
  "type": "string",
  "description": "Summary of replacements with file paths, matched text, and dry-run reminder"
}
```

**Example Usage**:
```typescript
// Replace console.log with logger.debug (dry run first)
ast_grep_replace(
  pattern="console.log($MSG)",
  rewrite="logger.debug($MSG)",
  lang="typescript",
  paths=["src/"],
  dryRun=true
)
// Returns:
// "DRY RUN - 8 replacements would be made:
//
// src/api/handler.ts:25:4
// console.log(data)
//
// src/utils/helpers.ts:12:2
// console.log('Processing...')
//
// Use dryRun=false to apply changes"

// Apply the changes
ast_grep_replace(
  pattern="console.log($MSG)",
  rewrite="logger.debug($MSG)",
  lang="typescript",
  paths=["src/"],
  dryRun=false
)
// Returns: "Applied 8 replacements across 5 files"
```

**Important**: Always perform a dry run first (`dryRun=true`) to preview changes before applying.

---

### Pattern Syntax Reference

**Meta-Variables**:
| Pattern | Description | Example |
|---------|-------------|---------|
| `$NAME` | Matches single AST node | `function $NAME()` |
| `$$$` | Matches multiple nodes | `function $NAME($$$)` |

**Language-Specific Pattern Examples**:

| Language | Pattern | Matches |
|----------|---------|---------|
| TypeScript | `async function $NAME($$$) { $$$ }` | Async function declarations |
| TypeScript | `interface $NAME { $$$ }` | Interface definitions |
| JavaScript | `const $VAR = require($MOD)` | CommonJS imports |
| JavaScript | `import $NAME from '$MOD'` | ES6 default imports |
| Python | `def $FUNC($$$):` | Function definitions |
| Python | `class $NAME:` | Class definitions |
| Go | `func $NAME($$$) $RET { $$$ }` | Function declarations |
| Rust | `fn $NAME($$$) -> $RET { $$$ }` | Function declarations |
| React/TSX | `<$COMP $$$/>` | Self-closing JSX |
| React/TSX | `useState($INIT)` | useState hook calls |

---

### Supported Languages (25)

| Language | File Extensions | Example Patterns |
|----------|-----------------|------------------|
| bash | .bash, .sh, .zsh, .bats | `if [ $$$ ]; then $$$ fi` |
| c | .c, .h | `void $NAME($$$) { $$$ }` |
| cpp | .cpp, .cc, .cxx, .hpp, .hxx, .h | `class $NAME { $$$ };` |
| csharp | .cs | `public class $NAME { $$$ }` |
| css | .css | `.$CLASS { $$$ }` |
| elixir | .ex, .exs | `def $NAME($$$) do $$$ end` |
| go | .go | `func $NAME($$$) { $$$ }` |
| haskell | .hs, .lhs | `$NAME :: $TYPE` |
| html | .html, .htm | `<$TAG $$$>$$$</$TAG>` |
| java | .java | `public class $NAME { $$$ }` |
| javascript | .js, .jsx, .mjs, .cjs | `const $VAR = ($$$) => $$$` |
| json | .json | N/A (structural only) |
| kotlin | .kt, .kts | `fun $NAME($$$): $RET { $$$ }` |
| lua | .lua | `function $NAME($$$) $$$ end` |
| nix | .nix | `{ $$$ }: $$$` |
| php | .php | `function $NAME($$$) { $$$ }` |
| python | .py, .pyi | `def $NAME($$$):` |
| ruby | .rb, .rake | `def $NAME($$$) $$$ end` |
| rust | .rs | `fn $NAME($$$) -> $RET { $$$ }` |
| scala | .scala, .sc | `def $NAME($$$): $RET = $$$` |
| solidity | .sol | `function $NAME($$$) $VIS { $$$ }` |
| swift | .swift | `func $NAME($$$) -> $RET { $$$ }` |
| typescript | .ts, .cts, .mts | `interface $NAME { $$$ }` |
| tsx | .tsx | `<$COMP $PROPS>$CHILDREN</$COMP>` |
| yaml | .yml, .yaml | N/A (structural only) |

**NAPI-Accelerated Languages** (5): html, javascript, tsx, css, typescript
- These languages use native bindings for improved performance
- Falls back to CLI for other languages

---

## LSP Server Configuration

### Configuration File Locations

LSP servers are configured in `oh-my-opencode.json` at these locations (in priority order):

1. **Project-level**: `.opencode/oh-my-opencode.json`
2. **User-level**: `~/.config/opencode/oh-my-opencode.json`
3. **OpenCode defaults**: `~/.config/opencode/opencode.json`

### Configuration Schema

```json
{
  "lsp": {
    "server-id": {
      "command": ["command", "arg1", "arg2"],
      "extensions": [".ext1", ".ext2"],
      "priority": 10,
      "env": {
        "ENV_VAR": "value"
      },
      "initialization": {},
      "disabled": false
    }
  }
}
```

**Properties**:
| Property | Type | Description |
|----------|------|-------------|
| command | string[] | Command and arguments to start the LSP server |
| extensions | string[] | File extensions this server handles |
| priority | number | Server priority (higher = higher priority) |
| env | object | Environment variables for the server process |
| initialization | object | Initialization options passed to the server |
| disabled | boolean | Disable this server |

### Example Configuration

```json
{
  "lsp": {
    "typescript-language-server": {
      "command": ["typescript-language-server", "--stdio"],
      "extensions": [".ts", ".tsx", ".js", ".jsx"],
      "priority": 10
    },
    "eslint": {
      "command": ["vscode-eslint-language-server", "--stdio"],
      "extensions": [".ts", ".tsx", ".js", ".jsx"],
      "priority": 5
    },
    "pylsp": {
      "disabled": true
    }
  }
}
```

### Priority System

1. **Source Priority**: Project > User > OpenCode defaults
2. **Priority Field**: Higher numbers take precedence
3. **Built-in Default**: Built-in servers have priority -100

When multiple servers support the same extension:
- Project-level config overrides user-level
- Within same source, higher `priority` value wins
- First installed server matching extension is used

### Default Built-in Servers (39)

| Server ID | Extensions | Purpose |
|-----------|------------|---------|
| typescript | .ts, .tsx, .js, .jsx, .mjs, .cjs, .mts, .cts | TypeScript/JavaScript |
| deno | .ts, .tsx, .js, .jsx | Deno runtime |
| vue | .vue | Vue.js SFCs |
| eslint | .ts, .tsx, .js, .jsx | ESLint diagnostics |
| oxlint | .ts, .tsx, .js, .jsx | Oxlint (fast linter) |
| biome | .ts, .tsx, .js, .jsx, .json | Biome formatter/linter |
| gopls | .go | Go |
| ruby-lsp | .rb, .rake | Ruby |
| basedpyright | .py, .pyi | Python (basedpyright) |
| pyright | .py, .pyi | Python (pyright) |
| ty | .py, .pyi | Python type checker |
| ruff | .py, .pyi | Python linter |
| elixir-ls | .ex, .exs | Elixir |
| zls | .zig | Zig |
| csharp | .cs | C# |
| fsharp | .fs, .fsi, .fsx | F# |
| sourcekit-lsp | .swift | Swift |
| rust (rust-analyzer) | .rs | Rust |
| clangd | .c, .cpp, .h, .hpp | C/C++ |
| svelte | .svelte | Svelte |
| astro | .astro | Astro |
| bash / bash-ls | .sh, .bash | Bash |
| jdtls | .java | Java |
| yaml-ls | .yml, .yaml | YAML |
| lua-ls | .lua | Lua |
| php | .php | PHP |
| dart | .dart | Dart |
| terraform / terraform-ls | .tf | Terraform |
| prisma | .prisma | Prisma ORM |
| ocaml-lsp | .ml, .mli | OCaml |
| texlab | .tex | LaTeX |
| dockerfile | Dockerfile | Docker |
| gleam | .gleam | Gleam |
| clojure-lsp | .clj, .cljs, .cljc | Clojure |
| nixd | .nix | Nix |
| tinymist | .typ | Typst |
| haskell-language-server | .hs, .lhs | Haskell |

---

## Claude Code Native LSP Comparison

| Capability | OmO LSP | Claude Code LSP | Notes |
|------------|---------|-----------------|-------|
| Hover Information | `lsp_hover` | Native via Read | CC infers from file content |
| Go to Definition | `lsp_goto_definition` | Grep/Glob patterns | CC uses text search |
| Find References | `lsp_find_references` | Grep tool | CC uses regex patterns |
| Document Symbols | `lsp_document_symbols` | Not available | Manual parsing needed |
| Workspace Symbols | `lsp_workspace_symbols` | Grep + Glob | Text-based search |
| Diagnostics | `lsp_diagnostics` | Bash (compiler) | Run build/lint commands |
| Prepare Rename | `lsp_prepare_rename` | Not available | Manual validation |
| Rename Symbol | `lsp_rename` | Edit (manual) | Multi-file edit needed |
| Code Actions | `lsp_code_actions` | Not available | Manual fixes |
| Code Action Resolve | `lsp_code_action_resolve` | Not available | Manual application |
| List Servers | `lsp_servers` | N/A | No server management |
| AST Search | `ast_grep_search` | Grep (text) | No structural awareness |
| AST Replace | `ast_grep_replace` | Edit (manual) | No pattern-based replace |
| **Language Support** | 39 LSP servers | N/A | CC relies on tools |
| **Configuration** | JSON config | N/A | No server config |

### Key Differences

1. **Semantic vs Text**: OmO provides true semantic understanding via LSP; Claude Code relies on text patterns
2. **Refactoring**: OmO supports safe, workspace-wide renames; Claude Code requires manual multi-file edits
3. **Diagnostics**: OmO gets real-time errors pre-build; Claude Code must run compiler/linter
4. **Code Actions**: OmO provides IDE-like quick fixes; Claude Code requires manual implementation
5. **AST Patterns**: OmO supports structural code search; Claude Code limited to regex

---

## Tool Integration Patterns

### Tool Selection Strategy

The Explore agent demonstrates optimal tool selection for code search tasks:

| Search Type | Best Tool | Use Case |
|-------------|-----------|----------|
| **Semantic search** | LSP tools | Finding definitions, references, type info |
| **Structural patterns** | `ast_grep_search` | Function shapes, class structures |
| **Text patterns** | `grep` | Strings, comments, log statements |
| **File patterns** | `glob` | Finding files by name/extension |
| **History/evolution** | git commands | When added, who changed |

### When to Use Each Tool

**Use LSP Tools When**:
- Need type information or documentation
- Finding symbol definitions across codebase
- Locating all references before refactoring
- Getting pre-build diagnostics
- Performing safe workspace-wide renames
- Applying IDE-suggested quick fixes

**Use AST-Grep When**:
- Searching for structural code patterns (not just text)
- Need language-aware pattern matching
- Performing bulk code transformations
- Finding specific code constructs (all async functions, all class definitions)
- Pattern syntax would be complex with regex

**Use Grep When**:
- Searching for literal strings or simple patterns
- Looking for comments or documentation
- Finding log statements or error messages
- Text search is sufficient

### Parallel Execution Pattern

The Explore agent floods with parallel calls for comprehensive coverage:

```typescript
// Example: Investigate a function
Promise.all([
  lsp_hover(filePath, line, char),           // Get type info
  lsp_goto_definition(filePath, line, char), // Find definition
  lsp_find_references(filePath, line, char), // Find all usages
  ast_grep_search(pattern, lang, paths),     // Find similar patterns
  grep(pattern, paths)                       // Find text mentions
])
```

### Workflow Integration

**Pre-Modification Workflow**:
```typescript
// 1. Get baseline diagnostics
const baseline = lsp_diagnostics(filePath)

// 2. Find all references (impact analysis)
const refs = lsp_find_references(filePath, line, char)

// 3. Validate rename is possible
const canRename = lsp_prepare_rename(filePath, line, char)

// 4. Make changes
// ... modifications ...

// 5. Verify diagnostics unchanged
const after = lsp_diagnostics(filePath)
// Compare with baseline
```

**Refactoring Workflow**:
```typescript
// 1. Preview with dry run
ast_grep_replace(pattern, rewrite, lang, paths, dryRun=true)

// 2. Review changes
// ... human review ...

// 3. Apply changes
ast_grep_replace(pattern, rewrite, lang, paths, dryRun=false)

// 4. Run diagnostics to verify
lsp_diagnostics(filePath)
```

---

## Migration Recommendations

### For Claude Code Users

1. **Replace LSP hover with Read + analysis**: Read file content and analyze types from context
2. **Replace LSP references with Grep**: Use regex patterns to find symbol usages
3. **Replace LSP rename with multi-Edit**: Manually edit all occurrences
4. **Replace AST patterns with Grep**: Use regex approximations (less accurate)
5. **Run build commands for diagnostics**: Use Bash to invoke compiler/linter

### Capability Gaps in Claude Code

| OmO Feature | Claude Code Alternative | Limitation |
|-------------|------------------------|------------|
| Safe rename | Multi-file Edit | May miss dynamic references |
| Type hover | Read + infer | Less accurate |
| Code actions | Manual implementation | No suggestions |
| AST patterns | Regex patterns | May match non-code text |
| Pre-build diagnostics | Bash lint/build | Slower feedback loop |

### Recommended Approach

1. **Use Grep for text search** - Works well for most cases
2. **Use Glob for file discovery** - Find files by pattern
3. **Use Read for analysis** - Examine file content
4. **Use Edit for modifications** - Apply targeted changes
5. **Use Bash for validation** - Run tests, linters, type checkers

---

## Appendix: Tool Argument Reference

### Position Parameters

All LSP tools use consistent position parameters:
- `line`: **1-based** (first line is 1)
- `character`: **0-based** (first character is 0)

This matches VS Code conventions but differs from some tools that use fully 0-based positions.

### Path Parameters

- `filePath`: Absolute or relative path to file
- `paths`: Array of directories/files to search
- Relative paths resolved from current working directory

### Response Truncation

Tools implement output limits to prevent overwhelming responses:
- `DEFAULT_MAX_SYMBOLS`: Maximum symbols returned
- `DEFAULT_MAX_REFERENCES`: Maximum references returned
- `DEFAULT_MAX_DIAGNOSTICS`: Maximum diagnostics returned
- `max_matches`: AST-grep match limit
- `max_output_bytes`: Maximum response size

When limits are exceeded, output includes total count and truncation notice.
