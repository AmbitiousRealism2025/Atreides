# Context: Scripts and Documentation (Tasks 6.1 - 6.2)

## Task Group Overview

This context covers creating helper scripts and core documentation:
- Task 6.1: Create helper scripts
- Task 6.2: Create core documentation files

---

## Task 6.1: Create Helper Scripts

### Purpose

Create shell scripts that run as hooks during Claude Code operation. These scripts provide automation for:
- Command validation
- Pre-edit safety checks
- Post-edit logging
- Error detection
- Idle notifications

### Script Requirements

All scripts must:
1. Have `#!/bin/bash` shebang
2. Be executable (chmod +x)
3. Work on macOS and Linux
4. Exit with appropriate codes (0 = success, 1 = block, other = error)
5. Handle missing inputs gracefully
6. Be silent on success (unless logging)

---

### scripts/validate-bash-command.sh

**Purpose**: Block dangerous bash commands before execution.

```bash
#!/bin/bash
# validate-bash-command.sh
# Validates bash commands before execution
# Exit 1 to block, Exit 0 to allow

COMMAND="$1"

# If no command provided, allow
if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# === DANGEROUS PATTERNS ===
# These patterns will BLOCK the command

# Recursive force delete from root or home
if [[ "$COMMAND" =~ "rm -rf /" ]] || \
   [[ "$COMMAND" =~ "rm -rf ~" ]] || \
   [[ "$COMMAND" =~ "rm -rf \$HOME" ]]; then
  echo "BLOCKED: Dangerous recursive delete pattern"
  exit 1
fi

# Direct disk access
if [[ "$COMMAND" =~ "dd if=" ]] && [[ "$COMMAND" =~ "of=/dev/" ]]; then
  echo "BLOCKED: Direct disk write detected"
  exit 1
fi

# Fork bomb patterns
if [[ "$COMMAND" =~ ":(){ :|:& };:" ]] || \
   [[ "$COMMAND" =~ "fork while fork" ]]; then
  echo "BLOCKED: Fork bomb pattern detected"
  exit 1
fi

# Sudo with dangerous commands
if [[ "$COMMAND" =~ ^sudo ]] && \
   ([[ "$COMMAND" =~ "rm -rf" ]] || [[ "$COMMAND" =~ "chmod -R 777" ]]); then
  echo "BLOCKED: Dangerous sudo command"
  exit 1
fi

# Writing to system paths
if [[ "$COMMAND" =~ "> /etc/" ]] || \
   [[ "$COMMAND" =~ "> /usr/" ]] || \
   [[ "$COMMAND" =~ "> /bin/" ]]; then
  echo "BLOCKED: Attempt to write to system path"
  exit 1
fi

# Chmod 777 on directories
if [[ "$COMMAND" =~ "chmod -R 777" ]] || \
   [[ "$COMMAND" =~ "chmod 777 /" ]]; then
  echo "BLOCKED: Insecure permissions"
  exit 1
fi

# === WARNINGS (log but allow) ===
# These patterns will warn but still allow

# Curl/wget piped to shell
if [[ "$COMMAND" =~ "curl" ]] && [[ "$COMMAND" =~ "|" ]] && \
   ([[ "$COMMAND" =~ "bash" ]] || [[ "$COMMAND" =~ "sh" ]]); then
  echo "WARNING: curl piped to shell - ensure source is trusted"
fi

# npm install from URL
if [[ "$COMMAND" =~ "npm install" ]] && [[ "$COMMAND" =~ "http" ]]; then
  echo "WARNING: npm install from URL - verify package source"
fi

# Git push force
if [[ "$COMMAND" =~ "git push" ]] && \
   ([[ "$COMMAND" =~ "--force" ]] || [[ "$COMMAND" =~ "-f" ]]); then
  echo "WARNING: Force push detected - ensure this is intentional"
fi

# Command is allowed
exit 0
```

---

### scripts/pre-edit-check.sh

**Purpose**: Validate files before editing.

