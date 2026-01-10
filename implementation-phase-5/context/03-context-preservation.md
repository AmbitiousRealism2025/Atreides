# Context: Advanced Context Preservation (Tasks 5.3.1 - 5.3.3)

## Task Group Overview

- Task 5.3.1: Create checkpoint system documentation
- Task 5.3.2: Create checkpoint.md template
- Task 5.3.3: Add checkpoint triggers to CLAUDE.md

---

## Task 5.3.1: Checkpoint System Documentation

### Purpose

Enable recovery from:
- Context compaction
- Session interruption
- Long-running task continuation
- Risky operation rollback

### Content Template for CLAUDE.md

```markdown
## Checkpoint System

### What is a Checkpoint?

A checkpoint is a snapshot of current work state saved to `.claude/checkpoint.md`.

Unlike context.md (general project context) or critical-context.md (compaction survival),
checkpoints are **active work snapshots** that enable:

1. **Session Recovery**: Resume exactly where you left off
2. **Risk Mitigation**: Rollback point before risky operations
3. **Progress Tracking**: Know what's done and what's next
4. **Collaboration**: Hand off state to another session

### Checkpoint vs Other Context Files

| File | Purpose | When Updated | Survives |
|------|---------|--------------|----------|
| `context.md` | Project overview | Weekly | SessionStart |
| `critical-context.md` | Must-not-forget | During work | PreCompact |
| `checkpoint.md` | Active work state | Before risk/periodically | Manual read |

### When to Create/Update Checkpoints

#### Mandatory Checkpoint Triggers

Create checkpoint BEFORE:
- [ ] Multi-file refactoring (3+ files)
- [ ] Architectural changes
- [ ] Database migrations
- [ ] Any operation with `git reset --hard` potential
- [ ] Switching to a different task

Update checkpoint WHEN:
- [ ] Completing a major milestone
- [ ] Every 30 minutes of active work
- [ ] Making significant decisions
- [ ] Encountering blockers

#### Checkpoint Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│                  CHECKPOINT LIFECYCLE                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  START TASK                                             │
│       │                                                 │
│       ▼                                                 │
│  ┌─────────────────┐                                    │
│  │ Create Checkpoint│ ← Note objective, initial state  │
│  └────────┬────────┘                                    │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │   Do Work       │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│     ┌─────┴─────┐                                       │
│     │           │                                       │
│     ▼           ▼                                       │
│  30 min?     Risky op?                                  │
│     │           │                                       │
│     └─────┬─────┘                                       │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │Update Checkpoint│ ← Progress, decisions, next steps │
│  └────────┬────────┘                                    │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │ Continue Work   │ → Loop back                       │
│  └────────┬────────┘                                    │
│           │                                             │
│     Done? │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                    │
│  │ Clear Checkpoint│ ← Task complete                   │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Reading Checkpoints

When resuming work:

1. **Read checkpoint file**:
   ```
   Read .claude/checkpoint.md
   ```

2. **Understand state**:
   - What was the objective?
   - What files were being modified?
   - What decisions were made?
   - What's the next step?

3. **Verify state**:
   ```bash
   git status
   git diff
   ```

4. **Continue or clarify**:
   - If checkpoint is clear: Continue from next step
   - If unclear: Ask user for clarification

### Recovery Scenarios

#### Scenario 1: Context Compaction

```
Before compaction: Checkpoint updated with current state
After compaction: Read checkpoint, resume work
```

#### Scenario 2: Session Timeout

```
Before timeout: Checkpoint updated periodically
New session: Read checkpoint, confirm with user, resume
```

#### Scenario 3: Failed Operation

```
Before risky op: Checkpoint created
After failure: Read checkpoint, revert if needed, retry
```
```

---

## Task 5.3.2: Checkpoint Template

### File Location

`.claude/checkpoint.md`

### Template Content

