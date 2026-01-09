/**
 * Update Command
 *
 * Update Muad'Dib global or project components.
 */

import { Command } from 'commander';
import { join } from 'path';
import logger from '../utils/logger.js';
import { confirm } from '../utils/prompts.js';
import {
  GLOBAL_MUADDIB_DIR,
  GLOBAL_TEMPLATES_DIR,
  GLOBAL_SCRIPTS_DIR,
  GLOBAL_LIB_DIR,
  GLOBAL_SKILLS_DIR,
  PACKAGE_TEMPLATES_DIR,
  PACKAGE_SCRIPTS_DIR,
  PACKAGE_LIB_CORE_DIR,
  PACKAGE_SKILLS_DIR,
  getProjectPaths
} from '../utils/paths.js';
import {
  exists,
  copyDir,
  listFiles,
  makeExecutable,
  readJson,
  writeFile
} from '../lib/file-manager.js';
import { renderTemplate, getDefaultData } from '../lib/template-engine.js';

/**
 * Create the update command
 * @returns {Command}
 */
export function updateCommand() {
  const cmd = new Command('update');

  cmd
    .description("Update Muad'Dib components")
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
        logger.error(`Update failed: ${error.message}`);
        logger.debug(error.stack);
        process.exit(1);
      }
    });

  return cmd;
}

/**
 * Update global components
 * @param {object} options - Command options
 */
async function updateGlobal(options) {
  logger.title("Muad'Dib Global Update");

  if (!await exists(GLOBAL_MUADDIB_DIR)) {
    logger.error("Muad'Dib is not installed.");
    logger.info('Run: muaddib install');
    process.exit(1);
  }

  // Create backup if requested
  if (options.backup !== false) {
    const backupDir = `${GLOBAL_MUADDIB_DIR}.backup.${Date.now()}`;
    logger.info(`Creating backup: ${backupDir}`);
    await copyDir(GLOBAL_MUADDIB_DIR, backupDir);
    logger.success('Backup created');
  }

  logger.info('Updating global components...');

  // Update templates
  if (await exists(PACKAGE_TEMPLATES_DIR)) {
    await copyDir(PACKAGE_TEMPLATES_DIR, GLOBAL_TEMPLATES_DIR, { overwrite: true });
    logger.success('Updated templates');
  }

  // Update scripts
  if (await exists(PACKAGE_SCRIPTS_DIR)) {
    await copyDir(PACKAGE_SCRIPTS_DIR, GLOBAL_SCRIPTS_DIR, { overwrite: true });

    // Make scripts executable
    const scriptFiles = await listFiles(GLOBAL_SCRIPTS_DIR, { extensions: ['.sh'] });
    for (const scriptFile of scriptFiles) {
      await makeExecutable(scriptFile);
    }
    logger.success('Updated scripts');
  }

  // Update lib/core
  if (await exists(PACKAGE_LIB_CORE_DIR)) {
    await copyDir(PACKAGE_LIB_CORE_DIR, join(GLOBAL_LIB_DIR, 'core'), { overwrite: true });
    logger.success('Updated lib/core');
  }

  // Update skills
  if (await exists(PACKAGE_SKILLS_DIR)) {
    await copyDir(PACKAGE_SKILLS_DIR, GLOBAL_SKILLS_DIR, { overwrite: true });
    logger.success('Updated skills');
  }

  console.log();
  logger.success('Global update complete!');
}

/**
 * Merge hook arrays, deduplicating by matcher and command
 * @param {Array} existing - Existing hook entries
 * @param {Array} newHooks - New hook entries to merge
 * @returns {Array} Merged hook array
 */
function mergeHookArrays(existing, newHooks) {
  const result = [...existing];

  for (const newHook of newHooks) {
    // Check if this hook already exists (by matcher + command signature)
    const hookSignature = getHookSignature(newHook);
    const isDuplicate = result.some(h => getHookSignature(h) === hookSignature);

    if (!isDuplicate) {
      result.push(newHook);
    }
  }

  return result;
}

/**
 * Generate a signature for a hook entry for deduplication
 * @param {object} hook - Hook configuration
 * @returns {string} Signature string
 */
function getHookSignature(hook) {
  if (hook.matcher && hook.hooks) {
    // PreToolUse/PostToolUse style: { matcher, hooks: [{type, command}] }
    const commands = hook.hooks.map(h => h.command || h.type).join('|');
    return `${hook.matcher}:${commands}`;
  } else if (hook.type && hook.command) {
    // Simple hook style: { type, command }
    return `${hook.type}:${hook.command}`;
  }
  // Fallback to JSON
  return JSON.stringify(hook);
}