```bash
#!/bin/bash
# pre-edit-check.sh
# Validates files before editing
# Exit 1 to block, Exit 0 to allow

FILE="$1"

# If no file provided, allow
if [[ -z "$FILE" ]]; then
  exit 0
fi

# === BLOCKED FILES ===

# Environment files with secrets
if [[ "$FILE" =~ \.env$ ]] || \
   [[ "$FILE" =~ \.env\. ]] || \
   [[ "$FILE" =~ /\.env$ ]]; then
  echo "BLOCKED: Cannot edit .env files - may contain secrets"
  exit 1
fi

# Secrets directories
if [[ "$FILE" =~ /secrets/ ]] || \
   [[ "$FILE" =~ /\.secrets/ ]]; then
  echo "BLOCKED: Cannot edit files in secrets directory"
  exit 1
fi

# Private keys
if [[ "$FILE" =~ \.pem$ ]] || \
   [[ "$FILE" =~ \.key$ ]] || \
   [[ "$FILE" =~ id_rsa ]] || \
   [[ "$FILE" =~ id_ed25519 ]]; then
  echo "BLOCKED: Cannot edit private key files"
  exit 1
fi

# Credential files
if [[ "$FILE" =~ credentials\.json$ ]] || \
   [[ "$FILE" =~ service-account\.json$ ]] || \
   [[ "$FILE" =~ \.credentials$ ]]; then
  echo "BLOCKED: Cannot edit credential files"
  exit 1
fi

# === WARNINGS ===

# New file creation
if [[ ! -f "$FILE" ]]; then
  echo "INFO: Creating new file: $FILE"
fi

# Lock files
if [[ "$FILE" =~ \.lock$ ]] || \
   [[ "$FILE" =~ lock\.json$ ]]; then
  echo "WARNING: Editing lock file - may cause dependency issues"
fi

# Config files
if [[ "$FILE" =~ package\.json$ ]] || \
   [[ "$FILE" =~ tsconfig\.json$ ]]; then
  echo "INFO: Editing configuration file"
fi

# Allow the edit
exit 0
```

---

### scripts/post-edit-log.sh

**Purpose**: Log file edits for tracking.

```bash
#!/bin/bash
# post-edit-log.sh
# Logs file edits for tracking
# Always exits 0 (informational only)

FILE="$1"
LOG_DIR="${MUADDIB_LOG_DIR:-.claude}"
LOG_FILE="${LOG_DIR}/edit-log.txt"

# If no file provided, skip
if [[ -z "$FILE" ]]; then
  exit 0
fi

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Get timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")

# Get file info
if [[ -f "$FILE" ]]; then
  SIZE=$(wc -c < "$FILE" 2>/dev/null | tr -d ' ')
  LINES=$(wc -l < "$FILE" 2>/dev/null | tr -d ' ')
  echo "$TIMESTAMP | EDIT | $FILE | ${SIZE}B | ${LINES}L" >> "$LOG_FILE"
else
  echo "$TIMESTAMP | NEW  | $FILE" >> "$LOG_FILE"
fi

# Keep log file under 1000 lines
if [[ -f "$LOG_FILE" ]]; then
  LINE_COUNT=$(wc -l < "$LOG_FILE")
  if [[ $LINE_COUNT -gt 1000 ]]; then
    tail -500 "$LOG_FILE" > "${LOG_FILE}.tmp"
    mv "${LOG_FILE}.tmp" "$LOG_FILE"
  fi
fi

exit 0
```

---

### scripts/error-detector.sh

**Purpose**: Detect errors in command output.

```bash
#!/bin/bash
# error-detector.sh
# Detects errors in command/tool output
# Always exits 0 (informational only)

OUTPUT="$1"
LOG_DIR="${MUADDIB_LOG_DIR:-.claude}"
ERROR_LOG="${LOG_DIR}/error-log.txt"

# If no output provided, skip
if [[ -z "$OUTPUT" ]]; then
  exit 0
fi

# Ensure log directory exists
mkdir -p "$LOG_DIR"

# Error patterns to detect
declare -a ERROR_PATTERNS=(
  "Error:"
  "error:"
  "ERROR:"
  "FAILED"
  "Failed"
  "Exception"
  "exception"
  "FATAL"
  "fatal:"
  "panic:"
  "Traceback"
  "SyntaxError"
  "TypeError"
  "ReferenceError"
  "Cannot find module"
  "Module not found"
  "command not found"
  "No such file"
  "Permission denied"
  "ENOENT"
  "EACCES"
  "EPERM"
)

# Check for error patterns
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
FOUND_ERROR=false

for pattern in "${ERROR_PATTERNS[@]}"; do
  if echo "$OUTPUT" | grep -q "$pattern"; then
    if [[ "$FOUND_ERROR" == "false" ]]; then
      echo "" >> "$ERROR_LOG"
      echo "=== $TIMESTAMP ===" >> "$ERROR_LOG"
      FOUND_ERROR=true
    fi
    # Log first occurrence
    echo "$OUTPUT" | grep -m 1 "$pattern" >> "$ERROR_LOG"
  fi
done

if [[ "$FOUND_ERROR" == "true" ]]; then
  echo "WARNING: Potential error detected in output (logged to $ERROR_LOG)"
fi

# Keep error log under 500 lines
if [[ -f "$ERROR_LOG" ]]; then
  LINE_COUNT=$(wc -l < "$ERROR_LOG")
  if [[ $LINE_COUNT -gt 500 ]]; then
    tail -250 "$ERROR_LOG" > "${ERROR_LOG}.tmp"
    mv "${ERROR_LOG}.tmp" "$ERROR_LOG"
  fi
fi

exit 0
```

