# Context: Workflow Phases (Tasks 1.1 - 1.6)

## Task Group Overview

- Task 1.1: Phase 0 (Intent Gate)
- Task 1.2: Phase 1 (Assessment)
- Task 1.3: Phase 2A (Exploration)
- Task 1.4: Phase 2B (Implementation)
- Task 1.5: Phase 2C (Recovery)
- Task 1.6: Phase 3 (Completion)

---

## Complete Workflow Content

```markdown
## Workflow Phases

### Overview

Every task progresses through defined phases:

```
Request → Phase 0 → [Phase 1] → [Phase 2A] → Phase 2B → [Phase 2C] → Phase 3 → Done
                        ↑            ↑                       ↑
                   (complex)    (explore)              (failures)
```

---

### Phase 0: Intent Gate

**Purpose**: Classify and validate request before work begins.

**Always Execute This Phase First**

**Actions**:
1. Read and understand the request
2. Classify the request type:
   - **Trivial**: Simple question → Answer directly, skip other phases
   - **Explicit**: Clear implementation → Skip to Phase 2B
   - **Exploratory**: Needs investigation → Proceed to Phase 2A
   - **Open-ended**: Architectural → Proceed to Phase 1
   - **Ambiguous**: Unclear → AskUserQuestion, then re-classify

**Gate Criteria** (must be true to proceed):
- [ ] Request is clearly understood
- [ ] Scope boundaries are defined
- [ ] Success criteria are known

**If Gate Fails**: Use AskUserQuestion to clarify before proceeding.

---

### Phase 1: Codebase Assessment

**Purpose**: Evaluate project state for complex tasks.

**Triggers**:
- Open-ended requests
- Unfamiliar codebase
- Architectural decisions
- First time working on project

**Actions**:
1. Assess codebase maturity:
   - Check test coverage
   - Evaluate code consistency
   - Review documentation
   - Identify patterns

2. Document findings:
   - DISCIPLINED / TRANSITIONAL / LEGACY / GREENFIELD
   - Key patterns to follow
   - Dependencies to respect

3. Identify constraints:
   - Technology stack
   - Existing conventions
   - Integration points

**Gate Criteria**:
- [ ] Maturity level documented
- [ ] Key patterns identified
- [ ] Dependencies understood
- [ ] Constraints known

**If Already Assessed**: Reference existing assessment, don't repeat.

---

### Phase 2A: Exploration & Research

**Purpose**: Gather context through parallel investigation.

**Triggers**:
- Exploratory requests
- Insufficient context for implementation
- "Find", "where", "how does" questions
- Unknown file locations

**Actions**:
1. **Launch parallel exploration agents** (in SINGLE message):
   ```
   Task(Explore, haiku, "Search codebase for [pattern]")
   Task(general-purpose, haiku, "Research [external topic]")
   ```

2. **Synthesize findings**:
   - Combine internal and external results
   - Identify relevant files
   - Note patterns and conventions

3. **Determine if sufficient**:
   - Convergence: Same info from multiple sources
   - Sufficiency: Enough to proceed confidently
   - Iteration limit: Stop after 2 rounds with no new info

**Gate Criteria**:
- [ ] Relevant files identified
- [ ] Patterns understood
- [ ] Dependencies mapped
- [ ] Ready to implement

**Continue Exploring If**:
- Key information still missing
- Conflicting findings need resolution
- Under iteration limit

---

### Phase 2B: Implementation

**Purpose**: Execute the actual development work.

**Triggers**:
- Explicit requests (from Phase 0)
- Sufficient context gathered (from Phase 2A)
- Clear path forward

**Actions**:
1. **Create TodoWrite items** for multi-step work:
   - Break into atomic tasks
   - One deliverable per todo
   - Clear completion criteria

2. **Execute implementation**:
   - Handle core logic directly
   - Follow existing patterns exactly
   - Run quality checks after edits

3. **Delegate specialized work**:
   - UI/Frontend → Task(frontend-architect, sonnet)
   - Security review → Task(security-engineer, sonnet)
   - Complex analysis → Task(Plan, opus)

4. **Track progress**:
   - Update todo status
   - Mark complete only when verified
   - Never leave code broken

**Implementation Rules**:
- Match existing code style
- Run formatters and linters (hooks should do this)
- Verify each change works before proceeding
- Commit logical checkpoints (if requested)

**Gate Criteria**:
- [ ] All todos marked complete
- [ ] Quality checks pass
- [ ] Code is in working state

---

### Phase 2C: Failure Recovery

**Purpose**: Handle persistent failures gracefully.

**Trigger**: 3 consecutive failures on the same operation.

**Protocol**:

```
┌─────────┐
│  STOP   │ → Halt all file modifications immediately
└────┬────┘
     ↓
