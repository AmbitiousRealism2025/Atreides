/**
 * File Manager for Muad'Dib CLI
 *
 * Provides safe file operations with backup capability.
 */

import fs from 'fs-extra';
import { dirname, join, basename } from 'path';
import { debug } from '../utils/logger.js';

/**
 * Ensure a directory exists, creating it if necessary
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<void>}
 */
export async function ensureDir(dirPath) {
  await fs.ensureDir(dirPath);
  debug(`Ensured directory: ${dirPath}`);
}

/**
 * Check if a file exists
 * @param {string} filePath - Path to the file
 * @returns {Promise<boolean>}
 */
export async function exists(filePath) {
  return fs.pathExists(filePath);
}

/**
 * Read a file as text
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>}
 */
export async function readFile(filePath) {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * Read a JSON file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<object>}
 */
export async function readJson(filePath) {
  return fs.readJson(filePath);
}

/**
 * Write content to a file, creating directories as needed
 * @param {string} filePath - Path to the file
 * @param {string} content - Content to write
 * @param {object} [options] - Options
 * @param {boolean} [options.backup=false] - Create backup before overwriting
 * @returns {Promise<void>}
 */
export async function writeFile(filePath, content, options = {}) {
  const { backup = false } = options;

  // Ensure parent directory exists
  await ensureDir(dirname(filePath));

  // Create backup if requested and file exists
  if (backup && await exists(filePath)) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copy(filePath, backupPath);
    debug(`Created backup: ${backupPath}`);
  }

  await fs.writeFile(filePath, content, 'utf-8');
  debug(`Wrote file: ${filePath}`);
}

/**
 * Write a JSON file, creating directories as needed
 * @param {string} filePath - Path to the JSON file
 * @param {object} data - Data to write
 * @param {object} [options] - Options
 * @param {boolean} [options.backup=false] - Create backup before overwriting
 * @returns {Promise<void>}
 */
export async function writeJson(filePath, data, options = {}) {
  const { backup = false } = options;

  await ensureDir(dirname(filePath));

  if (backup && await exists(filePath)) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copy(filePath, backupPath);
    debug(`Created backup: ${backupPath}`);
  }

  await fs.writeJson(filePath, data, { spaces: 2 });
  debug(`Wrote JSON: ${filePath}`);
}

/**
 * Copy a file with backup support
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @param {object} [options] - Options
 * @param {boolean} [options.backup=false] - Create backup before overwriting
 * @param {boolean} [options.overwrite=true] - Overwrite existing files
 * @returns {Promise<void>}
 */
export async function copyFile(src, dest, options = {}) {
  const { backup = false, overwrite = true } = options;

  await ensureDir(dirname(dest));

  if (backup && await exists(dest)) {
    const backupPath = `${dest}.backup.${Date.now()}`;
    await fs.copy(dest, backupPath);
    debug(`Created backup: ${backupPath}`);
  }

  await fs.copy(src, dest, { overwrite });
  debug(`Copied: ${src} → ${dest}`);
}

/**
 * Copy a directory recursively with depth and file count limits
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {object} [options] - Options
 * @param {boolean} [options.overwrite=true] - Overwrite existing files
 * @param {number} [options.maxDepth=10] - Maximum directory depth to prevent DoS
 * @param {number} [options.maxFiles=10000] - Maximum file count to prevent DoS
 * @param {number} [options.currentDepth=0] - Current recursion depth (internal)
 * @returns {Promise<void>}
 */
export async function copyDir(src, dest, options = {}) {
  const { overwrite = true, maxDepth = 10, maxFiles = 10000, currentDepth = 0 } = options;

  // Track file count via shared counter (initialized on first call)
  if (!options._fileCount) {
    options._fileCount = { count: 0 };
  }

  // Check depth limit
  if (currentDepth > maxDepth) {
    throw new Error(`Maximum directory depth (${maxDepth}) exceeded`);
  }

  const entries = await fs.readdir(src, { withFileTypes: true });
  await ensureDir(dest);

  for (const entry of entries) {
    // Increment and check file count
    options._fileCount.count++;
    if (options._fileCount.count > maxFiles) {
      throw new Error(`Maximum file count (${maxFiles}) exceeded`);
    }

    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, {
        ...options,
        currentDepth: currentDepth + 1
      });
    } else {
      await fs.copy(srcPath, destPath, { overwrite });
    }
  }

  debug(`Copied directory: ${src} → ${dest}`);
}