---

### scripts/notify-idle.sh

**Purpose**: Send notification when Claude session stops/idles.

```bash
#!/bin/bash
# notify-idle.sh
# Sends notification when Claude Code session stops
# Always exits 0

TITLE="Claude Code"
MESSAGE="Session idle or stopped"

# macOS notification
if [[ "$OSTYPE" == "darwin"* ]]; then
  if command -v osascript &> /dev/null; then
    osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\"" 2>/dev/null
  fi
fi

# Linux notification (requires libnotify)
if [[ "$OSTYPE" == "linux"* ]]; then
  if command -v notify-send &> /dev/null; then
    notify-send "$TITLE" "$MESSAGE" 2>/dev/null
  fi
fi

# Terminal bell (fallback)
echo -e "\a" 2>/dev/null

exit 0
```

---

## Task 6.2: Create Core Documentation Files

### Purpose

Create the core documentation files that define Muad'Dib orchestration patterns. These are used:
1. As reference documentation
2. As templates for CLAUDE.md generation
3. As the source of truth for orchestration rules

---

### lib/core/orchestration-rules.md

```markdown
# Muad'Dib Orchestration Rules

## Core Principles

1. **Systematic Workflow**: Every task follows a defined workflow
2. **Intelligent Delegation**: Use the right agent for the right task
3. **Robust Recovery**: Handle failures gracefully with 3-strikes
4. **Quality First**: Never compromise on code quality

## Task Management

### TodoWrite Usage

Use TodoWrite for any task with 3+ steps:
- Create todos BEFORE starting work
- Mark complete ONLY when verified
- Never stop with incomplete todos
- Break complex work into atomic tasks

### Atomic Task Definition

Each todo item must have:
- Single, clear deliverable
- Verifiable completion criteria
- Estimated complexity (simple/medium/complex)

## Error Recovery

### 3-Strikes Protocol

```
Strike 1: Attempt operation
Strike 2: Retry with adjustments
Strike 3: Final attempt
         ↓ (failure)
    STOP → REVERT → DOCUMENT → CONSULT → ESCALATE
```

### Recovery Actions

| Action | Description |
|--------|-------------|
| STOP | Halt all modifications immediately |
| REVERT | git checkout to last working state |
| DOCUMENT | Record failure details in response |
| CONSULT | Task(Plan, opus) for guidance |
| ESCALATE | AskUserQuestion for human intervention |

## Never Allowed

- Leave code in broken state
- Continue hoping errors will resolve
- Delete or skip tests to pass
- Ignore type errors or warnings
- Make changes without understanding context
```

---

### lib/core/agent-definitions.md

```markdown
# Muad'Dib Agent Definitions

## Agent Delegation Matrix

| Task Type | subagent_type | model | When to Use |
|-----------|---------------|-------|-------------|
| Codebase exploration | Explore | haiku | Finding files, understanding structure |
| Research/documentation | general-purpose | haiku | External lookups, documentation |
| Architecture decisions | Plan | opus | Complex design, multi-component |
| Implementation planning | Plan | sonnet | Feature design, refactoring |
| Security review | security-engineer | sonnet | Vulnerability analysis |
| Performance analysis | performance-engineer | sonnet | Optimization, profiling |
| Frontend work | frontend-architect | sonnet | UI/UX implementation |
| Backend design | backend-architect | sonnet | API design, data modeling |
| Code quality | quality-engineer | sonnet | Testing, edge cases |
| Root cause analysis | root-cause-analyst | sonnet | Debugging, investigation |
| Documentation | technical-writer | haiku | Docs, comments, README |

## Delegation Prompt Template

When delegating via Task tool, structure prompts with 7 sections:

### 1. TASK
[Specific, atomic goal - single deliverable]

### 2. EXPECTED OUTCOME
[Concrete, verifiable deliverables]

### 3. CONTEXT
- Files: [relevant file paths]
- Patterns: [existing conventions]
- Constraints: [limitations]

### 4. MUST DO
- [Explicit requirement 1]
- [Explicit requirement 2]

### 5. MUST NOT DO
- [Forbidden action 1]
- Do NOT modify files outside scope
- Do NOT spawn additional agents

### 6. TOOLS ALLOWED (optional)
[Whitelist if constraining]

### 7. SUCCESS CRITERIA
[How to verify completion]

## Model Selection Guidelines

### Default to haiku for:
- Codebase exploration
- Simple research queries
- File pattern searches
- Quick lookups

### Use sonnet for:
- Implementation tasks
- Code generation
- Standard complexity work

### Reserve opus for:
- Architecture decisions
- Complex debugging
- Strategic planning
- Error recovery consultation
```

