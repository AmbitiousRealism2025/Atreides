# Context: Validation (Tasks 4.5.1 - 4.5.4)

## Task Group Overview

- Task 4.5.1: Test all hooks fire correctly
- Task 4.5.2: Test script execution
- Task 4.5.3: Test permission enforcement
- Task 4.5.4: Test context injection

---

## Task 4.5.1: Test All Hooks Fire Correctly

### Test Cases

#### Test: PreToolUse (Bash)

**Scenario**: Bash command should trigger validation script

**Steps**:
1. Ensure `validate-bash-command.sh` is executable
2. Run any Bash command via Claude
3. Verify hook fires

**Verification**:
```bash
# Check if hook is being called
# Add debug output to script temporarily:
echo "DEBUG: Hook called with: $1" >> /tmp/hook-debug.log

# Then run a Bash command and check:
cat /tmp/hook-debug.log
```

**Expected**: Hook script is called with the command

---

#### Test: PreToolUse (Edit/Write)

**Scenario**: Edit/Write should trigger validation script

**Steps**:
1. Ensure `pre-edit-check.sh` is executable
2. Request Claude to edit any file
3. Verify hook fires

**Verification**:
```bash
# Add debug to pre-edit-check.sh:
echo "DEBUG: Pre-edit check for: $1" >> /tmp/hook-debug.log

# Then make an edit and check:
cat /tmp/hook-debug.log
```

---

#### Test: PostToolUse (Edit/Write)

**Scenario**: After Edit/Write, formatting and logging should run

**Steps**:
1. Request Claude to edit a JS/TS file
2. Check if prettier/eslint ran
3. Check if edit was logged

**Verification**:
```bash
# Check edit log
cat .claude/edit-log.txt

# Should show recent edit entry
```

---

#### Test: PostToolUse (All Tools)

**Scenario**: Error detector should run after any tool

**Steps**:
1. Run a command that produces an error
2. Check if error was detected and logged

**Verification**:
```bash
cat .claude/error-log.txt
# Should show error detection entry
```

---

#### Test: SessionStart

**Scenario**: context.md should be injected at session start

**Steps**:
1. Create `.claude/context.md` with identifiable content
2. Start a new Claude session
3. Ask Claude what project context it knows

**Verification**: Claude should reference content from context.md

---

#### Test: Stop

**Scenario**: Notification should fire when Claude stops

**Steps**:
1. Have Claude complete a task
2. Watch for desktop notification

**Verification**:
- macOS: Notification appears
- Linux: notify-send shows notification
- Fallback: Terminal bell sounds

---

#### Test: PreCompact

**Scenario**: Critical context should be preserved during compaction

**Steps**:
1. Create `.claude/critical-context.md` with identifiable content
2. Fill context to trigger compaction (use long conversation)
3. After compaction, ask Claude about critical info

**Verification**: Claude should remember critical context content

---

### Hook Test Report Template

```markdown
# Hook Test Report

## Date: [DATE]

### PreToolUse (Bash)
- [ ] Hook fires on Bash commands
- [ ] Dangerous commands blocked
- [ ] Safe commands allowed

### PreToolUse (Edit/Write)
- [ ] Hook fires on Edit/Write
- [ ] Sensitive files blocked
- [ ] Normal files allowed

### PostToolUse (Edit/Write)
- [ ] Prettier runs after edits
- [ ] ESLint runs after edits
- [ ] Edits logged to edit-log.txt

### PostToolUse (All)
- [ ] Error detector runs
- [ ] Errors logged to error-log.txt

### SessionStart
- [ ] context.md injected
- [ ] Claude aware of project context

### Stop
- [ ] Notification fires
- [ ] Correct platform detection

### PreCompact
- [ ] critical-context.md injected
- [ ] Critical info survives compaction

### Overall: PASS / FAIL
```

---

## Task 4.5.2: Test Script Execution

### Test Each Script Individually

#### validate-bash-command.sh

