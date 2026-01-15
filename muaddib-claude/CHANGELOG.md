# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2026-01-15

### Added
- Path traversal tests for file operations and manual security verification
- Command injection tests for hook validation

### Changed
- Debug logging now redacts sensitive values and environment data
- Permissions tightened for `cat` and `npx` workflows with explicit allow/deny patterns
- Asset sync now reuses `syncPackageAssets` across install/update/init flows
- Documentation notes explain scoped `cat`/`npx` defaults
- Model signature: GPT-5 (Codex)

### Fixed
- Path traversal protection added to file operations via `validatePath` + base directory enforcement
- Hook validation hardened with safer normalization, regex blocking, and metacharacter sanitization
- `post-edit-log.sh` no longer fails when log directory is not writable
- init now validates rendered `settings.json` JSON before writing

## [1.0.1] - 2026-01-15

### Fixed

#### Critical Bug Fixes (MVP Remediation)
- **listFiles() API mismatch** - Fixed destructuring in 4 locations where callers expected array but received `{files, limitReached}` object
  - `src/cli/install.js:137`
  - `src/cli/doctor.js:87, 103`
  - `src/cli/update.js:96`
- **init.js minimal mode** - Fixed unconditional `.claude` directory creation; now respects `--minimal` flag
- **doctor.js missing options** - Added `--cleanup-backups` and `--dry-run` options with full handler implementation

#### Shell Script Fixes
- **post-edit-log.sh** - Restored original API contract:
  - `$1` argument support (was removed, now restored)
  - stderr output for observability
  - `MUADDIB_SESSION_LOG` environment variable support
  - Kept security improvements (sanitization, length limits)
- **pre-edit-check.sh** - Added missing blocked file patterns:
  - `secrets.json`, `secrets.yaml`, `credentials.yaml`
  - `.ssh/config`
  - `.aws/credentials`, `.aws/config`
  - `.npmrc`, `.pypirc`, `.yarnrc`
  - `kubeconfig`, `.tfvars`, `.tfstate` (infrastructure secrets)
  - Added case-insensitive matching for `.env` patterns
- **validate-bash-command.sh** - Added mid-word backslash normalization to detect obfuscated commands like `r\m` → `rm`

#### Test Assertion Corrections
- **security-verification.test.js** - Fixed template injection test expectations for double HTML-encoding behavior
- **shell-scripts.test.js** - Fixed INFO/WARNING assertion for lock file warnings

#### Minor Fixes
- Added "Installation complete" message to install.js for test compatibility
- Fixed capitalization in doctor.js issue names ("Invalid JSON", "Backup")

### Added

#### Documentation
- **docs/API-FILE-MANAGER.md** - Comprehensive API reference for file-manager module
  - Migration guide for listFiles() API change
  - Correct vs incorrect usage examples
  - Full function reference with parameters and return types
  - Security features documentation (DoS protection)
  - Error handling guide
- **Enhanced JSDoc** in `src/lib/file-manager.js` for listFiles() with @example blocks and warnings
- **remediation-reviews/MVP-REMEDIATION-EXECUTION-REVIEW.md** - Complete audit of remediation execution

### Changed
- Test count increased from 426 passing to **456 passing** (30 fixes)
- cleanupBackups now imported directly in doctor.js (was dynamic import)

---

## [1.0.0] - 2026-01-08

### Added

#### CLI Commands
- `muaddib install` - Install global components for Claude Code orchestration
- `muaddib init` - Initialize Muad'Dib orchestration in a project directory
- `muaddib update` - Update to latest version of templates and configurations
- `muaddib doctor` - Check installation health and diagnose issues
- `muaddib uninstall` - Remove global components cleanly

#### Orchestration Features
- Intent classification system for automatic task categorization
- 7-section delegation template for smart agent assignments
- Cost-aware model selection (haiku for quick tasks, sonnet/opus for complex)
- TodoWrite integration for tracking multi-step tasks
- 3-strikes error recovery protocol with automatic rollback
- Session state persistence across conversations
- Completion checking to prevent premature task endings

#### Claude Code Integration
- 5 hook types supported: PreToolUse, PostToolUse, SessionStart, Stop, PreCompact
- Wildcard permissions using Claude Code 2.1 syntax
- Context injection for enhanced session awareness
- Parallel exploration agent delegation

#### Skills System
- Core skills: orchestrate, explore, validate
- Automation skills: lsp, refactor, checkpoint, tdd
- Advanced skills: parallel-explore, incremental-refactor, doc-sync, quality-gate
- Skill frontmatter hooks for custom behavior

#### Developer Tools Integration
- LSP (Language Server Protocol) operations for code intelligence
- AST-grep integration for structural code analysis and refactoring
- Checkpoint system for safe experimentation with rollback capability

#### Template System
- Handlebars-based template engine for configuration generation
- Customizable templates for CLAUDE.md and settings.json
- Partial templates for modular orchestration rules
- Support for 4 orchestration levels: minimal, standard, comprehensive, enterprise

#### Quality & Security
- ESLint configuration for code quality
- Jest test suite with 188 tests across 5 test files
- Security deny list for dangerous commands (rm -rf, sudo, chmod 777, env)
- Object deduplication in config-merger
- Hook array merging with signature-based deduplication

### Changed

- Nothing - this is the initial release

### Fixed

- Jest watchman configuration for improved test performance
- Documentation URLs corrected to proper references
- Lint errors resolved (unused variables cleanup)

---

[1.0.2]: https://github.com/muaddib-claude/muaddib-claude/releases/tag/v1.0.2
[1.0.1]: https://github.com/muaddib-claude/muaddib-claude/releases/tag/v1.0.1
[1.0.0]: https://github.com/muaddib-claude/muaddib-claude/releases/tag/v1.0.0