┌─────────┐
│ REVERT  │ → git checkout to last working state
└────┬────┘
     ↓
┌─────────┐
│DOCUMENT │ → Record in response:
└────┬────┘   • What was attempted
     │        • What failed
     │        • Error messages
     ↓
┌─────────┐
│ CONSULT │ → Task(Plan, opus, "Given these failures,
└────┬────┘                      suggest alternative approach")
     ↓
┌─────────┐
│ESCALATE │ → AskUserQuestion:
└─────────┘   "I've encountered persistent failures.
              Here's what happened: [summary]
              How would you like to proceed?"
```

**Recovery Rules**:
- Never continue hoping errors will resolve
- Never disable tests to make them pass
- Never ignore type errors
- Always investigate root cause
- Document lessons for future

**After Recovery**:
- If new approach found → Return to Phase 2B
- If user provides direction → Follow user guidance
- If insurmountable → Document and close gracefully

---

### Phase 3: Completion

**Purpose**: Verify and deliver results.

**Triggers**:
- Implementation complete (from Phase 2B)
- Recovery resolved (from Phase 2C)

**Actions**:

1. **TodoWrite Audit**:
   - Are ALL todos marked complete?
   - Were any skipped or forgotten?
   - If incomplete: CONTINUE, don't stop

2. **Quality Verification**:
   ```bash
   # Run relevant checks
   npm run lint    # or equivalent
   npm run test    # if tests exist
   npm run build   # if applicable
   ```
   - Fix any failures before completing

3. **Deliverable Verification**:
   - Does output match requirements?
   - Were all requested changes made?
   - Is code in working state?

4. **State Cleanup**:
   - Remove temporary files
   - Clean up debug code
   - Ensure git status is appropriate

5. **Summary**:
   - What was accomplished
   - What changed (files, functionality)
   - Any notes or recommendations

**Gate Criteria**:
- [ ] All todos complete
- [ ] Quality checks pass
- [ ] Deliverables match requirements
- [ ] Summary provided
```

---

## Task-Specific Acceptance Criteria

### Task 1.1 (Phase 0)
- [ ] Purpose stated
- [ ] Classification types listed
- [ ] Actions numbered
- [ ] Gate criteria checkable

### Task 1.2 (Phase 1)
- [ ] Triggers defined
- [ ] Assessment actions clear
- [ ] Gate criteria specific
- [ ] Skip condition noted

### Task 1.3 (Phase 2A)
- [ ] Parallel pattern shown
- [ ] Synthesis step included
- [ ] Termination conditions clear
- [ ] Gate criteria defined

### Task 1.4 (Phase 2B)
- [ ] TodoWrite integration
- [ ] Delegation patterns
- [ ] Implementation rules
- [ ] Gate criteria checkable

### Task 1.5 (Phase 2C)
- [ ] Trigger clear (3 strikes)
- [ ] Protocol diagram
- [ ] Recovery rules
- [ ] Exit paths defined

### Task 1.6 (Phase 3)
- [ ] Audit steps listed
- [ ] Quality checks specified
- [ ] Summary requirement
- [ ] Gate criteria final

---

*Context for Tasks 1.1-1.6*