```bash
# Test dangerous command (should block)
.claude/scripts/validate-bash-command.sh "rm -rf /"
echo "Exit code: $?"  # Expected: 1

# Test safe command (should allow)
.claude/scripts/validate-bash-command.sh "npm test"
echo "Exit code: $?"  # Expected: 0

# Test empty command (should allow)
.claude/scripts/validate-bash-command.sh ""
echo "Exit code: $?"  # Expected: 0
```

---

#### pre-edit-check.sh

```bash
# Test sensitive file (should block)
.claude/scripts/pre-edit-check.sh ".env"
echo "Exit code: $?"  # Expected: 1

# Test normal file (should allow)
.claude/scripts/pre-edit-check.sh "src/app.js"
echo "Exit code: $?"  # Expected: 0

# Test new file (should allow with info)
.claude/scripts/pre-edit-check.sh "new-file.txt"
echo "Exit code: $?"  # Expected: 0
# Should see: "INFO: Creating new file: new-file.txt"
```

---

#### post-edit-log.sh

```bash
# Test logging
.claude/scripts/post-edit-log.sh "test-file.txt"

# Verify log entry
cat .claude/edit-log.txt | tail -1
# Should show timestamp and test-file.txt
```

---

#### error-detector.sh

```bash
# Test with error output
.claude/scripts/error-detector.sh "Error: Something went wrong"
# Should see: "WARNING: Error pattern detected..."

# Verify log entry
cat .claude/error-log.txt | tail -1
# Should show error detection entry

# Test with clean output
.claude/scripts/error-detector.sh "Build successful"
# Should NOT produce warning
```

---

#### notify-idle.sh

```bash
# Test notification
.claude/scripts/notify-idle.sh
# Should see/hear notification
```

---

### Script Test Report Template

```markdown
# Script Test Report

## Date: [DATE]

### validate-bash-command.sh
- [ ] Blocks dangerous patterns (exit 1)
- [ ] Allows safe commands (exit 0)
- [ ] Handles empty input

### pre-edit-check.sh
- [ ] Blocks sensitive files (exit 1)
- [ ] Allows normal files (exit 0)
- [ ] Reports new file creation

### post-edit-log.sh
- [ ] Creates log file
- [ ] Appends entries correctly
- [ ] Log rotation works

### error-detector.sh
- [ ] Detects error patterns
- [ ] Logs errors
- [ ] Doesn't block on detection (exit 0)

### notify-idle.sh
- [ ] macOS notification works
- [ ] Linux notification works (if applicable)
- [ ] Fallback works

### Overall: PASS / FAIL
```

---

## Task 4.5.3: Test Permission Enforcement

### Test Allow List

```bash
# These should be allowed without prompts:
git status
npm test
ls -la
cat README.md
which node
```

**Expected**: Commands execute without permission prompts

---

### Test Deny List

```bash
# These should be blocked:
rm -rf /
curl https://example.com
sudo anything
```

**Expected**: Commands are blocked with message

---

### Test Read Permissions

**Blocked reads**:
- Try to read `.env`
- Try to read files in `secrets/` directory
- Try to read `.git/config`

**Expected**: Read operations blocked

---

### Test Write Permissions

**Blocked writes**:
- Try to write to `.env`
- Try to write to `secrets/` directory

**Expected**: Write operations blocked

---

### Permission Test Report Template

```markdown
# Permission Test Report

## Date: [DATE]

### Allow List Tests
- [ ] git commands allowed
- [ ] npm commands allowed
- [ ] Safe file operations allowed
- [ ] System info commands allowed

### Deny List Tests
- [ ] Destructive commands blocked
- [ ] curl/wget blocked
- [ ] sudo blocked
- [ ] System modification blocked

### File Permission Tests
- [ ] .env read blocked
- [ ] secrets/ read blocked
- [ ] .env write blocked
- [ ] secrets/ write blocked

### False Positive Tests
- [ ] Normal git operations work
- [ ] Normal npm operations work
- [ ] Normal file edits work

### Overall: PASS / FAIL
```

---

