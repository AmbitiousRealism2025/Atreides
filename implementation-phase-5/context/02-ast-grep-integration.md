# Context: AST-grep CLI Integration (Tasks 5.2.1 - 5.2.5)

## Task Group Overview

- Task 5.2.1: Verify ast-grep installation
- Task 5.2.2: Document ast-grep search patterns
- Task 5.2.3: Document ast-grep replace patterns
- Task 5.2.4: Create ast-grep cheat sheet
- Task 5.2.5: Test ast-grep operations

---

## Task 5.2.1: Verify ast-grep Installation

### Check Installation

```bash
# Check if installed
which ast-grep || which sg

# Check version
ast-grep --version
```

### Installation Methods

```bash
# npm (recommended for Node.js projects)
npm install -g @ast-grep/cli

# Cargo (Rust)
cargo install ast-grep --locked

# Homebrew (macOS)
brew install ast-grep

# Binary download
# https://github.com/ast-grep/ast-grep/releases
```

### Verify Language Support

```bash
# List supported languages
ast-grep --help

# Test with specific language
echo 'const x = 1;' | ast-grep --pattern '$X = $Y' --lang javascript
```

### Supported Languages (25+)

- JavaScript, TypeScript, TSX
- Python
- Go
- Rust
- Java, Kotlin, Scala
- C, C++, C#
- Ruby, PHP, Swift
- HTML, CSS, JSON, YAML
- And more...

---

## Task 5.2.2: Document ast-grep Search Patterns

### Content Template for CLAUDE.md

```markdown
## AST-grep Search Patterns

### Basic Pattern Syntax

| Symbol | Meaning | Example |
|--------|---------|---------|
| `$NAME` | Match single node | `function $NAME() {}` |
| `$$$` | Match multiple nodes | `console.log($$$ARGS)` |
| `$$NAME` | Match single, named | `import $$MOD from '$PATH'` |

### Function Patterns

**Find function declarations**:
```bash
ast-grep --pattern 'function $NAME($$$PARAMS) { $$$BODY }' --lang javascript src/
```

**Find arrow functions**:
```bash
ast-grep --pattern 'const $NAME = ($$$PARAMS) => $$$BODY' --lang typescript src/
```

**Find async functions**:
```bash
ast-grep --pattern 'async function $NAME($$$PARAMS) { $$$BODY }' --lang typescript src/
```

**Find exported functions**:
```bash
ast-grep --pattern 'export function $NAME($$$PARAMS) { $$$BODY }' --lang typescript src/
```

---

### Class Patterns

**Find class declarations**:
```bash
ast-grep --pattern 'class $NAME { $$$BODY }' --lang typescript src/
```

**Find class with extends**:
```bash
ast-grep --pattern 'class $NAME extends $BASE { $$$BODY }' --lang typescript src/
```

**Find methods**:
```bash
ast-grep --pattern '$NAME($$$PARAMS) { $$$BODY }' --lang typescript src/
```

---

### Import/Export Patterns

**Find all imports**:
```bash
ast-grep --pattern 'import $$$' --lang typescript src/
```

**Find specific import**:
```bash
ast-grep --pattern 'import { $$$NAMED } from "$MODULE"' --lang typescript src/
```

**Find default import**:
```bash
ast-grep --pattern 'import $NAME from "$MODULE"' --lang typescript src/
```

**Find exports**:
```bash
ast-grep --pattern 'export $$$' --lang typescript src/
```

---

### Call Patterns

**Find function calls**:
```bash
ast-grep --pattern '$FUNC($$$ARGS)' --lang typescript src/
```

**Find method calls**:
```bash
ast-grep --pattern '$OBJ.$METHOD($$$ARGS)' --lang typescript src/
```

**Find console.log**:
```bash
ast-grep --pattern 'console.log($$$ARGS)' --lang javascript src/
```

**Find specific API calls**:
```bash
ast-grep --pattern 'fetch($URL)' --lang javascript src/
ast-grep --pattern 'axios.$METHOD($$$ARGS)' --lang javascript src/
```

---

### Variable Patterns

**Find const declarations**:
```bash
ast-grep --pattern 'const $NAME = $VALUE' --lang typescript src/
```

**Find let declarations**:
```bash
ast-grep --pattern 'let $NAME = $VALUE' --lang typescript src/
```

**Find destructuring**:
```bash
ast-grep --pattern 'const { $$$PROPS } = $OBJ' --lang typescript src/
```

---

### React/JSX Patterns

**Find components**:
```bash
ast-grep --pattern 'function $NAME($PROPS): JSX.Element { $$$BODY }' --lang tsx src/
```

**Find JSX elements**:
```bash
ast-grep --pattern '<$TAG $$$ATTRS>$$$CHILDREN</$TAG>' --lang tsx src/
```

**Find hooks**:
```bash
ast-grep --pattern 'useState($$$)' --lang tsx src/
ast-grep --pattern 'useEffect($$$)' --lang tsx src/
```

---

### Error Handling Patterns

**Find try-catch**:
```bash
ast-grep --pattern 'try { $$$TRY } catch ($ERR) { $$$CATCH }' --lang typescript src/
```

**Find throw statements**:
```bash
ast-grep --pattern 'throw $$$' --lang typescript src/
```
```

