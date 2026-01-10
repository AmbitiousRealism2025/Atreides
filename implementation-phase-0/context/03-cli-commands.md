# Context: CLI Commands (Tasks 3.1 - 3.4)

## Task Group Overview

This context covers implementing the core CLI commands:
- Task 3.1: `muaddib install`
- Task 3.2: `muaddib init`
- Task 3.3: `muaddib update`
- Task 3.4: `muaddib doctor`

---

## Task 3.1: Install Command

### Purpose

Install/repair global Muad'Dib components to `~/.muaddib/`.

### Flow

```
muaddib install
       │
       ├── Check if ~/.muaddib exists
       │   ├── Yes + no --force → "Already installed. Use --force to reinstall"
       │   └── No OR --force → Continue
       │
       ├── Create ~/.muaddib directory structure
       │
       ├── Copy files from package
       │   ├── templates/ → ~/.muaddib/templates/
       │   ├── scripts/ → ~/.muaddib/scripts/
       │   └── lib/ → ~/.muaddib/lib/
       │
       ├── Make scripts executable
       │
       ├── Create skill symlink (optional)
       │   └── ~/.claude/skills/muaddib → ~/.muaddib/skills/muaddib
       │
       └── Report success
```

### Implementation

```javascript
// src/cli/install.js

import { Command } from 'commander';
import { existsSync, mkdirSync, copySync, chmodSync, symlinkSync, readdirSync } from 'fs-extra';
import { join } from 'path';
import { log } from '../utils/logger.js';
import {
  GLOBAL_DIR, GLOBAL_TEMPLATES, GLOBAL_SCRIPTS, GLOBAL_LIB, GLOBAL_SKILLS,
  CLAUDE_SKILLS, PACKAGE_ROOT
} from '../utils/paths.js';

export function installCommand() {
  const cmd = new Command('install');

  cmd
    .description('Install or repair global Muad\'Dib components')
    .option('-f, --force', 'Force reinstall even if already installed')
    .option('--no-skills', 'Skip skill symlink creation')
    .action(async (options) => {
      try {
        await runInstall(options);
      } catch (error) {
        log.error(`Installation failed: ${error.message}`);
        process.exit(1);
      }
    });

  return cmd;
}

async function runInstall(options) {
  const steps = options.skills ? 5 : 4;
  let step = 1;

  // Step 1: Check existing installation
  log.step(step++, steps, 'Checking existing installation...');

  if (existsSync(GLOBAL_DIR) && !options.force) {
    log.warn('Muad\'Dib is already installed.');
    log.info('Use --force to reinstall.');
    return;
  }

  // Step 2: Create directory structure
  log.step(step++, steps, 'Creating directory structure...');

  const dirs = [GLOBAL_DIR, GLOBAL_TEMPLATES, GLOBAL_SCRIPTS, GLOBAL_LIB, GLOBAL_SKILLS];
  for (const dir of dirs) {
    mkdirSync(dir, { recursive: true });
    log.debug(`Created: ${dir}`);
  }

  // Step 3: Copy files
  log.step(step++, steps, 'Copying files...');

  // Copy templates
  copySync(join(PACKAGE_ROOT, 'templates'), GLOBAL_TEMPLATES, { overwrite: true });
  log.debug('Copied templates');

  // Copy scripts
  copySync(join(PACKAGE_ROOT, 'scripts'), GLOBAL_SCRIPTS, { overwrite: true });
  log.debug('Copied scripts');

  // Copy lib
  copySync(join(PACKAGE_ROOT, 'lib'), GLOBAL_LIB, { overwrite: true });
  log.debug('Copied lib');

  // Step 4: Make scripts executable
  log.step(step++, steps, 'Setting permissions...');

  const scriptFiles = readdirSync(GLOBAL_SCRIPTS);
  for (const file of scriptFiles) {
    if (file.endsWith('.sh')) {
      chmodSync(join(GLOBAL_SCRIPTS, file), '755');
    }
  }

  // Step 5: Create skill symlink (optional)
  if (options.skills) {
    log.step(step++, steps, 'Creating skill symlink...');

    // Ensure ~/.claude/skills exists
    mkdirSync(CLAUDE_SKILLS, { recursive: true });

    const skillLink = join(CLAUDE_SKILLS, 'muaddib');
    const skillTarget = join(GLOBAL_SKILLS, 'muaddib');

    // Remove existing symlink if present
    if (existsSync(skillLink)) {
      rmSync(skillLink, { force: true, recursive: true });
    }

    symlinkSync(skillTarget, skillLink, 'dir');
    log.debug(`Created symlink: ${skillLink} → ${skillTarget}`);
  }

  log.newline();
  log.success('Muad\'Dib installed successfully!');
  log.info(`Location: ${GLOBAL_DIR}`);
  log.newline();
  log.info('Next steps:');
  log.info('  1. cd into your project directory');
  log.info('  2. Run: muaddib init');
}
```

