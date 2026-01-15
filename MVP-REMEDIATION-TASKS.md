# Atreides MVP Remediation Task List

**Generated**: 2026-01-15
**Source Reviews**:
- COMPREHENSIVE-MVP-REVIEW.md (6-agent analysis)
- atreides-mvp-review.md (Codex review)

This document consolidates findings from both reviews into a prioritized remediation task list.

---

## Summary Comparison

| Category | Comprehensive Review | Codex Review | Combined |
|----------|---------------------|--------------|----------|
| Critical | 2 | 0 | 2 |
| High | 5 + 1 = 6 | 1 | 7 |
| Medium | 8 | 3 | 11 |
| Low | 6 | 1 | 7 |

**Key Differences**:
- Comprehensive review identified 2 **Critical** security vulnerabilities not flagged by Codex
- Codex review found specific **CLI flag behavior** issues not in comprehensive review
- Both reviews agree on test coverage gaps and hook script weaknesses

---

## CRITICAL PRIORITY (Fix Before Release)

These issues pose significant security risks and **must be addressed before any public release**.

### CRIT-1: Command Injection in Shell Hook Scripts
**Source**: Comprehensive Review (Security Agent)
**Severity**: CRITICAL
**Location**: `scripts/validate-bash-command.sh:16`

**Issue**: The script receives commands via `$TOOL_INPUT` environment variable and passes them through shell operations without proper sanitization. Attacker-controlled input with embedded newlines, backticks, or `$(...)` could lead to command execution.

**Tasks**:
- [ ] **CRIT-1.1**: Replace `echo` with `printf '%s'` for all variable output
- [ ] **CRIT-1.2**: Quote all variable expansions properly (`"$VAR"` not `$VAR`)
- [ ] **CRIT-1.3**: Consider rewriting validation logic in Python/Node for safer parsing
- [ ] **CRIT-1.4**: Add input sanitization to strip shell metacharacters
- [ ] **CRIT-1.5**: Add test cases for command injection attempts

**Files to Modify**:
```
scripts/validate-bash-command.sh
```

**Example Fix**:
```bash
# Before (vulnerable)
echo "$TOOL_INPUT"

# After (safer)
printf '%s\n' "$TOOL_INPUT"
```

---

### CRIT-2: Arbitrary File Write via Path Traversal
**Source**: Comprehensive Review (Security Agent)
**Severity**: CRITICAL
**Location**: `src/lib/file-manager.js:56-71`

**Issue**: The `writeFile()`, `writeJson()`, `copyFile()`, and `copyDir()` functions accept file paths without validation for path traversal sequences (`../`). An attacker could write files outside intended directories.

**Tasks**:
- [ ] **CRIT-2.1**: Create `validatePath(filePath, baseDir)` utility function
- [ ] **CRIT-2.2**: Add path traversal check to `writeFile()`
- [ ] **CRIT-2.3**: Add path traversal check to `writeJson()`
- [ ] **CRIT-2.4**: Add path traversal check to `copyFile()`
- [ ] **CRIT-2.5**: Add path traversal check to `copyDir()`
- [ ] **CRIT-2.6**: Add unit tests for path traversal attempts
- [ ] **CRIT-2.7**: Define allowed base directories for each operation

**Files to Modify**:
```
src/lib/file-manager.js
tests/file-manager.test.js
```

**Example Fix**:
```javascript
function validatePath(filePath, allowedBaseDir) {
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(allowedBaseDir))) {
    throw new Error(`Path traversal attempt detected: ${filePath}`);
  }
  return resolvedPath;
}
```

---

## HIGH PRIORITY (Fix Within 1-2 Weeks)

These issues significantly impact functionality, security, or user experience.

### HIGH-1: CLI Flags Don't Normalize Dependent Settings
**Source**: Codex Review
**Severity**: HIGH
**Location**: `src/cli/init.js:102-105, 188-195`

**Issue**: When `--minimal` or `--full` is passed without `--yes`, `orchestrationLevel` is overridden after prompts, but `useHooks` and `useAgentDelegation` are not updated. This means `--minimal` can still copy hooks/scripts and `--full` can leave `useAgentDelegation` unset.

