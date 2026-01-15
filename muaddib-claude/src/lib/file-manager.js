/**
 * File Manager Module
 *
 * Core file operations for Muad'Dib CLI including listing, copying,
 * backup rotation, and asset synchronization.
 *
 * @module file-manager
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Default maximum number of files to return from listFiles
 * @type {number}
 */
const DEFAULT_MAX_FILES = 10000;

/**
 * Check if a file or directory exists
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>}
 */
export async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read and parse a JSON file
 * @param {string} filePath - Path to JSON file
 * @returns {Promise<object>} Parsed JSON content
 */
export async function readJson(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

/**
 * Check if a path is a symbolic link
 * @param {string} linkPath - Path to check
 * @returns {Promise<boolean>}
 */
export async function isSymlink(linkPath) {
  try {
    const stats = await fs.lstat(linkPath);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}

/**
 * Read the target of a symbolic link
 * @param {string} linkPath - Path to symlink
 * @returns {Promise<string>} Target path
 */
export async function readSymlink(linkPath) {
  return fs.readlink(linkPath);
}

/**
 * Make a file executable (chmod +x)
 * @param {string} filePath - Path to file
 * @returns {Promise<void>}
 */
export async function makeExecutable(filePath) {
  const stats = await fs.stat(filePath);
  // Add execute permission for owner, group, and others
  const newMode = stats.mode | 0o111;
  await fs.chmod(filePath, newMode);
}

/**
 * Find backup files for a given file
 * @param {string} dirPath - Directory to search
 * @param {string} [pattern] - Optional filename pattern to match
 * @returns {Promise<string[]>} Array of backup file paths
 */
export async function findBackups(dirPath, pattern = null) {
  const backups = [];

  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      return backups;
    }
  } catch {
    return backups;
  }

  const BACKUP_PATTERN_LOCAL = /\.(bak|backup|orig|\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})$/i;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!BACKUP_PATTERN_LOCAL.test(entry.name)) continue;

      if (pattern) {
        const baseName = entry.name.replace(BACKUP_PATTERN_LOCAL, '');
        if (!baseName.includes(pattern)) continue;
      }

      backups.push(path.join(dirPath, entry.name));
    }
  } catch {
    // Ignore errors
  }

  return backups;
}

/**
 * Default maximum number of backups to retain
 * @type {number}
 */
const DEFAULT_MAX_BACKUPS = 5;

/**
 * Backup file extension patterns to recognize
 * @type {RegExp}
 */
const BACKUP_PATTERN = /\.(bak|backup|orig|\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})$/i;

/**
 * List files in a directory with optional filtering and limits.
 *
 * @param {string} dirPath - Directory path to list files from
 * @param {Object} options - Listing options
 * @param {boolean} [options.recursive=false] - Whether to list files recursively
 * @param {string[]} [options.extensions=[]] - File extensions to filter by (e.g., ['.js', '.ts'])
 * @param {number} [options.maxFiles=10000] - Maximum number of files to return (prevents OOM on large dirs)
 * @returns {Promise<{files: string[], limitReached: boolean}>} Object containing file paths and limit status
 *
 * @example
 * // List all JS files in src directory
 * const result = await listFiles('./src', {
 *   recursive: true,
 *   extensions: ['.js'],
 *   maxFiles: 5000
 * });
 * if (result.limitReached) {
 *   console.warn('File limit reached, results may be incomplete');
 * }
 */
