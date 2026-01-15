/**
 * Update Command
 *
 * Update global Muad'Dib components to latest version.
 * Uses the shared syncPackageAssets() function from file-manager.js (MED-11).
 *
 * Updates:
 * - Templates (to ~/.muaddib/templates)
 * - Scripts (to ~/.muaddib/scripts) - made executable
 * - Lib/core files (to ~/.muaddib/lib)
 * - Skills (to ~/.muaddib/skills)
 *
 * Unlike install, update always uses force mode to overwrite existing files.
 */

import { Command } from 'commander';
import fs from 'fs-extra';
import logger from '../utils/logger.js';
import { exists } from '../lib/file-manager.js';
import {
  GLOBAL_MUADDIB_DIR,
  PACKAGE_ROOT,
  PACKAGE_TEMPLATES_DIR,
  PACKAGE_SCRIPTS_DIR,
  PACKAGE_LIB_CORE_DIR,
  PACKAGE_SKILLS_DIR,
  GLOBAL_TEMPLATES_DIR,
  GLOBAL_SCRIPTS_DIR,
  GLOBAL_LIB_DIR,
  GLOBAL_SKILLS_DIR
} from '../utils/paths.js';
import { syncPackageAssets } from '../lib/file-manager.js';

/**
 * Create the update command
 * @returns {Command}
 */
export function updateCommand() {
  const cmd = new Command('update');

  cmd
    .description('Update global Muad\'Dib components to latest version')
    .option('--templates-only', 'Update only templates')
    .option('--scripts-only', 'Update only scripts')
    .option('--no-templates', 'Skip templates')
    .option('--no-scripts', 'Skip scripts')
    .option('--no-lib', 'Skip lib files')
    .option('--no-skills', 'Skip skills')
    .option('--dry-run', 'Show what would be updated without making changes')
    .action(async (options) => {
      try {
        await runUpdate(options);
      } catch (error) {
        logger.error(`Update failed: ${error.message}`);
        logger.debug(error.stack);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Run the update process
 * @param {object} options - Command options
 */
async function runUpdate(options) {
  const isDryRun = options.dryRun || false;

  logger.title("Muad'Dib Global Update");
  logger.info(`Updating from: ${PACKAGE_ROOT}`);
  logger.info(`Destination: ${GLOBAL_MUADDIB_DIR}`);

  if (isDryRun) {
    logger.warn('Dry run mode - no changes will be made');
  }
  console.log();

  // Check if already installed
  const isInstalled = await exists(GLOBAL_MUADDIB_DIR);
  if (!isInstalled) {
    logger.warn('Muad\'Dib is not installed globally.');
    logger.info('Run "muaddib install" first to install.');
    return;
  }

  // Determine what to update
  let syncTemplates = options.templates !== false;
  let syncScripts = options.scripts !== false;
  let syncLib = options.lib !== false;
  let syncSkills = options.skills !== false;

  // Handle exclusive flags
  if (options.templatesOnly) {
    syncTemplates = true;
    syncScripts = false;
    syncLib = false;
    syncSkills = false;
  } else if (options.scriptsOnly) {
    syncTemplates = false;
    syncScripts = true;
    syncLib = false;
    syncSkills = false;
  }

  if (isDryRun) {
    logger.info('Would update the following components:');
    if (syncTemplates) logger.list(['  templates']);
    if (syncScripts) logger.list(['  scripts']);
    if (syncLib) logger.list(['  lib']);
    if (syncSkills) logger.list(['  skills']);
    return;
  }

  // MED-11: Use shared syncPackageAssets function with force=true
  logger.step(1, 1, 'Syncing package assets...');

  const paths = {
    PACKAGE_TEMPLATES_DIR,
    PACKAGE_SCRIPTS_DIR,
    PACKAGE_LIB_CORE_DIR,
    PACKAGE_SKILLS_DIR,
    GLOBAL_TEMPLATES_DIR,
    GLOBAL_SCRIPTS_DIR,
    GLOBAL_LIB_DIR,
    GLOBAL_SKILLS_DIR
  };

  const result = await syncPackageAssets({
    templates: syncTemplates,
    scripts: syncScripts,
    lib: syncLib,
    skills: syncSkills,
    force: true  // Update always uses force mode
  }, paths);

  // Report results
  console.log();
  console.log('-'.repeat(50));
  console.log();

  if (result.synced.length > 0) {
    logger.success(`Updated ${result.synced.length} component(s):`);
    result.synced.forEach(item => logger.list([`  ${item}`]));
  }

  if (result.skipped.length > 0) {
    console.log();
    logger.dim(`Skipped ${result.skipped.length} component(s):`);
    result.skipped.forEach(item => logger.list([`  ${item}`]));
  }

  if (result.errors.length > 0) {
    console.log();
    logger.warn(`Encountered ${result.errors.length} error(s):`);
    result.errors.forEach(item => logger.list([`  ${item}`]));
  }

  console.log();
  if (result.synced.length > 0) {
    logger.success('Update complete!');
  } else if (result.skipped.length > 0 && result.errors.length === 0) {
    logger.info('Nothing to update (source files may be missing).');
  } else {
    logger.warn('Update completed with issues.');
  }
}

export default updateCommand;
