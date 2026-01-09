/**
 * Init Command
 *
 * Initialize Muad'Dib in the current project directory.
 */

import { Command } from 'commander';
import { basename } from 'path';
import logger from '../utils/logger.js';
import { confirm, projectInit } from '../utils/prompts.js';
import {
  GLOBAL_MUADDIB_DIR,
  GLOBAL_SCRIPTS_DIR,
  getProjectPaths
} from '../utils/paths.js';
import {
  ensureDir,
  exists,
  writeFile,
  copyDir
} from '../lib/file-manager.js';
import { renderTemplate, getDefaultData } from '../lib/template-engine.js';
import { getDefaultProjectConfig } from '../lib/config-merger.js';

/**
 * Create the init command
 * @returns {Command}
 */
export function initCommand() {
  const cmd = new Command('init');

  cmd
    .description("Initialize Muad'Dib in current project")
    .option('-m, --minimal', 'Minimal initialization (CLAUDE.md only)')
    .option('-f, --full', 'Full initialization with all features')
    .option('-y, --yes', 'Accept all defaults (non-interactive)')
    .option('--force', 'Overwrite existing files without confirmation')
    .action(async (options) => {
      try {
        await runInit(options);
      } catch (error) {
        logger.error(`Initialization failed: ${error.message}`);
        logger.debug(error.stack);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Run the initialization process
 * @param {object} options - Command options
 */
async function runInit(options) {
  const paths = getProjectPaths();

  logger.title("Muad'Dib Project Initialization");

  // Check global installation
  if (!await exists(GLOBAL_MUADDIB_DIR)) {
    logger.error("Muad'Dib is not installed globally.");
    logger.info("Run: muaddib install");
    process.exit(1);
  }

  // Check for existing files
  const existingFiles = [];
  if (await exists(paths.claudeMd)) existingFiles.push('CLAUDE.md');
  if (await exists(paths.claudeDir)) existingFiles.push('.claude/');
  if (await exists(paths.muaddibDir)) existingFiles.push('.muaddib/');

  if (existingFiles.length > 0 && !options.force) {
    logger.warn("Existing Muad'Dib files detected:");
    logger.list(existingFiles);

    const proceed = await confirm('Overwrite existing files?', false);

    if (!proceed) {
      logger.info('Initialization cancelled.');
      return;
    }
  }

  // Gather configuration
  let config;

  if (options.yes) {
    // Use defaults
    config = {
      projectName: basename(process.cwd()),
      description: '',
      projectType: 'node',
      orchestrationLevel: options.minimal ? 'minimal' : options.full ? 'full' : 'standard',
      codebaseMaturity: 'TRANSITIONAL',
      useHooks: !options.minimal,
      useAgentDelegation: options.full
    };
  } else {
    // Interactive prompts
    config = await projectInit();
    if (options.minimal) config.orchestrationLevel = 'minimal';
    if (options.full) config.orchestrationLevel = 'full';
  }

  // Add template defaults
  const templateData = {
    ...getDefaultData(),
    ...config,
    ...getDefaultProjectConfig(config)
  };

  // Determine what to create based on orchestration level
  const isMinimal = config.orchestrationLevel === 'minimal';
  const isFull = config.orchestrationLevel === 'full';

  logger.info('Creating project files...');

  // Always create .claude directory
  await ensureDir(paths.claudeDir);

  // Create CLAUDE.md (always)
  try {
    const claudeMd = await renderTemplate('CLAUDE.md', templateData);
    await writeFile(paths.claudeMd, claudeMd, { backup: !options.force });
    logger.success('Created: CLAUDE.md');
  } catch (error) {
    logger.warn(`Could not create CLAUDE.md: ${error.message}`);
    // Create a basic CLAUDE.md if template fails
    const basicClaudeMd = createBasicClaudeMd(config);
    await writeFile(paths.claudeMd, basicClaudeMd, { backup: !options.force });
    logger.success('Created: CLAUDE.md (basic)');
  }

  if (!isMinimal) {
    // Create .muaddib directory
    await ensureDir(paths.muaddibDir);
    await ensureDir(paths.stateDir);

    // Create settings.json
    try {
      const settings = await renderTemplate('settings.json', templateData);
      await writeFile(paths.settingsJson, settings, { backup: !options.force });
      logger.success('Created: .claude/settings.json');
    } catch (error) {
      logger.warn(`Could not create settings.json: ${error.message}`);
      const basicSettings = createBasicSettings(config);
      await writeFile(paths.settingsJson, JSON.stringify(basicSettings, null, 2), { backup: !options.force });
      logger.success('Created: .claude/settings.json (basic)');
    }

    // Create context.md
    try {
      const context = await renderTemplate('context.md', templateData);
      await writeFile(paths.contextMd, context, { backup: !options.force });
      logger.success('Created: .claude/context.md');
    } catch (error) {
      logger.warn(`Could not create context.md: ${error.message}`);
      const basicContext = createBasicContext(config);
      await writeFile(paths.contextMd, basicContext, { backup: !options.force });
      logger.success('Created: .claude/context.md (basic)');
    }

    // Create critical-context.md
    try {
      const criticalContext = await renderTemplate('critical-context.md', templateData);
      await writeFile(paths.criticalContextMd, criticalContext, { backup: !options.force });
      logger.success('Created: .claude/critical-context.md');
    } catch (error) {
      const basicCritical = createBasicCriticalContext();
      await writeFile(paths.criticalContextMd, basicCritical, { backup: !options.force });
      logger.success('Created: .claude/critical-context.md (basic)');
    }

    // Create project config
    try {
      const projectConfig = await renderTemplate('config.json', templateData);
      await writeFile(paths.projectConfig, projectConfig, { backup: !options.force });
      logger.success('Created: .muaddib/config.json');
    } catch (error) {
      const basicConfig = getDefaultProjectConfig(config);
      await writeFile(paths.projectConfig, JSON.stringify(basicConfig, null, 2), { backup: !options.force });
      logger.success('Created: .muaddib/config.json (basic)');
    }
  }

  // Copy scripts if full mode
  if (isFull && await exists(GLOBAL_SCRIPTS_DIR)) {
    const projectScriptsDir = `${paths.claudeDir}/scripts`;
    await ensureDir(projectScriptsDir);
    await copyDir(GLOBAL_SCRIPTS_DIR, projectScriptsDir);
    logger.success('Copied: .claude/scripts/');
  }

  // Success message
  console.log();
  logger.success("Muad'Dib initialized successfully!");
  console.log();
  logger.info('Files created:');
  logger.list([
    'CLAUDE.md',
    ...(isMinimal ? [] : [
      '.claude/settings.json',
      '.claude/context.md',
      '.claude/critical-context.md',
      '.muaddib/config.json'
    ]),
    ...(isFull ? ['.claude/scripts/'] : [])
  ]);
  console.log();
  logger.info("You're all set! Claude Code will now use Muad'Dib orchestration.");
}

/**
 * Create basic CLAUDE.md content
 * @param {object} config - Project config
 * @returns {string}
 */
function createBasicClaudeMd(config) {
  return `# ${config.projectName}

## Project Overview

**Project**: ${config.projectName}
**Type**: ${config.projectType}
**Description**: ${config.description || 'A project using Muad\'Dib orchestration'}

---

## Orchestration Rules

### Task Management

1. **Use TodoWrite for any task with 3+ steps**
2. **Mark todos complete only when fully verified**
3. **Never stop with incomplete todos**
4. **Break complex work into atomic tasks**

### 3-Strikes Error Recovery

After **3 consecutive failures** on same operation:

1. **STOP** - Halt modifications
2. **REVERT** - \`git checkout\` to working state
3. **DOCUMENT** - Record failure details
4. **ASK** - Request user guidance

---

## Quality Standards

- Write clean, maintainable code
- Follow existing project patterns
- Test changes before committing
- Document significant decisions

---

*Generated by Muad'Dib - OmO-style orchestration for Claude Code*
*Initialized: ${new Date().toISOString().split('T')[0]}*
`;
}

/**
 * Create basic settings.json content
 * @param {object} config - Project config
 * @returns {object}
 */
function createBasicSettings(config) {
  return {
    hooks: {},
    permissions: {
      allow: [],
      deny: []
    }
  };
}

/**
 * Create basic context.md content
 * @param {object} config - Project config
 * @returns {string}
 */
function createBasicContext(config) {
  return `# Project Context

## Overview

**Project**: ${config.projectName}
**Type**: ${config.projectType}

## Key Information

Add project-specific context here that Claude should know about.

## Important Patterns

Document any important patterns or conventions used in this project.

---

*Updated: ${new Date().toISOString().split('T')[0]}*
`;
}

/**
 * Create basic critical-context.md content
 * @returns {string}
 */
function createBasicCriticalContext() {
  return `# Critical Context

This file contains information that must survive context compaction.

## Must Remember

- Add critical information here
- This content persists through long sessions

---

*Updated: ${new Date().toISOString().split('T')[0]}*
`;
}
