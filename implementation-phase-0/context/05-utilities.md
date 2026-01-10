# Context: Utilities (Tasks 5.1 - 5.2)

## Task Group Overview

This context covers implementing utility libraries:
- Task 5.1: Implement config merger
- Task 5.2: Implement file manager

---

## Task 5.1: Config Merger

### Purpose

Merge global Muad'Dib configuration with project-specific overrides, following specific rules for different config types.

### Merging Rules

| Config Type | Merge Strategy |
|-------------|----------------|
| Objects | Deep merge (project values override) |
| Arrays (hooks) | Concatenate (project after global) |
| Arrays (permissions) | Concatenate (project after global) |
| Primitives | Project overrides global |

### Implementation

```javascript
// src/lib/config-merger.js

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { GLOBAL_DIR, PROJECT_MUADDIB_DIR } from '../utils/paths.js';

/**
 * Deep merge two objects
 * @param {Object} target - Base object
 * @param {Object} source - Override object
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (source[key] === null || source[key] === undefined) {
      continue;
    }

    if (Array.isArray(source[key])) {
      // Arrays are concatenated
      result[key] = [
        ...(Array.isArray(target[key]) ? target[key] : []),
        ...source[key]
      ];
    } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // Objects are deep merged
      result[key] = deepMerge(
        typeof target[key] === 'object' ? target[key] : {},
        source[key]
      );
    } else {
      // Primitives are overwritten
      result[key] = source[key];
    }
  }

  return result;
}

/**
 * Load and parse JSON config file
 * @param {string} path - Path to JSON file
 * @returns {Object|null} - Parsed config or null
 */
function loadConfig(path) {
  if (!existsSync(path)) {
    return null;
  }

  try {
    const content = readFileSync(path, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(`Failed to parse config at ${path}: ${error.message}`);
    return null;
  }
}

/**
 * Merge hooks arrays specially (preserve order, dedupe by matcher)
 * @param {Array} globalHooks - Global hook definitions
 * @param {Array} projectHooks - Project hook definitions
 * @returns {Array} - Merged hooks
 */
function mergeHooks(globalHooks = [], projectHooks = []) {
  const result = [...globalHooks];

  for (const projectHook of projectHooks) {
    // Check if project hook overrides a global one by matcher
    const existingIndex = result.findIndex(
      h => h.matcher === projectHook.matcher
    );

    if (existingIndex >= 0 && projectHook.replace) {
      // Replace mode: project hook completely replaces global
      result[existingIndex] = projectHook;
    } else if (existingIndex >= 0) {
      // Merge mode: combine hooks arrays
      result[existingIndex] = {
        ...result[existingIndex],
        hooks: [
          ...(result[existingIndex].hooks || []),
          ...(projectHook.hooks || [])
        ]
      };
    } else {
      // New hook: append
      result.push(projectHook);
    }
  }

  return result;
}

/**
 * Merge permissions arrays (simple concatenation with deduplication)
 * @param {Array} globalPerms - Global permissions
 * @param {Array} projectPerms - Project permissions
 * @returns {Array} - Merged permissions
 */
function mergePermissions(globalPerms = [], projectPerms = []) {
  const combined = [...globalPerms, ...projectPerms];
  return [...new Set(combined)];
}

/**
 * Merge settings.json configurations
 * @param {Object} globalSettings - Global settings
 * @param {Object} projectSettings - Project settings
 * @returns {Object} - Merged settings
 */
export function mergeSettings(globalSettings, projectSettings) {
  if (!projectSettings) return globalSettings;
  if (!globalSettings) return projectSettings;

  return {
    hooks: {
      PreToolUse: mergeHooks(
        globalSettings.hooks?.PreToolUse,
        projectSettings.hooks?.PreToolUse
      ),
      PostToolUse: mergeHooks(
        globalSettings.hooks?.PostToolUse,
        projectSettings.hooks?.PostToolUse
      ),
      SessionStart: mergeHooks(
        globalSettings.hooks?.SessionStart,
        projectSettings.hooks?.SessionStart
      ),
      Stop: mergeHooks(
        globalSettings.hooks?.Stop,
        projectSettings.hooks?.Stop
      ),
      PreCompact: mergeHooks(
        globalSettings.hooks?.PreCompact,
        projectSettings.hooks?.PreCompact
      ),
      CompactComplete: mergeHooks(
        globalSettings.hooks?.CompactComplete,
        projectSettings.hooks?.CompactComplete
      ),
      Notification: mergeHooks(
        globalSettings.hooks?.Notification,
        projectSettings.hooks?.Notification
      ),
      SubagentStop: mergeHooks(
        globalSettings.hooks?.SubagentStop,
        projectSettings.hooks?.SubagentStop
      )
    },
    permissions: {
      allow: mergePermissions(
        globalSettings.permissions?.allow,
        projectSettings.permissions?.allow
      ),
      deny: mergePermissions(
        globalSettings.permissions?.deny,
        projectSettings.permissions?.deny
      )
    }
  };
}

/**
 * Merge Muad'Dib config.json files
 * @param {Object} globalConfig - Global config
 * @param {Object} projectConfig - Project config
 * @returns {Object} - Merged config
 */
export function mergeConfig(globalConfig, projectConfig) {
  return deepMerge(globalConfig || {}, projectConfig || {});
}

/**
 * Load and merge all configuration
 * @param {string} projectDir - Project directory (default: cwd)
 * @returns {Object} - Complete merged configuration
 */
export function loadMergedConfig(projectDir = process.cwd()) {
  const globalConfigPath = join(GLOBAL_DIR, 'config.json');
  const projectConfigPath = join(projectDir, PROJECT_MUADDIB_DIR, 'config.json');

  const globalConfig = loadConfig(globalConfigPath) || {};
  const projectConfig = loadConfig(projectConfigPath) || {};

  return mergeConfig(globalConfig, projectConfig);
}

/**
 * Load and merge settings.json
 * @param {string} projectDir - Project directory (default: cwd)
 * @returns {Object} - Complete merged settings
 */
export function loadMergedSettings(projectDir = process.cwd()) {
  const globalSettingsPath = join(GLOBAL_DIR, 'lib', 'hooks', 'settings-template.json');
  const projectSettingsPath = join(projectDir, '.claude', 'settings.json');

  const globalSettings = loadConfig(globalSettingsPath) || {};
  const projectSettings = loadConfig(projectSettingsPath) || {};

  return mergeSettings(globalSettings, projectSettings);
}
```

