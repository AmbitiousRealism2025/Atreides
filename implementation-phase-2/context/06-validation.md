# Context: Validation (Task 6.1)

## Task Overview

- Task 6.1: Integration Test - Classification → Delegation

---

## Purpose

Verify that the complete Phase 2 orchestration works end-to-end:
1. Requests are classified correctly
2. Classification leads to appropriate action
3. Delegations use 7-section template
4. Model selection is appropriate
5. Quality hooks execute

---

## Test Environment Setup

### Prerequisites

1. Muad'Dib installed globally
2. Test project initialized with `muaddib init`
3. Phase 2 content in CLAUDE.md
4. settings.json with hooks configured

### Test Project Structure

```
test-project/
├── CLAUDE.md              # With Phase 1+2 content
├── .claude/
│   └── settings.json      # With quality hooks
├── src/
│   ├── index.ts
│   ├── utils.ts
│   └── auth/
│       └── login.ts
├── tests/
│   └── utils.test.ts
├── package.json
└── tsconfig.json
```

---

## Integration Test Cases

### TC-1: Trivial Request → Direct Answer

**Input**:
```
"What does the formatDate function do?"
```

**Expected Classification**: TRIVIAL

**Expected Behavior**:
- [ ] No TodoWrite created
- [ ] No Task delegation
- [ ] Direct answer provided
- [ ] May read file for accuracy

**Verification**:
- Response is concise
- No unnecessary tool usage

---

### TC-2: Explicit Request → Immediate Execution

**Input**:
```
"Add a console.log statement at the beginning of the login function in src/auth/login.ts"
```

**Expected Classification**: EXPLICIT

**Expected Behavior**:
- [ ] File read first
- [ ] Edit made directly
- [ ] Quality hooks run (formatting)
- [ ] TodoWrite if additional steps needed

**Verification**:
- Edit completed
- File formatted after edit
- No unnecessary exploration

---

### TC-3: Exploratory Request → Exploration First

**Input**:
```
"Find all places where we handle user authentication errors"
```

**Expected Classification**: EXPLORATORY

**Expected Behavior**:
- [ ] Task(Explore) launched
- [ ] haiku model used
- [ ] 7-section template in delegation
- [ ] Results synthesized

**Verification**:
- Delegation prompt structure correct:
  - TASK section present
  - EXPECTED OUTCOME clear
  - MUST DO / MUST NOT DO present
- Results returned and summarized

**Sample Expected Delegation**:
```
Task(
  subagent_type="Explore",
  model="haiku",
  prompt="""
## 1. TASK
Find all error handling related to user authentication.

## 2. EXPECTED OUTCOME
- List of file paths with authentication error handling
- Line numbers for each occurrence
- Type of error handling (try/catch, .catch, error callback)

## 3. CONTEXT
- Files: src/**/*.ts
- Patterns: Looking for try/catch, .catch(), error handlers
- Background: Need to standardize auth error handling

## 4. MUST DO
- Search all TypeScript files
- Include both sync and async error handling
- Note the error types being caught

## 5. MUST NOT DO
- Do NOT modify any files
- Do NOT analyze node_modules

## 7. SUCCESS CRITERIA
- [ ] All auth-related files searched
- [ ] Error patterns identified
- [ ] Locations documented
"""
)
```

---

### TC-4: Ambiguous Request → Clarification

**Input**:
```
"Make the auth system better"
```

**Expected Classification**: AMBIGUOUS

**Expected Behavior**:
- [ ] AskUserQuestion used
- [ ] Clarifying questions asked about:
  - What aspect to improve
  - Specific issues to address
  - Success criteria
- [ ] No implementation started

**Verification**:
- Questions are relevant
- Multiple options provided
- Implementation waits for response

**Expected Questions**:
1. "What aspects of auth need improvement?" (Security, Performance, UX)
2. "Are there specific issues you're seeing?"
3. "What would success look like?"

---

### TC-5: Open-ended Request → Full Assessment

**Input**:
```
"Refactor the authentication module to support OAuth providers"
```

**Expected Classification**: OPEN-ENDED

**Expected Behavior**:
- [ ] Codebase maturity assessed (or referenced if done)
- [ ] Exploration phase initiated
- [ ] Task(Plan) considered for strategy
- [ ] TodoWrite created for phases
- [ ] May use opus for architecture decisions

**Verification**:
- Assessment or reference to existing assessment
- Planning before implementation
- Multiple steps tracked
- Architecture considered

---

### TC-6: Delegation with Correct Model Selection

**Scenario**: Test model selection across different tasks

| Request | Expected Model | Verification |
|---------|---------------|--------------|
| "Find all test files" | haiku | Search task |
| "Implement the validation" | sonnet | Implementation |
| "Design the new API structure" | opus | Architecture |

**Verification**:
- Each delegation uses correct model
- Rationale could be explained

---

### TC-7: Quality Hooks Integration

**Setup**: Edit a TypeScript file

**Expected**:
- Edit operation completes
- PostToolUse hooks fire
- Prettier runs (or attempts to)
- ESLint runs (or attempts to)
- File is modified by hooks

**Verification**:
- Check file formatting after edit
- No blocking errors from hooks
- Hooks executed in order

---

## Test Execution Checklist

### Pre-Test

- [ ] Test project initialized
- [ ] CLAUDE.md has Phase 1+2 content
- [ ] settings.json has hooks configured
- [ ] Formatters installed (npm install -D prettier eslint)

### During Test

For each test case, document:

| Field | Value |
|-------|-------|
| Test Case | TC-X |
| Input | [User request] |
| Classification Observed | [Category] |
| Expected Classification | [Category] |
| Behavior Observed | [Description] |
| Template Used | Yes/No |
| Model Selected | [haiku/sonnet/opus] |
| Hooks Fired | Yes/No |
| Result | PASS/FAIL |
| Notes | [Any observations] |

### Post-Test

- [ ] All 7 test cases executed
- [ ] Results documented
- [ ] Issues identified
- [ ] Fixes applied if needed

---

## Test Report Template

```markdown
# Phase 2 Integration Test Report

## Test Date: [DATE]
## Tester: [NAME]
## Project: [TEST_PROJECT_PATH]

### Summary

| Test Case | Result | Notes |
|-----------|--------|-------|
| TC-1: Trivial | PASS/FAIL | |
| TC-2: Explicit | PASS/FAIL | |
| TC-3: Exploratory | PASS/FAIL | |
| TC-4: Ambiguous | PASS/FAIL | |
| TC-5: Open-ended | PASS/FAIL | |
| TC-6: Model Selection | PASS/FAIL | |
| TC-7: Quality Hooks | PASS/FAIL | |

### Overall Result: PASS / PARTIAL / FAIL

### Issues Found

1. [Issue description]
   - Expected: [what should happen]
   - Actual: [what happened]
   - Severity: [High/Medium/Low]

### Recommendations

1. [Recommendation]

### Next Steps

- [ ] Fix identified issues
- [ ] Re-run failed tests
- [ ] Proceed to Phase 3
```

---

## Acceptance Criteria

### Task 6.1
- [ ] All 7 test cases executed
- [ ] Classification accuracy verified
- [ ] 7-section template usage verified
- [ ] Model selection verified
- [ ] Quality hooks verified
- [ ] Test report completed
- [ ] Any issues addressed

---

## Exit Criteria for Phase 2

Phase 2 is complete when:

1. ✅ Requests are classified before action
2. ✅ All delegations use 7-section template
3. ✅ Model selection is cost-aware
4. ✅ Quality hooks run automatically
5. ✅ Project maturity is documented
6. ✅ Integration tests pass

---

*Context for Task 6.1*
