# Context: Validation and Testing (Tasks 3.1 - 3.3)

## Task Group Overview

This context covers testing the MVP features:
- Task 3.1: Test TodoWrite Integration
- Task 3.2: Test 3-Strikes Protocol
- Task 3.3: Test Task Delegation

---

## Testing Approach

### Manual Integration Testing

Phase 1 validation is manual - we're testing that the CLAUDE.md content produces the expected AI behavior.

### Test Environment

1. Initialize a test project with `muaddib init`
2. Start a Claude Code session
3. Execute test scenarios
4. Observe behavior
5. Document results

---

## Task 3.1: Test TodoWrite Integration

### Purpose

Verify that TodoWrite is used appropriately based on task complexity.

### Test Cases

#### TC-1.1: Single-Step Task (Should NOT Trigger TodoWrite)

**Scenario**: Simple file read

**Input**:
```
"Read the package.json file and tell me what the name is"
```

**Expected Behavior**:
- Direct file read
- No TodoWrite created
- Immediate response

**Pass Criteria**:
- [ ] No todos created
- [ ] Task completed directly

---

#### TC-1.2: Three-Step Task (Should Trigger TodoWrite)

**Scenario**: Multi-step implementation

**Input**:
```
"Create a new utility function that:
1. Reads a JSON file
2. Validates the schema
3. Returns parsed data"
```

**Expected Behavior**:
- TodoWrite created with 3 items
- Each step tracked
- Progress visible to user

**Pass Criteria**:
- [ ] 3 todos created
- [ ] Todos marked in_progress then completed
- [ ] All steps executed

---

#### TC-1.3: Multi-File Operation (Should Trigger TodoWrite)

**Scenario**: Changes across multiple files

**Input**:
```
"Add error handling to all API endpoints in src/api/"
```

**Expected Behavior**:
- TodoWrite created per file or grouped
- Progress tracked
- Completion verification

**Pass Criteria**:
- [ ] Todos created
- [ ] Each file change tracked
- [ ] All marked complete when done

---

#### TC-1.4: Todo Completion Verification

**Scenario**: Ensure todos only marked complete when verified

**Input**:
```
"Create a function that validates emails and write tests for it"
```

**Expected Behavior**:
- Todo for function creation
- Todo for test creation
- Function todo completed only after code works
- Test todo completed only after tests pass

**Pass Criteria**:
- [ ] Completion order correct
- [ ] No premature completion
- [ ] Tests actually run

---

### Validation Checklist for Task 3.1

| Criterion | Status |
|-----------|--------|
| Single-step tasks handled directly | [ ] |
| 3+ step tasks create todos | [ ] |
| Multi-file operations tracked | [ ] |
| Completion requires verification | [ ] |
| Progress visible to user | [ ] |

---

## Task 3.2: Test 3-Strikes Protocol

### Purpose

Verify that error recovery protocol triggers correctly after 3 failures.

### Test Cases

#### TC-2.1: First Failure (Continue)

**Scenario**: Simulate a failing edit

**Setup**:
```
Create a file with known content, then request an edit
with a string that doesn't exist.
```

**Expected Behavior**:
- Edit fails
- Strike 1 counted
- Retry with adjustment

**Pass Criteria**:
- [ ] Failure acknowledged
- [ ] Automatic retry attempted
- [ ] Approach adjusted

---

#### TC-2.2: Second Failure (Continue with Adjustment)

**Scenario**: Second failure in sequence

**Expected Behavior**:
- Second edit fails
- Strike 2 counted
- Different approach tried

**Pass Criteria**:
- [ ] Strike count maintained
- [ ] Strategy changed
- [ ] Still attempting resolution

---

#### TC-2.3: Third Failure (Trigger Protocol)

**Scenario**: Third consecutive failure

**Expected Behavior**:
1. STOP - No more modifications
2. REVERT - Suggest/execute git checkout
3. DOCUMENT - Explain what failed
4. CONSULT - Offer to use Plan agent
5. ESCALATE - Ask user for guidance

**Pass Criteria**:
- [ ] Modifications halted
- [ ] Revert mentioned/executed
- [ ] Failure documented
- [ ] Consultation offered
- [ ] User asked for help

---

#### TC-2.4: Strike Reset After Success

**Scenario**: Success after failure should reset

**Setup**:
1. Cause one failure
2. Successfully complete different task
3. Return to original task

**Expected Behavior**:
- Strike count resets after success
- New failures start from strike 1

**Pass Criteria**:
- [ ] Count resets on success
- [ ] Fresh start on new attempt

---

### Validation Checklist for Task 3.2

| Criterion | Status |
|-----------|--------|
| First failure continues with adjustment | [ ] |
| Second failure tries new approach | [ ] |
| Third failure triggers STOP | [ ] |
| REVERT action mentioned | [ ] |
| Failure documented in response | [ ] |
| CONSULT/ESCALATE offered | [ ] |
| Strike count resets on success | [ ] |

---

## Task 3.3: Test Task Delegation

### Purpose

Verify that agents are correctly selected and delegated to.

### Test Cases

