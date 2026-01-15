/**
 * Doctor Command
 *
 * Health check for Muad'Dib installation with backup cleanup support.
 */

import { Command } from 'commander';
import { join } from 'path';
import logger from '../utils/logger.js';
import {
  GLOBAL_MUADDIB_DIR,
  GLOBAL_TEMPLATES_DIR,
  GLOBAL_SCRIPTS_DIR,
  GLOBAL_LIB_DIR,
  GLOBAL_SKILLS_DIR,
  CLAUDE_SKILLS_DIR,
  getProjectPaths
} from '../utils/paths.js';
import {
  isScriptExecutable
} from '../lib/validator.js';
import {
  exists,
  isSymlink,
  readSymlink,
  listFiles,
  makeExecutable,
  readJson,
  findBackups,
  cleanupBackups
} from '../lib/file-manager.js';

/**
 * Create the doctor command
 * @returns {Command}
 */
export function doctorCommand() {
  const cmd = new Command('doctor');

  cmd
    .description("Check Muad'Dib installation health")
    .option('-v, --verbose', 'Show detailed check results')
    .option('--fix', 'Attempt to fix found issues')
    .option('--cleanup-backups', 'Find and remove old backup files from the project')
    .option('--cleanup-days <days>', 'Maximum age in days for backups to keep (default: 30)', parseInt)
    .option('--dry-run', 'Show what would be cleaned up without actually deleting')
    .action(async (options) => {
      try {
        // If cleanup-backups is specified, run the cleanup flow
        if (options.cleanupBackups) {
          await runBackupCleanup(options);
        } else {
          await runDoctor(options);
        }
      } catch (error) {
        logger.error(`Health check failed: ${error.message}`);
        logger.debug(error.stack);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Run backup cleanup
 * @param {object} options - Command options
 */
async function runBackupCleanup(options) {
  const maxAgeDays = options.cleanupDays || 30;
  const dryRun = options.dryRun || false;

  logger.title("Backup File Cleanup");

  const paths = getProjectPaths();
  const dirsToCheck = [
    paths.root,
    paths.claudeDir,
    paths.muaddibDir
  ];

  let totalDeleted = 0;
  let totalRetained = 0;
  let totalErrors = 0;

  for (const dir of dirsToCheck) {
    if (!await exists(dir)) {
      continue;
    }

    if (options.verbose) {
      logger.info(`Checking: ${dir}`);
    }

    // First find what backups exist
    const backups = await findBackups(dir);
    if (backups.length === 0) {
      continue;
    }

    logger.info(`Found ${backups.length} backup file(s) in ${dir}`);

    if (dryRun) {
      logger.warn('Dry run mode - no files will be deleted');
    }

    const result = await cleanupBackups(dir, {
      maxAgeDays,
      dryRun
    });

    if (result.deleted.length > 0) {
      const action = dryRun ? 'Would delete' : 'Deleted';
      logger.success(`${action} ${result.deleted.length} old backup(s)`);
      if (options.verbose) {
        result.deleted.forEach(f => logger.dim(`  - ${f}`));
      }
    }

    if (result.retained.length > 0 && options.verbose) {
      logger.info(`Retained ${result.retained.length} recent backup(s)`);
      result.retained.forEach(f => logger.dim(`  - ${f}`));
    }

    if (result.errors.length > 0) {
      logger.warn(`${result.errors.length} error(s) during cleanup`);
      result.errors.forEach(e => logger.error(`  ${e}`));
    }

    totalDeleted += result.deleted.length;
    totalRetained += result.retained.length;
    totalErrors += result.errors.length;
  }

  console.log();
  console.log('-'.repeat(50));
  console.log();

  if (totalDeleted === 0 && totalRetained === 0) {
    logger.info('No backup files found in project.');
  } else {
    const action = dryRun ? 'Would clean' : 'Cleaned';
    logger.success(`${action} ${totalDeleted} backup file(s), retained ${totalRetained}`);
    if (totalErrors > 0) {
      logger.warn(`${totalErrors} error(s) occurred during cleanup`);
    }
  }
}

/**
 * Run the health check
 * @param {object} options - Command options
 */
async function runDoctor(options) {
  logger.title("Muad'Dib Health Check");

  const issues = [];
  const warnings = [];

  // ══════════════════════════════════════════════════════════════
  // Global Installation Checks
  // ══════════════════════════════════════════════════════════════

  console.log();
  logger.info('Global Installation:');

  // Check global directory
  const globalExists = await exists(GLOBAL_MUADDIB_DIR);
  if (globalExists) {
    logger.success(`  Global directory: ${GLOBAL_MUADDIB_DIR}`);
  } else {
    logger.error('  Global directory: Not found');
    issues.push({
      name: 'Global directory missing',
      fix: 'Run: muaddib install'
    });
  }

  if (globalExists) {
    // Check templates
    const templatesExist = await exists(GLOBAL_TEMPLATES_DIR);
    if (templatesExist) {
      const result = await listFiles(GLOBAL_TEMPLATES_DIR, { extensions: ['.hbs'] });
      const templates = result.files || [];
      logger.success(`  Templates: ${templates.length} found`);
      if (options.verbose) {
        templates.forEach(t => logger.dim(`    - ${t.split('/').pop()}`));
      }
    } else {
      logger.error('  Templates: Not found');
      issues.push({
        name: 'Templates missing',
        fix: 'Run: muaddib install --force'
      });
    }

    // Check scripts
    const scriptsExist = await exists(GLOBAL_SCRIPTS_DIR);
    if (scriptsExist) {
      const result = await listFiles(GLOBAL_SCRIPTS_DIR, { extensions: ['.sh'] });
      const scripts = result.files || [];
      logger.success(`  Scripts: ${scripts.length} found`);

      // Check if scripts are executable
      let allExecutable = true;
      for (const script of scripts) {
        const executable = await isScriptExecutable(script);
        if (!executable) {
          allExecutable = false;
          warnings.push({
            name: `Script not executable: ${script.split('/').pop()}`,
            fix: `chmod +x ${script}`,
            autoFix: async () => await makeExecutable(script)
          });
        }
      }

      if (!allExecutable) {
        logger.warn('  Scripts executable: Some scripts need chmod +x');
      } else {
        logger.success('  Scripts executable: All OK');
      }
    } else {
      logger.warn('  Scripts: Not found (hooks will not work)');
      warnings.push({
        name: 'Scripts missing',
        fix: 'Run: muaddib install --force'
      });
    }

    // Check lib/core
    const libExists = await exists(join(GLOBAL_LIB_DIR, 'core'));
    if (libExists) {
      logger.success('  Core library: OK');
    } else {
      logger.warn('  Core library: Not found');
      warnings.push({
        name: 'Core library missing',
        fix: 'Run: muaddib install --force'
      });
    }

    // Check skills
    const skillsExist = await exists(GLOBAL_SKILLS_DIR);
    if (skillsExist) {
      logger.success('  Skills directory: OK');
    } else {
      logger.warn('  Skills directory: Not found (optional)');
    }

    // Check skill symlink
    const skillLink = join(CLAUDE_SKILLS_DIR, 'muaddib');
    if (await exists(skillLink)) {
      if (await isSymlink(skillLink)) {
        const target = await readSymlink(skillLink);
        logger.success(`  Skill symlink: OK -> ${target}`);
      } else {
        logger.warn('  Skill symlink: Exists but is not a symlink');
        warnings.push({
          name: 'Skill path is not a symlink',
          fix: 'Remove and recreate with muaddib install --force'
        });
      }
    } else {
      logger.dim('  Skill symlink: Not configured (optional)');
    }
  }

  // ══════════════════════════════════════════════════════════════
  // Project Installation Checks
  // ══════════════════════════════════════════════════════════════

  const paths = getProjectPaths();
  const hasProject = await exists(paths.claudeMd) || await exists(paths.claudeDir);

  if (hasProject) {
    console.log();
    logger.info('Project Installation:');

    // Check CLAUDE.md
    if (await exists(paths.claudeMd)) {
      logger.success('  CLAUDE.md: OK');
    } else {
      logger.warn('  CLAUDE.md: Not found');
      warnings.push({
        name: 'CLAUDE.md missing',
        fix: 'Run: muaddib init'
      });
    }

    // Check .claude directory
    if (await exists(paths.claudeDir)) {
      logger.success('  .claude directory: OK');
    } else {
      logger.error('  .claude directory: Not found');
      issues.push({
        name: '.claude directory missing',
        fix: 'Run: muaddib init'
      });
    }

    // Check settings.json
    if (await exists(paths.settingsJson)) {
      try {
        await readJson(paths.settingsJson);
        logger.success('  settings.json: Valid JSON');
      } catch {
        logger.error('  settings.json: Invalid JSON');
        issues.push({
          name: 'settings.json is invalid JSON',
          fix: 'Fix JSON syntax or run: muaddib init --force'
        });
      }
    } else {
      logger.dim('  settings.json: Not found (hooks disabled)');
    }

    // Check context files
    if (await exists(paths.contextMd)) {
      logger.success('  context.md: OK');
    } else {
      logger.dim('  context.md: Not found (optional)');
    }

    // Check .muaddib directory
    if (await exists(paths.muaddibDir)) {
      logger.success('  .muaddib directory: OK');
    } else {
      logger.dim('  .muaddib directory: Not found (optional)');
    }

    // Check project config
    if (await exists(paths.projectConfig)) {
      try {
        await readJson(paths.projectConfig);
        logger.success('  Project config: Valid JSON');
      } catch {
        logger.warn('  Project config: Invalid JSON');
        warnings.push({
          name: 'Project config is invalid JSON',
          fix: 'Fix JSON syntax or run: muaddib init --force'
        });
      }
    } else {
      logger.dim('  Project config: Not found (optional)');
    }

    // Check for backup files
    const backupsInProject = await findBackups(paths.root);
    const backupsInClaude = await findBackups(paths.claudeDir);
    const totalBackups = backupsInProject.length + backupsInClaude.length;

    if (totalBackups > 0) {
      logger.warn(`  Backup files: ${totalBackups} found`);
      if (options.verbose) {
        [...backupsInProject, ...backupsInClaude].forEach(f =>
          logger.dim(`    - ${f.split('/').pop()}`)
        );
      }
      warnings.push({
        name: `${totalBackups} backup file(s) found`,
        fix: 'Run: muaddib doctor --cleanup-backups'
      });
    }
  } else {
    console.log();
    logger.dim('No project detected in current directory.');
    logger.dim('Run "muaddib init" to initialize a project.');
  }

  // ══════════════════════════════════════════════════════════════
  // Summary
  // ══════════════════════════════════════════════════════════════

  console.log();
  console.log('-'.repeat(50));
  console.log();

  if (issues.length === 0 && warnings.length === 0) {
    logger.success('All checks passed! Installation is healthy.');
  } else {
    if (issues.length > 0) {
      logger.error(`${issues.length} issue(s) found:`);
      issues.forEach(issue => {
        logger.list([`${issue.name}`]);
        if (options.verbose) {
          logger.dim(`    Fix: ${issue.fix}`);
        }
      });
    }

    if (warnings.length > 0) {
      console.log();
      logger.warn(`${warnings.length} warning(s):`);
      warnings.forEach(warning => {
        logger.list([`${warning.name}`]);
        if (options.verbose) {
          logger.dim(`    Fix: ${warning.fix}`);
        }
      });
    }

    // Auto-fix if requested
    if (options.fix) {
      console.log();
      logger.info('Attempting fixes...');

      for (const warning of warnings) {
        if (warning.autoFix) {
          try {
            await warning.autoFix();
            logger.success(`Fixed: ${warning.name}`);
          } catch (error) {
            logger.error(`Could not fix ${warning.name}: ${error.message}`);
          }
        }
      }

      if (issues.length > 0) {
        console.log();
        logger.info('Some issues require manual intervention:');
        issues.forEach(issue => {
          logger.list([issue.fix]);
        });
      }
    } else if (warnings.some(w => w.autoFix)) {
      console.log();
      logger.info('Run with --fix to automatically fix some issues.');
    }
  }

  // Exit with appropriate code
  process.exit(issues.length > 0 ? 1 : 0);
}
