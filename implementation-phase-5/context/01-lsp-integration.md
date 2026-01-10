# Context: LSP MCP Integration (Tasks 5.1.1 - 5.1.4)

## Task Group Overview

- Task 5.1.1: Research available LSP MCP servers
- Task 5.1.2: Configure LSP MCP (if available)
- Task 5.1.3: Document CLI-based LSP alternatives
- Task 5.1.4: Test LSP operations

---

## Task 5.1.1: Research Available LSP MCP Servers

### Purpose

Identify MCP servers that provide LSP capabilities for semantic code operations.

### Research Areas

#### 1. Official Anthropic MCP Servers

Check: https://github.com/anthropics/mcp-servers

Look for:
- Language-specific LSP servers
- Generic LSP wrapper
- IDE integration servers

#### 2. Community MCP Servers

Search for:
- `mcp-server-lsp`
- `mcp-lsp`
- Language-specific servers (TypeScript, Python, etc.)

#### 3. Existing MCP Server Capabilities

Review what existing MCP servers might provide:
- Context7: Documentation, not LSP
- Sequential: Reasoning, not LSP
- Magic: UI generation, not LSP

### Research Output Template

```markdown
## LSP MCP Server Research Results

### Official Servers
| Server | Language | LSP Operations | Status |
|--------|----------|----------------|--------|
| [name] | [lang] | [ops] | Available/Not Found |

### Community Servers
| Server | Language | LSP Operations | Status |
|--------|----------|----------------|--------|
| [name] | [lang] | [ops] | Available/Not Found |

### Recommendation
[Which server(s) to use, or fallback to CLI]
```

### Desired LSP Operations

| Operation | OmO Support | Priority |
|-----------|-------------|----------|
| Go to Definition | Yes | High |
| Find References | Yes | High |
| Find Implementations | Yes | Medium |
| Rename Symbol | Yes | High |
| Hover (type info) | Yes | Medium |
| Code Actions | Yes | Low |
| Diagnostics | Yes | Medium |
| Completion | Yes | Low |

---

## Task 5.1.2: Configure LSP MCP (If Available)

### MCP Configuration Location

`.claude/settings.json` (project) or `~/.claude/settings.json` (global)

### Configuration Template

```json
{
  "mcpServers": {
    "lsp-typescript": {
      "command": "npx",
      "args": ["@anthropic/mcp-server-lsp", "--language", "typescript"],
      "env": {
        "LSP_ROOT": "${workspaceFolder}"
      }
    },
    "lsp-python": {
      "command": "python",
      "args": ["-m", "mcp_server_lsp", "--language", "python"],
      "env": {
        "PYTHONPATH": "${workspaceFolder}"
      }
    }
  }
}
```

### Configuration Per Language

#### TypeScript/JavaScript

```json
{
  "mcpServers": {
    "lsp-typescript": {
      "command": "npx",
      "args": ["typescript-language-server", "--stdio"]
    }
  }
}
```

#### Python

```json
{
  "mcpServers": {
    "lsp-python": {
      "command": "pylsp"
    }
  }
}
```

#### Go

```json
{
  "mcpServers": {
    "lsp-go": {
      "command": "gopls",
      "args": ["serve"]
    }
  }
}
```

### Verification Steps

1. Add configuration to settings.json
2. Restart Claude Code
3. Check server connection: `claude mcp status`
4. Test an LSP operation

---

## Task 5.1.3: Document CLI-Based LSP Alternatives

### Purpose

Provide fallback methods when MCP LSP is unavailable.

### Content Template for CLAUDE.md

```markdown
## Semantic Code Operations

When native LSP is unavailable, use CLI alternatives:

### TypeScript/JavaScript

**Type Checking**:
```bash
npx tsc --noEmit
```

**Find References** (approximate):
```bash
grep -r "functionName" --include="*.ts" --include="*.tsx" src/
```

**Find Definition** (read source directly):
```bash
# For exports
grep -r "export.*functionName" --include="*.ts" src/
```

**Diagnostics**:
```bash
npx eslint src/
npx tsc --noEmit 2>&1 | head -50
```

---

### Python

**Type Checking**:
```bash
# Using mypy
mypy path/to/file.py