#### TC-3.1: Exploration Delegation

**Scenario**: Request codebase exploration

**Input**:
```
"Find all files that define React components in this project"
```

**Expected Behavior**:
- Task(Explore) used
- Model: haiku
- Results integrated into response

**Pass Criteria**:
- [ ] Explore agent used
- [ ] haiku model selected
- [ ] Results returned and summarized

---

#### TC-3.2: Research Delegation

**Scenario**: Request external research

**Input**:
```
"What's the latest best practice for handling JWT refresh tokens?"
```

**Expected Behavior**:
- Task(general-purpose) or WebSearch used
- Model: haiku for delegation
- External information retrieved

**Pass Criteria**:
- [ ] Research delegated
- [ ] Appropriate agent used
- [ ] Information retrieved

---

#### TC-3.3: Architecture Consultation

**Scenario**: Complex architectural question

**Input**:
```
"I'm trying to decide between microservices and a monolith
for our new project. What should I consider?"
```

**Expected Behavior**:
- Task(Plan) considered
- Model: opus for complex analysis
- Structured guidance provided

**Pass Criteria**:
- [ ] High-complexity recognized
- [ ] Opus model used (if delegated)
- [ ] Thorough analysis provided

---

#### TC-3.4: Direct Handling

**Scenario**: Task that shouldn't be delegated

**Input**:
```
"Add a console.log to the handleSubmit function"
```

**Expected Behavior**:
- No delegation
- Direct implementation
- Quick completion

**Pass Criteria**:
- [ ] No delegation overhead
- [ ] Direct execution
- [ ] Efficient completion

---

#### TC-3.5: Model Selection Verification

**Test Matrix**:

| Task Type | Expected Agent | Expected Model |
|-----------|---------------|----------------|
| "Search for auth files" | Explore | haiku |
| "Find documentation for React hooks" | general-purpose | haiku |
| "Design the database schema" | Plan | opus |
| "Plan the refactoring approach" | Plan | sonnet |
| "Add a button to the form" | (direct) | - |

**Pass Criteria**:
- [ ] Each task uses correct agent
- [ ] Each task uses correct model
- [ ] No over-delegation
- [ ] No under-delegation

---

### Validation Checklist for Task 3.3

| Criterion | Status |
|-----------|--------|
| Explore agent used for codebase search | [ ] |
| general-purpose used for research | [ ] |
| Plan/opus used for architecture | [ ] |
| Simple tasks handled directly | [ ] |
| Model selection matches complexity | [ ] |
| Results properly integrated | [ ] |

---

## Overall Phase 1 Validation

### Final Checklist

Before marking Phase 1 complete, verify all:

**TodoWrite Integration**:
- [ ] 3+ step tasks create todos
- [ ] Completion requires verification
- [ ] Progress visible to user

**3-Strikes Protocol**:
- [ ] Triggers after 3 failures
- [ ] STOP/REVERT/DOCUMENT/CONSULT/ESCALATE sequence
- [ ] Strike count resets appropriately

**Task Delegation**:
- [ ] Correct agents selected
- [ ] Correct models used
- [ ] Direct handling when appropriate

**Overall Behavior**:
- [ ] CLAUDE.md rules referenced
- [ ] Quality standards followed
- [ ] Systematic workflow evident

---

## Documentation of Results

### Test Report Template

```markdown
# Phase 1 Validation Report

## Test Date: [DATE]
## Tester: [NAME]

### TodoWrite Tests
| Test Case | Result | Notes |
|-----------|--------|-------|
| TC-1.1 | PASS/FAIL | |
| TC-1.2 | PASS/FAIL | |
| TC-1.3 | PASS/FAIL | |
| TC-1.4 | PASS/FAIL | |

### 3-Strikes Tests
| Test Case | Result | Notes |
|-----------|--------|-------|
| TC-2.1 | PASS/FAIL | |
| TC-2.2 | PASS/FAIL | |
| TC-2.3 | PASS/FAIL | |
| TC-2.4 | PASS/FAIL | |

### Delegation Tests
| Test Case | Result | Notes |
|-----------|--------|-------|
| TC-3.1 | PASS/FAIL | |
| TC-3.2 | PASS/FAIL | |
| TC-3.3 | PASS/FAIL | |
| TC-3.4 | PASS/FAIL | |
| TC-3.5 | PASS/FAIL | |

### Overall Assessment

**Phase 1 Status**: PASS / FAIL / PARTIAL

**Issues Found**:
1. [Issue description]

**Recommendations**:
1. [Recommendation]
```

---

## Acceptance Criteria

### Task 3.1 (TodoWrite Tests)
- [ ] All 4 test cases executed
- [ ] Results documented
- [ ] Issues addressed

### Task 3.2 (3-Strikes Tests)
- [ ] All 4 test cases executed
- [ ] Protocol triggers correctly
- [ ] Recovery sequence verified

### Task 3.3 (Delegation Tests)
- [ ] All 5 test cases executed
- [ ] Agent selection correct
- [ ] Model selection correct

---

*Context for Tasks 3.1, 3.2, 3.3*
