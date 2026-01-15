/**
 * Path constants and utilities for Muad'Dib CLI
 *
 * Centralizes all path handling for consistent cross-platform behavior.
 */

import { homedir } from 'os';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Root directory of the muaddib-claude package
 */
export const PACKAGE_ROOT = resolve(__dirname, '..', '..');

/**
 * User's home directory
 */
export const HOME_DIR = homedir();

/**
 * Global muaddib installation directory
 */
export const GLOBAL_MUADDIB_DIR = join(HOME_DIR, '.muaddib');

/**
 * Global muaddib bin directory
 */
export const GLOBAL_BIN_DIR = join(GLOBAL_MUADDIB_DIR, 'bin');

/**
 * Global muaddib lib directory
 */
export const GLOBAL_LIB_DIR = join(GLOBAL_MUADDIB_DIR, 'lib');

/**
 * Global templates directory (copied from package)
 */
export const GLOBAL_TEMPLATES_DIR = join(GLOBAL_MUADDIB_DIR, 'templates');

/**
 * Global scripts directory (copied from package)
 */
export const GLOBAL_SCRIPTS_DIR = join(GLOBAL_MUADDIB_DIR, 'scripts');

/**
 * Global skills directory
 */
export const GLOBAL_SKILLS_DIR = join(GLOBAL_MUADDIB_DIR, 'skills');

/**
 * Claude config directory in user's home
 */
export const CLAUDE_CONFIG_DIR = join(HOME_DIR, '.claude');

/**
 * Claude skills directory (for symlinks)
 */
export const CLAUDE_SKILLS_DIR = join(CLAUDE_CONFIG_DIR, 'skills');

/**
 * Package templates directory (source)
 */
export const PACKAGE_TEMPLATES_DIR = join(PACKAGE_ROOT, 'templates');

/**
 * Package scripts directory (source)
 */
export const PACKAGE_SCRIPTS_DIR = join(PACKAGE_ROOT, 'scripts');

/**
 * Package lib/core directory (source)
 */
export const PACKAGE_LIB_CORE_DIR = join(PACKAGE_ROOT, 'lib', 'core');

/**
 * Package skills directory (source)
 */
export const PACKAGE_SKILLS_DIR = join(PACKAGE_ROOT, 'lib', 'skills');

/**
 * Get project-level paths for a given project directory
 * @param {string} [projectDir=process.cwd()] - The project directory
 * @returns {object} Object containing project-specific paths
 */
export function getProjectPaths(projectDir = process.cwd()) {
  return {
    root: projectDir,
    claudeDir: join(projectDir, '.claude'),
    muaddibDir: join(projectDir, '.muaddib'),
    claudeMd: join(projectDir, 'CLAUDE.md'),
    settingsJson: join(projectDir, '.claude', 'settings.json'),
    contextMd: join(projectDir, '.claude', 'context.md'),
    criticalContextMd: join(projectDir, '.claude', 'critical-context.md'),
    checkpointMd: join(projectDir, '.claude', 'checkpoint.md'),
    projectConfig: join(projectDir, '.muaddib', 'config.json'),
    stateDir: join(projectDir, '.muaddib', 'state')
  };
}

/**
 * Check if a path is within the global muaddib directory
 * @param {string} path - Path to check
 * @returns {boolean}
 */
export function isGlobalPath(path) {
  return resolve(path).startsWith(GLOBAL_MUADDIB_DIR);
}

/**
 * Check if a path is within a project's .muaddib directory
 * @param {string} path - Path to check
 * @param {string} [projectDir=process.cwd()] - Project directory
 * @returns {boolean}
 */
export function isProjectPath(path, projectDir = process.cwd()) {
  const paths = getProjectPaths(projectDir);
  const resolved = resolve(path);
  return resolved.startsWith(paths.muaddibDir) || resolved.startsWith(paths.claudeDir);
}

/**
 * Get a relative path from the project root
 * @param {string} fullPath - Full path
 * @param {string} [projectDir=process.cwd()] - Project directory
 * @returns {string} Relative path
 */
export function getRelativePath(fullPath, projectDir = process.cwd()) {
  const resolved = resolve(fullPath);
  const projectResolved = resolve(projectDir);
  if (resolved.startsWith(projectResolved)) {
    return resolved.slice(projectResolved.length + 1);
  }
  return fullPath;
}

export default {
  PACKAGE_ROOT,
  HOME_DIR,
  GLOBAL_MUADDIB_DIR,
  GLOBAL_BIN_DIR,
  GLOBAL_LIB_DIR,
  GLOBAL_TEMPLATES_DIR,
  GLOBAL_SCRIPTS_DIR,
  GLOBAL_SKILLS_DIR,
  CLAUDE_CONFIG_DIR,
  CLAUDE_SKILLS_DIR,
  PACKAGE_TEMPLATES_DIR,
  PACKAGE_SCRIPTS_DIR,
  PACKAGE_LIB_CORE_DIR,
  PACKAGE_SKILLS_DIR,
  getProjectPaths,
  isGlobalPath,
  isProjectPath,
  getRelativePath
};
