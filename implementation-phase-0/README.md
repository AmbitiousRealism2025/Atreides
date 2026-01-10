# Implementation Phase 0: Package Architecture

## Phase Overview

**Goal**: Create a distributable NPM package (`muaddib-claude`) that enables global installation and per-project initialization of OmO-style orchestration for Claude Code.

**Phase Duration**: 1-2 days (~15-18 hours)
**Dependencies**: None (this is the foundation phase)

---

## Success Criteria

Before marking this phase complete, verify:

- [ ] `npm install -g muaddib-claude` completes without errors
- [ ] `muaddib --version` returns version number
- [ ] `muaddib doctor` reports healthy installation
- [ ] `muaddib init` in empty directory creates expected files
- [ ] `muaddib init` in existing project doesn't overwrite files without confirmation
- [ ] Generated CLAUDE.md contains all required sections
- [ ] Generated settings.json has valid hook configuration
- [ ] Scripts are executable and work on macOS/Linux
- [ ] `muaddib update` pulls latest templates
- [ ] Config merging works correctly (global + project)

---

## Task Breakdown

### Group 1: Project Setup

<!-- LOAD_CONTEXT: context/01-project-setup.md -->

#### Task 1.1: Design Final Package Structure
**Objective**: Finalize the directory structure for the NPM package.

**Deliverables**:
- Directory structure diagram
- File list with purposes
- Decision on monorepo vs single package

**Acceptance Criteria**:
- Structure supports global installation
- Templates are accessible after install
- Scripts are executable from CLI

---

#### Task 1.2: Create package.json
**Objective**: Create the NPM package configuration with all dependencies.

**Deliverables**:
- Complete package.json file
- Dependency list with versions pinned
- NPM scripts configured

**Acceptance Criteria**:
- `npm install` succeeds
- `npm run test` configured (even if empty)
- `npm run lint` configured
- bin entry points configured

---

#### Task 1.3: Set Up Project Scaffolding
**Objective**: Create the directory structure and placeholder files.

**Deliverables**:
- All directories created
- Placeholder files where needed
- .gitignore configured
- LICENSE file added

**Acceptance Criteria**:
- Directory structure matches design
- No missing folders
- Git-ready project structure

---

### Group 2: CLI Router

<!-- LOAD_CONTEXT: context/02-cli-router.md -->

#### Task 2.1: Implement CLI Router
**Objective**: Create the main CLI entry point using commander.js.

**Deliverables**:
- `bin/muaddib.js` - Main CLI entry
- `src/cli/index.js` - Command router
- Subcommand registration structure

**Acceptance Criteria**:
- `muaddib --help` shows all commands
- `muaddib --version` shows version
- Unknown commands show help
- Exit codes are appropriate

---

### Group 3: CLI Commands

<!-- LOAD_CONTEXT: context/03-cli-commands.md -->

#### Task 3.1: Implement `muaddib install` Command
**Objective**: Create global installation/repair command.

**Deliverables**:
- `src/cli/install.js`
- Global directory creation logic
- Symlink creation for skills

**Acceptance Criteria**:
- Creates ~/.muaddib directory
- Copies all required files
- Links skills to ~/.claude/skills/muaddib
- Idempotent (safe to run multiple times)

---

#### Task 3.2: Implement `muaddib init` Command
**Objective**: Create project initialization command.

**Deliverables**:
- `src/cli/init.js`
- Interactive prompts using inquirer
- Template rendering with Handlebars
- File generation logic

**Acceptance Criteria**:
- Creates CLAUDE.md from template
- Creates .claude/settings.json
- Creates .muaddib/config.json
- Prompts for project details
- Supports --minimal and --full flags
- Won't overwrite without confirmation

---

#### Task 3.3: Implement `muaddib update` Command
**Objective**: Create update command for global components.

**Deliverables**:
- `src/cli/update.js`
- Version checking logic
- File replacement with backup

