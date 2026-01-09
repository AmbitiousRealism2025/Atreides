# Muad'Dib Polish Fixes - Consolidated Review Action Items

**Date**: 2026-01-08
**Sources**: Claude Review, Codex Review, Gemini Review
**Goal**: Apply polish layer before RC release

---

## Summary by Priority

| Priority | Count | Description |
|----------|-------|-------------|
| CRITICAL | 3 | Blocking/broken functionality |
| HIGH | 4 | Significant quality issues |
| MEDIUM | 7 | Good improvements |
| LOW | 4 | Nice to have |
| FUTURE | 2 | For v1.1+ |

---

## CRITICAL - Must Fix Before Release

### 1. Fix Jest Watchman Issue
**Source**: Codex Review
**Problem**: `npm test` fails with "unable to talk to your watchman" error
**Location**: `package.json:44`
**Fix**:
```json
"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watchman=false"
```
**Effort**: 1 minute

---

### 2. Fix Documentation URL
**Source**: Claude Review
**Problem**: Help text points to placeholder URL
**Location**: `src/cli/index.js:80`
**Current**:
```javascript
${chalk.blue('https://github.com/muaddib-claude/muaddib-claude')}
```
**Fix**:
```javascript
${chalk.blue('https://github.com/AmbitiousRealism2025/muad-dib')}
```
**Effort**: 1 minute

---

### 3. Reconcile Documentation State
**Source**: Codex Review
**Problem**: CLAUDE.md says "Current Phase: Pre-Phase 4 Remediation" and "38 tests" but we're at Phase 5 with 53 tests
**Location**: Project root `CLAUDE.md:83-169`
**Fix**: Update CLAUDE.md to reflect completed Phase 5 status
**Effort**: 5 minutes

---

## HIGH PRIORITY - Should Fix

### 4. Clarify Hook Coverage Documentation
**Source**: Codex Review
**Problem**: Phase 4 claims "all 8 hook types" but Claude Code 2.1 only supports 5 events
**Reality**: Claude Code 2.1 actually supports these 5 hook events:
- PreToolUse
- PostToolUse
- Stop
- SessionStart
- PreCompact

PostCompact, PreSubagent, PostSubagent don't exist in Claude Code 2.1.

**Fix Options**:
A. Update progress.md Phase 4 exit criteria to say "all 5 supported hook types"
B. Update documentation to clarify Claude Code 2.1 hook limitations
**Location**: `progress.md:233-240,247`
**Effort**: 5 minutes

---

### 5. Add CLI Integration Tests
**Source**: Claude Review
**Problem**: CLI commands (install, init, update, doctor) have no test coverage
**Fix**: Create `__tests__/cli.test.js` with:
- Mocked filesystem tests for init command
- Verification that commands don't throw
- E2E test in temp directory (per Gemini)
**Effort**: 2-4 hours

---

### 6. Fix Settings Update Within Hook Types
**Source**: Codex Review
**Problem**: `muaddib update --project` only adds new hook TYPES, not new entries within existing hook types
**Location**: `src/cli/update.js:120-166`
**Current Behavior**: If we add a new PreToolUse entry, existing projects won't get it
**Fix Options**:
A. Merge hook arrays with deduplication (by command string)
B. Document that major hook changes require re-init
C. Add `--force-hooks` flag to overwrite hook config
**Effort**: 1-2 hours for Option A

---

### 7. Fix Object Deduplication in Config Merger
**Source**: Claude Review
**Problem**: Object items in arrays always get pushed (no deduplication)
**Location**: `src/lib/config-merger.js:70`
**Current**:
```javascript
if (typeof item === 'object') {
  result.push(item);  // Always adds - may cause duplicates
}
```
**Fix**: Add deep equality check for objects or use JSON.stringify comparison
**Effort**: 30 minutes

---

## MEDIUM PRIORITY - Nice Improvements

### 8. Add `muaddib uninstall` Command
**Source**: Claude Review
**Problem**: No clean uninstall path exists
**Fix**: Add `src/cli/uninstall.js` that:
- Removes ~/.muaddib/ directory
- Removes ~/.claude/skills/muaddib symlink
- Optionally removes project .claude/ files with --project flag
**Effort**: 1-2 hours

---

