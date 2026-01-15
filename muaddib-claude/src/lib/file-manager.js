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

export default {
  listFiles,
  getDefaultMaxFiles,
  getDefaultMaxBackups,
  rotateBackups,
  cleanupBackups
};
