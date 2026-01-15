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

# ============================================================================
# Command Normalization
# Decode various obfuscation techniques to detect hidden dangerous commands
# ============================================================================

normalize_command() {
    local cmd="$1"

    # 1. URL decode (%XX hex sequences)
    # Handles patterns like %72m -> rm, %2F -> /
    cmd=$(echo "$cmd" | sed 's/%\([0-9A-Fa-f][0-9A-Fa-f]\)/\\x\1/g' | while IFS= read -r line; do printf '%b' "$line"; done 2>/dev/null || echo "$cmd")

    # 2. Remove null bytes and control characters (except newlines/tabs)
    cmd=$(echo "$cmd" | tr -d '\000-\010\013\014\016-\037')

    # 3. Collapse multiple spaces/tabs to single space
    cmd=$(echo "$cmd" | tr -s '[:space:]' ' ')

    # 4. Remove backslash continuations (\ at end of segments)
    cmd=$(echo "$cmd" | sed 's/\\[[:space:]]*$//g; s/\\[[:space:]]\+/ /g')

    # 5. Decode common hex escapes (\xNN)
    cmd=$(echo "$cmd" | sed 's/\\x\([0-9A-Fa-f][0-9A-Fa-f]\)/\\x\1/g' | while IFS= read -r line; do printf '%b' "$line"; done 2>/dev/null || echo "$cmd")

    # 6. Decode octal escapes (\NNN)
    cmd=$(echo "$cmd" | sed 's/\\\([0-7][0-7][0-7]\)/\\0\1/g' | while IFS= read -r line; do printf '%b' "$line"; done 2>/dev/null || echo "$cmd")

    # 7. Remove single quotes used to break up commands (e.g., r'm' -> rm)
    # This handles obfuscation like: r'm' -rf / or 'r''m' -rf /
    cmd=$(echo "$cmd" | sed "s/'\([^']*\)'/\1/g")

    # 8. Remove double quotes used to break up commands
    cmd=$(echo "$cmd" | sed 's/"\([^"]*\)"/\1/g')

    # 9. Handle $'\xNN' bash quoting style
    cmd=$(echo "$cmd" | sed "s/\\\$'\\\\x\([0-9A-Fa-f][0-9A-Fa-f]\)'/\\\\x\1/g" | while IFS= read -r line; do printf '%b' "$line"; done 2>/dev/null || echo "$cmd")

    # 10. Remove backtick command substitution markers (flag for review)
    # Note: We just normalize, actual backtick content is complex to evaluate

    echo "$cmd"
}

# Normalize the command for security checking
NORMALIZED_COMMAND=$(normalize_command "$COMMAND")

# Check if normalization revealed hidden content
if [ "$NORMALIZED_COMMAND" != "$COMMAND" ]; then
    # Log that obfuscation was detected (for debugging)
    : # Silent - we'll catch it in the pattern check
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
# Check both original and normalized command
COMMAND_LOWER=$(echo "$COMMAND" | tr '[:upper:]' '[:lower:]')
NORMALIZED_LOWER=$(echo "$NORMALIZED_COMMAND" | tr '[:upper:]' '[:lower:]')

for pattern in "${BLOCKED_PATTERNS[@]}"; do
    pattern_lower=$(echo "$pattern" | tr '[:upper:]' '[:lower:]')

    # Check original command
    if [[ "$COMMAND_LOWER" == *"$pattern_lower"* ]]; then
        echo "BLOCKED: Command matches dangerous pattern: $pattern"
        exit 1
    fi

    # Check normalized command (catches obfuscated attacks)
    if [[ "$NORMALIZED_LOWER" == *"$pattern_lower"* ]]; then
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
    pattern_lower=$(echo "$pattern" | tr '[:upper:]' '[:lower:]')
    if [[ "$COMMAND_LOWER" == *"$pattern_lower"* ]] || [[ "$NORMALIZED_LOWER" == *"$pattern_lower"* ]]; then
        echo "WARNING: Command contains potentially risky operation: $pattern"
        # Don't block, just warn
    fi
done

# Command is allowed
exit 0