export async function listFiles(dirPath, options = {}) {
  const {
    recursive = false,
    extensions = [],
    maxFiles = DEFAULT_MAX_FILES
  } = options;

  // Validate maxFiles parameter
  if (typeof maxFiles !== 'number' || maxFiles < 1) {
    throw new Error(`maxFiles must be a positive number, got: ${maxFiles}`);
  }

  const files = [];
  let limitReached = false;

  /**
   * Internal recursive function to collect files
   * @param {string} currentPath - Current directory being processed
   * @returns {Promise<void>}
   */
  async function collectFiles(currentPath) {
    // Early return if limit already reached
    if (files.length >= maxFiles) {
      limitReached = true;
      return;
    }

    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (err) {
      // Skip directories we can't read (permission errors, etc.)
      if (err.code === 'EACCES' || err.code === 'EPERM') {
        return;
      }
      throw err;
    }

    for (const entry of entries) {
      // Check limit before processing each entry
      if (files.length >= maxFiles) {
        limitReached = true;
        return;
      }

      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (recursive) {
          await collectFiles(fullPath);
        }
      } else if (entry.isFile()) {
        // Filter by extensions if specified
        if (extensions.length > 0) {
          const ext = path.extname(entry.name).toLowerCase();
          if (!extensions.includes(ext)) {
            continue;
          }
        }

        files.push(fullPath);

        // Check if we've hit the limit after adding
        if (files.length >= maxFiles) {
          limitReached = true;
          return;
        }
      }
    }
  }

  // Verify directory exists
  try {
    const stat = await fs.stat(dirPath);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${dirPath}`);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      throw new Error(`Directory does not exist: ${dirPath}`);
    }
    throw err;
  }

  await collectFiles(dirPath);

  // Log warning when limit is reached
  if (limitReached) {
    console.warn(
      `[file-manager] Warning: maxFiles limit (${maxFiles}) reached while listing ${dirPath}. ` +
      `Results may be incomplete. Consider increasing maxFiles or filtering by extension.`
    );
  }

  return { files, limitReached };
}

/**
 * Get the default max files limit
 * @returns {number} The default maximum files limit
 */
export function getDefaultMaxFiles() {
  return DEFAULT_MAX_FILES;
}

/**
 * Get the default max backups limit
 * @returns {number} The default maximum backups to retain
 */
export function getDefaultMaxBackups() {
  return DEFAULT_MAX_BACKUPS;
}

/**
 * Rotate backup files in a directory, keeping only the most recent N backups.
 * Backups are identified by common extensions (.bak, .backup, .orig) or
 * ISO timestamp patterns (e.g., .2024-01-15T10-30-00).
 *
 * @param {string} backupDir - Directory containing backup files
 * @param {Object} options - Rotation options
 * @param {number} [options.maxBackups=5] - Maximum number of backups to retain
 * @param {string} [options.pattern] - Optional filename pattern to match (e.g., 'settings.json')
 * @param {boolean} [options.dryRun=false] - If true, only report what would be deleted
 * @returns {Promise<{kept: string[], deleted: string[], errors: string[]}>} Rotation results
 *
 * @example
 * // Rotate backups, keeping last 3
 * const result = await rotateBackups('./backups', {
 *   maxBackups: 3,
 *   pattern: 'settings.json'
 * });
 * console.log(`Kept ${result.kept.length}, deleted ${result.deleted.length}`);
 */
export async function rotateBackups(backupDir, options = {}) {
  const {
    maxBackups = DEFAULT_MAX_BACKUPS,
    pattern = null,
    dryRun = false
  } = options;

  // Validate maxBackups parameter
  if (typeof maxBackups !== 'number' || maxBackups < 0) {
    throw new Error(`maxBackups must be a non-negative number, got: ${maxBackups}`);
  }

  const kept = [];
  const deleted = [];
  const errors = [];

  // Verify directory exists
  try {
    const stat = await fs.stat(backupDir);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${backupDir}`);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      // No backup directory means nothing to rotate
      return { kept, deleted, errors };
    }
    throw err;
  }

  // Read all entries in the directory
  let entries;
  try {
    entries = await fs.readdir(backupDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      errors.push(`Permission denied reading directory: ${backupDir}`);
      return { kept, deleted, errors };
    }
    throw err;
  }

  // Filter to backup files only
  const backupFiles = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;

    // Check if it matches the backup pattern
    if (!BACKUP_PATTERN.test(entry.name)) continue;

    // If a pattern is specified, check if the base name matches
    if (pattern) {
      const baseName = entry.name.replace(BACKUP_PATTERN, '');
      if (!baseName.includes(pattern)) continue;
    }

    const fullPath = path.join(backupDir, entry.name);

    try {
      const stat = await fs.stat(fullPath);
      backupFiles.push({
        name: entry.name,
        path: fullPath,
        mtime: stat.mtime.getTime()
      });
    } catch (err) {
      errors.push(`Could not stat file: ${fullPath}`);
    }
  }

  // Sort by modification time, newest first
  backupFiles.sort((a, b) => b.mtime - a.mtime);

  // Keep the newest maxBackups, delete the rest
  for (let i = 0; i < backupFiles.length; i++) {
    const backup = backupFiles[i];

    if (i < maxBackups) {
      kept.push(backup.path);
    } else {
      if (dryRun) {
        deleted.push(backup.path);
      } else {
        try {
          await fs.unlink(backup.path);
          deleted.push(backup.path);
        } catch (err) {
          errors.push(`Failed to delete: ${backup.path} (${err.message})`);
        }
      }
    }
  }

  return { kept, deleted, errors };
}