**Tasks**:
- [ ] **HIGH-1.1**: After overriding `orchestrationLevel`, set `useHooks` based on mode
- [ ] **HIGH-1.2**: After overriding `orchestrationLevel`, set `useAgentDelegation` based on mode
- [ ] **HIGH-1.3**: Add integration test for `--minimal` flag behavior
- [ ] **HIGH-1.4**: Add integration test for `--full` flag behavior
- [ ] **HIGH-1.5**: Document expected behavior in README

**Files to Modify**:
```
src/cli/init.js
tests/init.test.js
```

**Expected Behavior**:
| Mode | useHooks | useAgentDelegation |
|------|----------|-------------------|
| minimal | false | false |
| standard | true | false |
| full | true | true |

---

### HIGH-2: TOCTOU Race Condition in Symlink Operations
**Source**: Comprehensive Review (Security Agent)
**Severity**: HIGH
**Location**: `src/lib/file-manager.js:152-163`

**Issue**: Symlink creation has a time-of-check to time-of-use (TOCTOU) race condition that could be exploited.

**Tasks**:
- [ ] **HIGH-2.1**: Use atomic operations for symlink creation
- [ ] **HIGH-2.2**: Check target exists immediately before symlink creation
- [ ] **HIGH-2.3**: Add error handling for race condition scenarios
- [ ] **HIGH-2.4**: Add tests for concurrent symlink operations

**Files to Modify**:
```
src/lib/file-manager.js
tests/file-manager.test.js
```

---

### HIGH-3: Permission Bypass via Encoding/Aliasing
**Source**: Comprehensive Review (Security Agent)
**Severity**: HIGH
**Location**: `templates/settings.json.hbs:152-199`

**Issue**: The deny list can be bypassed via URL encoding, shell aliasing, or other evasion techniques.

**Tasks**:
- [ ] **HIGH-3.1**: Normalize commands before deny list checking
- [ ] **HIGH-3.2**: Add URL-decoded variants to deny patterns
- [ ] **HIGH-3.3**: Add common alias patterns to deny list
- [ ] **HIGH-3.4**: Consider using allowlist approach for dangerous operations
- [ ] **HIGH-3.5**: Add tests for bypass attempts

**Files to Modify**:
```
templates/settings.json.hbs
scripts/validate-bash-command.sh
```

---

### HIGH-4: Log Injection in Hook Scripts
**Source**: Comprehensive Review (Security Agent)
**Severity**: HIGH
**Location**: `scripts/post-edit-log.sh:65`

**Issue**: Unsanitized strings written to log files could enable log injection attacks.

**Tasks**:
- [ ] **HIGH-4.1**: Sanitize all user input before logging
- [ ] **HIGH-4.2**: Escape special characters in log entries
- [ ] **HIGH-4.3**: Use structured logging format (JSON)
- [ ] **HIGH-4.4**: Add tests for log injection attempts

**Files to Modify**:
```
scripts/post-edit-log.sh
```

---

### HIGH-5: Template Injection Risk
**Source**: Comprehensive Review (Security Agent)
**Severity**: HIGH
**Location**: `src/lib/template-engine.js:184-187`

**Issue**: User data rendered without proper sanitization could lead to template injection.

**Tasks**:
- [ ] **HIGH-5.1**: Escape user-provided data before template rendering
- [ ] **HIGH-5.2**: Use Handlebars SafeString only for trusted content
- [ ] **HIGH-5.3**: Add input validation for template context data
- [ ] **HIGH-5.4**: Add tests for template injection attempts

**Files to Modify**:
```
src/lib/template-engine.js
tests/template-engine.test.js
```

---

### HIGH-6: Recursive Copy DoS Vulnerability
**Source**: Comprehensive Review (Security Agent)
**Severity**: HIGH
**Location**: `src/lib/file-manager.js:128-132`

**Issue**: No depth limit on directory copy operations could lead to denial of service.

**Tasks**:
- [ ] **HIGH-6.1**: Add `maxDepth` parameter to `copyDir()`
- [ ] **HIGH-6.2**: Set reasonable default depth limit (e.g., 10)
- [ ] **HIGH-6.3**: Add file count limit for copy operations
- [ ] **HIGH-6.4**: Add tests for deeply nested directories

**Files to Modify**:
```
src/lib/file-manager.js
tests/file-manager.test.js
```