/**
 * Deep merge settings with smart hook/permission handling
 * - New hook types are added
 * - New entries within existing hook types are merged with deduplication
 * - Existing hook customizations are preserved
 * - Permissions are merged with deduplication
 * @param {object} newSettings - New settings from template
 * @param {object} existingSettings - User's existing settings
 * @returns {object} Merged settings
 */
function deepMergeSettings(newSettings, existingSettings) {
  const merged = { ...existingSettings };

  // Merge hooks: add new hook types AND merge entries within existing types
  if (newSettings.hooks) {
    merged.hooks = merged.hooks || {};
    for (const [hookType, hookConfig] of Object.entries(newSettings.hooks)) {
      if (!merged.hooks[hookType]) {
        // New hook type - add it
        merged.hooks[hookType] = hookConfig;
      } else if (Array.isArray(hookConfig) && Array.isArray(merged.hooks[hookType])) {
        // Merge hook arrays, deduplicating by command string
        merged.hooks[hookType] = mergeHookArrays(merged.hooks[hookType], hookConfig);
      }
      // If hook type exists but isn't an array, keep user's customization
    }
  }

  // Merge permissions: combine arrays with deduplication
  if (newSettings.permissions) {
    merged.permissions = merged.permissions || {};

    // Merge allow list
    if (newSettings.permissions.allow) {
      const existingAllow = merged.permissions.allow || [];
      const newAllow = newSettings.permissions.allow.filter(
        p => !existingAllow.includes(p)
      );
      merged.permissions.allow = [...existingAllow, ...newAllow];
    }

    // Merge deny list
    if (newSettings.permissions.deny) {
      const existingDeny = merged.permissions.deny || [];
      const newDeny = newSettings.permissions.deny.filter(
        p => !existingDeny.includes(p)
      );
      merged.permissions.deny = [...existingDeny, ...newDeny];
    }
  }

  return merged;
}

/**
 * Update project files
 * @param {object} options - Command options
 */
async function updateProject(options) {
  const paths = getProjectPaths();

  logger.title("Muad'Dib Project Update");

  if (!await exists(paths.claudeDir)) {
    logger.error("No Muad'Dib project found in current directory.");
    logger.info('Run: muaddib init');
    process.exit(1);
  }

  // Confirm update
  const proceed = await confirm(
    'This will update project files. Continue?',
    true
  );

  if (!proceed) {
    logger.info('Update cancelled.');
    return;
  }

  // Load existing project config
  let projectConfig = {};
  if (await exists(paths.projectConfig)) {
    try {
      projectConfig = await readJson(paths.projectConfig);
    } catch {
      logger.warn('Could not read project config, using defaults');
    }
  }

  // Prepare template data
  const templateData = {
    ...getDefaultData(),
    ...projectConfig,
    updated: new Date().toISOString()
  };

  logger.info('Updating project files...');

  // Update settings.json (preserving custom settings)
  if (await exists(paths.settingsJson)) {
    try {
      const existingSettings = await readJson(paths.settingsJson);
      const newSettings = await renderTemplate('settings.json', templateData);
      const newSettingsObj = JSON.parse(newSettings);

      // Deep merge settings: new values fill gaps, existing customizations preserved
      const mergedSettings = deepMergeSettings(newSettingsObj, existingSettings);

      await writeFile(paths.settingsJson, JSON.stringify(mergedSettings, null, 2), { backup: options.backup !== false });
      logger.success('Updated: .claude/settings.json');
    } catch (error) {
      logger.warn(`Could not update settings.json: ${error.message}`);
    }
  }

  // Update context.md if empty or minimal
  if (await exists(paths.contextMd)) {
    // Don't overwrite user's context
    logger.dim('Skipped: .claude/context.md (preserving user content)');
  }

  // Update project config version
  if (await exists(paths.projectConfig)) {
    try {
      projectConfig.updated = new Date().toISOString();
      await writeFile(paths.projectConfig, JSON.stringify(projectConfig, null, 2), { backup: options.backup !== false });
      logger.success('Updated: .muaddib/config.json');
    } catch (error) {
      logger.warn(`Could not update config: ${error.message}`);
    }
  }

  console.log();
  logger.success('Project update complete!');
  console.log();
  logger.info('Note: CLAUDE.md and context files were not modified to preserve your customizations.');
  logger.info('To regenerate, run: muaddib init --force');
}

// Export for testing
export { deepMergeSettings };
