# Context: Testing (Tasks 7.1 - 7.3)

## Task Group Overview

This context covers testing the implementation:
- Task 7.1: Test global installation flow
- Task 7.2: Test project initialization flow
- Task 7.3: Test update mechanism

---

## Testing Approach

### Manual Testing First

For Phase 0, focus on manual integration testing to verify end-to-end flows work correctly. Unit tests can be added later for critical utilities.

### Test Environment Setup

```bash
# Create a clean test environment
mkdir -p ~/muaddib-test
cd ~/muaddib-test

# Backup existing installation (if any)
if [ -d ~/.muaddib ]; then
  mv ~/.muaddib ~/.muaddib.backup.$(date +%s)
fi
```

---

## Task 7.1: Test Global Installation Flow

### Test Cases

#### TC-1.1: Fresh Install on Clean System

**Preconditions**:
- No ~/.muaddib directory exists
- Package is built and linkable

**Steps**:
```bash
# 1. Link package locally for testing
cd /path/to/muaddib-claude
npm link

# 2. Verify command is accessible
which muaddib
# Expected: /usr/local/bin/muaddib or ~/.npm-global/bin/muaddib

# 3. Run install
muaddib install

# 4. Verify installation
ls -la ~/.muaddib/
# Expected: bin/, lib/, templates/, scripts/, skills/

# 5. Verify structure
ls ~/.muaddib/templates/
# Expected: CLAUDE.md.hbs, settings.json.hbs, etc.

ls ~/.muaddib/scripts/
# Expected: *.sh files

# 6. Verify scripts executable
ls -la ~/.muaddib/scripts/*.sh
# Expected: -rwxr-xr-x permissions
```

**Expected Result**: All directories created, all files present, scripts executable.

---

#### TC-1.2: Reinstall Over Existing Installation

**Preconditions**:
- ~/.muaddib exists from TC-1.1

**Steps**:
```bash
# 1. Try install without --force
muaddib install
# Expected: "Already installed. Use --force to reinstall"

# 2. Install with --force
muaddib install --force
# Expected: Reinstallation completes

# 3. Verify files updated
ls -la ~/.muaddib/
# Expected: All files present with current timestamp
```

**Expected Result**: Without --force, install aborts. With --force, reinstallation succeeds.

---

#### TC-1.3: Install Without Skill Symlink

**Steps**:
```bash
# 1. Remove existing installation
rm -rf ~/.muaddib

# 2. Install without skills
muaddib install --no-skills

# 3. Check skill symlink doesn't exist
ls -la ~/.claude/skills/muaddib
# Expected: No such file or directory
```

**Expected Result**: Installation completes without creating skill symlink.

---

#### TC-1.4: Verify CLI Accessibility

**Steps**:
```bash
# 1. Test version
muaddib --version
# Expected: 1.0.0 (or current version)

# 2. Test help
muaddib --help
# Expected: Help text with all commands listed

# 3. Test command help
muaddib init --help
# Expected: init command options

# 4. Test unknown command
muaddib unknown-command
# Expected: Error message with help suggestion
```

**Expected Result**: All CLI interactions work as expected.

---

## Task 7.2: Test Project Initialization Flow

### Test Cases

#### TC-2.1: Init in Empty Directory

**Preconditions**:
- Global installation complete
- Empty test directory

**Steps**:
```bash
# 1. Create empty directory
mkdir -p ~/muaddib-test/empty-project
cd ~/muaddib-test/empty-project

# 2. Run init (accept defaults)
muaddib init --yes

# 3. Verify files created
ls -la
# Expected: CLAUDE.md

ls -la .claude/
# Expected: settings.json, context.md, critical-context.md

ls -la .muaddib/
# Expected: config.json, state/

# 4. Verify CLAUDE.md content
head -20 CLAUDE.md
# Expected: Project name = "empty-project", Muad'Dib header

# 5. Verify settings.json is valid JSON
cat .claude/settings.json | python3 -m json.tool
# Expected: Valid JSON output
```

**Expected Result**: All files created with correct content.

---

#### TC-2.2: Init in Existing Project (Non-Conflicting)

**Preconditions**:
- Directory with some files but no Muad'Dib files

**Steps**:
```bash
# 1. Create project with existing files
mkdir -p ~/muaddib-test/existing-project
cd ~/muaddib-test/existing-project
echo '{"name": "test"}' > package.json
mkdir src
echo "console.log('hello');" > src/index.js

# 2. Run init
muaddib init --yes

# 3. Verify existing files untouched
cat package.json
# Expected: {"name": "test"}

cat src/index.js
# Expected: console.log('hello');

# 4. Verify Muad'Dib files created
ls CLAUDE.md .claude/ .muaddib/
# Expected: All present
```

**Expected Result**: Existing files preserved, Muad'Dib files added.

---

#### TC-2.3: Init in Existing Project (With Conflicts)

**Preconditions**:
- Directory with existing CLAUDE.md

**Steps**:
```bash
# 1. Create project with existing CLAUDE.md
mkdir -p ~/muaddib-test/conflict-project
cd ~/muaddib-test/conflict-project
echo "# Existing CLAUDE.md" > CLAUDE.md

# 2. Run init (should prompt)
muaddib init
# Expected: Prompt "Overwrite existing files?"

# 3. Answer 'no' - verify preserved
# After answering 'n':
cat CLAUDE.md
# Expected: "# Existing CLAUDE.md"

# 4. Run init with --force
muaddib init --force --yes

# 5. Verify overwritten
head -5 CLAUDE.md
# Expected: Muad'Dib header
```