---

## Task 5.2: File Manager

### Purpose

Provide safe file operations with backup capability, atomic writes, and cross-platform path handling.

### Implementation

```javascript
// src/lib/file-manager.js

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
  rmSync,
  statSync,
  readdirSync,
  chmodSync
} from 'fs';
import { dirname, join, basename } from 'path';
import { tmpdir } from 'os';

/**
 * Ensure directory exists
 * @param {string} dirPath - Directory path
 */
export function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Create backup of a file
 * @param {string} filePath - Path to file
 * @returns {string|null} - Backup path or null if file doesn't exist
 */
export function createBackup(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const dir = dirname(filePath);
  const name = basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `${name}.backup.${timestamp}`;
  const backupPath = join(dir, backupName);

  copyFileSync(filePath, backupPath);
  return backupPath;
}

/**
 * Write file safely with backup
 * @param {string} filePath - Destination path
 * @param {string} content - File content
 * @param {boolean} force - Overwrite without backup
 * @returns {Object} - { written: boolean, backup?: string }
 */
export async function writeFileSafe(filePath, content, force = false) {
  const result = { written: false, backup: null };

  // Ensure directory exists
  ensureDir(dirname(filePath));

  // Create backup if file exists (unless force)
  if (existsSync(filePath) && !force) {
    result.backup = createBackup(filePath);
  }

  // Atomic write: write to temp file, then rename
  const tempPath = join(tmpdir(), `muaddib-${Date.now()}-${basename(filePath)}`);

  try {
    writeFileSync(tempPath, content, 'utf8');
    copyFileSync(tempPath, filePath);
    rmSync(tempPath);
    result.written = true;
  } catch (error) {
    // Clean up temp file on failure
    if (existsSync(tempPath)) {
      rmSync(tempPath);
    }
    throw error;
  }

  return result;
}

/**
 * Read file with fallback
 * @param {string} filePath - Path to file
 * @param {string} fallback - Fallback value if file doesn't exist
 * @returns {string}
 */
export function readFileSafe(filePath, fallback = '') {
  if (!existsSync(filePath)) {
    return fallback;
  }
  return readFileSync(filePath, 'utf8');
}

/**
 * Copy directory recursively
 * @param {string} src - Source directory
 * @param {string} dest - Destination directory
 * @param {Object} options - { overwrite: boolean }
 */
export function copyDir(src, dest, options = { overwrite: true }) {
  if (!existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }

  ensureDir(dest);

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, options);
    } else {
      if (!existsSync(destPath) || options.overwrite) {
        copyFileSync(srcPath, destPath);
      }
    }
  }
}

/**
 * Make file executable
 * @param {string} filePath - Path to file
 */
export function makeExecutable(filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  chmodSync(filePath, '755');
}

/**
 * Remove directory recursively
 * @param {string} dirPath - Directory path
 * @param {boolean} force - Force removal
 */
export function removeDir(dirPath, force = false) {
  if (!existsSync(dirPath)) {
    return;
  }

  rmSync(dirPath, { recursive: true, force });
}

/**
 * Check if path is a directory
 * @param {string} path - Path to check
 * @returns {boolean}
 */
export function isDirectory(path) {
  if (!existsSync(path)) {
    return false;
  }
  return statSync(path).isDirectory();
}

/**
 * Get file modification time
 * @param {string} filePath - Path to file
 * @returns {Date|null}
 */
export function getModTime(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return statSync(filePath).mtime;
}

/**
 * List files in directory matching pattern
 * @param {string} dirPath - Directory path
 * @param {RegExp} pattern - Filename pattern
 * @returns {string[]} - Array of matching file paths
 */
export function listFiles(dirPath, pattern = /.*/) {
  if (!existsSync(dirPath) || !isDirectory(dirPath)) {
    return [];
  }

  const entries = readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isFile() && pattern.test(entry.name)) {
      files.push(join(dirPath, entry.name));
    }
  }

  return files;
}

/**
 * Clean up backup files older than maxAge
 * @param {string} dirPath - Directory to clean
 * @param {number} maxAgeMs - Maximum age in milliseconds
 * @returns {number} - Number of files removed
 */
export function cleanupBackups(dirPath, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
  const now = Date.now();
  const backupPattern = /\.backup\.\d{4}-\d{2}-\d{2}T/;
  const files = listFiles(dirPath, backupPattern);
  let removed = 0;

  for (const file of files) {
    const modTime = getModTime(file);
    if (modTime && now - modTime.getTime() > maxAgeMs) {
      rmSync(file);
      removed++;
    }
  }

  return removed;
}
```

