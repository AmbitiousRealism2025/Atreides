/**
 * Install Command
 *
 * Installs or repairs global Muad'Dib components to ~/.muaddib/
 */

import { Command } from 'commander';
import logger from '../utils/logger.js';
import {
  GLOBAL_MUADDIB_DIR,
  GLOBAL_TEMPLATES_DIR,
  GLOBAL_SCRIPTS_DIR,
  GLOBAL_LIB_DIR,
  GLOBAL_SKILLS_DIR,
  CLAUDE_SKILLS_DIR,
  PACKAGE_TEMPLATES_DIR,
  PACKAGE_SCRIPTS_DIR,
  PACKAGE_LIB_CORE_DIR,
  PACKAGE_SKILLS_DIR
} from '../utils/paths.js';
import {
  ensureDir,
  exists,
  copyDir,
  symlink,
  listFiles,
  makeExecutable,
  remove
} from '../lib/file-manager.js';
import { join } from 'path';

/**
 * Create the install command
 * @returns {Command}
 */
export function installCommand() {
  const cmd = new Command('install');

  cmd
    .description("Install or repair global Muad'Dib components")
    .option('-f, --force', 'Force reinstall even if already installed')
    .option('--no-skills', 'Skip skill symlink creation')
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
  const totalSteps = options.skills !== false ? 5 : 4;
  let currentStep = 0;

  logger.title("Muad'Dib Installation");

  // Step 1: Check existing installation
  currentStep++;
  logger.step(currentStep, totalSteps, 'Checking existing installation...');

  const isInstalled = await exists(GLOBAL_MUADDIB_DIR);

  if (isInstalled && !options.force) {
    logger.warn("Muad'Dib is already installed.");
    logger.info('Use --force to reinstall.');
    logger.dim(`Location: ${GLOBAL_MUADDIB_DIR}`);
    return;
  }

  if (isInstalled && options.force) {
    logger.info('Removing existing installation...');
    await remove(GLOBAL_MUADDIB_DIR);
  }

  // Step 2: Create directory structure
  currentStep++;
  logger.step(currentStep, totalSteps, 'Creating directory structure...');

  const dirs = [
    GLOBAL_MUADDIB_DIR,
    GLOBAL_TEMPLATES_DIR,
    GLOBAL_SCRIPTS_DIR,
    GLOBAL_LIB_DIR,
    GLOBAL_SKILLS_DIR
  ];

  for (const dir of dirs) {
    await ensureDir(dir);
    logger.debug(`Created: ${dir}`);
  }

  // Step 3: Copy files from package
  currentStep++;
  logger.step(currentStep, totalSteps, 'Copying files...');

  // Copy templates
  if (await exists(PACKAGE_TEMPLATES_DIR)) {
    await copyDir(PACKAGE_TEMPLATES_DIR, GLOBAL_TEMPLATES_DIR);
    logger.debug('Copied templates');
  } else {
    logger.warn('No templates directory found in package');
  }

  // Copy scripts
  if (await exists(PACKAGE_SCRIPTS_DIR)) {
    await copyDir(PACKAGE_SCRIPTS_DIR, GLOBAL_SCRIPTS_DIR);
    logger.debug('Copied scripts');
  } else {
    logger.warn('No scripts directory found in package');
  }

  // Copy lib/core
  if (await exists(PACKAGE_LIB_CORE_DIR)) {
    await copyDir(PACKAGE_LIB_CORE_DIR, join(GLOBAL_LIB_DIR, 'core'));
    logger.debug('Copied lib/core');
  }

  // Copy skills
  if (await exists(PACKAGE_SKILLS_DIR)) {
    await copyDir(PACKAGE_SKILLS_DIR, GLOBAL_SKILLS_DIR);
    logger.debug('Copied skills');
  }

  // Step 4: Make scripts executable
  currentStep++;
  logger.step(currentStep, totalSteps, 'Setting permissions...');

  const scriptFiles = await listFiles(GLOBAL_SCRIPTS_DIR, { extensions: ['.sh'] });
  for (const scriptFile of scriptFiles) {
    await makeExecutable(scriptFile);
    logger.debug(`Made executable: ${scriptFile}`);
  }

  // Step 5: Create skill symlink (optional)
  if (options.skills !== false) {
    currentStep++;
    logger.step(currentStep, totalSteps, 'Creating skill symlink...');

    await ensureDir(CLAUDE_SKILLS_DIR);

    const skillLink = join(CLAUDE_SKILLS_DIR, 'muaddib');
    const skillTarget = join(GLOBAL_SKILLS_DIR, 'muaddib');

    if (await exists(skillTarget)) {
      await symlink(skillTarget, skillLink, { force: true });
      logger.debug(`Created symlink: ${skillLink} → ${skillTarget}`);
    } else {
      logger.warn('Skill source not found, skipping symlink');
    }
  }

  // Success message
  console.log();
  logger.success("Muad'Dib installed successfully!");
  logger.dim(`Location: ${GLOBAL_MUADDIB_DIR}`);
  console.log();
  logger.info('Next steps:');
  logger.list([
    'cd into your project directory',
    'Run: muaddib init'
  ]);
}
