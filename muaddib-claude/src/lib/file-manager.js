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

export default {
  listFiles,
  getDefaultMaxFiles
};