/**
 * Clean up all backup files in a directory, optionally older than a specified age.
 * This is a more aggressive cleanup than rotateBackups.
 *
 * @param {string} backupDir - Directory containing backup files
 * @param {Object} options - Cleanup options
 * @param {number} [options.maxAgeDays=30] - Maximum age in days for backups (0 = delete all)
 * @param {string} [options.pattern] - Optional filename pattern to match
 * @param {boolean} [options.dryRun=false] - If true, only report what would be deleted
 * @returns {Promise<{deleted: string[], retained: string[], errors: string[]}>} Cleanup results
 *
 * @example
 * // Delete all backups older than 7 days
 * const result = await cleanupBackups('./backups', {
 *   maxAgeDays: 7
 * });
 * console.log(`Cleaned up ${result.deleted.length} old backups`);
 */
export async function cleanupBackups(backupDir, options = {}) {
  const {
    maxAgeDays = 30,
    pattern = null,
    dryRun = false
  } = options;

  // Validate maxAgeDays parameter
  if (typeof maxAgeDays !== 'number' || maxAgeDays < 0) {
    throw new Error(`maxAgeDays must be a non-negative number, got: ${maxAgeDays}`);
  }

  const deleted = [];
  const retained = [];
  const errors = [];

  // Verify directory exists
  try {
    const stat = await fs.stat(backupDir);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${backupDir}`);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      // No backup directory means nothing to clean
      return { deleted, retained, errors };
    }
    throw err;
  }

  // Read all entries in the directory
  let entries;
  try {
    entries = await fs.readdir(backupDir, { withFileTypes: true });
  } catch (err) {
    if (err.code === 'EACCES' || err.code === 'EPERM') {
      errors.push(`Permission denied reading directory: ${backupDir}`);
      return { deleted, retained, errors };
    }
    throw err;
  }

  const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);

  for (const entry of entries) {
    if (!entry.isFile()) continue;

    // Check if it matches the backup pattern
    if (!BACKUP_PATTERN.test(entry.name)) continue;

    // If a pattern is specified, check if the base name matches
    if (pattern) {
      const baseName = entry.name.replace(BACKUP_PATTERN, '');
      if (!baseName.includes(pattern)) continue;
    }

    const fullPath = path.join(backupDir, entry.name);

    try {
      const stat = await fs.stat(fullPath);
      const fileTime = stat.mtime.getTime();

      // Delete if older than cutoff (or if maxAgeDays is 0, delete all)
      if (maxAgeDays === 0 || fileTime < cutoffTime) {
        if (dryRun) {
          deleted.push(fullPath);
        } else {
          try {
            await fs.unlink(fullPath);
            deleted.push(fullPath);
          } catch (unlinkErr) {
            errors.push(`Failed to delete: ${fullPath} (${unlinkErr.message})`);
          }
        }
      } else {
        retained.push(fullPath);
      }
    } catch (err) {
      errors.push(`Could not stat file: ${fullPath}`);
    }
  }

  return { deleted, retained, errors };
}

/**
 * MED-11: Synchronize package assets (templates, scripts, lib, skills) to global directory.
 * This shared function is used by install.js and update.js to ensure consistent behavior.
 *
 * @param {Object} options - Sync options
 * @param {boolean} [options.templates=true] - Sync templates directory
 * @param {boolean} [options.scripts=true] - Sync scripts directory
 * @param {boolean} [options.lib=true] - Sync lib/core directory
 * @param {boolean} [options.skills=true] - Sync skills directory
 * @param {boolean} [options.force=false] - Force overwrite even if destination exists
 * @param {Object} paths - Path configuration (from paths.js)
 * @param {string} paths.PACKAGE_TEMPLATES_DIR - Source templates directory
 * @param {string} paths.PACKAGE_SCRIPTS_DIR - Source scripts directory
 * @param {string} paths.PACKAGE_LIB_CORE_DIR - Source lib/core directory
 * @param {string} paths.PACKAGE_SKILLS_DIR - Source skills directory
 * @param {string} paths.GLOBAL_TEMPLATES_DIR - Destination templates directory
 * @param {string} paths.GLOBAL_SCRIPTS_DIR - Destination scripts directory
 * @param {string} paths.GLOBAL_LIB_DIR - Destination lib directory
 * @param {string} paths.GLOBAL_SKILLS_DIR - Destination skills directory
 * @returns {Promise<{synced: string[], skipped: string[], errors: string[]}>} Sync results
 *
 * @example
 * import { syncPackageAssets } from '../lib/file-manager.js';
 * import * as paths from '../utils/paths.js';
 *
 * const result = await syncPackageAssets({
 *   templates: true,
 *   scripts: true,
 *   force: false
 * }, paths);
 * console.log(`Synced: ${result.synced.length} items`);
 */
export async function syncPackageAssets(options = {}, paths) {
  const {
    templates = true,
    scripts = true,
    lib = true,
    skills = true,
    force = false
  } = options;

  const synced = [];
  const skipped = [];
  const errors = [];

  // Validate paths object
  if (!paths) {
    throw new Error('paths configuration is required for syncPackageAssets');
  }

  /**
   * Sync a single directory from source to destination
   * @param {string} srcDir - Source directory
   * @param {string} destDir - Destination directory
   * @param {string} name - Human-readable name for logging
   * @param {boolean} [makeScriptsExecutable=false] - Whether to make .sh files executable
   */
  async function syncDirectory(srcDir, destDir, name, makeScriptsExecutable = false) {
    // Check if source exists
    const srcExists = await exists(srcDir);
    if (!srcExists) {
      skipped.push(`${name}: source not found (${srcDir})`);
      return;
    }

    // Check if destination exists and force is false
    const destExists = await exists(destDir);
    if (destExists && !force) {
      skipped.push(`${name}: already exists (use force to overwrite)`);
      return;
    }

    try {
      // Copy directory recursively
      await fs.copy(srcDir, destDir, { overwrite: force });
      synced.push(`${name}: ${srcDir} -> ${destDir}`);

      // Make shell scripts executable if requested
      if (makeScriptsExecutable) {
        try {
          const entries = await fs.readdir(destDir, { withFileTypes: true });
          for (const entry of entries) {
            if (entry.isFile() && entry.name.endsWith('.sh')) {
              const scriptPath = path.join(destDir, entry.name);
              await makeExecutable(scriptPath);
            }
          }
        } catch (execErr) {
          errors.push(`${name}: failed to make scripts executable: ${execErr.message}`);
        }
      }
    } catch (copyErr) {
      errors.push(`${name}: copy failed: ${copyErr.message}`);
    }
  }

  // Sync each asset type if enabled
  if (templates) {
    await syncDirectory(
      paths.PACKAGE_TEMPLATES_DIR,
      paths.GLOBAL_TEMPLATES_DIR,
      'templates'
    );
  }

  if (scripts) {
    await syncDirectory(
      paths.PACKAGE_SCRIPTS_DIR,
      paths.GLOBAL_SCRIPTS_DIR,
      'scripts',
      true // Make .sh files executable
    );
  }

  if (lib) {
    await syncDirectory(
      paths.PACKAGE_LIB_CORE_DIR,
      paths.GLOBAL_LIB_DIR,
      'lib'
    );
  }

  if (skills) {
    await syncDirectory(
      paths.PACKAGE_SKILLS_DIR,
      paths.GLOBAL_SKILLS_DIR,
      'skills'
    );
  }

  return { synced, skipped, errors };
}

export default {
  exists,
  readJson,
  isSymlink,
  readSymlink,
  makeExecutable,
  findBackups,
  listFiles,
  getDefaultMaxFiles,
  getDefaultMaxBackups,
  rotateBackups,
  cleanupBackups,
  syncPackageAssets
};