```markdown
# Session Checkpoint

**Last Updated**: [TIMESTAMP]
**Session ID**: [Optional reference]

---

## 🎯 Current Objective

[Clear, single statement of what we're trying to accomplish]

**Success Criteria**:
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

---

## 📁 Files In Progress

Currently being modified:

| File | Status | What We're Doing |
|------|--------|------------------|
| `path/to/file1` | ✏️ Editing | [Description] |
| `path/to/file2` | 🆕 New | [Description] |
| `path/to/file3` | ✅ Done | [Description] |

**Do NOT forget these files!**

---

## ✅ Completed Steps

1. [x] [Step 1 description]
2. [x] [Step 2 description]
3. [x] [Step 3 description]

---

## ⏳ Remaining Steps

4. [ ] [Step 4 description] ← **NEXT**
5. [ ] [Step 5 description]
6. [ ] [Step 6 description]

---

## 📝 Key Decisions Made

| Decision | Rationale | Reversible? |
|----------|-----------|-------------|
| [Decision 1] | [Why] | Yes/No |
| [Decision 2] | [Why] | Yes/No |

**These decisions should NOT be reconsidered without explicit user request.**

---

## ⚠️ Blockers / Issues

- [Issue 1 - if any]
- [Issue 2 - if any]

---

## 🔄 Recovery Instructions

If you're reading this after context loss:

### 1. Current State
- We were working on: [Brief description]
- Progress: [X of Y steps complete]
- Last action: [What was just done]

### 2. To Continue
1. Verify git state: `git status && git diff`
2. Read files in progress (listed above)
3. Resume from step [N] in "Remaining Steps"

### 3. If Something Went Wrong
1. Revert: `git checkout -- .`
2. Start from step [N-1]
3. Or ask user for guidance

---

## 📊 Progress Summary

```
[█████████░░░░░░░░░░░] 45% complete
Step 4 of 9
```

---

*Checkpoint created by Muad'Dib orchestration*
*Update this file before risky operations and every 30 minutes*
```

### Template Usage Notes

1. **Keep it focused**: One objective at a time
2. **Update frequently**: Every major step
3. **Be specific**: File paths, not descriptions
4. **Include recovery**: Assume future reader has no context

---

## Task 5.3.3: Add Checkpoint Triggers to CLAUDE.md

### Content to Add

```markdown
### Checkpoint Triggers

#### Automatic Triggers

Create or update checkpoint when:

| Trigger | Action |
|---------|--------|
| Starting multi-step task | Create initial checkpoint |
| 30 minutes elapsed | Update with current progress |
| Before risky operation | Update with rollback info |
| Making key decision | Update decisions section |
| Completing milestone | Update completed steps |
| Encountering blocker | Document in blockers section |
| Task complete | Clear or archive checkpoint |

#### Manual Triggers

User may request:
- "Create checkpoint" → Full checkpoint creation
- "Update checkpoint" → Update existing
- "Read checkpoint" → Display current state
- "Clear checkpoint" → Task complete, clear file

#### Checkpoint Commands Pattern

**Create/Update**:
```
Before proceeding, let me update the checkpoint.

[Write to .claude/checkpoint.md with current state]
```

**Read**:
```
Let me check the checkpoint for current state.

[Read .claude/checkpoint.md]
[Summarize key points]
```

**Clear**:
```
Task complete. Clearing checkpoint.

[Clear .claude/checkpoint.md or mark as archived]
```

### Checkpoint Integration with Workflow

```
Phase 0: Intent Gate
├── If complex task → Create checkpoint
└── Continue

Phase 2B: Implementation
├── Every 30 min → Update checkpoint
├── Before risky op → Update checkpoint
└── Continue

Phase 3: Completion
├── Verify all complete
├── Clear checkpoint
└── Done
```

### Checkpoint Recovery Protocol

When reading a checkpoint after context loss:

1. **Announce recovery**:
   ```
   "I'm resuming from a checkpoint. Let me review the state..."
   ```

2. **Summarize state**:
   ```
   "According to checkpoint:
   - Objective: [X]
   - Progress: [Y]% complete
   - Next step: [Z]"
   ```

3. **Verify with user**:
   ```
   "Should I continue from here, or would you like to adjust the plan?"
   ```

4. **Continue or adjust**:
   - If confirmed: Resume from next step
   - If adjusted: Update checkpoint and proceed
```

---

## Acceptance Criteria

### Task 5.3.1
- [ ] Checkpoint purpose explained
- [ ] Comparison with other context files
- [ ] Trigger conditions documented
- [ ] Lifecycle diagram included
- [ ] Reading instructions provided
- [ ] Recovery scenarios documented

### Task 5.3.2
- [ ] Template file created
- [ ] All sections included:
  - Current objective
  - Files in progress
  - Completed steps
  - Remaining steps
  - Key decisions
  - Blockers
  - Recovery instructions
  - Progress summary
- [ ] Usage notes provided

### Task 5.3.3
- [ ] Automatic triggers documented
- [ ] Manual triggers documented
- [ ] Commands pattern provided
- [ ] Workflow integration explained
- [ ] Recovery protocol documented

---

*Context for Tasks 5.3.1 - 5.3.3*
