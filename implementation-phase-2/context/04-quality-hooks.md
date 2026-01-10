# Context: Quality Hooks (Tasks 4.1 - 4.3)

## Task Group Overview

- Task 4.1: Add PostToolUse Formatting Hooks
- Task 4.2: Add PostToolUse Linting Hooks
- Task 4.3: Test Hook Execution

---

## Task 4.1: PostToolUse Formatting Hooks

### Purpose

Automatically format code after every Edit or Write operation.

### Hook Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "[FORMATTER_COMMAND]"
          }
        ]
      }
    ]
  }
}
```

### Project-Type Specific Formatters

#### Node.js / JavaScript / TypeScript

```json
{
  "type": "command",
  "command": "npx prettier --write \"$FILE\" 2>/dev/null || true"
}
```

**Notes**:
- Uses npx to avoid global install requirement
- Prettier handles JS, TS, JSON, CSS, MD
- `2>/dev/null || true` suppresses errors and prevents blocking

#### Python

```json
{
  "type": "command",
  "command": "black \"$FILE\" 2>/dev/null || true"
}
```

**Alternative (ruff format)**:
```json
{
  "type": "command",
  "command": "ruff format \"$FILE\" 2>/dev/null || true"
}
```

#### Go

```json
{
  "type": "command",
  "command": "gofmt -w \"$FILE\" 2>/dev/null || true"
}
```

#### Rust

```json
{
  "type": "command",
  "command": "rustfmt \"$FILE\" 2>/dev/null || true"
}
```

### Handlebars Template

```handlebars
"PostToolUse": [
  {
    "matcher": "Edit|Write",
    "hooks": [
{{#if (eq projectType "node")}}
      {"type": "command", "command": "npx prettier --write \"$FILE\" 2>/dev/null || true"}
{{else if (eq projectType "python")}}
      {"type": "command", "command": "black \"$FILE\" 2>/dev/null || true"}
{{else if (eq projectType "go")}}
      {"type": "command", "command": "gofmt -w \"$FILE\" 2>/dev/null || true"}
{{else if (eq projectType "rust")}}
      {"type": "command", "command": "rustfmt \"$FILE\" 2>/dev/null || true"}
{{else}}
      {"type": "command", "command": "echo 'Formatted: $FILE' > /dev/null"}
{{/if}}
    ]
  }
]
```

---

## Task 4.2: PostToolUse Linting Hooks

### Purpose

Automatically lint and fix code after formatting.

### Hook Configuration (After Formatter)

Linting hooks run after formatting hooks in the array.

#### Node.js / JavaScript / TypeScript

```json
{
  "type": "command",
  "command": "npx eslint --fix \"$FILE\" 2>/dev/null || true"
}
```

**Notes**:
- `--fix` applies automatic fixes
- Runs after prettier for proper order
- Won't block on lint errors

#### Python

```json
{
  "type": "command",
  "command": "ruff check --fix \"$FILE\" 2>/dev/null || true"
}
```

**Alternative (flake8 - no auto-fix)**:
```json
{
  "type": "command",
  "command": "flake8 \"$FILE\" 2>/dev/null || true"
}
```

#### Go

```json
{
  "type": "command",
  "command": "go vet \"$FILE\" 2>/dev/null || true"
}
```

**With golint**:
```json
{
  "type": "command",
  "command": "golint \"$FILE\" 2>/dev/null || true"
}
```

#### Rust

```json
{
  "type": "command",
  "command": "cargo clippy --fix --allow-dirty --allow-staged 2>/dev/null || true"
}
```

### Complete Hook Configuration

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$FILE\" 2>/dev/null || true"
          },
          {
            "type": "command",
            "command": "npx eslint --fix \"$FILE\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

### Handlebars Template (Complete)

```handlebars
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
      {"type": "command", "command": "gofmt -w \"$FILE\" 2>/dev/null || true"},
      {"type": "command", "command": "go vet \"$FILE\" 2>/dev/null || true"}
{{else if (eq projectType "rust")}}
      {"type": "command", "command": "rustfmt \"$FILE\" 2>/dev/null || true"},
      {"type": "command", "command": "cargo clippy --fix --allow-dirty 2>/dev/null || true"}
{{else}}
      {"type": "command", "command": "echo 'Edited: $FILE' > /dev/null"}
{{/if}}
    ]
  }
]
```

---

## Task 4.3: Test Hook Execution

### Test Cases

#### TC-1: Edit JS File → Prettier Runs

**Setup**:
1. Create a Node.js project with `muaddib init`
2. Create poorly formatted JS file

**Test**:
```javascript
// test.js (before)
const x=1;function foo(){return x+2}

// After edit, should become:
const x = 1;
function foo() {
  return x + 2;
}
```

**Verification**:
- Edit the file using Claude Code
- Check file is formatted after edit
- No error messages shown

---

#### TC-2: Edit Python File → Black Runs

**Setup**:
1. Create a Python project with `muaddib init`
2. Create poorly formatted Python file

**Test**:
```python
# test.py (before)
def foo():return 1+2

# After edit, should become:
def foo():
    return 1 + 2
```

**Verification**:
- Edit the file
- Check file is formatted
- No blocking errors

---

#### TC-3: Create New File → Hooks Run

**Setup**:
1. Initialized project

**Test**:
- Use Write to create new file with poor formatting
- Verify hooks run on Write operation
- File should be formatted

---

#### TC-4: Hook Failure → Continues Gracefully

**Setup**:
1. Project without prettier installed
2. Or file type not supported by formatter

**Test**:
- Edit a file
- Formatter fails (tool not found)
- Claude Code continues without blocking
- No error shown to user (suppressed)

**Verification**:
- `2>/dev/null || true` prevents blocking
- Session continues normally

---

#### TC-5: Multiple Edits → Each Triggers Hooks

**Test**:
- Edit file A
- Verify hooks run
- Edit file B
- Verify hooks run again
- Edit file A again
- Verify hooks run again

---

### Test Checklist

| Test Case | Expected Result | Pass/Fail |
|-----------|-----------------|-----------|
| TC-1: JS formatting | File formatted | [ ] |
| TC-2: Python formatting | File formatted | [ ] |
| TC-3: New file hooks | Hooks run on Write | [ ] |
| TC-4: Missing tool | Continues gracefully | [ ] |
| TC-5: Multiple edits | Each triggers hooks | [ ] |

---

## Hook Design Principles

### Always Include Error Suppression

```bash
command 2>/dev/null || true
```

- `2>/dev/null` - Suppress stderr
- `|| true` - Return success even on failure

### Order Matters

1. Formatting first (changes whitespace)
2. Linting second (may change code)
3. Additional hooks last

### Keep Hooks Fast

- Don't run full test suites
- Don't run slow operations
- Format/lint individual files only

### Handle Missing Tools

- Use `which` check if needed
- Always have fallback behavior
- Never block on missing tools

---

## Acceptance Criteria

### Task 4.1 (Formatting Hooks)
- [ ] Prettier hook for Node.js
- [ ] Black hook for Python
- [ ] gofmt hook for Go
- [ ] rustfmt hook for Rust
- [ ] Error suppression on all

### Task 4.2 (Linting Hooks)
- [ ] ESLint hook for Node.js
- [ ] ruff hook for Python
- [ ] go vet hook for Go
- [ ] clippy hook for Rust
- [ ] Auto-fix enabled where possible

### Task 4.3 (Testing)
- [ ] All 5 test cases executed
- [ ] Formatting works per project type
- [ ] Failures handled gracefully
- [ ] Multiple edits work correctly

---

*Context for Tasks 4.1, 4.2, 4.3*