# Using pyright
pyright path/to/file.py
```

**Find References**:
```bash
grep -r "function_name" --include="*.py" src/
```

**Find Imports**:
```bash
grep -r "from module import\|import module" --include="*.py" src/
```

**Diagnostics**:
```bash
ruff check src/
pylint src/
```

---

### Go

**Type Checking**:
```bash
go vet ./...
```

**Find References**:
```bash
grep -r "FunctionName" --include="*.go" ./
```

**Documentation**:
```bash
go doc package.Function
```

**Diagnostics**:
```bash
go vet ./...
golangci-lint run
```

---

### Rust

**Type Checking**:
```bash
cargo check
```

**Find References**:
```bash
grep -r "function_name" --include="*.rs" src/
```

**Diagnostics**:
```bash
cargo clippy
```

---

### General Pattern

When semantic operation needed:
1. **Identify what you need** (definition, references, types)
2. **Use language-specific CLI tool** (see above)
3. **Parse output** for relevant information
4. **Follow up with Read** for details
5. **Use Task(Explore)** for comprehensive search

### Limitations of CLI Approach

| Operation | CLI Support | Quality |
|-----------|-------------|---------|
| Go to Definition | Grep-based | Medium |
| Find References | Grep-based | Medium |
| Rename | Manual edits | Low |
| Type Info | Compiler output | Medium |
| Diagnostics | Full | High |
```

---

## Task 5.1.4: Test LSP Operations

### Test Cases

#### Test 1: Go to Definition

**Scenario**: Find where a function is defined

**MCP Test** (if available):
```
Use LSP: Go to definition of `handleLogin` in src/auth.ts
```

**CLI Test**:
```bash
grep -r "export.*function handleLogin\|export.*const handleLogin" --include="*.ts" src/
```

**Expected**: Returns file path and line number

---

#### Test 2: Find References

**Scenario**: Find all usages of a function

**MCP Test** (if available):
```
Use LSP: Find references to `handleLogin`
```

**CLI Test**:
```bash
grep -rn "handleLogin" --include="*.ts" --include="*.tsx" src/
```

**Expected**: List of files and lines where function is used

---

#### Test 3: Type Information

**Scenario**: Get type information for a symbol

**MCP Test** (if available):
```
Use LSP: Get hover info for `user` variable in src/auth.ts:45
```

**CLI Test**:
```bash
npx tsc --noEmit 2>&1 | grep "user"
```

**Expected**: Type annotation or interface definition

---

#### Test 4: Diagnostics

**Scenario**: Get errors and warnings for a file

**CLI Test**:
```bash
# TypeScript
npx tsc --noEmit src/auth.ts 2>&1

# Python
mypy src/auth.py

# Go
go vet ./pkg/auth/...
```

**Expected**: List of errors/warnings with locations

---

### Test Report Template

```markdown
# LSP Operations Test Report

## Date: [DATE]

### MCP Server Status
- [ ] MCP LSP server available
- [ ] Server configured correctly
- [ ] Server responding

### Operation Tests (MCP)
| Operation | Result | Notes |
|-----------|--------|-------|
| Go to Definition | N/A / PASS / FAIL | |
| Find References | N/A / PASS / FAIL | |
| Type Info | N/A / PASS / FAIL | |
| Diagnostics | N/A / PASS / FAIL | |

### Operation Tests (CLI Fallback)
| Operation | Result | Notes |
|-----------|--------|-------|
| Go to Definition (grep) | PASS / FAIL | |
| Find References (grep) | PASS / FAIL | |
| Type Info (compiler) | PASS / FAIL | |
| Diagnostics (linter) | PASS / FAIL | |

### Recommendation
- [ ] Use MCP server (preferred)
- [ ] Use CLI fallbacks (acceptable)
- [ ] Mix of both

### Overall: PASS / FAIL
```

---

## Acceptance Criteria

### Task 5.1.1
- [ ] Official MCP servers researched
- [ ] Community servers researched
- [ ] Research output documented
- [ ] Recommendation made

### Task 5.1.2
- [ ] MCP configuration created (if server available)
- [ ] Configuration added to settings.json
- [ ] Server connection verified
- [ ] Basic operation tested

### Task 5.1.3
- [ ] TypeScript CLI alternatives documented
- [ ] Python CLI alternatives documented
- [ ] Go CLI alternatives documented
- [ ] Rust CLI alternatives documented
- [ ] General pattern documented
- [ ] Limitations noted

### Task 5.1.4
- [ ] Go to Definition tested
- [ ] Find References tested
- [ ] Type Information tested
- [ ] Diagnostics tested
- [ ] Test report completed
- [ ] Recommendation made

---

*Context for Tasks 5.1.1 - 5.1.4*