---

## Task 3.2: Init Command

### Purpose

Initialize Muad'Dib in the current project directory.

### Flow

```
muaddib init
       │
       ├── Check if global installation exists
       │   └── No → "Run 'muaddib install' first"
       │
       ├── Check for existing files
       │   ├── CLAUDE.md exists + no --force → Prompt to overwrite
       │   └── Continue
       │
       ├── Interactive prompts (unless --yes)
       │   ├── Project name (default: directory name)
       │   ├── Project type (Node/Python/Go/Rust/Other)
       │   ├── Codebase maturity (Disciplined/Transitional/Legacy/Greenfield)
       │   └── Strict mode? (yes/no)
       │
       ├── Render templates with answers
       │   ├── CLAUDE.md.hbs → CLAUDE.md
       │   ├── settings.json.hbs → .claude/settings.json
       │   ├── context.md.hbs → .claude/context.md
       │   └── config.json.hbs → .muaddib/config.json
       │
       ├── Copy scripts if --full
       │
       └── Report success
```

### Implementation

```javascript
// src/cli/init.js

import { Command } from 'commander';
import { existsSync, mkdirSync } from 'fs-extra';
import { basename, join } from 'path';
import inquirer from 'inquirer';
import { log } from '../utils/logger.js';
import { GLOBAL_DIR, PROJECT_CLAUDE_DIR, PROJECT_MUADDIB_DIR, PROJECT_CLAUDE_MD } from '../utils/paths.js';
import { renderTemplate } from '../lib/template-engine.js';
import { writeFileSafe } from '../lib/file-manager.js';

export function initCommand() {
  const cmd = new Command('init');

  cmd
    .description('Initialize Muad\'Dib in current project')
    .option('-m, --minimal', 'Minimal initialization (CLAUDE.md only)')
    .option('-f, --full', 'Full initialization with all features')
    .option('-y, --yes', 'Accept all defaults (non-interactive)')
    .option('--force', 'Overwrite existing files without confirmation')
    .action(async (options) => {
      try {
        await runInit(options);
      } catch (error) {
        log.error(`Initialization failed: ${error.message}`);
        process.exit(1);
      }
    });

  return cmd;
}

async function runInit(options) {
  // Check global installation
  if (!existsSync(GLOBAL_DIR)) {
    log.error('Muad\'Dib is not installed globally.');
    log.info('Run: muaddib install');
    process.exit(1);
  }

  // Check for existing files
  const existingFiles = [];
  if (existsSync(PROJECT_CLAUDE_MD)) existingFiles.push(PROJECT_CLAUDE_MD);
  if (existsSync(PROJECT_CLAUDE_DIR)) existingFiles.push(PROJECT_CLAUDE_DIR);
  if (existsSync(PROJECT_MUADDIB_DIR)) existingFiles.push(PROJECT_MUADDIB_DIR);

  if (existingFiles.length > 0 && !options.force) {
    log.warn('Existing Muad\'Dib files detected:');
    existingFiles.forEach(f => log.info(`  - ${f}`));

    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Overwrite existing files?',
      default: false
    }]);

    if (!proceed) {
      log.info('Initialization cancelled.');
      return;
    }
  }

  // Gather configuration
  let config = {
    projectName: basename(process.cwd()),
    projectType: 'node',
    maturity: 'transitional',
    strictMode: false,
    version: '1.0.0'
  };

  if (!options.yes) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: config.projectName
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'Project type:',
        choices: [
          { name: 'Node.js / JavaScript', value: 'node' },
          { name: 'Python', value: 'python' },
          { name: 'Go', value: 'go' },
          { name: 'Rust', value: 'rust' },
          { name: 'Other', value: 'other' }
        ],
        default: 'node'
      },
      {
        type: 'list',
        name: 'maturity',
        message: 'Codebase maturity:',
        choices: [
          { name: 'Disciplined - Consistent patterns, good tests', value: 'disciplined' },
          { name: 'Transitional - Mix of old/new patterns', value: 'transitional' },
          { name: 'Legacy - Technical debt, few tests', value: 'legacy' },
          { name: 'Greenfield - New project', value: 'greenfield' }
        ],
        default: 'transitional'
      },
      {
        type: 'confirm',
        name: 'strictMode',
        message: 'Enable strict mode? (more guardrails)',
        default: false
      }
    ]);

    config = { ...config, ...answers };
  }

  // Create directories
  log.info('Creating directories...');
  mkdirSync(PROJECT_CLAUDE_DIR, { recursive: true });
  if (!options.minimal) {
    mkdirSync(PROJECT_MUADDIB_DIR, { recursive: true });
    mkdirSync(join(PROJECT_MUADDIB_DIR, 'state'), { recursive: true });
  }

  // Render and write templates
  log.info('Generating files...');

  // CLAUDE.md (always)
  const claudeMd = await renderTemplate('CLAUDE.md.hbs', config);
  await writeFileSafe(PROJECT_CLAUDE_MD, claudeMd, options.force);
  log.success(`Created: ${PROJECT_CLAUDE_MD}`);

  if (!options.minimal) {
    // settings.json
    const settings = await renderTemplate('settings.json.hbs', config);
    await writeFileSafe(join(PROJECT_CLAUDE_DIR, 'settings.json'), settings, options.force);
    log.success(`Created: ${PROJECT_CLAUDE_DIR}/settings.json`);

    // context.md
    const context = await renderTemplate('context.md.hbs', config);
    await writeFileSafe(join(PROJECT_CLAUDE_DIR, 'context.md'), context, options.force);
    log.success(`Created: ${PROJECT_CLAUDE_DIR}/context.md`);

    // critical-context.md
    const criticalContext = await renderTemplate('critical-context.md.hbs', config);
    await writeFileSafe(join(PROJECT_CLAUDE_DIR, 'critical-context.md'), criticalContext, options.force);
    log.success(`Created: ${PROJECT_CLAUDE_DIR}/critical-context.md`);

    // config.json
    const muaddibConfig = await renderTemplate('config.json.hbs', config);
    await writeFileSafe(join(PROJECT_MUADDIB_DIR, 'config.json'), muaddibConfig, options.force);
    log.success(`Created: ${PROJECT_MUADDIB_DIR}/config.json`);
  }

  // Copy scripts if --full
  if (options.full) {
    log.info('Copying scripts...');
    const scriptsDir = join(PROJECT_CLAUDE_DIR, 'scripts');
    mkdirSync(scriptsDir, { recursive: true });
    // Copy and chmod scripts...
  }

  log.newline();
  log.success('Muad\'Dib initialized successfully!');
  log.newline();
  log.info('Files created:');
  log.info(`  - ${PROJECT_CLAUDE_MD}`);
  if (!options.minimal) {
    log.info(`  - ${PROJECT_CLAUDE_DIR}/settings.json`);
    log.info(`  - ${PROJECT_CLAUDE_DIR}/context.md`);
    log.info(`  - ${PROJECT_MUADDIB_DIR}/config.json`);
  }
}
```

