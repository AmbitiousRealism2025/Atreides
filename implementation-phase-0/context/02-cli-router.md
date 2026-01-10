# Context: CLI Router (Task 2.1)

## Task Overview

**Objective**: Create the main CLI entry point using commander.js that routes to subcommands.

---

## Architecture

```
User types: muaddib init
                │
                ▼
        bin/muaddib.js
                │
                └── imports and calls run()
                        │
                        ▼
                src/cli/index.js
                        │
                        ├── Parses arguments with commander
                        │
                        └── Routes to appropriate command:
                            ├── install.js
                            ├── init.js
                            ├── update.js
                            ├── doctor.js
                            ├── config.js
                            └── reset.js
```

---

## Implementation

### bin/muaddib.js

```javascript
#!/usr/bin/env node

/**
 * Muad'Dib CLI Entry Point
 * OmO-style orchestration for Claude Code
 */

import { run } from '../src/cli/index.js';

run().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
```

**Critical Requirements**:
1. First line MUST be `#!/usr/bin/env node` (hashbang for Unix)
2. File MUST be executable (`chmod +x`)
3. Exit with non-zero code on error

---

### src/cli/index.js

```javascript
/**
 * CLI Router - Commander.js based command routing
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import commands
import { installCommand } from './install.js';
import { initCommand } from './init.js';
import { updateCommand } from './update.js';
import { doctorCommand } from './doctor.js';
import { configCommand } from './config.js';
import { resetCommand } from './reset.js';

// Get package version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf8')
);

/**
 * Main CLI entry point
 */
export async function run() {
  const program = new Command();

  // Program metadata
  program
    .name('muaddib')
    .description(chalk.cyan('Muad\'Dib - OmO-style orchestration for Claude Code'))
    .version(packageJson.version, '-v, --version', 'Output the current version')
    .helpOption('-h, --help', 'Display help for command');

  // Register commands
  program.addCommand(installCommand());
  program.addCommand(initCommand());
  program.addCommand(updateCommand());
  program.addCommand(doctorCommand());
  program.addCommand(configCommand());
  program.addCommand(resetCommand());

  // Custom help formatting
  program.configureHelp({
    sortSubcommands: true,
    subcommandTerm: (cmd) => chalk.yellow(cmd.name())
  });

  // Add examples to help
  program.addHelpText('after', `

${chalk.bold('Examples:')}
  ${chalk.gray('# Install Muad\'Dib globally')}
  $ muaddib install

  ${chalk.gray('# Initialize in current project')}
  $ muaddib init

  ${chalk.gray('# Initialize with minimal setup')}
  $ muaddib init --minimal

  ${chalk.gray('# Check installation health')}
  $ muaddib doctor

${chalk.bold('Documentation:')}
  ${chalk.blue('https://github.com/yourusername/muaddib-claude')}
`);

  // Error handling
  program.showHelpAfterError('(add --help for additional information)');

  // Parse and execute
  await program.parseAsync(process.argv);
}
```

---

### Command File Template

Each command file exports a function that returns a Commander Command:

```javascript
// src/cli/install.js (example structure)

import { Command } from 'commander';
import chalk from 'chalk';

/**
 * Install command - installs/repairs global Muad'Dib installation
 * @returns {Command}
 */
export function installCommand() {
  const cmd = new Command('install');

  cmd
    .description('Install or repair global Muad\'Dib components')
    .option('-f, --force', 'Force reinstall even if already installed')
    .option('--no-skills', 'Skip skill symlink creation')
    .action(async (options) => {
      // Implementation here
      console.log(chalk.blue('Installing Muad\'Dib...'));
      // ...
    });

  return cmd;
}
```

---

## Command Definitions

### install
```javascript
cmd
  .description('Install or repair global Muad\'Dib components')
  .option('-f, --force', 'Force reinstall even if already installed')
  .option('--no-skills', 'Skip skill symlink creation')
```

### init
```javascript
cmd
  .description('Initialize Muad\'Dib in current project')
  .option('-m, --minimal', 'Minimal initialization (CLAUDE.md only)')
  .option('-f, --full', 'Full initialization with all features')
  .option('-y, --yes', 'Accept all defaults (non-interactive)')
  .option('--force', 'Overwrite existing files without confirmation')
```