### 9. Add Template Lookup Helper
**Source**: Claude Review
**Problem**: Deep nested `{{#if-eq}}` chains for project types are hard to maintain
**Location**: `templates/partials/skills-and-hooks.hbs:140-188`
**Fix**: Create a `{{lookup-project-type}}` helper that uses object lookup
```javascript
Handlebars.registerHelper('project-patterns', function(projectType) {
  const patterns = {
    node: ['npm *', 'npx *', 'node *', ...],
    python: ['python *', 'pip *', ...],
    // etc
  };
  return patterns[projectType] || patterns.default;
});
```
**Effort**: 1 hour

---

### 10. Add File Manager Tests
**Source**: Claude Review
**Problem**: `src/lib/file-manager.js` operations untested
**Fix**: Create `__tests__/file-manager.test.js` testing:
- writeFile with backup
- findBackups
- restoreFromBackup
- symlink operations
**Effort**: 1-2 hours

---

### 11. Standardize Skill Model Specifications
**Source**: Claude Review
**Problem**: Some skills don't specify model in frontmatter
**Files Missing Model**:
- `validate.md`
- `tdd.md`
- `parallel-explore.md`
- `doc-sync.md`
- `quality-gate.md`
**Fix**: Add explicit `model: sonnet` or `model: opus` to each
**Effort**: 15 minutes

---

### 12. Add E2E Test
**Source**: Gemini Review
**Problem**: No test that actually runs `muaddib init` and verifies output
**Fix**: Create `__tests__/e2e.test.js` that:
1. Creates temp directory
2. Runs `muaddib init` with mock answers
3. Verifies CLAUDE.md contains expected strings
4. Cleans up
**Effort**: 2 hours

---

### 13. Add `Bash(env *)` to Deny List
**Source**: Claude Review
**Problem**: `env` command can leak secrets
**Location**: `templates/settings.json.hbs` deny list
**Fix**: Add `"Bash(env *)"` to deny patterns
**Effort**: 5 minutes

---

### 14. Fix Trailing Comma in settings.json.hbs
**Source**: Claude Review
**Problem**: When `useHooks` is false, empty hooks object may have trailing comma
**Location**: `templates/settings.json.hbs`
**Fix**: Restructure template to avoid trailing comma issue
**Effort**: 15 minutes

---

## LOW PRIORITY - Nice to Have

### 15. Consolidate lib/core and templates/partials
**Source**: Claude Review
**Problem**: Some content appears duplicated between these directories
**Effort**: Research first, then 1-2 hours

---

### 16. Add TypeScript Type Definitions
**Source**: Claude Review
**Problem**: Library consumers have no type hints
**Fix**: Create `types/index.d.ts` with interfaces for:
- Config options
- Template data
- Merge options
**Effort**: 2-3 hours

---

### 17. Add Changelog Automation
**Source**: Claude Review
**Fix**: Set up conventional commits or standard-version
**Effort**: 1 hour

---

### 18. Add Markdown Validation
**Source**: Gemini Review
**Problem**: No verification that generated Markdown is syntactically correct
**Fix**: Add markdownlint or remark-lint to test pipeline
**Effort**: 1 hour

---

## FUTURE ENHANCEMENTS (v1.1+)

### 19. TypeScript Migration
**Source**: Gemini Review
**Note**: User explicitly said "for another day"

---

### 20. Plugin System for Custom Skills
**Source**: Gemini Review
**Description**: Allow users to define custom skills in local directory
**Effort**: 4-8 hours

---

## Quick Win Order (For Polish Session)

If fixing now, tackle in this order for maximum impact:

1. [ ] Fix Jest watchman (#1) - 1 min
2. [ ] Fix documentation URL (#2) - 1 min
3. [ ] Add `Bash(env *)` to deny (#13) - 5 min
4. [ ] Reconcile docs state (#3) - 5 min
5. [ ] Clarify hook coverage (#4) - 5 min
6. [ ] Standardize skill models (#11) - 15 min
7. [ ] Fix trailing comma (#14) - 15 min
8. [ ] Fix object deduplication (#7) - 30 min

**Total Quick Wins**: ~1 hour for significant polish

---

## Effort Summary

| Priority | Total Effort |
|----------|--------------|
| Critical | ~10 minutes |
| High | 4-7 hours |
| Medium | 7-10 hours |
| Low | 5-7 hours |
| Future | 4-8 hours |

**Recommended for RC**: Critical + Quick Wins = ~1 hour
**Full Polish**: Critical + High + Medium = ~15-20 hours

---

*Generated from Claude, Codex, and Gemini reviews on 2026-01-08*
