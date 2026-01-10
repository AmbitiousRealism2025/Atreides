# Context: Helper Script Ecosystem (Tasks 4.2.1 - 4.2.7)

## Task Group Overview

- Task 4.2.1: Create .claude/scripts/ directory
- Task 4.2.2: Create validate-bash-command.sh
- Task 4.2.3: Create pre-edit-check.sh
- Task 4.2.4: Create post-edit-log.sh
- Task 4.2.5: Create error-detector.sh
- Task 4.2.6: Create notify-idle.sh
- Task 4.2.7: Make all scripts executable

---

## Task 4.2.1: Create Scripts Directory

### Directory Structure

```
project-root/
└── .claude/
    └── scripts/
        ├── validate-bash-command.sh
        ├── pre-edit-check.sh
        ├── post-edit-log.sh
        ├── error-detector.sh
        └── notify-idle.sh
```

### Command

```bash
mkdir -p .claude/scripts
```

---

## Task 4.2.2: validate-bash-command.sh

### Purpose

Validate bash commands before execution to block dangerous patterns.

### Script Content

```bash
#!/bin/bash
# validate-bash-command.sh
# Validates bash commands before execution
# Returns 0 to allow, 1 to block

COMMAND="$1"

# Exit early if no command provided
if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Block patterns that could cause system damage
DANGEROUS_PATTERNS=(
  "rm -rf /"
  "rm -rf ~"
  "rm -rf *"
  "dd if="
  "> /dev/"
  "mkfs"
  ":(){:|:&};:"  # Fork bomb
  "chmod -R 777 /"
  "chown -R"
  "wget.*|.*sh"  # Piped remote execution
  "curl.*|.*sh"  # Piped remote execution
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if [[ "$COMMAND" =~ $pattern ]]; then
    echo "BLOCKED: Dangerous command pattern detected: $pattern"
    exit 1
  fi
done

# Block commands with potential secrets exposure
if [[ "$COMMAND" =~ "cat.*\.env" ]] || \
   [[ "$COMMAND" =~ "cat.*/secrets/" ]] || \
   [[ "$COMMAND" =~ "echo.*\$.*PASSWORD" ]]; then
  echo "BLOCKED: Potential secrets exposure"
  exit 1
fi

# Allow command
exit 0
```

### Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `$COMMAND` | Hook | The bash command being executed |

### Exit Codes

| Code | Meaning | Effect |
|------|---------|--------|
| 0 | Allow | Command proceeds |
| 1 | Block | Command is prevented |

---

## Task 4.2.3: pre-edit-check.sh

### Purpose

Validate file edits before they occur to protect sensitive files.

### Script Content

```bash
#!/bin/bash
# pre-edit-check.sh
# Pre-edit validation for file operations
# Returns 0 to allow, 1 to block

FILE="$1"

# Exit early if no file provided
if [[ -z "$FILE" ]]; then
  exit 0
fi

# Block editing sensitive files
SENSITIVE_PATTERNS=(
  ".env"
  ".env.local"
  ".env.production"
  "secrets"
  "credentials"
  ".git/config"
  "id_rsa"
  "id_ed25519"
  ".npmrc"
  ".pypirc"
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if [[ "$FILE" =~ $pattern ]]; then
    echo "BLOCKED: Cannot edit sensitive file: $FILE"
    exit 1
  fi
done

# Warn about creating new files (but allow)
if [[ ! -f "$FILE" ]]; then
  echo "INFO: Creating new file: $FILE"
fi

# Warn about system files (but allow)
if [[ "$FILE" =~ ^/etc/ ]] || [[ "$FILE" =~ ^/usr/ ]]; then
  echo "WARNING: Editing system file: $FILE"
fi

# Allow edit
exit 0
```

### Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `$FILE` | Hook | The file being edited/written |

---

## Task 4.2.4: post-edit-log.sh

### Purpose

Log all file edits for tracking and audit purposes.

### Script Content

```bash
#!/bin/bash
# post-edit-log.sh
# Log file edits for tracking

FILE="$1"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
LOG_FILE=".claude/edit-log.txt"

# Create log directory if needed
mkdir -p "$(dirname "$LOG_FILE")"

# Log the edit
echo "$TIMESTAMP | EDIT | $FILE" >> "$LOG_FILE"

# Keep log file manageable (last 1000 entries)
if [[ $(wc -l < "$LOG_FILE") -gt 1000 ]]; then
  tail -500 "$LOG_FILE" > "$LOG_FILE.tmp"
  mv "$LOG_FILE.tmp" "$LOG_FILE"
fi

exit 0
```

### Output

Creates/appends to `.claude/edit-log.txt`:

```
2026-01-08 10:30:45 | EDIT | src/components/Button.tsx
2026-01-08 10:31:12 | EDIT | src/styles/button.css
2026-01-08 10:32:00 | EDIT | tests/button.test.ts
```

---

## Task 4.2.5: error-detector.sh

### Purpose

Detect errors in tool output and log for review.

### Script Content

