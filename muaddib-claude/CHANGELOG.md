# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.0.0]: https://github.com/muaddib-claude/muaddib-claude/releases/tag/v1.0.0
