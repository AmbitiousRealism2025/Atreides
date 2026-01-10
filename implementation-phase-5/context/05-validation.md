# Context: Validation (Tasks 5.5.1 - 5.5.4)

## Task Group Overview

- Task 5.5.1: Integration test: LSP operations
- Task 5.5.2: Integration test: ast-grep workflow
- Task 5.5.3: Integration test: checkpoint system
- Task 5.5.4: Integration test: automation patterns

---

## Task 5.5.1: Integration Test - LSP Operations

### Purpose

Verify LSP operations work in realistic scenarios.

### Test Scenario: Find and Fix Type Error

**Setup**:
```typescript
// Create test file: src/example.ts
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User) {
  console.log(`Hello, ${user.nam}`); // Intentional typo
}

const user: User = {
  id: 1,
  name: 'Alice',
  email: 'alice@example.com'
};

greetUser(user);
```

**Test Steps**:

1. **Get Diagnostics**:
   ```bash
   npx tsc --noEmit src/example.ts
   ```
   Expected: Error about `nam` not existing on `User`

2. **Find Definition**:
   ```bash
   # Find User interface
   grep -n "interface User" src/example.ts
   ```
   Expected: Line number of User definition

3. **Find References**:
   ```bash
   grep -rn "User" --include="*.ts" src/
   ```
   Expected: All usages of User type

4. **Fix and Verify**:
   - Edit `user.nam` → `user.name`
   - Re-run: `npx tsc --noEmit src/example.ts`
   Expected: No errors

---

### Test Scenario: Refactor with Find References

**Task**: Rename `greetUser` to `sayHelloTo`

1. **Find all usages**:
   ```bash
   grep -rn "greetUser" --include="*.ts" src/
   ```

2. **Update each usage**

3. **Verify no broken references**:
   ```bash
   npx tsc --noEmit
   ```

---

### Test Report Template

```markdown
# LSP Integration Test Report

## Date: [DATE]
## Method: MCP / CLI Fallback

### Scenario: Find and Fix Type Error
- [ ] Diagnostics detected error
- [ ] Definition found correctly
- [ ] References found correctly
- [ ] Fix verified

### Scenario: Refactor with References
- [ ] All usages found
- [ ] Updates applied
- [ ] No broken references

### Notes
[Any issues or observations]

### Result: PASS / FAIL
```

---

## Task 5.5.2: Integration Test - ast-grep Workflow

### Purpose

Verify ast-grep works for real refactoring tasks.

### Test Scenario: Migrate console.log to Logger

**Setup**:
```typescript
// Create test files
// src/service.ts
export function fetchData() {
  console.log('Fetching data...');
  const data = getData();
  console.log('Data fetched:', data);
  return data;
}

// src/handler.ts
export function handleRequest(req: Request) {
  console.log('Request received:', req.id);
  const result = process(req);
  console.log('Request processed');
  return result;
}
```

**Test Steps**:

1. **Find all console.log**:
   ```bash
   ast-grep --pattern 'console.log($$$ARGS)' --lang typescript src/
   ```
   Expected: 4 matches across 2 files

2. **Preview replacement**:
   ```bash
   ast-grep --pattern 'console.log($$$ARGS)' \
            --rewrite 'logger.info($$$ARGS)' \
            --lang typescript src/ \
            --debug-query
   ```
   Expected: Shows what would change

3. **Apply replacement**:
   ```bash
   ast-grep --pattern 'console.log($$$ARGS)' \
            --rewrite 'logger.info($$$ARGS)' \
            --lang typescript src/
   ```

4. **Verify changes**:
   ```bash
   grep -r "console.log" src/
   # Expected: No matches

   grep -r "logger.info" src/
   # Expected: 4 matches
   ```

5. **Add import** (if needed):
   ```bash
   # Check for missing import
   ast-grep --pattern 'logger.info($$$)' --lang typescript src/
   # Add import to each file
   ```

---

### Test Scenario: Convert Function Syntax

**Task**: Convert function declarations to arrow functions