---

## Task 3.3: Update Command

### Purpose

Update global or project components to latest version.

### Implementation

```javascript
// src/cli/update.js

import { Command } from 'commander';
import { existsSync, copySync, mkdirSync } from 'fs-extra';
import { join } from 'path';
import { log } from '../utils/logger.js';
import { GLOBAL_DIR, GLOBAL_TEMPLATES, PACKAGE_ROOT, PROJECT_CLAUDE_DIR } from '../utils/paths.js';
import { createBackup } from '../lib/file-manager.js';

export function updateCommand() {
  const cmd = new Command('update');

  cmd
    .description('Update Muad\'Dib components')
    .option('-g, --global', 'Update global components (default)')
    .option('-p, --project', 'Update current project files')
    .option('--no-backup', 'Skip backup creation')
    .action(async (options) => {
      try {
        if (options.project) {
          await updateProject(options);
        } else {
          await updateGlobal(options);
        }
      } catch (error) {
        log.error(`Update failed: ${error.message}`);
        process.exit(1);
      }
    });

  return cmd;
}

async function updateGlobal(options) {
  if (!existsSync(GLOBAL_DIR)) {
    log.error('Muad\'Dib is not installed.');
    log.info('Run: muaddib install');
    process.exit(1);
  }

  log.info('Updating global components...');

  if (options.backup) {
    const backupDir = `${GLOBAL_DIR}.backup.${Date.now()}`;
    log.info(`Creating backup: ${backupDir}`);
    copySync(GLOBAL_DIR, backupDir);
  }

  // Update templates
  copySync(join(PACKAGE_ROOT, 'templates'), join(GLOBAL_DIR, 'templates'), { overwrite: true });
  log.success('Updated templates');

  // Update scripts
  copySync(join(PACKAGE_ROOT, 'scripts'), join(GLOBAL_DIR, 'scripts'), { overwrite: true });
  log.success('Updated scripts');

  // Update lib
  copySync(join(PACKAGE_ROOT, 'lib'), join(GLOBAL_DIR, 'lib'), { overwrite: true });
  log.success('Updated lib');

  log.newline();
  log.success('Global update complete!');
}

async function updateProject(options) {
  if (!existsSync(PROJECT_CLAUDE_DIR)) {
    log.error('No Muad\'Dib project found in current directory.');
    log.info('Run: muaddib init');
    process.exit(1);
  }

  log.info('Updating project files...');

  if (options.backup) {
    await createBackup(PROJECT_CLAUDE_DIR);
  }

  // Re-render templates with existing config
  // ... (similar to init but preserving project-specific values)

  log.success('Project update complete!');
}
```