---

### HIGH-7: Prototype Pollution in deepMerge
**Source**: Comprehensive Review (Security Agent)
**Severity**: HIGH
**Location**: `src/lib/settings-merge.js` (deepMerge function)

**Issue**: The `deepMerge()` function doesn't check for `__proto__` or `constructor` properties.

**Tasks**:
- [ ] **HIGH-7.1**: Add prototype pollution protection to `deepMerge()`
- [ ] **HIGH-7.2**: Filter out `__proto__`, `constructor`, `prototype` keys
- [ ] **HIGH-7.3**: Add tests for prototype pollution attempts

**Files to Modify**:
```
src/lib/settings-merge.js
tests/settings-merge.test.js
```

**Example Fix**:
```javascript
const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (DANGEROUS_KEYS.includes(key)) continue;
    // ... rest of merge logic
  }
}
```

---

## MEDIUM PRIORITY (Fix Within 1 Month)

These issues affect quality, maintainability, or edge cases.

### MED-1: Edit/Write Hooks Ignore Passed Arguments
**Source**: Codex Review
**Severity**: MEDIUM
**Location**: `scripts/pre-edit-check.sh:15-20`, `scripts/post-edit-log.sh:15-20`

**Issue**: Hook scripts read only `TOOL_INPUT` and ignore the `$FILE` argument passed by `settings.json`.

**Tasks**:
- [ ] **MED-1.1**: Update `pre-edit-check.sh` to accept `$1` argument
- [ ] **MED-1.2**: Update `post-edit-log.sh` to accept `$1` argument
- [ ] **MED-1.3**: Use fallback pattern: `FILE="${1:-${TOOL_INPUT:-}}"`
- [ ] **MED-1.4**: Add tests for hook argument handling

**Files to Modify**:
```
scripts/pre-edit-check.sh
scripts/post-edit-log.sh
```

---

### MED-2: Minimal Mode Creates .claude/ Directory
**Source**: Codex Review
**Severity**: MEDIUM
**Location**: `src/cli/init.js:120-121`

**Issue**: CLI advertises "minimal initialization (CLAUDE.md only)" but `.claude/` is always created.

**Tasks**:
- [ ] **MED-2.1**: Decide: change behavior or update documentation
- [ ] **MED-2.2**: If changing behavior: skip `.claude/` creation in minimal mode
- [ ] **MED-2.3**: If updating docs: clarify minimal mode creates `.claude/`
- [ ] **MED-2.4**: Add test to verify minimal mode file creation

**Files to Modify**:
```
src/cli/init.js
muaddib-claude/README.md
```

---

### MED-3: Recovery Guidance Risks Data Loss
**Source**: Codex Review
**Severity**: MEDIUM
**Location**: `templates/partials/orchestration-rules.hbs:68-90`

**Issue**: 3-strikes protocol instructs `git checkout .` without checking for uncommitted work.

**Tasks**:
- [ ] **MED-3.1**: Update guidance to check `git status` first
- [ ] **MED-3.2**: Prefer `git restore <file>` over `git checkout .`
- [ ] **MED-3.3**: Add warning about uncommitted changes
- [ ] **MED-3.4**: Suggest `git stash` before destructive operations

**Files to Modify**:
```
templates/partials/orchestration-rules.hbs
```

---

### MED-4: Incomplete Sensitive File Protection
**Source**: Comprehensive Review (Security Agent)
**Severity**: MEDIUM

**Issue**: Sensitive file list missing `.envrc`, `kubeconfig`, `terraform.tfvars`, etc.

**Tasks**:
- [ ] **MED-4.1**: Add `.envrc` to sensitive file patterns
- [ ] **MED-4.2**: Add `kubeconfig`, `~/.kube/*` to sensitive patterns
- [ ] **MED-4.3**: Add `terraform.tfvars`, `*.tfstate` to sensitive patterns
- [ ] **MED-4.4**: Add `*.pem`, `*.key`, `*.p12` to sensitive patterns
- [ ] **MED-4.5**: Document sensitive file patterns in README

**Files to Modify**:
```
templates/settings.json.hbs
scripts/pre-edit-check.sh
```

---

### MED-5: Debug Logging May Expose Sensitive Data
**Source**: Comprehensive Review (Security Agent)
**Severity**: MEDIUM