```bash
# Before
ast-grep --pattern 'function $NAME($$$PARAMS) { return $EXPR; }' \
         --lang typescript src/

# Apply
ast-grep --pattern 'function $NAME($$$PARAMS) { return $EXPR; }' \
         --rewrite 'const $NAME = ($$$PARAMS) => $EXPR;' \
         --lang typescript src/

# Verify syntax
npx tsc --noEmit
```

---

### Test Report Template

```markdown
# ast-grep Integration Test Report

## Date: [DATE]

### Scenario: Migrate console.log
- [ ] All occurrences found
- [ ] Preview showed correct changes
- [ ] Replacement applied
- [ ] Changes verified
- [ ] No regressions

### Scenario: Convert Function Syntax
- [ ] Functions found
- [ ] Conversion applied
- [ ] Syntax still valid
- [ ] Types still check

### Notes
[Any issues or observations]

### Result: PASS / FAIL
```

---

## Task 5.5.3: Integration Test - Checkpoint System

### Purpose

Verify checkpoints enable recovery from interruption.

### Test Scenario: Interrupted Refactoring

**Setup**:
- Multi-file refactoring task
- Checkpoint created at start
- Work partially complete

**Simulation**:

1. **Start Task**:
   ```
   User: "Refactor authentication to use new token format"

   Create checkpoint with:
   - Objective
   - 5 files to modify
   - 0/5 complete
   ```

2. **Partial Progress**:
   ```
   Complete 2 of 5 files

   Update checkpoint:
   - 2/5 complete
   - Files done: auth.ts, session.ts
   - Next: middleware.ts
   ```

3. **Simulate Interruption**:
   - Clear conversation context
   - New session starts

4. **Recovery**:
   ```
   New session reads checkpoint.md

   Should identify:
   - What was being done
   - What's complete
   - What's next
   ```

5. **Continue**:
   ```
   Resume from file 3 (middleware.ts)
   Complete remaining work
   Clear checkpoint when done
   ```

---

### Test Scenario: Risky Operation Recovery

1. **Before Risky Op**:
   ```
   Update checkpoint:
   - About to: Delete and recreate database schema
   - Rollback: git checkout migrations/
   ```

2. **If Operation Fails**:
   ```
   Read checkpoint
   Execute rollback instructions
   Adjust approach
   ```

---

### Test Report Template

```markdown
# Checkpoint System Integration Test Report

## Date: [DATE]

### Scenario: Interrupted Refactoring
- [ ] Checkpoint created at start
- [ ] Checkpoint updated during work
- [ ] Recovery identified correct state
- [ ] Work continued from correct point
- [ ] Checkpoint cleared when done

### Scenario: Risky Operation
- [ ] Checkpoint created before risk
- [ ] Rollback instructions included
- [ ] Recovery worked (if needed)

### Notes
[Any issues or observations]

### Result: PASS / FAIL
```

---

## Task 5.5.4: Integration Test - Automation Patterns

### Purpose

Verify automation patterns work for real tasks.

### Test Scenario: Test-Driven Pattern

**Task**: Add input validation feature

1. **Write failing test**:
   ```typescript
   // tests/validation.test.ts
   test('rejects empty email', () => {
     expect(() => validateEmail('')).toThrow('Email required');
   });
   ```

2. **Confirm failure**:
   ```bash
   npm test tests/validation.test.ts
   # Should fail
   ```

3. **Implement**:
   ```typescript
   // src/validation.ts
   export function validateEmail(email: string) {
     if (!email) throw new Error('Email required');
   }
   ```

4. **Confirm pass**:
   ```bash
   npm test tests/validation.test.ts
   # Should pass
   ```

---

### Test Scenario: Incremental Refactoring Pattern

**Task**: Rename `getData` to `fetchData` across codebase

1. **Identify scope**:
   ```bash
   grep -rn "getData" --include="*.ts" src/
   # Found in 4 files
   ```

2. **Create todos**:
   ```
   1. Refactor src/api.ts
   2. Refactor src/service.ts
   3. Refactor src/handler.ts
   4. Refactor tests/api.test.ts
   5. Final verification
   ```

