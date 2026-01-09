/**
 * Settings Merge Tests
 *
 * Tests the deep merge logic for settings.json updates
 */

import { deepMergeSettings } from '../src/cli/update.js';

describe('deepMergeSettings', () => {
  describe('hook merging', () => {
    it('should add new hook types from template', () => {
      const newSettings = {
        hooks: {
          PreToolUse: [{ type: 'command', command: 'validate.sh' }],
          PostToolUse: [{ type: 'command', command: 'format.sh' }]
        }
      };
      const existingSettings = {
        hooks: {}
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      expect(result.hooks.PreToolUse).toEqual([{ type: 'command', command: 'validate.sh' }]);
      expect(result.hooks.PostToolUse).toEqual([{ type: 'command', command: 'format.sh' }]);
    });

    it('should merge new entries with existing hook customizations', () => {
      const newSettings = {
        hooks: {
          PostToolUse: [{ type: 'command', command: 'new-format.sh' }]
        }
      };
      const existingSettings = {
        hooks: {
          PostToolUse: [{ type: 'command', command: 'my-custom-format.sh' }]
        }
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      // Should keep user's customization AND add new entry
      expect(result.hooks.PostToolUse).toHaveLength(2);
      expect(result.hooks.PostToolUse[0]).toEqual({ type: 'command', command: 'my-custom-format.sh' });
      expect(result.hooks.PostToolUse[1]).toEqual({ type: 'command', command: 'new-format.sh' });
    });

    it('should not duplicate identical hooks', () => {
      const newSettings = {
        hooks: {
          PostToolUse: [{ type: 'command', command: 'format.sh' }]
        }
      };
      const existingSettings = {
        hooks: {
          PostToolUse: [{ type: 'command', command: 'format.sh' }]
        }
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      // Should not duplicate identical hooks
      expect(result.hooks.PostToolUse).toHaveLength(1);
    });

    it('should add new hook types while preserving existing ones', () => {
      const newSettings = {
        hooks: {
          PreToolUse: [{ type: 'command', command: 'validate.sh' }],
          SessionStart: [{ type: 'command', command: 'context.sh' }]
        }
      };
      const existingSettings = {
        hooks: {
          PostToolUse: [{ type: 'command', command: 'custom.sh' }]
        }
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      expect(result.hooks.PreToolUse).toEqual([{ type: 'command', command: 'validate.sh' }]);
      expect(result.hooks.SessionStart).toEqual([{ type: 'command', command: 'context.sh' }]);
      expect(result.hooks.PostToolUse).toEqual([{ type: 'command', command: 'custom.sh' }]);
    });

    it('should handle empty existing hooks', () => {
      const newSettings = {
        hooks: {
          PreToolUse: [{ type: 'command', command: 'test.sh' }]
        }
      };
      const existingSettings = {};

      const result = deepMergeSettings(newSettings, existingSettings);

      expect(result.hooks.PreToolUse).toEqual([{ type: 'command', command: 'test.sh' }]);
    });
  });

  describe('permission merging', () => {
    it('should add new allow permissions', () => {
      const newSettings = {
        permissions: {
          allow: ['Bash(npm:*)', 'Bash(node:*)']
        }
      };
      const existingSettings = {
        permissions: {
          allow: ['Bash(git:*)']
        }
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      expect(result.permissions.allow).toContain('Bash(git:*)');
      expect(result.permissions.allow).toContain('Bash(npm:*)');
      expect(result.permissions.allow).toContain('Bash(node:*)');
    });

    it('should not duplicate existing permissions', () => {
      const newSettings = {
        permissions: {
          allow: ['Bash(git:*)', 'Bash(npm:*)']
        }
      };
      const existingSettings = {
        permissions: {
          allow: ['Bash(git:*)']
        }
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      const gitCount = result.permissions.allow.filter(p => p === 'Bash(git:*)').length;
      expect(gitCount).toBe(1);
    });

    it('should add new deny permissions', () => {
      const newSettings = {
        permissions: {
          deny: ['Bash(rm -rf /*:*)', 'Bash(sudo:*)']
        }
      };
      const existingSettings = {
        permissions: {
          deny: ['Read(.env)']
        }
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      expect(result.permissions.deny).toContain('Read(.env)');
      expect(result.permissions.deny).toContain('Bash(rm -rf /*:*)');
      expect(result.permissions.deny).toContain('Bash(sudo:*)');
    });

    it('should handle empty existing permissions', () => {
      const newSettings = {
        permissions: {
          allow: ['Bash(npm:*)'],
          deny: ['Bash(sudo:*)']
        }
      };
      const existingSettings = {};

      const result = deepMergeSettings(newSettings, existingSettings);

      expect(result.permissions.allow).toContain('Bash(npm:*)');
      expect(result.permissions.deny).toContain('Bash(sudo:*)');
    });
  });

  describe('combined scenarios', () => {
    it('should handle real-world Phase 4 upgrade scenario', () => {
      // Existing settings from Phase 3
      const existingSettings = {
        hooks: {
          PostToolUse: [
            { matcher: 'Edit|Write', hooks: [{ type: 'command', command: 'prettier --write' }] }
          ]
        },
        permissions: {
          allow: ['Bash(git:*)', 'Bash(npm:*)'],
          deny: ['Bash(sudo:*)']
        }
      };

      // New settings from Phase 4 template with additional hooks
      const newSettings = {
        hooks: {
          PreToolUse: [
            { matcher: 'Bash', hooks: [{ type: 'command', command: 'validate-bash-command.sh' }] }
          ],
          PostToolUse: [
            { matcher: 'Edit|Write', hooks: [{ type: 'command', command: 'new-formatter.sh' }] }
          ],
          SessionStart: [
            { type: 'command', command: 'cat context.md' }
          ]
        },
        permissions: {
          allow: ['Bash(git:*)', 'Bash(npm:*)', 'Bash(cargo:*)'],
          deny: ['Bash(sudo:*)', 'Bash(eval:*)']
        }
      };

      const result = deepMergeSettings(newSettings, existingSettings);

      // New hook types should be added
      expect(result.hooks.PreToolUse).toBeDefined();
      expect(result.hooks.SessionStart).toBeDefined();

      // PostToolUse should have user's customization AND new entry (merged)
      expect(result.hooks.PostToolUse).toHaveLength(2);
      expect(result.hooks.PostToolUse[0].hooks[0].command).toBe('prettier --write');
      expect(result.hooks.PostToolUse[1].hooks[0].command).toBe('new-formatter.sh');

      // New permissions should be added
      expect(result.permissions.allow).toContain('Bash(cargo:*)');
      expect(result.permissions.deny).toContain('Bash(eval:*)');

      // Existing permissions should be preserved
      expect(result.permissions.allow).toContain('Bash(git:*)');
    });
  });
});
