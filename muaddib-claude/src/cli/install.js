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
    .option('-n, --dry-run', 'Preview what would be installed without making changes')
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
  const isDryRun = options.dryRun === true;

  logger.title(isDryRun ? "Muad'Dib Installation (Dry Run)" : "Muad'Dib Installation");

  if (isDryRun) {
    logger.info('Dry run mode - no changes will be made');
    console.log();
  }

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
    if (isDryRun) {
      logger.info('Would remove existing installation');
    } else {
      logger.info('Removing existing installation...');
      await remove(GLOBAL_MUADDIB_DIR);
    }
  }

  // Step 2: Create directory structure
  currentStep++;
  logger.step(currentStep, totalSteps, isDryRun ? 'Would create directory structure...' : 'Creating directory structure...');

  const dirs = [
    GLOBAL_MUADDIB_DIR,
    GLOBAL_TEMPLATES_DIR,
    GLOBAL_SCRIPTS_DIR,
    GLOBAL_LIB_DIR,
    GLOBAL_SKILLS_DIR
  ];

  for (const dir of dirs) {
    if (isDryRun) {
      logger.dim(`  Would create: ${dir}`);
    } else {
      await ensureDir(dir);
      logger.debug(`Created: ${dir}`);
    }
  }

  // Step 3: Copy files from package
  currentStep++;
  logger.step(currentStep, totalSteps, isDryRun ? 'Would copy files...' : 'Copying files...');

  // Copy templates
  if (await exists(PACKAGE_TEMPLATES_DIR)) {
    if (isDryRun) {
      logger.dim(`  Would copy: templates → ${GLOBAL_TEMPLATES_DIR}`);
    } else {
      await copyDir(PACKAGE_TEMPLATES_DIR, GLOBAL_TEMPLATES_DIR);
      logger.debug('Copied templates');
    }
  } else {
    logger.warn('No templates directory found in package');
  }

  // Copy scripts
  if (await exists(PACKAGE_SCRIPTS_DIR)) {
    if (isDryRun) {
      logger.dim(`  Would copy: scripts → ${GLOBAL_SCRIPTS_DIR}`);
    } else {
      await copyDir(PACKAGE_SCRIPTS_DIR, GLOBAL_SCRIPTS_DIR);
      logger.debug('Copied scripts');
    }
  } else {
    logger.warn('No scripts directory found in package');
  }

  // Copy lib/core
  if (await exists(PACKAGE_LIB_CORE_DIR)) {
    if (isDryRun) {
      logger.dim(`  Would copy: lib/core → ${join(GLOBAL_LIB_DIR, 'core')}`);
    } else {
      await copyDir(PACKAGE_LIB_CORE_DIR, join(GLOBAL_LIB_DIR, 'core'));
      logger.debug('Copied lib/core');
    }
  }

  // Copy skills
  if (await exists(PACKAGE_SKILLS_DIR)) {
    if (isDryRun) {
      logger.dim(`  Would copy: skills → ${GLOBAL_SKILLS_DIR}`);
    } else {
      await copyDir(PACKAGE_SKILLS_DIR, GLOBAL_SKILLS_DIR);
      logger.debug('Copied skills');
    }
  }

  // Step 4: Make scripts executable
  currentStep++;
  logger.step(currentStep, totalSteps, isDryRun ? 'Would set permissions...' : 'Setting permissions...');

  if (isDryRun) {
    const packageScriptFiles = await listFiles(PACKAGE_SCRIPTS_DIR, { extensions: ['.sh'] });
    for (const scriptFile of packageScriptFiles) {
      logger.dim(`  Would make executable: ${scriptFile}`);
    }
  } else {
    const scriptFiles = await listFiles(GLOBAL_SCRIPTS_DIR, { extensions: ['.sh'] });
    for (const scriptFile of scriptFiles) {
      await makeExecutable(scriptFile);
      logger.debug(`Made executable: ${scriptFile}`);
    }
  }

  // Step 5: Create skill symlink (optional)
  if (options.skills !== false) {
    currentStep++;
    logger.step(currentStep, totalSteps, isDryRun ? 'Would create skill symlink...' : 'Creating skill symlink...');

    const skillLink = join(CLAUDE_SKILLS_DIR, 'muaddib');
    const skillTarget = join(GLOBAL_SKILLS_DIR, 'muaddib');

    if (isDryRun) {
      logger.dim(`  Would create symlink: ${skillLink} → ${skillTarget}`);
    } else {
      await ensureDir(CLAUDE_SKILLS_DIR);

      if (await exists(skillTarget)) {
        await symlink(skillTarget, skillLink, { force: true });
        logger.debug(`Created symlink: ${skillLink} → ${skillTarget}`);
      } else {
        logger.warn('Skill source not found, skipping symlink');
      }
    }
  }

  // Success message
  console.log();
  if (isDryRun) {
    logger.success('Dry run complete - no changes were made');
    logger.info('Run without --dry-run to perform installation');
  } else {
    logger.success("Muad'Dib installed successfully!");
    logger.dim(`Location: ${GLOBAL_MUADDIB_DIR}`);
    console.log();
    logger.info('Next steps:');
    logger.list([
      'cd into your project directory',
      'Run: muaddib init'
    ]);
  }
}
