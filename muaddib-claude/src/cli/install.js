/**
 * Install Command
 *
 * Install global Muad'Dib components to ~/.muaddib directory.
 * Uses the shared syncPackageAssets() function from file-manager.js (MED-11).
 *
 * Installs:
 * - Templates (to ~/.muaddib/templates)
 * - Scripts (to ~/.muaddib/scripts) - made executable
 * - Lib/core files (to ~/.muaddib/lib)
 * - Skills (to ~/.muaddib/skills)
 */

import { Command } from 'commander';
import fs from 'fs-extra';
import logger from '../utils/logger.js';
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
 * Create the install command
 * @returns {Command}
 */
export function installCommand() {
  const cmd = new Command('install');

  cmd
    .description('Install global Muad\'Dib components')
    .option('-f, --force', 'Force overwrite existing installation')
    .option('--templates-only', 'Install only templates')
    .option('--scripts-only', 'Install only scripts')
    .option('--no-templates', 'Skip templates')
    .option('--no-scripts', 'Skip scripts')
    .option('--no-lib', 'Skip lib files')
    .option('--no-skills', 'Skip skills')
    .action(async (options) => {
      try {
        await runInstall(options);
      } catch (error) {
        logger.error(`Installation failed: ${error.message}`);
        logger.debug(error.stack);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Run the installation process
 * @param {object} options - Command options
 */
async function runInstall(options) {
  const isForce = options.force || false;

  logger.title("Muad'Dib Global Installation");
  logger.info(`Installing to: ${GLOBAL_MUADDIB_DIR}`);
  logger.info(`Package root: ${PACKAGE_ROOT}`);
  console.log();

  // Determine what to install
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

  // Ensure global directory exists
  await fs.ensureDir(GLOBAL_MUADDIB_DIR);

  // MED-11: Use shared syncPackageAssets function
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
    force: isForce
  }, paths);

  // Report results
  console.log();
  console.log('-'.repeat(50));
  console.log();

  if (result.synced.length > 0) {
    logger.success(`Installed ${result.synced.length} component(s):`);
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
    logger.success('Installation complete!');
    logger.info('Run "muaddib init" in a project to initialize it.');
  } else if (result.skipped.length > 0 && result.errors.length === 0) {
    logger.info('Nothing installed (use --force to overwrite existing components).');
  } else {
    logger.warn('Installation completed with issues.');
  }
}

export default installCommand;
