# Muad'Dib Session Continuity

## Overview

Session continuity ensures work can be resumed across sessions and context compaction.

---

## Session Start Protocol

### Step 1: Read Project Context
- Read CLAUDE.md (project rules)
- Read .claude/context.md (if exists)

### Step 2: Check Existing Todos
- Are there incomplete todos?
- Review what was being worked on
- Resume from where left off

### Step 3: Review Recent Changes
```bash
git status
git log --oneline -5
git diff --stat
```

### Step 4: Establish Session Context
- Note current objectives
- Identify files to be modified
- Check for blocking issues

### Quick Start Checklist
```
☐ Read CLAUDE.md
☐ Check for existing todos
☐ Review git status
☐ Understand project state
☐ Ready for user request
```

---

## Session End Protocol

### Step 1: Ensure Completion
- All todos complete OR documented?
- Quality checks passing?
- No broken code left behind?

### Step 2: Summarize Progress
```markdown
## Session Summary

### Completed
- [Task 1]: [Description]

### Files Modified
- `file.ts`: [What changed]

### Status
- Code: Working / Has issues
- Tests: Passing / Failing / N/A
- Commits: Made / Pending
```

### Step 3: Note Pending Work
```markdown
### Pending Work
- [ ] [Incomplete task]

### Context for Next Session
- Currently working on: [description]
- Next step would be: [description]
- Key files: [paths]
```

### Step 4: Clean State
- Remove temporary files
- Remove debug statements
- Code is in runnable state
- No half-implemented features

### Quick End Checklist
```
☐ All work complete or documented
☐ Summary provided
☐ Pending work noted
☐ State is clean
☐ User informed
```

---

## State Persistence Methods

### TodoWrite Persistence
- Todos persist across conversation
- Always check for existing todos at start

### File-Based State (.claude/context.md)
- Current work description
- Key decisions with rationale
- Next steps
- Important files

### Critical Context (.claude/critical-context.md)
- MUST REMEMBER items
- Current objective
- Key files
- Survives compaction

---

*Muad'Dib Session Continuity v1.0.0*
