# File Manager API Reference

> **Module**: `src/lib/file-manager.js`
> **Version**: 1.0.0
> **Last Updated**: 2026-01-15

The file-manager module provides safe file operations with backup capability, DoS protection, and consistent error handling.

---

## Table of Contents

- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [listFiles()](#listfiles) ⚠️ **Important API Change**
  - [Basic Operations](#basic-operations)
  - [Directory Operations](#directory-operations)
  - [Backup Operations](#backup-operations)
  - [Symlink Operations](#symlink-operations)
  - [Asset Synchronization](#asset-synchronization)
- [Migration Guide](#migration-guide)
- [Error Handling](#error-handling)
- [Security Features](#security-features)

---

## Quick Start

```javascript
import {
  listFiles,
  readFile,
  writeFile,
  copyDir,
  ensureDir
} from '../lib/file-manager.js';

// List files with the NEW return format (v1.0+)
const { files, limitReached } = await listFiles('/path/to/dir', {
  extensions: ['.js', '.ts'],
  recursive: true
});

// Process files
for (const file of files) {
  const content = await readFile(file);
  // ...
}
```

---

## API Reference

### listFiles()

Lists files in a directory with optional filtering and pagination limits.

```typescript
async function listFiles(
  dirPath: string,
  options?: {
    recursive?: boolean;      // Default: false
    extensions?: string[];    // Default: [] (all files)
    maxFiles?: number;        // Default: 10000
  }
): Promise<{ files: string[], limitReached: boolean }>
```

#### ⚠️ IMPORTANT: Return Type Change (v1.0)

**This function returns an OBJECT, not an array.**

The return type is `{ files: string[], limitReached: boolean }`, NOT `string[]`.

#### Correct Usage

```javascript
// ✅ CORRECT - Destructure the result
const { files, limitReached } = await listFiles(dir, { extensions: ['.sh'] });
for (const file of files) {
  console.log(file);
}

// ✅ CORRECT - Access .files property
const result = await listFiles(dir);
console.log(`Found ${result.files.length} files`);
if (result.limitReached) {
  console.warn('Results may be incomplete');
}
```

#### Incorrect Usage (Common Mistake)

```javascript
// ❌ WRONG - Will cause "TypeError: scriptFiles is not iterable"
const scriptFiles = await listFiles(dir, { extensions: ['.sh'] });
for (const file of scriptFiles) {  // ERROR!
  console.log(file);
}

// ❌ WRONG - Will fail silently or error
const files = await listFiles(dir);
files.forEach(f => console.log(f));  // ERROR!
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `dirPath` | `string` | (required) | Directory path to list files from |
| `options.recursive` | `boolean` | `false` | Whether to list files recursively |
| `options.extensions` | `string[]` | `[]` | File extensions to filter (e.g., `['.js', '.ts']`) |
| `options.maxFiles` | `number` | `10000` | Maximum number of files to return |

#### Return Value

| Property | Type | Description |
|----------|------|-------------|
| `files` | `string[]` | Array of absolute file paths |
| `limitReached` | `boolean` | `true` if maxFiles limit was hit |

#### Examples

```javascript
// List all JavaScript files recursively
const { files } = await listFiles('./src', {
  extensions: ['.js'],
  recursive: true
});

// List with limit check
const { files, limitReached } = await listFiles('./logs', { maxFiles: 100 });
if (limitReached) {
  console.warn('Large directory - results truncated');
}

// List shell scripts (common pattern)
const { files: scripts } = await listFiles(SCRIPTS_DIR, {
  extensions: ['.sh']
});
for (const script of scripts) {
  await makeExecutable(script);
}
```

---

### Basic Operations

#### exists()

Check if a file or directory exists.

```javascript
const fileExists = await exists('/path/to/file.js');
```

#### readFile()

Read a file as UTF-8 text.

```javascript
const content = await readFile('/path/to/file.js');
```

#### readJson()

Read and parse a JSON file.

```javascript
const config = await readJson('/path/to/config.json');
```

#### writeFile()

Write content to a file with optional backup.

```javascript
await writeFile('/path/to/file.js', content, { backup: true });
```

#### writeJson()

Write an object as formatted JSON.

```javascript
await writeJson('/path/to/config.json', { key: 'value' }, { backup: true });
```

#### remove()

Remove a file or directory.

```javascript
await remove('/path/to/file-or-dir');
```

---

### Directory Operations

#### ensureDir()

Ensure a directory exists, creating it if necessary.

```javascript
await ensureDir('/path/to/new/directory');
```

#### copyDir()

Copy a directory recursively with DoS protection.

```javascript
await copyDir(srcDir, destDir, {
  overwrite: true,
  maxDepth: 10,    // Prevent deep recursion attacks
  maxFiles: 10000  // Prevent large directory attacks
});
```

#### copyFile()

Copy a single file with optional backup.

```javascript
await copyFile(src, dest, { backup: true, overwrite: true });
```

---

### Backup Operations

#### findBackups()

Find backup files in a directory.

```javascript
const backups = await findBackups('/path/to/dir', 'config');
// Returns: ['/path/to/dir/config.json.backup.1234567890']
```

#### restoreFromBackup()

Restore a file from its most recent backup.

```javascript
const restored = await restoreFromBackup('/path/to/file.json');
if (restored) {
  console.log('File restored from backup');
}
```

#### rotateBackups()

Keep only the N most recent backups.

```javascript
const { kept, deleted, errors } = await rotateBackups('/path/to/dir', {
  maxBackups: 5,
  pattern: 'config',
  dryRun: false
});
```

#### cleanupBackups()

Remove backups older than a specified age.

```javascript
const { deleted, retained, errors } = await cleanupBackups('/path/to/dir', {
  maxAgeDays: 30,
  dryRun: true  // Preview only
});
```

---

### Symlink Operations

#### symlink()

Create a symbolic link with atomic error handling.

```javascript
await symlink('/target/path', '/link/path', { force: true });
```

#### isSymlink()

Check if a path is a symbolic link.

```javascript
const isLink = await isSymlink('/path/to/check');
```

#### readSymlink()

Get the target of a symbolic link.

```javascript
const target = await readSymlink('/path/to/link');
```

---

### Asset Synchronization

#### syncPackageAssets()

Synchronize package assets to global directory.

```javascript
const { synced, skipped, errors } = await syncPackageAssets({
  templates: true,
  scripts: true,
  lib: true,
  skills: true,
  force: false
}, paths);
```

---

## Migration Guide

### From Pre-1.0 listFiles() Usage

If you're updating code that used `listFiles()` before version 1.0, you need to update the call sites to destructure the result.

#### Before (Pre-1.0)

```javascript
// Old code - listFiles returned string[]
const files = await listFiles(dir, { extensions: ['.sh'] });
for (const file of files) {
  await process(file);
}
```

#### After (1.0+)

```javascript
// New code - listFiles returns { files, limitReached }
const { files } = await listFiles(dir, { extensions: ['.sh'] });
for (const file of files) {
  await process(file);
}
```

#### Search Pattern for Affected Code

Use this grep pattern to find potentially affected code:

```bash
grep -rn "= await listFiles" --include="*.js" src/
```

Look for any usage where the result is NOT destructured.

---

## Error Handling

All functions throw standard Node.js errors with helpful messages:

```javascript
try {
  const { files } = await listFiles('/nonexistent');
} catch (err) {
  if (err.message.includes('Directory does not exist')) {
    console.log('Directory not found');
  }
}
```

### Common Error Codes

| Error | Cause | Solution |
|-------|-------|----------|
| `ENOENT` | File/directory doesn't exist | Check path or create first |
| `EACCES` | Permission denied | Check file permissions |
| `Maximum directory depth exceeded` | copyDir depth limit hit | Increase maxDepth or review source |
| `Maximum file count exceeded` | listFiles/copyDir limit hit | Increase maxFiles or filter by extension |

---

## Security Features

### DoS Protection

Both `listFiles()` and `copyDir()` include limits to prevent denial-of-service attacks:

- **maxFiles**: Limits total files processed (default: 10,000)
- **maxDepth**: Limits directory recursion depth (default: 10)

### Atomic Operations

Symlink creation uses atomic error handling to prevent TOCTOU race conditions:

```javascript
// Safe - uses try/catch instead of check-then-remove
await symlink(target, link, { force: true });
```

### Backup Safety

Write operations support automatic backups:

```javascript
await writeFile(path, content, { backup: true });
// Creates: path.backup.{timestamp} before overwriting
```

---

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_MAX_FILES` | `10000` | Default file listing limit |
| `DEFAULT_MAX_BACKUPS` | `5` | Default backup retention count |
| `BACKUP_PATTERN` | RegExp | Pattern matching backup file extensions |

---

*Documentation generated 2026-01-15*