---

## Utility: Validator

```javascript
// src/lib/validator.js

import { existsSync, statSync, accessSync, constants } from 'fs';
import { join } from 'path';
import {
  GLOBAL_DIR,
  GLOBAL_TEMPLATES,
  GLOBAL_SCRIPTS,
  PROJECT_CLAUDE_DIR,
  PROJECT_CLAUDE_MD
} from '../utils/paths.js';

/**
 * Validation check result
 * @typedef {Object} CheckResult
 * @property {string} name - Check name
 * @property {boolean} passed - Whether check passed
 * @property {string} message - Result message
 * @property {string} [fix] - How to fix if failed
 */

/**
 * Check if global installation is valid
 * @returns {CheckResult[]}
 */
export function validateGlobalInstallation() {
  const checks = [];

  // Check main directory
  checks.push({
    name: 'Global directory',
    passed: existsSync(GLOBAL_DIR),
    message: existsSync(GLOBAL_DIR) ? 'OK' : 'Not found',
    fix: 'Run: muaddib install'
  });

  // Check templates
  checks.push({
    name: 'Templates directory',
    passed: existsSync(GLOBAL_TEMPLATES),
    message: existsSync(GLOBAL_TEMPLATES) ? 'OK' : 'Not found',
    fix: 'Run: muaddib install --force'
  });

  // Check scripts
  const scriptsExist = existsSync(GLOBAL_SCRIPTS);
  checks.push({
    name: 'Scripts directory',
    passed: scriptsExist,
    message: scriptsExist ? 'OK' : 'Not found',
    fix: 'Run: muaddib install --force'
  });

  // Check scripts executable
  if (scriptsExist) {
    const scriptFile = join(GLOBAL_SCRIPTS, 'validate-bash-command.sh');
    let executable = false;
    if (existsSync(scriptFile)) {
      try {
        accessSync(scriptFile, constants.X_OK);
        executable = true;
      } catch {}
    }
    checks.push({
      name: 'Scripts executable',
      passed: executable,
      message: executable ? 'OK' : 'Not executable',
      fix: `chmod +x ${GLOBAL_SCRIPTS}/*.sh`
    });
  }

  return checks;
}

/**
 * Check if project initialization is valid
 * @param {string} projectDir - Project directory
 * @returns {CheckResult[]}
 */
