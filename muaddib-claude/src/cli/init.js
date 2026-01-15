/**
 * Init Command
 *
 * Initialize a project with Muad'Dib configuration files.
 * Supports full and minimal modes with JSON validation.
 *
 * ## Modes
 *
 * **Full Mode (default):**
 * - Creates CLAUDE.md in project root
 * - Creates .claude/settings.json with permissions config
 *
 * **Minimal Mode (--minimal):**
 * - Creates ONLY CLAUDE.md in project root
 * - Does NOT create .claude directory or settings.json
 * - Use when you only need basic Claude Code instructions
 *
 * MED-2: The .claude directory is explicitly skipped in minimal mode.
 * This is intentional - minimal mode is for projects that only need
 * the CLAUDE.md instructions file without permission configurations.
 */

import { Command } from 'commander';
import { join } from 'path';
import fs from 'fs-extra';
import logger from '../utils/logger.js';
import {
  getProjectPaths,
  GLOBAL_TEMPLATES_DIR
} from '../utils/paths.js';
import { exists } from '../lib/file-manager.js';
import {
  renderTemplateFile,
  validateJson
} from '../lib/template-engine.js';

/**
 * Default fallback settings when JSON validation fails
 * @type {object}
 */
const FALLBACK_SETTINGS = {
  "$schema": "https://raw.githubusercontent.com/anthropics/claude-code/main/.claude/settings.schema.json",
  "permissions": {
    "allow": [],
    "deny": [
      "Bash(rm -rf *)",
      "Read(**/.env*)",
      "Write(**/.env*)"
    ]
  }
};

/**
 * Create the init command
 * @returns {Command}
 */
export function initCommand() {
  const cmd = new Command('init');

  cmd
    .description('Initialize a project with Muad\'Dib configuration')
    .option('-m, --minimal', 'Create only CLAUDE.md (no .claude directory or settings.json)')
    .option('-f, --force', 'Overwrite existing files')
    .option('-y, --yes', 'Skip confirmation prompts')
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
  const isMinimal = options.minimal || false;
  const isForce = options.force || false;

  logger.title("Muad'Dib Project Initialization");

  // Check for existing files
  const existingFiles = [];
  if (await exists(paths.claudeMd)) {
    existingFiles.push('CLAUDE.md');
  }
  if (!isMinimal && await exists(paths.settingsJson)) {
    existingFiles.push('.claude/settings.json');
  }

  if (existingFiles.length > 0 && !isForce) {
    logger.warn('Existing files found:');
    existingFiles.forEach(f => logger.list([f]));
    logger.info('Use --force to overwrite existing files.');
    return;
  }

  // Track created files
  const createdFiles = [];

  // Step 1: Create CLAUDE.md
  logger.step(1, isMinimal ? 1 : 2, 'Creating CLAUDE.md...');

  const claudeMdTemplate = join(GLOBAL_TEMPLATES_DIR, 'CLAUDE.md.hbs');
  if (await exists(claudeMdTemplate)) {
    const context = {
      projectName: getProjectName(paths.root),
      timestamp: new Date().toISOString()
    };

    try {
      const content = await renderTemplateFile(claudeMdTemplate, context);
      await fs.outputFile(paths.claudeMd, content);
      createdFiles.push('CLAUDE.md');
      logger.success('  Created CLAUDE.md');
    } catch (err) {
      // Fallback to basic CLAUDE.md
      logger.warn(`  Template rendering failed: ${err.message}`);
      const basicContent = `# ${getProjectName(paths.root)}\n\nProject configuration for Claude Code.\n`;
      await fs.outputFile(paths.claudeMd, basicContent);
      createdFiles.push('CLAUDE.md');
      logger.success('  Created CLAUDE.md (basic)');
    }
  } else {
    const basicContent = `# ${getProjectName(paths.root)}\n\nProject configuration for Claude Code.\n`;
    await fs.outputFile(paths.claudeMd, basicContent);
    createdFiles.push('CLAUDE.md');
    logger.success('  Created CLAUDE.md');
  }

  // Step 2: Create .claude directory and settings.json (full mode only)
  // MED-2: In minimal mode, we explicitly skip creating the .claude directory.
  // This is the expected behavior - minimal mode only creates CLAUDE.md.
  if (!isMinimal) {
    logger.step(2, 2, 'Creating .claude/settings.json...');

    // Ensure .claude directory exists
    await fs.ensureDir(paths.claudeDir);

    const settingsTemplate = join(GLOBAL_TEMPLATES_DIR, 'settings.json.hbs');
    if (await exists(settingsTemplate)) {
      const context = {
        projectName: getProjectName(paths.root),
        timestamp: new Date().toISOString()
      };

      try {
        const renderedContent = await renderTemplateFile(settingsTemplate, context);

        // MED-10: Validate JSON after template rendering
        const validation = validateJson(renderedContent);

        if (!validation.valid) {
          // JSON validation failed - log error and use fallback
          logger.warn(`  Template rendered invalid JSON: ${validation.error}`);
          // MED-5: Don't log rendered content to avoid potential sensitive data exposure
          logger.debug(`  Rendered content length: ${renderedContent.length} chars`);
          logger.info('  Using fallback settings...');

          await fs.outputFile(
            paths.settingsJson,
            JSON.stringify(FALLBACK_SETTINGS, null, 2)
          );
          createdFiles.push('.claude/settings.json (fallback)');
          logger.success('  Created .claude/settings.json (fallback)');
        } else {
          // JSON is valid - write it
          await fs.outputFile(paths.settingsJson, renderedContent);
          createdFiles.push('.claude/settings.json');
          logger.success('  Created .claude/settings.json');
        }
      } catch (err) {
        // Template rendering failed - use fallback
        logger.warn(`  Template rendering failed: ${err.message}`);
        logger.info('  Using fallback settings...');

        await fs.outputFile(
          paths.settingsJson,
          JSON.stringify(FALLBACK_SETTINGS, null, 2)
        );
        createdFiles.push('.claude/settings.json (fallback)');
        logger.success('  Created .claude/settings.json (fallback)');
      }
    } else {
      // No template found - use fallback
      logger.dim('  Template not found, using fallback settings');
      await fs.outputFile(
        paths.settingsJson,
        JSON.stringify(FALLBACK_SETTINGS, null, 2)
      );
      createdFiles.push('.claude/settings.json');
      logger.success('  Created .claude/settings.json');
    }
  }

  // Summary
  console.log();
  console.log('-'.repeat(50));
  console.log();

  if (createdFiles.length > 0) {
    logger.success(`Initialization complete! Created ${createdFiles.length} file(s):`);
    createdFiles.forEach(f => logger.list([f]));
  } else {
    logger.info('No files were created.');
  }

  if (isMinimal) {
    logger.dim('\nMinimal mode: Only CLAUDE.md was created.');
    logger.dim('Run without --minimal for full configuration.');
  }
}

/**
 * Get project name from directory path
 * @param {string} projectPath - Path to project root
 * @returns {string} Project name
 */
function getProjectName(projectPath) {
  const parts = projectPath.split(/[/\\]/);
  return parts[parts.length - 1] || 'project';
}

export default initCommand;