---

### lib/core/workflow-phases.md

```markdown
# Muad'Dib Workflow Phases

## Phase Overview

```
Phase 0: Intent Gate
    ↓
Phase 1: Codebase Assessment (if needed)
    ↓
Phase 2A: Exploration (if needed)
Phase 2B: Implementation
Phase 2C: Failure Recovery (if needed)
    ↓
Phase 3: Completion
```

## Phase 0: Intent Gate

**Purpose**: Classify and validate request before work begins

### Request Classifications

| Category | Description | Action |
|----------|-------------|--------|
| Trivial | Simple questions | Direct answer |
| Explicit | Clear implementation | Execute immediately |
| Exploratory | Requires investigation | Launch exploration |
| Open-ended | Architectural decisions | Full assessment |
| Ambiguous | Unclear requirements | AskUserQuestion |

### Gate Criteria

- Request is clearly understood
- Scope is defined
- Success criteria are known

## Phase 1: Codebase Assessment

**Purpose**: Evaluate project state for complex tasks

### Triggers
- Open-ended requests
- Unfamiliar codebases
- Architecture changes

### Actions
1. Assess codebase maturity
2. Identify existing patterns
3. Check dependencies
4. Understand project structure

### Maturity Levels

| Level | Indicators | Approach |
|-------|------------|----------|
| DISCIPLINED | Consistent patterns, tests | Follow exactly |
| TRANSITIONAL | Mix of old/new | Gradual migration |
| LEGACY | Technical debt | Propose cleanups |
| GREENFIELD | New project | Establish patterns |

## Phase 2A: Exploration & Research

**Purpose**: Gather context through parallel investigation

### Parallel Agent Pattern

Launch in SINGLE message:
- Task(Explore) for internal codebase
- Task(general-purpose) for external research

### Continue Until
- Sufficient context gathered
- Information converges
- Iteration limit (2 searches, no new data)

## Phase 2B: Implementation

**Purpose**: Execute the actual development work

### Rules
- Follow existing patterns exactly
- Run quality checks after edits
- Mark todos complete only when verified
- Never leave code in broken state

## Phase 2C: Failure Recovery

**Purpose**: Handle persistent failures

### Trigger
3 consecutive failures on same operation

### Protocol
STOP → REVERT → DOCUMENT → CONSULT → ESCALATE

## Phase 3: Completion

**Purpose**: Verify and deliver results

### Actions
1. Verify all todos complete
2. Run quality checks
3. Verify deliverables
4. Clean up temporary files
5. Summarize accomplishments

### Gate Criteria
- All todos marked complete
- Quality checks pass
- Deliverables verified
```

---

### lib/skills/muaddib/SKILL.md

```markdown
# Muad'Dib Orchestration Skill

A Claude Code skill that enables OmO-style orchestration patterns.

## Activation

This skill is automatically active when Muad'Dib is initialized in a project.

## Capabilities

- Systematic workflow management
- Intelligent agent delegation
- 3-strikes error recovery
- Multi-phase task execution
- Context preservation strategies

## Usage

The skill modifies Claude Code behavior through:

1. **CLAUDE.md Rules**: Project-specific orchestration rules
2. **Hook Automation**: Pre/post tool execution hooks
3. **Agent Templates**: Standardized delegation patterns

## Commands

| Command | Description |
|---------|-------------|
| `muaddib init` | Initialize in current project |
| `muaddib doctor` | Check installation health |
| `muaddib update` | Update to latest version |

## Configuration

Located in `.muaddib/config.json`:

```json
{
  "projectName": "...",
  "projectType": "node|python|go|rust|other",
  "maturity": "disciplined|transitional|legacy|greenfield",
  "strictMode": false
}
```

## Version

{{version}}
```

---

## Acceptance Criteria

### Task 6.1 (scripts)
- [ ] All 5 scripts created
- [ ] All scripts have correct shebang
- [ ] All scripts are executable
- [ ] Scripts work on macOS
- [ ] Scripts work on Linux
- [ ] Exit codes are correct
- [ ] Blocking works for dangerous patterns
- [ ] Logging works correctly

### Task 6.2 (documentation)
- [ ] orchestration-rules.md complete
- [ ] agent-definitions.md complete
- [ ] workflow-phases.md complete
- [ ] SKILL.md complete
- [ ] All docs follow consistent format
- [ ] No placeholder content

---

*Context for Tasks 6.1, 6.2*