**Issue**: Sensitive data may appear in debug output when verbose modes enabled.

**Tasks**:
- [ ] **MED-5.1**: Audit all debug log statements for sensitive data
- [ ] **MED-5.2**: Redact file paths containing sensitive patterns
- [ ] **MED-5.3**: Never log environment variables or credentials
- [ ] **MED-5.4**: Add warning about debug mode in production

**Files to Modify**:
```
src/cli/*.js
scripts/*.sh
```

---

### MED-6: Backup Files Not Cleaned/Rotated
**Source**: Comprehensive Review (Security Agent)
**Severity**: MEDIUM

**Issue**: Backup files have predictable timestamps and are never rotated, potentially filling disk.

**Tasks**:
- [ ] **MED-6.1**: Implement backup rotation (keep last N backups)
- [ ] **MED-6.2**: Add `muaddib clean-backups` command or integrate with doctor
- [ ] **MED-6.3**: Use random component in backup names
- [ ] **MED-6.4**: Document backup retention policy

**Files to Modify**:
```
src/lib/file-manager.js
src/cli/doctor.js
```

---

### MED-7: Wildcard Permissions Too Permissive
**Source**: Comprehensive Review (Security Agent)
**Severity**: MEDIUM

**Issue**: `Bash(cat *)`, `Bash(npx *)` allow potentially dangerous operations.

**Tasks**:
- [ ] **MED-7.1**: Review and tighten wildcard permission patterns
- [ ] **MED-7.2**: Replace `cat *` with specific file patterns
- [ ] **MED-7.3**: Add deny rules for `npx` with dangerous packages
- [ ] **MED-7.4**: Document permission rationale

**Files to Modify**:
```
templates/settings.json.hbs
```

---

### MED-8: No Input Length Validation
**Source**: Comprehensive Review (Security Agent)
**Severity**: MEDIUM

**Issue**: Extremely long inputs could cause memory issues or buffer overflows.

**Tasks**:
- [ ] **MED-8.1**: Add max length check to CLI inputs
- [ ] **MED-8.2**: Add max length check to template context
- [ ] **MED-8.3**: Add max file size check to file operations
- [ ] **MED-8.4**: Return meaningful error for oversized inputs

**Files to Modify**:
```
src/cli/*.js
src/lib/template-engine.js
```

---

### MED-9: Uncontrolled Resource Consumption in listFiles
**Source**: Comprehensive Review (Security Agent)
**Severity**: MEDIUM
**Location**: `src/lib/file-manager.js` (listFiles function)

**Issue**: `listFiles()` has no limits, could cause issues on large directories.

**Tasks**:
- [ ] **MED-9.1**: Add `maxFiles` parameter to `listFiles()`
- [ ] **MED-9.2**: Set reasonable default limit (e.g., 10000)
- [ ] **MED-9.3**: Add warning when limit is reached
- [ ] **MED-9.4**: Add tests for large directory handling

**Files to Modify**:
```
src/lib/file-manager.js
tests/file-manager.test.js
```

---

### MED-10: JSON Template Corruption Risk
**Source**: Comprehensive Review (Security Agent)
**Severity**: MEDIUM

**Issue**: Template errors could generate invalid JSON in settings.json.

**Tasks**:
- [ ] **MED-10.1**: Add JSON validation after template rendering
- [ ] **MED-10.2**: Provide clear error message for invalid JSON
- [ ] **MED-10.3**: Fall back to known-good settings on validation failure
- [ ] **MED-10.4**: Add tests for malformed template output

**Files to Modify**:
```
src/cli/init.js
src/lib/template-engine.js
```

---

### MED-11: Code Duplication (DRY Violations)
**Source**: Comprehensive Review (Architecture Agent)
**Severity**: MEDIUM
**Location**: `src/cli/install.js`, `src/cli/update.js`, `src/cli/init.js`

**Issue**: File copy pattern duplicated across multiple CLI commands.

**Tasks**:
- [ ] **MED-11.1**: Create shared `syncPackageAssets()` function
- [ ] **MED-11.2**: Refactor `install.js` to use shared function
- [ ] **MED-11.3**: Refactor `update.js` to use shared function
- [ ] **MED-11.4**: Refactor `init.js` to use shared function
- [ ] **MED-11.5**: Add tests for shared function