**Expected Result**: Without force, prompts and respects answer. With force, overwrites.

---

#### TC-2.4: Init with --minimal Flag

**Steps**:
```bash
# 1. Create directory
mkdir -p ~/muaddib-test/minimal-project
cd ~/muaddib-test/minimal-project

# 2. Run minimal init
muaddib init --minimal --yes

# 3. Verify only CLAUDE.md created
ls -la
# Expected: Only CLAUDE.md

ls .claude/ 2>/dev/null
# Expected: No such directory (or empty)

ls .muaddib/ 2>/dev/null
# Expected: No such directory
```

**Expected Result**: Only CLAUDE.md created.

---

#### TC-2.5: Init with --full Flag

**Steps**:
```bash
# 1. Create directory
mkdir -p ~/muaddib-test/full-project
cd ~/muaddib-test/full-project

# 2. Run full init
muaddib init --full --yes

# 3. Verify scripts copied
ls .claude/scripts/
# Expected: All hook scripts present

# 4. Verify scripts executable
ls -la .claude/scripts/*.sh
# Expected: Executable permissions
```

**Expected Result**: All files including scripts created.

---

#### TC-2.6: Init with Interactive Prompts

**Steps**:
```bash
# 1. Create directory
mkdir -p ~/muaddib-test/interactive-project
cd ~/muaddib-test/interactive-project

# 2. Run init (interactive)
muaddib init
# Answer prompts:
# - Project name: "My Test Project"
# - Project type: Python
# - Maturity: Transitional
# - Strict mode: Yes

# 3. Verify CLAUDE.md reflects answers
grep "My Test Project" CLAUDE.md
# Expected: Found

grep "Python" CLAUDE.md
# Expected: Found (project type)

grep "Strict" CLAUDE.md
# Expected: Found (strict mode section)

# 4. Verify settings.json has Python hooks
cat .claude/settings.json | grep black
# Expected: Found (Python formatter)
```

**Expected Result**: Generated files reflect user's answers.

---

## Task 7.3: Test Update Mechanism

### Test Cases

#### TC-3.1: Update Global Components

**Preconditions**:
- Global installation exists
- Templates have been modified (simulate newer version)

**Steps**:
```bash
# 1. Modify a template (simulate update)
# (In package source, modify a template)

# 2. Run update
muaddib update

# 3. Verify backup created
ls ~/.muaddib*.backup* 2>/dev/null
# Expected: Backup directory present

# 4. Verify templates updated
diff ~/.muaddib/templates/CLAUDE.md.hbs /path/to/package/templates/CLAUDE.md.hbs
# Expected: No differences (or updated)
```

**Expected Result**: Templates updated, backup created.

---

#### TC-3.2: Update with --no-backup

**Steps**:
```bash
# 1. Remove any existing backups
rm -rf ~/.muaddib*.backup*

# 2. Run update without backup
muaddib update --no-backup

# 3. Verify no backup created
ls ~/.muaddib*.backup* 2>/dev/null
# Expected: No backup directory
```

**Expected Result**: Update completes without backup.

---

#### TC-3.3: Update Project Files

**Preconditions**:
- Project initialized with older version

**Steps**:
```bash
# 1. Go to initialized project
cd ~/muaddib-test/existing-project

# 2. Run project update
muaddib update --project

# 3. Verify backup of .claude
ls .claude*.backup* 2>/dev/null
# Expected: Backup directory present

# 4. Verify files updated
cat .claude/settings.json
# Expected: Latest template content
```

**Expected Result**: Project files updated with backup.

---

#### TC-3.4: Doctor Command

**Steps**:
```bash
# 1. Healthy installation
muaddib doctor
# Expected: All checks pass, exit code 0

echo $?
# Expected: 0

# 2. Break something
chmod 644 ~/.muaddib/scripts/validate-bash-command.sh

# 3. Doctor should detect
muaddib doctor
# Expected: Warning about non-executable script

# 4. Fix with --fix
muaddib doctor --fix
# Expected: Fixes applied

# 5. Verify fixed
muaddib doctor
# Expected: All checks pass
```

**Expected Result**: Doctor detects issues and --fix repairs them.

---

## Test Checklist Summary

### Global Installation (TC-1.x)
- [ ] TC-1.1: Fresh install creates all directories and files
- [ ] TC-1.2: Reinstall requires --force
- [ ] TC-1.3: --no-skills skips symlink
- [ ] TC-1.4: CLI commands all work

### Project Initialization (TC-2.x)
- [ ] TC-2.1: Init in empty directory succeeds
- [ ] TC-2.2: Init preserves existing non-conflicting files
- [ ] TC-2.3: Init prompts on conflicts, --force overwrites
- [ ] TC-2.4: --minimal creates only CLAUDE.md
- [ ] TC-2.5: --full includes scripts
- [ ] TC-2.6: Interactive prompts work correctly

### Update Mechanism (TC-3.x)
- [ ] TC-3.1: Global update creates backup and updates
- [ ] TC-3.2: --no-backup skips backup
- [ ] TC-3.3: --project updates project files
- [ ] TC-3.4: Doctor detects issues, --fix repairs

---

## Cleanup

After testing:

```bash
# Remove test directories
rm -rf ~/muaddib-test

# Restore original installation (if backed up)
if [ -d ~/.muaddib.backup.* ]; then
  rm -rf ~/.muaddib
  mv ~/.muaddib.backup.* ~/.muaddib
fi

# Unlink development package
npm unlink -g muaddib-claude
```

---

*Context for Tasks 7.1, 7.2, 7.3*
