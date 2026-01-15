#!/bin/bash
# post-edit-log.sh
# Logs file edits for audit trail
# Exit 0 after logging
#
# Arguments:
#   $1 - File path (optional, falls back to TOOL_INPUT env var)

set -euo pipefail

# Accept $1 argument or fall back to TOOL_INPUT env var
FILE="${1:-${TOOL_INPUT:-}}"

# If no file provided, nothing to log
if [[ -z "$FILE" ]]; then
  exit 0
fi

# Log the edit (to stderr to not interfere with tool output)
printf '%s\n' "EDIT: $FILE" >&2

# Track edit in session log if available
if [[ -n "${MUADDIB_SESSION_LOG:-}" ]] && [[ -w "$(dirname "${MUADDIB_SESSION_LOG}")" ]]; then
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$FILE" >> "$MUADDIB_SESSION_LOG"
fi

# Always succeed - logging should never block edits
exit 0