/**
 * Remove a file or directory
 * @param {string} path - Path to remove
 * @returns {Promise<void>}
 */
export async function remove(path) {
  await fs.remove(path);
  debug(`Removed: ${path}`);
}

/**
 * Create a symlink
 * @param {string} target - Target path (what the link points to)
 * @param {string} linkPath - Path where the symlink will be created
 * @param {object} [options] - Options
 * @param {boolean} [options.force=false] - Remove existing link/file first
 * @returns {Promise<void>}
 */
export async function symlink(target, linkPath, options = {}) {
  const { force = false } = options;

  await ensureDir(dirname(linkPath));

  // Atomic approach: try to create, handle EEXIST error
  // This eliminates the TOCTOU race condition between check and remove
  try {
    await fs.symlink(target, linkPath);
  } catch (error) {
    if (error.code === 'EEXIST' && force) {
      await remove(linkPath);
      await fs.symlink(target, linkPath);
    } else {
      throw error;
    }
  }
  debug(`Created symlink: ${linkPath} → ${target}`);
}

/**
 * Check if a path is a symlink
 * @param {string} path - Path to check
 * @returns {Promise<boolean>}
 */
export async function isSymlink(path) {
  try {
    const stats = await fs.lstat(path);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Get the target of a symlink
 * @param {string} linkPath - Path to the symlink
 * @returns {Promise<string|null>}
 */
export async function readSymlink(linkPath) {
  try {
    return await fs.readlink(linkPath);
  } catch {
    return null;
  }
}

/**
 * List files in a directory
 * @param {string} dirPath - Path to the directory
 * @param {object} [options] - Options
 * @param {boolean} [options.recursive=false] - List recursively
 * @param {string[]} [options.extensions] - Filter by file extensions
 * @returns {Promise<string[]>}
 */
export async function listFiles(dirPath, options = {}) {
  const { recursive = false, extensions = [] } = options;

  if (!await exists(dirPath)) {
    return [];
  }

  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory() && recursive) {
      const subFiles = await listFiles(fullPath, options);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      if (extensions.length === 0 || extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Get file stats
 * @param {string} filePath - Path to the file
 * @returns {Promise<fs.Stats|null>}
 */
export async function getStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

/**
 * Make a file executable
 * @param {string} filePath - Path to the file
 * @returns {Promise<void>}
 */
export async function makeExecutable(filePath) {
  await fs.chmod(filePath, 0o755);
  debug(`Made executable: ${filePath}`);
}

/**
 * Find backup files for a given file
 * @param {string} filePath - Original file path
 * @returns {Promise<string[]>} List of backup file paths
 */
export async function findBackups(filePath) {
  const dir = dirname(filePath);
  const name = basename(filePath);

  if (!await exists(dir)) {
    return [];
  }

  const entries = await fs.readdir(dir);
  return entries
    .filter(entry => entry.startsWith(`${name}.backup.`))
    .map(entry => join(dir, entry))
    .sort()
    .reverse();
}

/**
 * Restore from the most recent backup
 * @param {string} filePath - File to restore
 * @returns {Promise<boolean>} True if restored, false if no backup found
 */
export async function restoreFromBackup(filePath) {
  const backups = await findBackups(filePath);

  if (backups.length === 0) {
    return false;
  }

  await fs.copy(backups[0], filePath, { overwrite: true });
  debug(`Restored from backup: ${backups[0]}`);
  return true;
}

export default {
  ensureDir,
  exists,
  readFile,
  readJson,
  writeFile,
  writeJson,
  copyFile,
  copyDir,
  remove,
  symlink,
  isSymlink,
  readSymlink,
  listFiles,
  getStats,
  makeExecutable,
  findBackups,
  restoreFromBackup
};