3. **For each file**:
   - Read file
   - Apply change
   - Run tests
   - Mark complete

4. **Final verification**:
   ```bash
   npm test
   npm run typecheck
   ```

---

### Test Scenario: Documentation Sync Pattern

**Task**: After adding new API endpoint

1. **Identify affected docs**:
   - README.md
   - docs/api.md
   - CHANGELOG.md
   - Inline comments

2. **Update each**:
   - Add endpoint to README
   - Document in api.md
   - Add to CHANGELOG
   - Add JSDoc comments

3. **Verify**:
   - Documentation matches implementation
   - Examples work

---

### Test Report Template

```markdown
# Automation Patterns Integration Test Report

## Date: [DATE]

### Scenario: Test-Driven Pattern
- [ ] Test written first
- [ ] Test failed initially
- [ ] Implementation passed test
- [ ] Pattern followed correctly

### Scenario: Incremental Refactoring
- [ ] Scope identified
- [ ] Todos created
- [ ] Each file done incrementally
- [ ] Tests run after each change
- [ ] Final verification passed

### Scenario: Documentation Sync
- [ ] Affected docs identified
- [ ] All docs updated
- [ ] Documentation accurate

### Notes
[Any issues or observations]

### Result: PASS / FAIL
```

---

## Complete Phase 5 Validation Report Template

```markdown
# Phase 5 Validation Report

## Test Date: [DATE]

### Task 5.5.1: LSP Operations
| Test | Result | Notes |
|------|--------|-------|
| Diagnostics | PASS/FAIL | |
| Find Definition | PASS/FAIL | |
| Find References | PASS/FAIL | |
| Refactor with LSP | PASS/FAIL | |

### Task 5.5.2: ast-grep Workflow
| Test | Result | Notes |
|------|--------|-------|
| Search patterns | PASS/FAIL | |
| Replace patterns | PASS/FAIL | |
| Multi-file refactor | PASS/FAIL | |

### Task 5.5.3: Checkpoint System
| Test | Result | Notes |
|------|--------|-------|
| Create checkpoint | PASS/FAIL | |
| Update checkpoint | PASS/FAIL | |
| Recover from checkpoint | PASS/FAIL | |
| Clear checkpoint | PASS/FAIL | |

### Task 5.5.4: Automation Patterns
| Test | Result | Notes |
|------|--------|-------|
| Test-driven | PASS/FAIL | |
| Incremental refactoring | PASS/FAIL | |
| Documentation sync | PASS/FAIL | |

### Overall Phase 5 Status: PASS / PARTIAL / FAIL

### OmO Parity Assessment
- Estimated parity achieved: [X]%
- Key gaps remaining: [List]

### Issues Found
1. [Issue]

### Recommendations
1. [Recommendation]

### MUAD'DIB IMPLEMENTATION STATUS: COMPLETE / NEEDS WORK
```

---

## Acceptance Criteria

### Task 5.5.1
- [ ] Diagnostics tested
- [ ] Find definition tested
- [ ] Find references tested
- [ ] Refactoring workflow tested
- [ ] Test report completed

### Task 5.5.2
- [ ] Search patterns tested
- [ ] Replace patterns tested
- [ ] Multi-file workflow tested
- [ ] Test report completed

### Task 5.5.3
- [ ] Checkpoint creation tested
- [ ] Checkpoint update tested
- [ ] Recovery tested
- [ ] Checkpoint clearing tested
- [ ] Test report completed

### Task 5.5.4
- [ ] Test-driven pattern tested
- [ ] Incremental refactoring tested
- [ ] Documentation sync tested
- [ ] Test report completed

---

## Final Phase 5 Acceptance

Phase 5 is complete when:
- [ ] All integration tests pass
- [ ] LSP operations functional (MCP or CLI)
- [ ] ast-grep fully integrated
- [ ] Checkpoint system working
- [ ] All automation patterns documented and tested
- [ ] ~75-80% OmO parity achieved
- [ ] Muad'Dib implementation complete

---

*Context for Tasks 5.5.1 - 5.5.4*