**Acceptance Criteria**:
- Updates templates from package
- Creates backups before replacing
- Reports what was updated
- Supports --project flag

---

#### Task 3.4: Implement `muaddib doctor` Command
**Objective**: Create health check command.

**Deliverables**:
- `src/cli/doctor.js`
- Installation verification checks
- Repair suggestions

**Acceptance Criteria**:
- Checks global installation
- Checks project initialization
- Reports issues clearly
- Suggests fixes for problems

---

### Group 4: Templates

<!-- LOAD_CONTEXT: context/04-templates.md -->

#### Task 4.1: Create CLAUDE.md.hbs Template
**Objective**: Create the Handlebars template for project CLAUDE.md.

**Deliverables**:
- `templates/CLAUDE.md.hbs`
- Partial templates for sections
- Variable documentation

**Acceptance Criteria**:
- Renders without errors
- All variables documented
- Includes orchestration rules
- Includes workflow phases
- Includes agent delegation

---

#### Task 4.2: Create settings.json.hbs Template
**Objective**: Create template for Claude Code settings.

**Deliverables**:
- `templates/settings.json.hbs`
- Hook configuration structure
- Permission configuration

**Acceptance Criteria**:
- Valid JSON output
- Hooks configured correctly
- Permissions match project type

---

#### Task 4.3: Create Context Templates
**Objective**: Create templates for context injection files.

**Deliverables**:
- `templates/context.md.hbs`
- `templates/critical-context.md.hbs`
- `templates/config.json.hbs`

**Acceptance Criteria**:
- All templates render correctly
- Context files are useful
- Config tracks project state

---

#### Task 4.4: Implement Template Engine
**Objective**: Create template rendering utilities.

**Deliverables**:
- `src/lib/template-engine.js`
- Handlebars helpers registered
- Partial loading system

**Acceptance Criteria**:
- Can render any template
- Supports partials
- Custom helpers work
- Error handling for missing vars

---

### Group 5: Utilities

<!-- LOAD_CONTEXT: context/05-utilities.md -->

#### Task 5.1: Implement Config Merger
**Objective**: Create configuration merging logic.

**Deliverables**:
- `src/lib/config-merger.js`
- Deep merge for objects
- Array concatenation for hooks/permissions

**Acceptance Criteria**:
- Global + project configs merge correctly
- Arrays are concatenated, not replaced
- Objects are deep merged
- Handles missing configs gracefully

---

#### Task 5.2: Implement File Manager
**Objective**: Create file operation utilities.

**Deliverables**:
- `src/lib/file-manager.js`
- Safe file writing (with backup)
- Directory creation
- Symlink handling

**Acceptance Criteria**:
- Creates directories recursively
- Backs up before overwriting
- Handles symlinks correctly
- Cross-platform path handling

---

### Group 6: Scripts and Documentation

<!-- LOAD_CONTEXT: context/06-scripts-docs.md -->

#### Task 6.1: Create Helper Scripts
**Objective**: Create the shell scripts for hooks.

**Deliverables**:
- `scripts/validate-bash-command.sh`
- `scripts/pre-edit-check.sh`
- `scripts/post-edit-log.sh`
- `scripts/error-detector.sh`
- `scripts/notify-idle.sh`

**Acceptance Criteria**:
- All scripts are executable
- Work on macOS and Linux
- Exit codes are correct
- Error handling is appropriate

---

#### Task 6.2: Create Core Documentation Files
**Objective**: Create the library documentation files.

**Deliverables**:
- `lib/core/orchestration-rules.md`
- `lib/core/agent-definitions.md`
- `lib/core/workflow-phases.md`
- `lib/skills/muaddib/SKILL.md`

**Acceptance Criteria**:
- Complete orchestration rules
- All agents documented
- Workflow phases detailed
- Skill is functional

---

### Group 7: Testing

<!-- LOAD_CONTEXT: context/07-testing.md -->

#### Task 7.1: Test Global Installation Flow
**Objective**: Verify global installation works end-to-end.