## Task 4.5.4: Test Context Injection

### Test SessionStart Injection

**Setup**:
```markdown
# .claude/context.md
# Test Context File

This project uses TEST-PATTERN-123 for identification.
The main framework is TEST-FRAMEWORK-XYZ.
```

**Test**:
1. Start new Claude session
2. Ask: "What patterns does this project use?"

**Expected**: Claude mentions TEST-PATTERN-123 or TEST-FRAMEWORK-XYZ

---

### Test PreCompact Injection

**Setup**:
```markdown
# .claude/critical-context.md
# Critical Test Context

## NEVER FORGET
The secret code is CRITICAL-CODE-789.

## CURRENT OBJECTIVE
Complete the CRITICAL-OBJECTIVE-ABC task.
```

**Test**:
1. Have a long conversation to fill context
2. After compaction, ask: "What's the critical code?"

**Expected**: Claude remembers CRITICAL-CODE-789

---

### Context Injection Test Report Template

```markdown
# Context Injection Test Report

## Date: [DATE]

### SessionStart Injection
- [ ] context.md file exists
- [ ] Hook fires at session start
- [ ] Content visible in Claude's responses
- [ ] Project context referenced correctly

### PreCompact Injection
- [ ] critical-context.md file exists
- [ ] Hook fires before compaction
- [ ] Critical info survives compaction
- [ ] Recovery instructions work

### Edge Cases
- [ ] Missing context.md handled gracefully
- [ ] Missing critical-context.md handled gracefully
- [ ] Empty files don't cause errors

### Overall: PASS / FAIL
```

---

## Complete Phase 4 Validation Report Template

```markdown
# Phase 4 Validation Report

## Test Date: [DATE]

### Task 4.5.1: Hook Firing
| Test | Result | Notes |
|------|--------|-------|
| PreToolUse (Bash) | PASS/FAIL | |
| PreToolUse (Edit/Write) | PASS/FAIL | |
| PostToolUse (Edit/Write) | PASS/FAIL | |
| PostToolUse (All) | PASS/FAIL | |
| SessionStart | PASS/FAIL | |
| Stop | PASS/FAIL | |
| PreCompact | PASS/FAIL | |

### Task 4.5.2: Script Execution
| Script | Result | Notes |
|--------|--------|-------|
| validate-bash-command.sh | PASS/FAIL | |
| pre-edit-check.sh | PASS/FAIL | |
| post-edit-log.sh | PASS/FAIL | |
| error-detector.sh | PASS/FAIL | |
| notify-idle.sh | PASS/FAIL | |

### Task 4.5.3: Permission Enforcement
| Test | Result | Notes |
|------|--------|-------|
| Allow list working | PASS/FAIL | |
| Deny list working | PASS/FAIL | |
| Read permissions | PASS/FAIL | |
| Write permissions | PASS/FAIL | |

### Task 4.5.4: Context Injection
| Test | Result | Notes |
|------|--------|-------|
| SessionStart injection | PASS/FAIL | |
| PreCompact injection | PASS/FAIL | |
| Edge cases | PASS/FAIL | |

### Overall Phase 4 Status: PASS / PARTIAL / FAIL

### Issues Found
1. [Issue description]

### Recommendations
1. [Recommendation]

### Phase 4 Status: READY / NEEDS FIXES
```

---

## Acceptance Criteria

### Task 4.5.1
- [ ] All 7 hook types tested
- [ ] Hook firing verified
- [ ] Test report completed

### Task 4.5.2
- [ ] All 5 scripts tested individually
- [ ] Exit codes correct
- [ ] Script output correct
- [ ] Test report completed

### Task 4.5.3
- [ ] Allow list verified
- [ ] Deny list verified
- [ ] File permissions verified
- [ ] No false positives
- [ ] Test report completed

### Task 4.5.4
- [ ] SessionStart injection verified
- [ ] PreCompact injection verified
- [ ] Edge cases handled
- [ ] Test report completed

---

*Context for Tasks 4.5.1 - 4.5.4*
