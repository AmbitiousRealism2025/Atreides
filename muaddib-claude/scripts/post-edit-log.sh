#!/bin/bash
#
# post-edit-log.sh
#
# PostToolUse hook for Edit/Write operations
# Logs file changes and optionally runs formatters
#
# Exit codes:
#   0 - Success
#   1 - Warning (non-fatal)
#   2 - Error

set -euo pipefail

# Sanitize input by removing control characters and limiting length
# Prevents log injection attacks via embedded newlines/control chars
sanitize_for_log() {
    local input="$1"
    local max_len="${2:-500}"
    # Remove control characters (0x00-0x1F and 0x7F), limit length
    printf '%s' "$input" | tr -d '\000-\037\177' | head -c "$max_len"
}

# Get file path from environment
FILE="${TOOL_INPUT:-}"

if [ -z "$FILE" ]; then
    exit 0
fi

# Check if file exists
if [ ! -f "$FILE" ]; then
    SAFE_FILE=$(sanitize_for_log "$FILE")
    printf 'INFO: File does not exist (may have been deleted): %s\n' "$SAFE_FILE"
    exit 0
fi

# Determine file type and run appropriate formatter
EXTENSION="${FILE##*.}"

case "$EXTENSION" in
    js|jsx|ts|tsx|json|md|yaml|yml)
        # JavaScript/TypeScript - try prettier
        if command -v npx &> /dev/null; then
            npx prettier --write "$FILE" 2>/dev/null || true
        fi
        ;;
    py)
        # Python - try black
        if command -v black &> /dev/null; then
            black "$FILE" 2>/dev/null || true
        elif command -v python &> /dev/null; then
            python -m black "$FILE" 2>/dev/null || true
        fi
        ;;
    go)
        # Go - gofmt
        if command -v gofmt &> /dev/null; then
            gofmt -w "$FILE" 2>/dev/null || true
        fi
        ;;
    rs)
        # Rust - rustfmt
        if command -v rustfmt &> /dev/null; then
            rustfmt "$FILE" 2>/dev/null || true
        fi
        ;;
esac

# Log the edit
LOG_DIR="${HOME}/.muaddib/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="${LOG_DIR}/edits.log"
# Sanitize file path before logging to prevent log injection
LOG_ENTRY=$(sanitize_for_log "$FILE")
printf '%s\n' "$(date -Iseconds) | EDIT | $LOG_ENTRY" >> "$LOG_FILE"

# Keep log file from growing too large (keep last 1000 lines)
if [ -f "$LOG_FILE" ] && [ "$(wc -l < "$LOG_FILE")" -gt 1000 ]; then
    tail -n 1000 "$LOG_FILE" > "${LOG_FILE}.tmp"
    mv "${LOG_FILE}.tmp" "$LOG_FILE"
fi

exit 0
