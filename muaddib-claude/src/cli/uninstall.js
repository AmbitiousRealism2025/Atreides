/**
 * Uninstall Command
 *
 * Removes Muad'Dib global components and optionally project files.
 */

import { Command } from 'commander';
import { join } from 'path';
import logger from '../utils/logger.js';
import { confirm } from '../utils/prompts.js';
import {
  GLOBAL_MUADDIB_DIR,
  CLAUDE_SKILLS_DIR,
  getProjectPaths
} from '../utils/paths.js';
import {
  exists,
  remove
} from '../lib/file-manager.js';

/**
 * Create the uninstall command
 * @returns {Command}
 */
export function uninstallCommand() {
  const cmd = new Command('uninstall');

  cmd
    .description("Uninstall Muad'Dib components")
    .option('-g, --global', 'Uninstall global components (default)')
    .option('-p, --project', 'Also remove project files (.claude/, .muaddib/)')
    .option('-f, --force', 'Skip confirmation prompts')
    .action(async (options) => {
      try {
        await runUninstall(options);
      } catch (error) {
        logger.error(`Uninstall failed: ${error.message}`);
        logger.debug(error.stack);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Run the uninstall process
 * @param {object} options - Command options
 */
async function runUninstall(options) {
  logger.title("Muad'Dib Uninstall");

  const hasGlobal = await exists(GLOBAL_MUADDIB_DIR);
  const skillLink = join(CLAUDE_SKILLS_DIR, 'muaddib');
  const hasSkillLink = await exists(skillLink);
  const paths = getProjectPaths();
  const hasProject = await exists(paths.claudeDir) || await exists(paths.muaddibDir);

  if (!hasGlobal && !hasSkillLink && (!options.project || !hasProject)) {
    logger.info("Muad'Dib is not installed.");
    return;
  }

  // Show what will be removed
  console.log();
  logger.info('The following will be removed:');
  console.log();

  if (hasGlobal) {
    logger.dim(`  - ${GLOBAL_MUADDIB_DIR}/ (global components)`);
  }
  if (hasSkillLink) {
    logger.dim(`  - ${skillLink} (skill symlink)`);
  }
  if (options.project && hasProject) {
    if (await exists(paths.claudeDir)) {
      logger.dim(`  - ${paths.claudeDir}/ (project Claude settings)`);
    }
    if (await exists(paths.muaddibDir)) {
      logger.dim(`  - ${paths.muaddibDir}/ (project config)`);
    }
  }

  console.log();

  // Confirm unless --force
  if (!options.force) {
    const proceed = await confirm(
      'Are you sure you want to uninstall?',
      false
    );

    if (!proceed) {
      logger.info('Uninstall cancelled.');
      return;
    }
  }

  console.log();
  logger.info('Uninstalling...');

  // Remove skill symlink first
  if (hasSkillLink) {
    try {
      await remove(skillLink);
      logger.success('Removed: skill symlink');
    } catch (error) {
      logger.warn(`Could not remove skill symlink: ${error.message}`);
    }
  }

  // Remove global directory
  if (hasGlobal) {
    try {
      await remove(GLOBAL_MUADDIB_DIR);
      logger.success('Removed: global components');
    } catch (error) {
      logger.warn(`Could not remove global directory: ${error.message}`);
    }
  }

  // Remove project files if requested
  if (options.project && hasProject) {
    if (await exists(paths.claudeDir)) {
      try {
        await remove(paths.claudeDir);
        logger.success('Removed: .claude/');
      } catch (error) {
        logger.warn(`Could not remove .claude/: ${error.message}`);
      }
    }

    if (await exists(paths.muaddibDir)) {
      try {
        await remove(paths.muaddibDir);
        logger.success('Removed: .muaddib/');
      } catch (error) {
        logger.warn(`Could not remove .muaddib/: ${error.message}`);
      }
    }
  }

  console.log();
  logger.success('Uninstall complete!');

  if (!options.project && hasProject) {
    console.log();
    logger.info('Note: Project files were preserved.');
    logger.info('To remove project files, run: muaddib uninstall --project');
  }
}

export default uninstallCommand;