---

## Task 5.2.3: Document ast-grep Replace Patterns

### Content Template for CLAUDE.md

```markdown
## AST-grep Replace Patterns

### Basic Replace Syntax

```bash
ast-grep --pattern 'OLD_PATTERN' --rewrite 'NEW_PATTERN' --lang LANG path/
```

### Common Transformations

**Replace console.log with logger**:
```bash
ast-grep --pattern 'console.log($$$ARGS)' \
         --rewrite 'logger.info($$$ARGS)' \
         --lang javascript src/
```

**Convert var to const**:
```bash
ast-grep --pattern 'var $NAME = $VALUE' \
         --rewrite 'const $NAME = $VALUE' \
         --lang javascript src/
```

**Add await to async call**:
```bash
ast-grep --pattern '$FUNC()' \
         --rewrite 'await $FUNC()' \
         --lang typescript src/
```

---

### Import Transformations

**Change import path**:
```bash
ast-grep --pattern 'import $WHAT from "old-module"' \
         --rewrite 'import $WHAT from "new-module"' \
         --lang typescript src/
```

**Convert default to named import**:
```bash
ast-grep --pattern 'import $NAME from "$MODULE"' \
         --rewrite 'import { $NAME } from "$MODULE"' \
         --lang typescript src/
```

---

### Function Transformations

**Convert function to arrow**:
```bash
ast-grep --pattern 'function $NAME($$$PARAMS) { return $EXPR }' \
         --rewrite 'const $NAME = ($$$PARAMS) => $EXPR' \
         --lang typescript src/
```

**Add async to function**:
```bash
ast-grep --pattern 'function $NAME($$$PARAMS) { $$$BODY }' \
         --rewrite 'async function $NAME($$$PARAMS) { $$$BODY }' \
         --lang typescript src/
```

---

### React Transformations

**Convert class component to function**:
```bash
# This is a multi-step process, simplified example:
ast-grep --pattern 'class $NAME extends Component { $$$BODY }' \
         --rewrite 'function $NAME(props) { $$$BODY }' \
         --lang tsx src/
```

**Update hook usage**:
```bash
ast-grep --pattern 'this.state.$PROP' \
         --rewrite '$PROP' \
         --lang tsx src/
```

---

### Safety Rules

1. **Always preview first**:
```bash
ast-grep --pattern 'OLD' --rewrite 'NEW' --lang ts src/ --debug-query
```

2. **Use JSON output for review**:
```bash
ast-grep --pattern 'OLD' --lang ts src/ --json | jq '.[] | .file'
```

3. **Commit before replacing**:
```bash
git add . && git commit -m "Before ast-grep refactor"
ast-grep --pattern 'OLD' --rewrite 'NEW' --lang ts src/
```

4. **Test after replacing**:
```bash
npm test
npm run typecheck
```
```

---

## Task 5.2.4: Create ast-grep Cheat Sheet

### Cheat Sheet Content

```markdown
## AST-grep Quick Reference

### Command Structure

```
ast-grep [OPTIONS] --pattern 'PATTERN' [--rewrite 'REPLACEMENT'] --lang LANG PATH
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--pattern` | `-p` | Pattern to match |
| `--rewrite` | `-r` | Replacement pattern |
| `--lang` | `-l` | Language (ts, js, py, go, etc.) |
| `--json` | | JSON output |
| `--debug-query` | | Debug pattern |
| `--interactive` | `-i` | Interactive mode |

### Pattern Variables

| Variable | Matches |
|----------|---------|
| `$NAME` | Single node (any name) |
| `$$$ARGS` | Zero or more nodes |
| `$$VAR` | Named single node |
| `$_` | Anonymous single node |

### Common Patterns by Language

#### TypeScript/JavaScript

| Find | Pattern |
|------|---------|
| Functions | `function $NAME($$$) { $$$BODY }` |
| Arrow functions | `($$$) => $$$` |
| Imports | `import $$$` |
| Exports | `export $$$` |
| Console.log | `console.log($$$)` |
| Await | `await $EXPR` |
| Try-catch | `try { $$$ } catch ($E) { $$$ }` |

#### Python

| Find | Pattern |
|------|---------|
| Functions | `def $NAME($$$): $$$` |
| Classes | `class $NAME: $$$` |
| Imports | `import $$$` |
| Print | `print($$$)` |
| With | `with $$$: $$$` |
| Try-except | `try: $$$ except $E: $$$` |

#### Go

| Find | Pattern |
|------|---------|
| Functions | `func $NAME($$$) $$$` |
| Methods | `func ($R $TYPE) $NAME($$$) $$$` |
| Imports | `import ($$$)` |
| Structs | `type $NAME struct { $$$ }` |
| Error check | `if err != nil { $$$ }` |

### Common Replacements

| Task | Command |
|------|---------|
| Remove console.log | `--pattern 'console.log($$$)' --rewrite ''` |
| var → const | `--pattern 'var $X = $Y' --rewrite 'const $X = $Y'` |
| Add await | `--pattern '$F()' --rewrite 'await $F()'` |
| Rename function | `--pattern 'oldName($$$)' --rewrite 'newName($$$)'` |

### Workflow

```bash
# 1. Find matches
ast-grep -p 'PATTERN' -l ts src/