```bash
#!/bin/bash
# error-detector.sh
# Detect errors in tool output

OUTPUT="$1"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ERROR_LOG=".claude/error-log.txt"

# Exit early if no output
if [[ -z "$OUTPUT" ]]; then
  exit 0
fi

# Create log directory if needed
mkdir -p "$(dirname "$ERROR_LOG")"

# Error patterns to detect
ERROR_PATTERNS=(
  "Error:"
  "error:"
  "ERROR"
  "FAILED"
  "Failed"
  "Exception"
  "exception"
  "Traceback"
  "panic:"
  "fatal:"
  "FATAL"
  "Cannot find"
  "not found"
  "Permission denied"
  "Segmentation fault"
)

for pattern in "${ERROR_PATTERNS[@]}"; do
  if [[ "$OUTPUT" =~ $pattern ]]; then
    echo "$TIMESTAMP | ERROR DETECTED | Pattern: $pattern" >> "$ERROR_LOG"
    echo "WARNING: Error pattern detected in output: $pattern"
    # Don't exit with error - just log and warn
    break
  fi
done

# Keep log file manageable
if [[ -f "$ERROR_LOG" ]] && [[ $(wc -l < "$ERROR_LOG") -gt 500 ]]; then
  tail -250 "$ERROR_LOG" > "$ERROR_LOG.tmp"
  mv "$ERROR_LOG.tmp" "$ERROR_LOG"
fi

exit 0
```

### Notes

- Script logs errors but doesn't block operations
- Uses `exit 0` to avoid disrupting workflow
- Warning message is visible in Claude's output

---

## Task 4.2.6: notify-idle.sh

### Purpose

Send desktop notification when Claude stops/pauses.

### Script Content

```bash
#!/bin/bash
# notify-idle.sh
# Send notification when Claude Code stops

TITLE="Claude Code"
MESSAGE="Session idle - awaiting input"

# macOS notification
if [[ "$OSTYPE" == "darwin"* ]]; then
  if command -v osascript &> /dev/null; then
    osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\""
  fi
fi

# Linux notification (notify-send)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if command -v notify-send &> /dev/null; then
    notify-send "$TITLE" "$MESSAGE"
  fi
fi

# WSL/Windows notification (optional)
if [[ -f "/mnt/c/Windows/System32/msg.exe" ]]; then
  # WSL detected - could add Windows notification here
  :
fi

# Terminal bell as fallback
echo -e '\a'

exit 0
```

### Platform Support

| Platform | Method | Requirement |
|----------|--------|-------------|
| macOS | osascript | Built-in |
| Linux | notify-send | libnotify-bin package |
| WSL | (fallback) | Terminal bell |

---

## Task 4.2.7: Make Scripts Executable

### Command

```bash
chmod +x .claude/scripts/*.sh
```

### Verification

```bash
ls -la .claude/scripts/
# Should show -rwxr-xr-x for all .sh files
```

---

## Script Integration Summary

| Script | Hook | Called From | Purpose |
|--------|------|-------------|---------|
| validate-bash-command.sh | PreToolUse | Bash | Block dangerous commands |
| pre-edit-check.sh | PreToolUse | Edit/Write | Block sensitive file edits |
| post-edit-log.sh | PostToolUse | Edit/Write | Log all edits |
| error-detector.sh | PostToolUse | * | Detect and log errors |
| notify-idle.sh | Stop | (session) | Desktop notification |

---

## Testing Scripts

### Test validate-bash-command.sh

```bash
# Should block
./scripts/validate-bash-command.sh "rm -rf /"
echo "Exit code: $?"  # Should be 1

# Should allow
./scripts/validate-bash-command.sh "npm test"
echo "Exit code: $?"  # Should be 0
```

### Test pre-edit-check.sh

```bash
# Should block
./scripts/pre-edit-check.sh ".env"
echo "Exit code: $?"  # Should be 1

# Should allow
./scripts/pre-edit-check.sh "src/app.js"
echo "Exit code: $?"  # Should be 0
```

### Test post-edit-log.sh

```bash
./scripts/post-edit-log.sh "test-file.txt"
cat .claude/edit-log.txt  # Should show entry
```

### Test error-detector.sh

```bash
./scripts/error-detector.sh "Error: Something went wrong"
cat .claude/error-log.txt  # Should show entry
```

### Test notify-idle.sh

```bash
./scripts/notify-idle.sh
# Should see desktop notification (platform-dependent)
```

---

## Acceptance Criteria

### Task 4.2.1
- [ ] .claude/scripts/ directory exists

### Task 4.2.2
- [ ] validate-bash-command.sh created
- [ ] Blocks dangerous patterns
- [ ] Returns correct exit codes

### Task 4.2.3
- [ ] pre-edit-check.sh created
- [ ] Blocks sensitive file edits
- [ ] Returns correct exit codes

### Task 4.2.4
- [ ] post-edit-log.sh created
- [ ] Creates/appends to edit-log.txt
- [ ] Log rotation works

### Task 4.2.5
- [ ] error-detector.sh created
- [ ] Detects common error patterns
- [ ] Logs to error-log.txt
- [ ] Doesn't block operations (exit 0)

### Task 4.2.6
- [ ] notify-idle.sh created
- [ ] Works on macOS
- [ ] Works on Linux (if notify-send available)
- [ ] Falls back gracefully

### Task 4.2.7
- [ ] All scripts are executable
- [ ] Verified with ls -la

---

*Context for Tasks 4.2.1 - 4.2.7*
