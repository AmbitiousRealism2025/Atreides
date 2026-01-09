#!/bin/bash
#
# validate-bash-command.sh
#
# PreToolUse hook for Bash commands
# Validates commands against security rules before execution
#
# Exit codes:
#   0 - Command allowed
#   1 - Command blocked
#   2 - Error in validation

set -euo pipefail

# Get the command from environment or argument
COMMAND="${1:-$TOOL_INPUT}"

if [ -z "$COMMAND" ]; then
    echo "No command provided"
    exit 2
fi

# Blocked patterns (case-insensitive)
BLOCKED_PATTERNS=(
    "rm -rf /"
    "rm -rf ~"
    "rm -rf \$HOME"
    "> /dev/sd"
    "mkfs"
    "dd if="
    ":(){:|:&};:"  # Fork bomb
    "chmod -R 777 /"
    "curl.*| bash"
    "wget.*| bash"
    "eval.*\$("
)

# Check against blocked patterns
COMMAND_LOWER=$(echo "$COMMAND" | tr '[:upper:]' '[:lower:]')

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    if [[ "$COMMAND_LOWER" == *"${pattern,,}"* ]]; then
        echo "BLOCKED: Command matches dangerous pattern: $pattern"
        exit 1
    fi
done

# Warn about potentially risky commands (but allow)
WARN_PATTERNS=(
    "sudo"
    "chmod"
    "chown"
    "rm -rf"
    "git push --force"
    "git reset --hard"
)

for pattern in "${WARN_PATTERNS[@]}"; do
    if [[ "$COMMAND_LOWER" == *"${pattern,,}"* ]]; then
        echo "WARNING: Command contains potentially risky operation: $pattern"
        # Don't block, just warn
    fi
done

# Command is allowed
exit 0