# 2. Preview as JSON
ast-grep -p 'PATTERN' -l ts src/ --json | jq

# 3. Git checkpoint
git add . && git commit -m "Pre-refactor"

# 4. Apply replacement
ast-grep -p 'OLD' -r 'NEW' -l ts src/

# 5. Verify
npm test && npm run typecheck
```
```

---

## Task 5.2.5: Test ast-grep Operations

### Test Cases

#### Test 1: Search Operation

```bash
# Create test file
cat > /tmp/test.ts << 'EOF'
function greet(name: string) {
  console.log(`Hello, ${name}`);
  return name;
}

const farewell = (name: string) => {
  console.log(`Goodbye, ${name}`);
};
EOF

# Test search
ast-grep --pattern 'console.log($$$)' --lang typescript /tmp/test.ts
```

**Expected**: Two matches for console.log calls

---

#### Test 2: Replace Operation

```bash
# Test replace (preview)
ast-grep --pattern 'console.log($$$ARGS)' \
         --rewrite 'logger.info($$$ARGS)' \
         --lang typescript /tmp/test.ts \
         --debug-query

# Apply replace
ast-grep --pattern 'console.log($$$ARGS)' \
         --rewrite 'logger.info($$$ARGS)' \
         --lang typescript /tmp/test.ts

# Verify
cat /tmp/test.ts
```

**Expected**: console.log replaced with logger.info

---

#### Test 3: JSON Output

```bash
ast-grep --pattern 'function $NAME($$$)' \
         --lang typescript /tmp/test.ts \
         --json
```

**Expected**: JSON with file, line, column, text

---

#### Test 4: Multi-file Search

```bash
# Search across directory
ast-grep --pattern 'import $$$' --lang typescript src/
```

**Expected**: All imports listed from src/

---

### Test Report Template

```markdown
# AST-grep Test Report

## Date: [DATE]

### Installation Verification
- [ ] ast-grep installed
- [ ] Version: [VERSION]
- [ ] All languages supported

### Search Tests
| Test | Result | Notes |
|------|--------|-------|
| Single file search | PASS/FAIL | |
| Multi-file search | PASS/FAIL | |
| JSON output | PASS/FAIL | |
| Function patterns | PASS/FAIL | |
| Import patterns | PASS/FAIL | |

### Replace Tests
| Test | Result | Notes |
|------|--------|-------|
| Preview (debug) | PASS/FAIL | |
| Actual replace | PASS/FAIL | |
| Variable preservation | PASS/FAIL | |

### Language Tests
| Language | Search | Replace |
|----------|--------|---------|
| TypeScript | PASS/FAIL | PASS/FAIL |
| JavaScript | PASS/FAIL | PASS/FAIL |
| Python | PASS/FAIL | PASS/FAIL |

### Overall: PASS / FAIL
```

---

## Acceptance Criteria

### Task 5.2.1
- [ ] ast-grep installation verified
- [ ] Version checked
- [ ] Language support confirmed

### Task 5.2.2
- [ ] Function patterns documented
- [ ] Class patterns documented
- [ ] Import/export patterns documented
- [ ] Call patterns documented
- [ ] Variable patterns documented
- [ ] React/JSX patterns documented

### Task 5.2.3
- [ ] Replace syntax documented
- [ ] Common transformations listed
- [ ] Import transformations documented
- [ ] Function transformations documented
- [ ] Safety rules included

### Task 5.2.4
- [ ] Cheat sheet created
- [ ] Command structure explained
- [ ] Options listed
- [ ] Pattern variables explained
- [ ] Language-specific patterns included
- [ ] Workflow documented

### Task 5.2.5
- [ ] Search operation tested
- [ ] Replace operation tested
- [ ] JSON output tested
- [ ] Multi-file search tested
- [ ] Test report completed

---

*Context for Tasks 5.2.1 - 5.2.5*