**Files to Modify**:
```
src/lib/file-manager.js (or new src/lib/asset-sync.js)
src/cli/install.js
src/cli/update.js
src/cli/init.js
```

---

## LOW PRIORITY (Future Enhancement)

These are improvements that enhance quality but aren't blocking.

### LOW-1: Fallback Settings Are Permissive
**Source**: Codex Review
**Severity**: LOW
**Location**: `src/cli/init.js:142-150, 280-287`

**Issue**: If template rendering fails, fallback settings have no deny list.

**Tasks**:
- [ ] **LOW-1.1**: Add minimal deny list to fallback settings
- [ ] **LOW-1.2**: Consider aborting initialization on settings failure
- [ ] **LOW-1.3**: Add test for fallback settings scenario

**Files to Modify**:
```
src/cli/init.js
```

---

### LOW-2: Oversized Functions Need Decomposition
**Source**: Comprehensive Review (Architecture Agent)
**Severity**: LOW
**Location**: `src/cli/init.js:56-223`, `src/cli/doctor.js:58-319`

**Issue**: `runInit()` (167 lines) and `runDoctor()` (261 lines) handle too many responsibilities.

**Tasks**:
- [ ] **LOW-2.1**: Extract prompt handling from `runInit()`
- [ ] **LOW-2.2**: Extract file operations from `runInit()`
- [ ] **LOW-2.3**: Extract checks from `runDoctor()` into separate functions
- [ ] **LOW-2.4**: Extract fixes from `runDoctor()` into separate functions
- [ ] **LOW-2.5**: Extract reporting from `runDoctor()` into separate functions

**Files to Modify**:
```
src/cli/init.js
src/cli/doctor.js
```

---

### LOW-3: Swallowed Exceptions Need Logging
**Source**: Comprehensive Review (Architecture Agent)
**Severity**: LOW

**Issue**: Multiple locations catch errors and return defaults without logging.

**Tasks**:
- [ ] **LOW-3.1**: Audit all try/catch blocks for silent failures
- [ ] **LOW-3.2**: Add debug logging before returning fallback values
- [ ] **LOW-3.3**: Consider throwing instead of swallowing in critical paths

**Files to Modify**:
```
src/cli/*.js
src/lib/*.js
```

---

### LOW-4: Documentation Test Count Outdated
**Source**: Comprehensive Review (Documentation Agent)
**Severity**: LOW
**Location**: `CLAUDE.md:184`

**Issue**: Says "53 tests", should be "188 tests".

**Tasks**:
- [ ] **LOW-4.1**: Update CLAUDE.md test count to 188
- [ ] **LOW-4.2**: Verify all documentation references correct test count

**Files to Modify**:
```
CLAUDE.md
```

---

### LOW-5: Missing CHANGELOG.md
**Source**: Comprehensive Review (Documentation Agent)
**Severity**: LOW

**Issue**: No changelog for version tracking.

**Tasks**:
- [ ] **LOW-5.1**: Create CHANGELOG.md following Keep a Changelog format
- [ ] **LOW-5.2**: Document all features from phases 0-5
- [ ] **LOW-5.3**: Add version 1.0.0 entry

**Files to Modify**:
```
muaddib-claude/CHANGELOG.md (new file)
```

---

### LOW-6: Template Conditional Complexity
**Source**: Comprehensive Review (Template Agent)
**Severity**: LOW
**Location**: Multiple template files

**Issue**: Excessive nesting in projectType conditionals (5+ levels deep).

**Tasks**:
- [ ] **LOW-6.1**: Consider creating language config files
- [ ] **LOW-6.2**: Implement `switch` helper for templates
- [ ] **LOW-6.3**: Reduce nesting to max 3 levels
- [ ] **LOW-6.4**: Add template linting

**Files to Modify**:
```
templates/partials/lsp-operations.hbs
templates/partials/ast-grep-patterns.hbs
templates/settings.json.hbs
```

---

### LOW-7: Missing --dry-run Option
**Source**: Comprehensive Review (CLI Agent)
**Severity**: LOW

**Issue**: Destructive commands should support preview mode.

