# Context: Validation (Tasks 6.1 - 6.3)

## Task Group Overview

- Task 6.1: Test Complete Workflow (Phase 0 → Phase 3)
- Task 6.2: Test Parallel Exploration
- Task 6.3: Test Completion Checking

---

## Task 6.1: Test Complete Workflow

### Purpose

Verify end-to-end workflow from request to completion.

### Test Case: Open-Ended Request

**Scenario**: Complete workflow for an open-ended request

**Input**:
```
"Refactor the user authentication module to support OAuth2 providers"
```

**Expected Flow**:

```
Phase 0: Intent Gate
├── Classification: OPEN-ENDED
├── Gate: Requirements understood? YES
└── Route to: Phase 1

Phase 1: Assessment
├── Check codebase maturity
├── Identify existing auth patterns
├── Document findings
└── Gate: Context gathered? YES

Phase 2A: Exploration
├── Task(Explore) - Find existing auth code
├── Task(general-purpose) - Research OAuth2 best practices
├── Synthesize findings
└── Gate: Sufficient context? YES

Phase 2B: Implementation
├── Create TodoWrite items
│   ├── Add OAuth2 configuration
│   ├── Create OAuth2 client abstraction
│   ├── Implement provider-specific handlers
│   ├── Update login flow
│   └── Add tests
├── Execute each todo
├── Quality checks after each edit
└── Gate: All todos complete? YES

Phase 3: Completion
├── TodoWrite audit: All complete
├── Quality verification: Tests passing
├── Deliverable check: OAuth2 working
├── Summary provided
└── DONE
```

**Verification Checklist**:
- [ ] Phase 0 classification occurred
- [ ] Phase 1 assessment was done
- [ ] Phase 2A exploration was parallel
- [ ] Phase 2B used TodoWrite
- [ ] Phase 3 verification happened
- [ ] Summary provided at end

---

### Test Case: Explicit Request

**Scenario**: Simple explicit request (skips phases)

**Input**:
```
"Add a console.log to the login function showing the username"
```

**Expected Flow**:

```
Phase 0: Intent Gate
├── Classification: EXPLICIT
├── Gate: Clear enough? YES
└── Route to: Phase 2B (skip 1, 2A)

Phase 2B: Implementation
├── Read login file
├── Add console.log
├── Quality hooks run (format)
└── Gate: Complete? YES

Phase 3: Completion
├── No todos needed (single step)
├── Verify change made
├── Summary: "Added console.log to login function"
└── DONE
```

**Verification Checklist**:
- [ ] Correctly skipped Phase 1 and 2A
- [ ] Direct implementation
- [ ] Quick completion

---

### Test Case: Ambiguous Request

**Scenario**: Request needs clarification

**Input**:
```
"Make the login better"
```

**Expected Flow**:

```
Phase 0: Intent Gate
├── Classification: AMBIGUOUS
├── Gate: Clear enough? NO
└── Action: AskUserQuestion

"What aspect of login should be improved?"
- Security (prevent brute force, add 2FA)
- Performance (faster authentication)
- UX (better error messages, social login)
- Other: [specify]

User responds: "Security - add rate limiting"

Phase 0: Re-classify
├── Classification: EXPLICIT/EXPLORATORY
└── Continue to appropriate phase...
```

**Verification Checklist**:
- [ ] Identified as ambiguous
- [ ] Asked clarifying questions
- [ ] Waited for response
- [ ] Re-classified after clarification

---

## Task 6.2: Test Parallel Exploration

### Purpose

Verify multiple agents launch in single message.

### Test Case: Parallel Launch

**Input**:
```
"I need to understand how error handling works across the application"
```

**Expected Behavior**:

1. **Single message contains multiple Task calls**:
```
// Should see in the same response:
Task(Explore, haiku, "Find error handling patterns in src/")
Task(Explore, haiku, "Find error middleware and interceptors")
Task(general-purpose, haiku, "Research Express error handling best practices")
```

2. **Results returned together**:
```
## Exploration Results

### Internal (Codebase)
- Error handler in src/middleware/error.ts
- Custom errors in src/errors/
- Try/catch in API routes

### External (Research)
- Express error middleware pattern
- Async error handling
- Status code conventions
```

**Verification Checklist**:
- [ ] Multiple Task calls in same message
- [ ] Both Explore and general-purpose used
- [ ] Results synthesized together
- [ ] haiku model used (cost-effective)