### update
```javascript
cmd
  .description('Update Muad\'Dib components')
  .option('-g, --global', 'Update global components (default)')
  .option('-p, --project', 'Update current project files')
  .option('--no-backup', 'Skip backup creation')
```

### doctor
```javascript
cmd
  .description('Check Muad\'Dib installation health')
  .option('-v, --verbose', 'Show detailed check results')
  .option('--fix', 'Attempt to fix found issues')
```

### config
```javascript
cmd
  .description('View or modify configuration')
  .argument('[key]', 'Configuration key to get/set')
  .argument('[value]', 'Value to set')
  .option('-g, --global', 'Operate on global config')
  .option('-l, --list', 'List all configuration values')
```

### reset
```javascript
cmd
  .description('Reset project to default Muad\'Dib state')
  .option('--hard', 'Reset all files, not just config')
  .option('-y, --yes', 'Skip confirmation prompt')
```

---

## Utility Files

### src/utils/logger.js

```javascript
import chalk from 'chalk';

export const log = {
  info: (msg) => console.log(chalk.blue('ℹ'), msg),
  success: (msg) => console.log(chalk.green('✓'), msg),
  warn: (msg) => console.log(chalk.yellow('⚠'), msg),
  error: (msg) => console.log(chalk.red('✗'), msg),
  debug: (msg) => {
    if (process.env.DEBUG) {
      console.log(chalk.gray('⚙'), msg);
    }
  },
  step: (num, total, msg) => {
    console.log(chalk.cyan(`[${num}/${total}]`), msg);
  },
  newline: () => console.log('')
};
```

### src/utils/paths.js

```javascript
import { homedir } from 'os';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Package root (where package.json is)
const __filename = fileURLToPath(import.meta.url);
export const PACKAGE_ROOT = join(dirname(__filename), '../../');

// Global installation paths
export const GLOBAL_DIR = join(homedir(), '.muaddib');
export const GLOBAL_BIN = join(GLOBAL_DIR, 'bin');
export const GLOBAL_LIB = join(GLOBAL_DIR, 'lib');
export const GLOBAL_TEMPLATES = join(GLOBAL_DIR, 'templates');
export const GLOBAL_SCRIPTS = join(GLOBAL_DIR, 'scripts');
export const GLOBAL_SKILLS = join(GLOBAL_DIR, 'skills');

// Claude Code paths
export const CLAUDE_DIR = join(homedir(), '.claude');
export const CLAUDE_SKILLS = join(CLAUDE_DIR, 'skills');

// Project paths (relative to cwd)
export const PROJECT_CLAUDE_DIR = '.claude';
export const PROJECT_MUADDIB_DIR = '.muaddib';
export const PROJECT_CLAUDE_MD = 'CLAUDE.md';
```

---

## Testing Verification

After implementing the CLI router:

```bash
# 1. Test help
./bin/muaddib.js --help

# Expected output:
# Usage: muaddib [options] [command]
#
# Muad'Dib - OmO-style orchestration for Claude Code
#
# Options:
#   -v, --version   Output the current version
#   -h, --help      Display help for command
#
# Commands:
#   config          View or modify configuration
#   doctor          Check Muad'Dib installation health
#   init            Initialize Muad'Dib in current project
#   install         Install or repair global Muad'Dib components
#   reset           Reset project to default Muad'Dib state
#   update          Update Muad'Dib components

# 2. Test version
./bin/muaddib.js --version
# Expected: 1.0.0

# 3. Test unknown command
./bin/muaddib.js unknown
# Expected: error + help hint

# 4. Test subcommand help
./bin/muaddib.js init --help
```

---

## Acceptance Criteria

Task 2.1 is complete when:

- [ ] `bin/muaddib.js` has correct hashbang
- [ ] `bin/muaddib.js` is executable
- [ ] `src/cli/index.js` uses commander correctly
- [ ] `muaddib --help` shows all commands
- [ ] `muaddib --version` shows version from package.json
- [ ] `muaddib <unknown>` shows error with help hint
- [ ] All commands are registered (even if implementation is stub)
- [ ] Logger utility is implemented
- [ ] Paths utility is implemented
- [ ] Exit codes are appropriate (0 success, 1 error)

---

*Context for Task 2.1*
