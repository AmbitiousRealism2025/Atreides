#!/bin/bash
#
# pre-edit-check.sh
#
# PreToolUse hook for Edit/Write operations
# Validates file operations before execution
#
# Exit codes:
#   0 - Operation allowed
#   1 - Operation blocked
#   2 - Error in validation

set -euo pipefail

# Get file path from environment
FILE="${TOOL_INPUT:-}"

if [ -z "$FILE" ]; then
    # No file specified, allow (let the tool handle it)
    exit 0
fi

# Blocked file patterns
BLOCKED_FILES=(
    ".env"
    ".env.local"
    ".env.production"
    "secrets"
    "credentials"
    "id_rsa"
    "id_ed25519"
    ".ssh/config"
    ".aws/credentials"
    ".npmrc"
    ".pypirc"
)

# Check if file matches any blocked pattern
FILE_LOWER=$(echo "$FILE" | tr '[:upper:]' '[:lower:]')

for pattern in "${BLOCKED_FILES[@]}"; do
    if [[ "$FILE_LOWER" == *"$pattern"* ]]; then
        echo "BLOCKED: Cannot edit file matching pattern: $pattern"
        exit 1
    fi
done

# Warn about important configuration files
WARN_FILES=(
    "package.json"
    "package-lock.json"
    "tsconfig.json"
    "Cargo.toml"
    "go.mod"
    "pyproject.toml"
)

for pattern in "${WARN_FILES[@]}"; do
    if [[ "$FILE" == *"$pattern"* ]]; then
        echo "INFO: Editing configuration file: $FILE"
    fi
done

# File is allowed
exit 0
