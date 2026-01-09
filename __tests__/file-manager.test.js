/**
 * File Manager Tests
 *
 * Tests filesystem operations with backup capability.
 * Uses real temp directory for reliable testing.
 */

import { jest } from '@jest/globals';
import { join } from 'path';
import { tmpdir } from 'os';
import fs from 'fs-extra';
import {
  writeFile,
  readFile,
  writeJson,
  readJson,
  exists,
  ensureDir,
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
} from '../src/lib/file-manager.js';

// Test directory setup
const TEST_BASE = join(tmpdir(), 'muaddib-file-manager-test');
let testDir;

/**
 * Create a unique test directory for each test
 */
function createTestDir() {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  return join(TEST_BASE, uniqueId);
}

/**
 * Small delay to ensure unique timestamps for backups
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

beforeAll(async () => {
  // Ensure base test directory exists
  await fs.ensureDir(TEST_BASE);
});

beforeEach(async () => {
  testDir = createTestDir();
  await fs.ensureDir(testDir);
});

afterEach(async () => {
  // Clean up test directory
  if (testDir && await fs.pathExists(testDir)) {
    await fs.remove(testDir);
  }
});

afterAll(async () => {
  // Clean up base test directory
  if (await fs.pathExists(TEST_BASE)) {
    await fs.remove(TEST_BASE);
  }
});

describe('File Manager', () => {
  describe('exists', () => {
    it('should return true for existing file', async () => {
      const filePath = join(testDir, 'existing.txt');
      await fs.writeFile(filePath, 'content');

      const result = await exists(filePath);

      expect(result).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const filePath = join(testDir, 'nonexistent.txt');

      const result = await exists(filePath);

      expect(result).toBe(false);
    });

    it('should return true for existing directory', async () => {
      const dirPath = join(testDir, 'subdir');
      await fs.ensureDir(dirPath);

      const result = await exists(dirPath);

      expect(result).toBe(true);
    });
  });

  describe('ensureDir', () => {
    it('should create a directory if it does not exist', async () => {
      const dirPath = join(testDir, 'new-dir');

      await ensureDir(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(true);
    });

    it('should create nested directories', async () => {
      const dirPath = join(testDir, 'deep', 'nested', 'dir');

      await ensureDir(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(true);
    });

    it('should not fail if directory already exists', async () => {
      const dirPath = join(testDir, 'existing-dir');
      await fs.ensureDir(dirPath);

      await expect(ensureDir(dirPath)).resolves.not.toThrow();
    });
  });

  describe('writeFile', () => {
    it('should write content to a new file', async () => {
      const filePath = join(testDir, 'new-file.txt');
      const content = 'Hello, World!';

      await writeFile(filePath, content);

      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should create parent directories if they do not exist', async () => {
      const filePath = join(testDir, 'nested', 'dir', 'file.txt');
      const content = 'Nested content';

      await writeFile(filePath, content);

      expect(await fs.pathExists(filePath)).toBe(true);
      const written = await fs.readFile(filePath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should overwrite existing file without backup by default', async () => {
      const filePath = join(testDir, 'overwrite.txt');
      await fs.writeFile(filePath, 'original');

      await writeFile(filePath, 'updated');

      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('updated');

      // No backup should exist
      const backups = await findBackups(filePath);
      expect(backups).toHaveLength(0);
    });

    it('should create backup when option is set', async () => {
      const filePath = join(testDir, 'backup-test.txt');
      await fs.writeFile(filePath, 'original content');

      await writeFile(filePath, 'new content', { backup: true });

      // New content should be written
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('new content');

      // Backup should exist
      const backups = await findBackups(filePath);
      expect(backups.length).toBeGreaterThan(0);

      // Backup should contain original content
      const backupContent = await fs.readFile(backups[0], 'utf-8');
      expect(backupContent).toBe('original content');
    });

    it('should not create backup if file does not exist', async () => {
      const filePath = join(testDir, 'no-backup-needed.txt');

      await writeFile(filePath, 'content', { backup: true });

      const backups = await findBackups(filePath);
      expect(backups).toHaveLength(0);
    });
  });

  describe('readFile', () => {
    it('should read file content as string', async () => {
      const filePath = join(testDir, 'read-test.txt');
      const content = 'Test content\nWith multiple lines';
      await fs.writeFile(filePath, content);

      const result = await readFile(filePath);

      expect(result).toBe(content);
    });

    it('should throw error for non-existent file', async () => {
      const filePath = join(testDir, 'nonexistent.txt');

      await expect(readFile(filePath)).rejects.toThrow();
    });
  });

  describe('writeJson', () => {
    it('should write JSON data to file', async () => {
      const filePath = join(testDir, 'data.json');
      const data = { name: 'test', value: 42 };

      await writeJson(filePath, data);

      const written = await fs.readJson(filePath);
      expect(written).toEqual(data);
    });

    it('should format JSON with 2-space indentation', async () => {
      const filePath = join(testDir, 'formatted.json');
      const data = { key: 'value' };

      await writeJson(filePath, data);

      const content = await fs.readFile(filePath, 'utf-8');
      // fs-extra writeJson adds a trailing newline
      expect(content).toBe('{\n  "key": "value"\n}\n');
    });

    it('should create backup when option is set', async () => {
      const filePath = join(testDir, 'json-backup.json');
      await fs.writeJson(filePath, { original: true });

      await writeJson(filePath, { updated: true }, { backup: true });

      const backups = await findBackups(filePath);
      expect(backups.length).toBeGreaterThan(0);

      const backupData = await fs.readJson(backups[0]);
      expect(backupData).toEqual({ original: true });
    });
  });

  describe('readJson', () => {
    it('should read and parse JSON file', async () => {
      const filePath = join(testDir, 'read.json');
      const data = { foo: 'bar', num: 123 };
      await fs.writeJson(filePath, data);

      const result = await readJson(filePath);

      expect(result).toEqual(data);
    });

    it('should throw error for invalid JSON', async () => {
      const filePath = join(testDir, 'invalid.json');
      await fs.writeFile(filePath, 'not valid json');

      await expect(readJson(filePath)).rejects.toThrow();
    });

    it('should throw error for non-existent file', async () => {
      const filePath = join(testDir, 'nonexistent.json');

      await expect(readJson(filePath)).rejects.toThrow();
    });
  });

  describe('copyFile', () => {
    it('should copy a file to new location', async () => {
      const src = join(testDir, 'source.txt');
      const dest = join(testDir, 'destination.txt');
      await fs.writeFile(src, 'source content');

      await copyFile(src, dest);

      expect(await fs.pathExists(dest)).toBe(true);
      const content = await fs.readFile(dest, 'utf-8');
      expect(content).toBe('source content');
    });

    it('should create parent directories for destination', async () => {
      const src = join(testDir, 'source.txt');
      const dest = join(testDir, 'nested', 'path', 'destination.txt');
      await fs.writeFile(src, 'content');

      await copyFile(src, dest);

      expect(await fs.pathExists(dest)).toBe(true);
    });

    it('should overwrite existing file by default', async () => {
      const src = join(testDir, 'source.txt');
      const dest = join(testDir, 'dest.txt');
      await fs.writeFile(src, 'new content');
      await fs.writeFile(dest, 'old content');

      await copyFile(src, dest);

      const content = await fs.readFile(dest, 'utf-8');
      expect(content).toBe('new content');
    });

    it('should create backup when option is set', async () => {
      const src = join(testDir, 'source.txt');
      const dest = join(testDir, 'dest-backup.txt');
      await fs.writeFile(src, 'new content');
      await fs.writeFile(dest, 'original content');

      await copyFile(src, dest, { backup: true });

      const backups = await findBackups(dest);
      expect(backups.length).toBeGreaterThan(0);

      const backupContent = await fs.readFile(backups[0], 'utf-8');
      expect(backupContent).toBe('original content');
    });
  });

  describe('copyDir', () => {
    it('should copy a directory recursively', async () => {
      const src = join(testDir, 'src-dir');
      const dest = join(testDir, 'dest-dir');
      await fs.ensureDir(src);
      await fs.writeFile(join(src, 'file1.txt'), 'content1');
      await fs.writeFile(join(src, 'file2.txt'), 'content2');
      await fs.ensureDir(join(src, 'subdir'));
      await fs.writeFile(join(src, 'subdir', 'nested.txt'), 'nested');

      await copyDir(src, dest);

      expect(await fs.pathExists(join(dest, 'file1.txt'))).toBe(true);
      expect(await fs.pathExists(join(dest, 'file2.txt'))).toBe(true);
      expect(await fs.pathExists(join(dest, 'subdir', 'nested.txt'))).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a file', async () => {
      const filePath = join(testDir, 'to-remove.txt');
      await fs.writeFile(filePath, 'content');

      await remove(filePath);

      expect(await fs.pathExists(filePath)).toBe(false);
    });

    it('should remove a directory recursively', async () => {
      const dirPath = join(testDir, 'dir-to-remove');
      await fs.ensureDir(dirPath);
      await fs.writeFile(join(dirPath, 'file.txt'), 'content');

      await remove(dirPath);

      expect(await fs.pathExists(dirPath)).toBe(false);
    });

    it('should not throw for non-existent path', async () => {
      const filePath = join(testDir, 'nonexistent');

      await expect(remove(filePath)).resolves.not.toThrow();
    });
  });

  describe('symlink', () => {
    it('should create a symbolic link', async () => {
      const target = join(testDir, 'target.txt');
      const linkPath = join(testDir, 'link.txt');
      await fs.writeFile(target, 'target content');

      await symlink(target, linkPath);

      expect(await fs.pathExists(linkPath)).toBe(true);
      expect(await isSymlink(linkPath)).toBe(true);
    });

    it('should create parent directories for link', async () => {
      const target = join(testDir, 'target.txt');
      const linkPath = join(testDir, 'nested', 'link.txt');
      await fs.writeFile(target, 'content');

      await symlink(target, linkPath);

      expect(await fs.pathExists(linkPath)).toBe(true);
    });

    it('should fail if link already exists without force option', async () => {
      const target = join(testDir, 'target.txt');
      const linkPath = join(testDir, 'existing-link.txt');
      await fs.writeFile(target, 'content');
      await fs.writeFile(linkPath, 'existing');

      await expect(symlink(target, linkPath)).rejects.toThrow();
    });

    it('should replace existing file when force option is set', async () => {
      const target = join(testDir, 'target.txt');
      const linkPath = join(testDir, 'forced-link.txt');
      await fs.writeFile(target, 'target content');
      await fs.writeFile(linkPath, 'existing content');

      await symlink(target, linkPath, { force: true });

      expect(await isSymlink(linkPath)).toBe(true);
      const linkTarget = await readSymlink(linkPath);
      expect(linkTarget).toBe(target);
    });
  });

  describe('isSymlink', () => {
    it('should return true for symlink', async () => {
      const target = join(testDir, 'target.txt');
      const linkPath = join(testDir, 'symlink.txt');
      await fs.writeFile(target, 'content');
      await fs.symlink(target, linkPath);

      const result = await isSymlink(linkPath);

      expect(result).toBe(true);
    });

    it('should return false for regular file', async () => {
      const filePath = join(testDir, 'regular.txt');
      await fs.writeFile(filePath, 'content');

      const result = await isSymlink(filePath);

      expect(result).toBe(false);
    });

    it('should return false for non-existent path', async () => {
      const filePath = join(testDir, 'nonexistent');

      const result = await isSymlink(filePath);

      expect(result).toBe(false);
    });
  });

  describe('readSymlink', () => {
    it('should return the target of a symlink', async () => {
      const target = join(testDir, 'target.txt');
      const linkPath = join(testDir, 'link.txt');
      await fs.writeFile(target, 'content');
      await fs.symlink(target, linkPath);

      const result = await readSymlink(linkPath);

      expect(result).toBe(target);
    });

    it('should return null for non-symlink', async () => {
      const filePath = join(testDir, 'regular.txt');
      await fs.writeFile(filePath, 'content');

      const result = await readSymlink(filePath);

      expect(result).toBe(null);
    });

    it('should return null for non-existent path', async () => {
      const filePath = join(testDir, 'nonexistent');

      const result = await readSymlink(filePath);

      expect(result).toBe(null);
    });
  });

  describe('listFiles', () => {
    beforeEach(async () => {
      // Setup test directory structure
      await fs.writeFile(join(testDir, 'file1.txt'), 'content');
      await fs.writeFile(join(testDir, 'file2.js'), 'content');
      await fs.writeFile(join(testDir, 'file3.json'), 'content');
      await fs.ensureDir(join(testDir, 'subdir'));
      await fs.writeFile(join(testDir, 'subdir', 'nested.txt'), 'content');
      await fs.writeFile(join(testDir, 'subdir', 'nested.js'), 'content');
    });

    it('should list files in a directory', async () => {
      const files = await listFiles(testDir);

      expect(files).toHaveLength(3);
      expect(files).toContain(join(testDir, 'file1.txt'));
      expect(files).toContain(join(testDir, 'file2.js'));
      expect(files).toContain(join(testDir, 'file3.json'));
    });

    it('should list files recursively', async () => {
      const files = await listFiles(testDir, { recursive: true });

      expect(files).toHaveLength(5);
      expect(files).toContain(join(testDir, 'subdir', 'nested.txt'));
      expect(files).toContain(join(testDir, 'subdir', 'nested.js'));
    });

    it('should filter by extension', async () => {
      const files = await listFiles(testDir, { extensions: ['.txt'] });

      expect(files).toHaveLength(1);
      expect(files).toContain(join(testDir, 'file1.txt'));
    });

    it('should filter by multiple extensions', async () => {
      const files = await listFiles(testDir, { extensions: ['.txt', '.js'] });

      expect(files).toHaveLength(2);
      expect(files).toContain(join(testDir, 'file1.txt'));
      expect(files).toContain(join(testDir, 'file2.js'));
    });

    it('should filter recursively by extension', async () => {
      const files = await listFiles(testDir, { recursive: true, extensions: ['.js'] });

      expect(files).toHaveLength(2);
      expect(files).toContain(join(testDir, 'file2.js'));
      expect(files).toContain(join(testDir, 'subdir', 'nested.js'));
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await listFiles(join(testDir, 'nonexistent'));

      expect(files).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return stats for existing file', async () => {
      const filePath = join(testDir, 'stats-test.txt');
      await fs.writeFile(filePath, 'content');

      const stats = await getStats(filePath);

      expect(stats).not.toBeNull();
      expect(stats.isFile()).toBe(true);
    });

    it('should return stats for directory', async () => {
      const dirPath = join(testDir, 'stats-dir');
      await fs.ensureDir(dirPath);

      const stats = await getStats(dirPath);

      expect(stats).not.toBeNull();
      expect(stats.isDirectory()).toBe(true);
    });

    it('should return null for non-existent path', async () => {
      const filePath = join(testDir, 'nonexistent');

      const stats = await getStats(filePath);

      expect(stats).toBeNull();
    });
  });

  describe('makeExecutable', () => {
    it('should make a file executable', async () => {
      const filePath = join(testDir, 'script.sh');
      await fs.writeFile(filePath, '#!/bin/bash\necho "hello"');

      await makeExecutable(filePath);

      const stats = await fs.stat(filePath);
      // Check that execute bit is set (mode includes 0o111)
      const hasExecuteBit = (stats.mode & 0o111) !== 0;
      expect(hasExecuteBit).toBe(true);
    });
  });

  describe('findBackups', () => {
    it('should find backup files for a given path', async () => {
      const filePath = join(testDir, 'file.txt');
      await fs.writeFile(filePath, 'content');

      // Create some backups manually
      await fs.writeFile(`${filePath}.backup.1000`, 'backup1');
      await fs.writeFile(`${filePath}.backup.2000`, 'backup2');
      await fs.writeFile(`${filePath}.backup.3000`, 'backup3');

      const backups = await findBackups(filePath);

      expect(backups).toHaveLength(3);
    });

    it('should return backups in reverse chronological order', async () => {
      const filePath = join(testDir, 'file.txt');
      await fs.writeFile(filePath, 'content');

      await fs.writeFile(`${filePath}.backup.1000`, 'oldest');
      await fs.writeFile(`${filePath}.backup.3000`, 'newest');
      await fs.writeFile(`${filePath}.backup.2000`, 'middle');

      const backups = await findBackups(filePath);

      // Newest first (highest timestamp)
      expect(backups[0]).toContain('.backup.3000');
      expect(backups[1]).toContain('.backup.2000');
      expect(backups[2]).toContain('.backup.1000');
    });

    it('should return empty array if no backups exist', async () => {
      const filePath = join(testDir, 'no-backups.txt');
      await fs.writeFile(filePath, 'content');

      const backups = await findBackups(filePath);

      expect(backups).toEqual([]);
    });

    it('should return empty array if directory does not exist', async () => {
      const filePath = join(testDir, 'nonexistent', 'file.txt');

      const backups = await findBackups(filePath);

      expect(backups).toEqual([]);
    });

    it('should not match unrelated files', async () => {
      const filePath = join(testDir, 'file.txt');
      await fs.writeFile(filePath, 'content');

      // Create backup and unrelated files
      await fs.writeFile(`${filePath}.backup.1000`, 'backup');
      await fs.writeFile(join(testDir, 'other.txt.backup.2000'), 'other backup');
      await fs.writeFile(join(testDir, 'file.txt.other'), 'other file');

      const backups = await findBackups(filePath);

      expect(backups).toHaveLength(1);
      expect(backups[0]).toContain('file.txt.backup.1000');
    });
  });

  describe('restoreFromBackup', () => {
    it('should restore from the most recent backup', async () => {
      const filePath = join(testDir, 'restore-test.txt');
      await fs.writeFile(filePath, 'current content');

      // Create backups with different timestamps
      await fs.writeFile(`${filePath}.backup.1000`, 'oldest backup');
      await fs.writeFile(`${filePath}.backup.3000`, 'newest backup');

      const result = await restoreFromBackup(filePath);

      expect(result).toBe(true);
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('newest backup');
    });

    it('should return false if no backup exists', async () => {
      const filePath = join(testDir, 'no-backup.txt');
      await fs.writeFile(filePath, 'content');

      const result = await restoreFromBackup(filePath);

      expect(result).toBe(false);
    });

    it('should restore even if original file does not exist', async () => {
      const filePath = join(testDir, 'deleted.txt');

      // Create backup but no original file
      await fs.writeFile(`${filePath}.backup.1000`, 'backup content');

      const result = await restoreFromBackup(filePath);

      expect(result).toBe(true);
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toBe('backup content');
    });
  });

  describe('integration: writeFile with backup and restore', () => {
    it('should complete full backup and restore cycle', async () => {
      const filePath = join(testDir, 'integration-test.txt');

      // Create initial file
      await writeFile(filePath, 'version 1');

      // Small delay to ensure unique timestamps
      await delay(5);

      // Update with backup (creates backup of version 1)
      await writeFile(filePath, 'version 2', { backup: true });

      // Small delay to ensure unique timestamps
      await delay(5);

      // Update again with backup (creates backup of version 2)
      await writeFile(filePath, 'version 3', { backup: true });

      // Verify current content
      let content = await readFile(filePath);
      expect(content).toBe('version 3');

      // Verify backups exist (should have 2: v1 and v2)
      const backups = await findBackups(filePath);
      expect(backups.length).toBeGreaterThanOrEqual(2);

      // Restore from backup (should restore to version 2 - the most recent backup)
      const restored = await restoreFromBackup(filePath);
      expect(restored).toBe(true);

      content = await readFile(filePath);
      expect(content).toBe('version 2');
    });

    it('should handle multiple backup-restore cycles', async () => {
      const filePath = join(testDir, 'multi-cycle.txt');

      // Create and backup
      await writeFile(filePath, 'original');
      await delay(5);
      await writeFile(filePath, 'modified', { backup: true });

      // First restore
      await restoreFromBackup(filePath);
      let content = await readFile(filePath);
      expect(content).toBe('original');

      // Modify again with backup
      await delay(5);
      await writeFile(filePath, 'modified again', { backup: true });

      // Second restore
      await restoreFromBackup(filePath);
      content = await readFile(filePath);
      expect(content).toBe('original');
    });
  });
});
