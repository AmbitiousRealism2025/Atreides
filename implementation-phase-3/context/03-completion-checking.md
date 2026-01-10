# Context: Completion Checking (Tasks 3.1 - 3.2)

## Task Group Overview

- Task 3.1: Add Completion Checking Protocol
- Task 3.2: Add Completion Rules

---

## Task 3.1: Completion Checking Protocol

### Content Template

```markdown
## Completion Checking Protocol

### Before Ending ANY Multi-Step Task

Execute this checklist before declaring work complete:

#### 1. TodoWrite Audit

```
┌─────────────────────────────────────────┐
│           TODO AUDIT                     │
├─────────────────────────────────────────┤
│ ☐ Are ALL todos marked complete?        │
│ ☐ Were any todos skipped?               │
│ ☐ Were any todos added and forgotten?   │
├─────────────────────────────────────────┤
│ If ANY incomplete → CONTINUE WORKING    │
│ Do NOT stop until all are done          │
└─────────────────────────────────────────┘
```

**Check**:
- Review each todo item
- Verify "completed" status is accurate
- Ensure no items were forgotten mid-stream

**If Incomplete**:
- Return to implementation
- Complete remaining items
- Do NOT ask user if they want to stop

#### 2. Quality Verification

```
┌─────────────────────────────────────────┐
│         QUALITY CHECKS                   │
├─────────────────────────────────────────┤
│ ☐ Did linters pass?                     │
│ ☐ Did type checks pass?                 │
│ ☐ Did tests pass? (if applicable)       │
│ ☐ Did build succeed? (if applicable)    │
├─────────────────────────────────────────┤
│ If ANY failed → FIX before completing   │
└─────────────────────────────────────────┘
```

**Run These Commands** (as appropriate):
```bash
# JavaScript/TypeScript
npm run lint
npm run typecheck
npm test

# Python
ruff check .
mypy .
pytest

# Go
go vet ./...
go test ./...

# Rust
cargo clippy
cargo test
```

**If Failures**:
- Fix the issues
- Re-run checks
- Only complete when passing

#### 3. Deliverable Check

```
┌─────────────────────────────────────────┐
│       DELIVERABLE VERIFICATION           │
├─────────────────────────────────────────┤
│ ☐ Does output match requirements?       │
│ ☐ Were ALL requested changes made?      │
│ ☐ Is code in working state?             │
│ ☐ Does it do what user asked for?       │
├─────────────────────────────────────────┤
│ If gaps exist → ADDRESS before stopping │
└─────────────────────────────────────────┘
```

**Compare Against Original Request**:
- Re-read the user's request
- Check each requirement explicitly
- Verify nothing was missed

#### 4. State Verification

```
┌─────────────────────────────────────────┐
│         STATE CHECK                      │
├─────────────────────────────────────────┤
│ ☐ Is codebase in clean state?           │
│ ☐ Should changes be committed?          │
│ ☐ Are temporary files cleaned up?       │
│ ☐ Is any debug code removed?            │
├─────────────────────────────────────────┤
│ Clean up before finishing               │
└─────────────────────────────────────────┘
```

**Clean Up**:
- Remove console.log/print debug statements
- Delete temporary files
- Remove commented-out code (unless intentional)
```

---

## Task 3.2: Completion Rules

### Content Template

```markdown
### Completion Rules

#### NEVER Rules

These rules are absolute. No exceptions.

| Rule | Consequence if Violated |
|------|-------------------------|
| **NEVER stop with incomplete todos** | Work continues incomplete |
| **NEVER stop with failing tests** | Broken code delivered |
| **NEVER stop with broken code** | Unusable deliverable |
| **NEVER stop with lint errors** | Quality degraded |
| **NEVER stop without verifying** | Requirements may be missed |

#### ALWAYS Rules

| Rule | Benefit |
|------|---------|
| **ALWAYS verify deliverables match request** | User gets what they asked for |
| **ALWAYS run quality checks** | Consistent code quality |
| **ALWAYS clean up before finishing** | Professional deliverable |
| **ALWAYS summarize what was accomplished** | User understands what changed |

#### The Summary

Every completed task should end with a summary:

```markdown
## Summary

### What Was Done
- [Specific change 1]
- [Specific change 2]
- [Specific change 3]

### Files Changed
- `path/to/file1.ts` - [description]
- `path/to/file2.ts` - [description]

### Quality Status
- ✅ Lint: Passing
- ✅ Tests: Passing (12/12)
- ✅ Build: Successful

### Notes
- [Any important observations]
- [Recommendations for future work]
```

#### Premature Stop Prevention

If tempted to stop early, ask yourself:

1. **"Are there incomplete todos?"**
   - Yes → Keep working
   - No → Continue to next check

2. **"Did all quality checks pass?"**
   - No → Fix and re-run
   - Yes → Continue to next check

3. **"Did I deliver what was requested?"**
   - No → Complete the request
   - Yes → Continue to next check

4. **"Is the state clean?"**
   - No → Clean up first
   - Yes → OK to complete

**Only when ALL answers lead to "continue" can you stop.**

#### Exception: User Interruption

The ONLY valid reason to stop before completion:

- User explicitly asks to stop
- User redirects to different task
- User indicates scope change

Even then:
- Document current state
- Note what remains incomplete
- Summarize progress so far
```

---

## Acceptance Criteria

### Task 3.1 (Protocol)
- [ ] 4-step checklist defined
- [ ] Todo audit detailed
- [ ] Quality verification commands listed
- [ ] Deliverable check process
- [ ] State verification included

### Task 3.2 (Rules)
- [ ] NEVER rules listed
- [ ] ALWAYS rules listed
- [ ] Summary template provided
- [ ] Prevention checks documented
- [ ] Exception noted

---

*Context for Tasks 3.1, 3.2*