---

## Task 3.4: Doctor Command

### Purpose

Health check for Muad'Dib installation.

### Implementation

```javascript
// src/cli/doctor.js

import { Command } from 'commander';
import { existsSync, statSync, accessSync, constants } from 'fs';
import { join } from 'path';
import { log } from '../utils/logger.js';
import {
  GLOBAL_DIR, GLOBAL_TEMPLATES, GLOBAL_SCRIPTS, GLOBAL_LIB,
  PROJECT_CLAUDE_DIR, PROJECT_CLAUDE_MD
} from '../utils/paths.js';

export function doctorCommand() {
  const cmd = new Command('doctor');

  cmd
    .description('Check Muad\'Dib installation health')
    .option('-v, --verbose', 'Show detailed check results')
    .option('--fix', 'Attempt to fix found issues')
    .action(async (options) => {
      try {
        await runDoctor(options);
      } catch (error) {
        log.error(`Health check failed: ${error.message}`);
        process.exit(1);
      }
    });

  return cmd;
}

async function runDoctor(options) {
  const checks = [];
  let hasErrors = false;

  log.info('Running health checks...');
  log.newline();

  // Global checks
  log.info('Global Installation:');

  checks.push(checkExists('Global directory', GLOBAL_DIR));
  checks.push(checkExists('Templates', GLOBAL_TEMPLATES));
  checks.push(checkExists('Scripts', GLOBAL_SCRIPTS));
  checks.push(checkExists('Library', GLOBAL_LIB));
  checks.push(checkScriptsExecutable());

  // Project checks (if in a project)
  if (existsSync(PROJECT_CLAUDE_MD) || existsSync(PROJECT_CLAUDE_DIR)) {
    log.newline();
    log.info('Project Installation:');

    checks.push(checkExists('CLAUDE.md', PROJECT_CLAUDE_MD));
    checks.push(checkExists('.claude directory', PROJECT_CLAUDE_DIR));
    checks.push(checkExists('settings.json', join(PROJECT_CLAUDE_DIR, 'settings.json')));
    checks.push(checkValidJson(join(PROJECT_CLAUDE_DIR, 'settings.json')));
  }

  log.newline();

  // Report results
  const failed = checks.filter(c => !c.passed);

  if (failed.length === 0) {
    log.success('All checks passed!');
  } else {
    log.error(`${failed.length} issue(s) found:`);
    failed.forEach(c => {
      log.warn(`  - ${c.name}: ${c.message}`);
      if (c.fix && options.verbose) {
        log.info(`    Fix: ${c.fix}`);
      }
    });

    if (options.fix) {
      log.newline();
      log.info('Attempting fixes...');
      // Run fixes
    }

    hasErrors = true;
  }

  process.exit(hasErrors ? 1 : 0);
}

function checkExists(name, path) {
  const passed = existsSync(path);
  return {
    name,
    passed,
    message: passed ? 'OK' : 'Not found',
    fix: `Run 'muaddib install' or 'muaddib init'`
  };
}

function checkScriptsExecutable() {
  const scripts = ['validate-bash-command.sh', 'pre-edit-check.sh'];
  const scriptsDir = GLOBAL_SCRIPTS;

  for (const script of scripts) {
    const path = join(scriptsDir, script);
    if (existsSync(path)) {
      try {
        accessSync(path, constants.X_OK);
      } catch {
        return {
          name: 'Scripts executable',
          passed: false,
          message: `${script} is not executable`,
          fix: `chmod +x ${path}`
        };
      }
    }
  }

  return { name: 'Scripts executable', passed: true, message: 'OK' };
}

function checkValidJson(path) {
  if (!existsSync(path)) {
    return { name: 'Valid JSON', passed: true, message: 'N/A' };
  }

  try {
    const content = readFileSync(path, 'utf8');
    JSON.parse(content);
    return { name: 'Valid JSON', passed: true, message: 'OK' };
  } catch (e) {
    return {
      name: 'Valid JSON',
      passed: false,
      message: `Invalid JSON in ${path}`,
      fix: 'Fix JSON syntax or run muaddib init --force'
    };
  }
}
```

---

## Acceptance Criteria

### Task 3.1 (install)
- [ ] Creates ~/.muaddib directory structure
- [ ] Copies templates, scripts, lib from package
- [ ] Makes scripts executable
- [ ] Creates skill symlink (optional)
- [ ] Idempotent (--force for reinstall)
- [ ] Clear success/error messages

### Task 3.2 (init)
- [ ] Checks for global installation first
- [ ] Interactive prompts work
- [ ] --yes accepts defaults
- [ ] --minimal creates only CLAUDE.md
- [ ] --full includes scripts
- [ ] --force overwrites without prompt
- [ ] All templates render correctly

### Task 3.3 (update)
- [ ] Updates global components
- [ ] --project updates project files
- [ ] Creates backups (unless --no-backup)
- [ ] Reports what was updated

### Task 3.4 (doctor)
- [ ] Checks global installation
- [ ] Checks project files (if present)
- [ ] Reports issues clearly
- [ ] --verbose shows details
- [ ] --fix attempts repairs
- [ ] Exit code reflects status

---

*Context for Tasks 3.1, 3.2, 3.3, 3.4*