export function validateProjectInstallation(projectDir = process.cwd()) {
  const checks = [];

  // Check CLAUDE.md
  const claudeMd = join(projectDir, PROJECT_CLAUDE_MD);
  checks.push({
    name: 'CLAUDE.md',
    passed: existsSync(claudeMd),
    message: existsSync(claudeMd) ? 'OK' : 'Not found',
    fix: 'Run: muaddib init'
  });

  // Check .claude directory
  const claudeDir = join(projectDir, PROJECT_CLAUDE_DIR);
  checks.push({
    name: '.claude directory',
    passed: existsSync(claudeDir),
    message: existsSync(claudeDir) ? 'OK' : 'Not found',
    fix: 'Run: muaddib init'
  });

  // Check settings.json
  const settings = join(claudeDir, 'settings.json');
  if (existsSync(settings)) {
    try {
      const content = require('fs').readFileSync(settings, 'utf8');
      JSON.parse(content);
      checks.push({
        name: 'settings.json valid',
        passed: true,
        message: 'OK'
      });
    } catch (e) {
      checks.push({
        name: 'settings.json valid',
        passed: false,
        message: 'Invalid JSON',
        fix: 'Run: muaddib init --force'
      });
    }
  }

  return checks;
}

/**
 * Run all validation checks
 * @param {string} projectDir - Project directory
 * @returns {{ global: CheckResult[], project: CheckResult[] }}
 */
export function validateAll(projectDir = process.cwd()) {
  return {
    global: validateGlobalInstallation(),
    project: validateProjectInstallation(projectDir)
  };
}
```

---

## Acceptance Criteria

### Task 5.1 (config-merger)
- [ ] Deep merge works for nested objects
- [ ] Arrays are concatenated, not replaced
- [ ] Hooks merge correctly (by matcher)
- [ ] Permissions deduplicated
- [ ] Handles missing config files gracefully
- [ ] Unit tests pass

### Task 5.2 (file-manager)
- [ ] ensureDir creates nested directories
- [ ] Backups created before overwrites
- [ ] Atomic writes (temp file + rename)
- [ ] copyDir works recursively
- [ ] makeExecutable sets correct permissions
- [ ] Cross-platform paths handled
- [ ] Unit tests pass

---

*Context for Tasks 5.1, 5.2*