---

### Test Case: Convergent Search

**Input**:
```
"Find where user sessions are managed"
```

**Expected Behavior**:

```
Round 1:
├── Task(Explore) - "Find session management code"
├── Found: src/auth/session.ts, src/middleware/auth.ts
└── Check: Converged? Not yet - need more detail

Round 2:
├── Task(Explore) - "Find session storage and expiry logic"
├── Found: Same files + src/config/session.ts
└── Check: Converged? YES - same areas, have details

Stop: Sufficient context gathered
```

**Verification Checklist**:
- [ ] First round executed
- [ ] Convergence checked
- [ ] Second round (if needed)
- [ ] Stopped when converged (not excessive rounds)

---

## Task 6.3: Test Completion Checking

### Purpose

Verify premature stop prevention works.

### Test Case: Attempt Early Stop

**Scenario**: Task with multiple todos, attempt to stop early

**Setup**:
```
User: "Add validation to all form inputs in the user settings page"

Expected todos created:
1. Add email validation
2. Add phone validation
3. Add address validation
4. Update tests
```

**Test**: After completing todos 1 and 2, observe behavior

**Expected Behavior**:

```
❌ WRONG:
"I've added email and phone validation. Let me know if you want
me to continue with the rest."

✅ CORRECT:
Continue to todos 3 and 4 without asking.
Only stop when ALL are complete.
```

**Verification Checklist**:
- [ ] Continued without asking
- [ ] Completed all todos
- [ ] Summary only at end

---

### Test Case: Quality Check Failure

**Scenario**: Quality check fails, must fix before completing

**Setup**:
```
Implementation complete, but:
- npm run lint shows errors
- Or tests are failing
```

**Expected Behavior**:

```
❌ WRONG:
"Implementation is complete. Note: There are some lint errors
you may want to fix."

✅ CORRECT:
1. Detect lint errors
2. Fix the errors
3. Re-run lint
4. Only then mark complete
```

**Verification Checklist**:
- [ ] Detected quality failure
- [ ] Fixed issues
- [ ] Re-ran checks
- [ ] Completed only when passing

---

### Test Case: Incomplete Deliverables

**Scenario**: User requested A, B, C but only A and B were done

**Setup**:
```
User: "Add login, logout, and password reset endpoints"
```

**Test**: What happens if password reset is forgotten

**Expected Behavior**:

```
Phase 3: Completion
├── Deliverable Check
│   ├── Login endpoint: ✅
│   ├── Logout endpoint: ✅
│   └── Password reset: ❌ MISSING
└── Action: Return to Phase 2B, complete password reset
```

**Verification Checklist**:
- [ ] Caught missing deliverable
- [ ] Returned to implementation
- [ ] Completed missing item
- [ ] Final verification passed

---

## Test Report Template

```markdown
# Phase 3 Validation Report

## Test Date: [DATE]

### Test 6.1: Complete Workflow
| Scenario | Result | Notes |
|----------|--------|-------|
| Open-ended request | PASS/FAIL | |
| Explicit request | PASS/FAIL | |
| Ambiguous request | PASS/FAIL | |

### Test 6.2: Parallel Exploration
| Scenario | Result | Notes |
|----------|--------|-------|
| Parallel launch | PASS/FAIL | |
| Convergent search | PASS/FAIL | |

### Test 6.3: Completion Checking
| Scenario | Result | Notes |
|----------|--------|-------|
| Early stop prevention | PASS/FAIL | |
| Quality check failure | PASS/FAIL | |
| Incomplete deliverables | PASS/FAIL | |

### Overall: PASS / PARTIAL / FAIL

### Issues Found
1. [Issue]

### Phase 3 Status: READY / NEEDS FIXES
```

---

## Acceptance Criteria

### Task 6.1
- [ ] Full workflow tested (open-ended)
- [ ] Shortcut workflow tested (explicit)
- [ ] Clarification workflow tested (ambiguous)
- [ ] All phase transitions verified

### Task 6.2
- [ ] Parallel launch verified
- [ ] Multiple agents in single message
- [ ] Convergent search stops appropriately

### Task 6.3
- [ ] Early stop prevented
- [ ] Quality failures caught
- [ ] Missing deliverables caught
- [ ] Complete only when truly complete

---

*Context for Tasks 6.1, 6.2, 6.3*