**Tasks**:
- [ ] **LOW-7.1**: Add `--dry-run` flag to `install` command
- [ ] **LOW-7.2**: Add `--dry-run` flag to `update` command
- [ ] **LOW-7.3**: Add `--dry-run` flag to `uninstall` command
- [ ] **LOW-7.4**: Document dry-run behavior

**Files to Modify**:
```
src/cli/install.js
src/cli/update.js
src/cli/uninstall.js
muaddib-claude/README.md
```

---

## Test Coverage Tasks

Both reviews identified significant test coverage gaps.

### TEST-1: CLI Command Execution Tests
**Source**: Both reviews
**Priority**: HIGH

**Tasks**:
- [ ] **TEST-1.1**: Add execution tests for `install` command
- [ ] **TEST-1.2**: Add execution tests for `init` command
- [ ] **TEST-1.3**: Add execution tests for `update` command
- [ ] **TEST-1.4**: Add execution tests for `doctor` command
- [ ] **TEST-1.5**: Add execution tests for `uninstall` command
- [ ] **TEST-1.6**: Mock filesystem, prompts, process.exit

**Files to Create/Modify**:
```
tests/cli-execution.test.js (new)
tests/cli.test.js
```

---

### TEST-2: Flag Behavior Tests
**Source**: Codex Review
**Priority**: MEDIUM

**Tasks**:
- [ ] **TEST-2.1**: Test `--minimal` creates correct file set
- [ ] **TEST-2.2**: Test `--full` creates correct file set
- [ ] **TEST-2.3**: Test `--yes` skips prompts correctly
- [ ] **TEST-2.4**: Test `--force` overwrites existing files

**Files to Create/Modify**:
```
tests/init.test.js
```

---

### TEST-3: Hook Script Tests
**Source**: Codex Review
**Priority**: MEDIUM

**Tasks**:
- [ ] **TEST-3.1**: Test hook scripts with `$FILE` argument
- [ ] **TEST-3.2**: Test hook scripts with `TOOL_INPUT` env var
- [ ] **TEST-3.3**: Test hook scripts with missing input
- [ ] **TEST-3.4**: Test hook scripts detect blocked files

**Files to Create/Modify**:
```
tests/hooks.test.js (new)
```

---

### TEST-4: Error Path Tests
**Source**: Comprehensive Review (Test Agent)
**Priority**: MEDIUM

**Tasks**:
- [ ] **TEST-4.1**: Test template rendering failures
- [ ] **TEST-4.2**: Test filesystem permission errors
- [ ] **TEST-4.3**: Test missing dependency scenarios
- [ ] **TEST-4.4**: Test invalid input handling

**Files to Create/Modify**:
```
tests/error-paths.test.js (new)
```

---

## Implementation Order Recommendation

### Phase 1: Critical Security (Before Release)
1. CRIT-1: Command Injection Fix
2. CRIT-2: Path Traversal Fix

### Phase 2: High Priority Security
3. HIGH-7: Prototype Pollution
4. HIGH-2: TOCTOU Fix
5. HIGH-3: Permission Bypass
6. HIGH-4: Log Injection
7. HIGH-5: Template Injection
8. HIGH-6: Recursive Copy DoS

### Phase 3: Functional Issues
9. HIGH-1: CLI Flag Normalization
10. MED-1: Hook Argument Handling
11. MED-2: Minimal Mode Behavior
12. MED-3: Recovery Guidance

### Phase 4: Quality Improvements
13. MED-10: JSON Validation
14. MED-11: Code Duplication
15. TEST-1: CLI Execution Tests
16. TEST-2: Flag Behavior Tests

### Phase 5: Polish
17. LOW-4: Documentation Updates
18. LOW-5: CHANGELOG.md
19. LOW-7: --dry-run Option
20. Remaining LOW items

---

## Progress Tracking

| Priority | Total | Complete | Remaining |
|----------|-------|----------|-----------|
| CRITICAL | 2 | 0 | 2 |
| HIGH | 7 | 0 | 7 |
| MEDIUM | 11 | 0 | 11 |
| LOW | 7 | 0 | 7 |
| **Total** | **27** | **0** | **27** |

---

*Generated from analysis of COMPREHENSIVE-MVP-REVIEW.md and atreides-mvp-review.md*
*Last Updated: 2026-01-15*