**Test Cases**:
1. Fresh install on clean system
2. Reinstall over existing installation
3. Uninstall and verify cleanup
4. Verify all files in expected locations
5. Verify CLI is accessible from PATH

**Acceptance Criteria**:
- All test cases pass
- No leftover files on uninstall
- CLI accessible after install

---

#### Task 7.2: Test Project Initialization Flow
**Objective**: Verify project init works correctly.

**Test Cases**:
1. Init in empty directory
2. Init in existing project (non-conflicting)
3. Init in existing project (with conflicts)
4. Init with --minimal flag
5. Init with --full flag
6. Verify all generated files

**Acceptance Criteria**:
- All test cases pass
- Files generated correctly
- No data loss on conflicts

---

#### Task 7.3: Test Update Mechanism
**Objective**: Verify updates work correctly.

**Test Cases**:
1. Update global components
2. Update project files with --project
3. Backup creation verification
4. Rollback capability

**Acceptance Criteria**:
- Updates apply correctly
- Backups are created
- Can rollback if needed

---

### Group 8: Documentation and Publish

<!-- LOAD_CONTEXT: context/08-publish.md -->

#### Task 8.1: Write README Documentation
**Objective**: Create comprehensive README for npm package.

**Deliverables**:
- README.md with:
  - Installation instructions
  - Quick start guide
  - Command reference
  - Configuration options
  - Troubleshooting section
  - Contributing guidelines

**Acceptance Criteria**:
- Clear installation steps
- All commands documented
- Examples provided
- Professional formatting

---

#### Task 8.2: Prepare for NPM Publish
**Objective**: Finalize package for npm publication.

**Deliverables**:
- .npmignore configured
- package.json metadata complete
- Version set correctly
- Keywords for discoverability

**Acceptance Criteria**:
- `npm pack` creates clean tarball
- Only necessary files included
- Metadata is complete
- Ready for `npm publish`

---

## Exit Criteria

Phase 0 is complete when:

1. **Package Structure**: NPM package can be installed globally
2. **Project Init**: `muaddib init` successfully scaffolds a project
3. **File Generation**: Generated files match expected structure
4. **Updates**: Update mechanism works
5. **Documentation**: Installation and usage documented

---

## Deliverables Summary

| Deliverable | Location |
|-------------|----------|
| CLI Entry Point | `bin/muaddib.js` |
| CLI Commands | `src/cli/*.js` |
| Library Utilities | `src/lib/*.js` |
| Templates | `templates/*.hbs` |
| Helper Scripts | `scripts/*.sh` |
| Core Documentation | `lib/core/*.md` |
| Skill Definition | `lib/skills/muaddib/SKILL.md` |
| Package Config | `package.json` |
| README | `README.md` |

---

## Dependencies Graph

```
Task 1.1 (Design)
    └── Task 1.2 (package.json)
        └── Task 1.3 (Scaffolding)
            ├── Task 2.1 (CLI Router)
            │   ├── Task 3.1 (install)
            │   ├── Task 3.2 (init)
            │   ├── Task 3.3 (update)
            │   └── Task 3.4 (doctor)
            ├── Task 4.1-4.4 (Templates) ──→ Task 3.2 (init uses templates)
            ├── Task 5.1-5.2 (Utilities) ──→ Task 3.* (commands use utilities)
            └── Task 6.1-6.2 (Scripts/Docs)
                    │
                    ▼
            Task 7.1-7.3 (Testing)
                    │
                    ▼
            Task 8.1-8.2 (Publish)
```

---

## Context Loading Instructions

For coding agents executing this phase:

1. **Always load first**: `context/00-base-context.md`
2. **Then load task-specific context** as indicated by `<!-- LOAD_CONTEXT: -->` markers
3. **Reference MASTER-PLAN.md** for detailed specifications when needed
4. **Mark tasks complete** in this README as you finish them

---

*Phase 0 of the Muad'Dib Implementation Plan*
