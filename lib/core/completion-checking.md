# Muad'Dib Completion Checking Protocol

## Overview

Before ending ANY multi-step task, execute the completion checking protocol.

---

## The 4-Step Checklist

### 1. TodoWrite Audit

- Are ALL todos marked complete?
- Were any todos skipped?
- Were any todos added and forgotten?

**If ANY incomplete → CONTINUE WORKING**

### 2. Quality Verification

- Did linters pass?
- Did type checks pass?
- Did tests pass (if applicable)?
- Did build succeed (if applicable)?

**If ANY failed → FIX before completing**

### 3. Deliverable Check

- Does output match requirements?
- Were ALL requested changes made?
- Is code in working state?
- Does it do what user asked for?

**If gaps exist → ADDRESS before stopping**

### 4. State Verification

- Is codebase in clean state?
- Should changes be committed?
- Are temporary files cleaned up?
- Is any debug code removed?

---

## Completion Rules

### NEVER Rules (Absolute)

| Rule | Consequence |
|------|-------------|
| NEVER stop with incomplete todos | Work incomplete |
| NEVER stop with failing tests | Broken code |
| NEVER stop with broken code | Unusable deliverable |
| NEVER stop with lint errors | Quality degraded |
| NEVER stop without verifying | Requirements missed |

### ALWAYS Rules

| Rule | Benefit |
|------|---------|
| ALWAYS verify deliverables match request | User gets what they asked |
| ALWAYS run quality checks | Consistent quality |
| ALWAYS clean up before finishing | Professional deliverable |
| ALWAYS summarize what was accomplished | User understands changes |

---

## Summary Template

```markdown
## Summary

### What Was Done
- [Specific change 1]
- [Specific change 2]

### Files Changed
- `path/to/file.ts` - [description]

### Quality Status
- ✅ Lint: Passing
- ✅ Tests: Passing
- ✅ Build: Successful

### Notes
- [Any observations or recommendations]
```

---

## Exception: User Interruption

Only valid reasons to stop before completion:
- User explicitly asks to stop
- User redirects to different task
- User indicates scope change

Even then: Document state, note incomplete work, summarize progress.

---

*Muad'Dib Completion Checking Protocol v1.0.0*
