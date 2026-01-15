/**
 * Validator for Muad'Dib CLI
 *
 * Validates installations, configurations, and project structure.
 */

import { exists } from './file-manager.js';
import { statSync } from 'fs';

/**
 * Validate script is executable
 * @param {string} scriptPath - Path to script
 * @returns {Promise<boolean>}
 */
export async function isScriptExecutable(scriptPath) {
  if (!await exists(scriptPath)) {
    return false;
  }

  try {
    const stats = statSync(scriptPath);
    // Check if any execute bit is set
    return (stats.mode & 0o111) !== 0;
  } catch {
    return false;
  }
}

export default {
  isScriptExecutable
};
