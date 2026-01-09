/**
 * Init Command Tests
 */

import { jest } from '@jest/globals';
import { renderTemplate, getDefaultData } from '../src/lib/template-engine.js';

describe('Init Command - Template Rendering', () => {
  const baseConfig = {
    projectName: 'test-project',
    description: 'Test description',
    projectType: 'node',
    orchestrationLevel: 'standard',
    codebaseMaturity: 'TRANSITIONAL',
    useHooks: true,
    useAgentDelegation: false
  };

  describe('CLAUDE.md generation', () => {
    it('should render CLAUDE.md with project name', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('CLAUDE.md', templateData);

      expect(result).toContain('test-project');
      expect(result).toContain('Muad\'Dib Orchestration');
    });

    it('should include codebase maturity', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('CLAUDE.md', templateData);

      expect(result).toContain('**Codebase Maturity**: TRANSITIONAL');
    });

    it('should include project type', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('CLAUDE.md', templateData);

      expect(result).toContain('**Project Type**: node');
    });

    it('should include version', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('CLAUDE.md', templateData);

      expect(result).toMatch(/\*\*Muad'Dib Version\*\*: \d+\.\d+\.\d+/);
    });

    it('should include core orchestration sections', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('CLAUDE.md', templateData);

      expect(result).toContain('## Intent Classification');
      expect(result).toContain('## Agent Delegation');
      expect(result).toContain('3-Strikes'); // Error recovery section
      expect(result).toContain('## Quality'); // Quality section
    });
  });

  describe('settings.json generation', () => {
    it('should render settings.json with hooks for node project', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.hooks).toBeDefined();
      expect(settings.permissions).toBeDefined();
    });

    it('should include node-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      // Claude Code 2.1 wildcard syntax: Bash(npm *) instead of Bash(npm:*)
      expect(settings.permissions.allow).toContain('Bash(npm *)');
      expect(settings.permissions.allow).toContain('Bash(node *)');
    });

    it('should include deny list for dangerous operations (Claude Code 2.1 wildcards)', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      // Claude Code 2.1 wildcard syntax
      expect(settings.permissions.deny).toContain('Bash(sudo *)');
      expect(settings.permissions.deny).toContain('Read(.env)');
    });

    it('should render python-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const pythonConfig = { ...baseConfig, projectType: 'python' };
      const templateData = { ...getDefaultData(), ...pythonConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.permissions.allow).toContain('Bash(python *)');
      expect(settings.permissions.allow).toContain('Bash(pip *)');
    });

    it('should render go-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const goConfig = { ...baseConfig, projectType: 'go' };
      const templateData = { ...getDefaultData(), ...goConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.permissions.allow).toContain('Bash(go *)');
    });

    it('should render rust-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const rustConfig = { ...baseConfig, projectType: 'rust' };
      const templateData = { ...getDefaultData(), ...rustConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.permissions.allow).toContain('Bash(cargo *)');
    });
  });

  describe('context.md generation', () => {
    it('should render context.md with project info', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('context.md', templateData);

      expect(result).toContain('test-project');
      expect(result).toContain('Project Context');
    });
  });

  describe('critical-context.md generation', () => {
    it('should render critical-context.md', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('critical-context.md', templateData);

      expect(result).toContain('Critical Context');
      expect(result).toContain('Never Forget');
    });
  });

  describe('Phase 4 - Enhanced Hook Configuration', () => {
    it('should include all 8 hook types when useHooks is true', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      // Check for all hook types
      expect(settings.hooks.PreToolUse).toBeDefined();
      expect(settings.hooks.PostToolUse).toBeDefined();
      expect(settings.hooks.SessionStart).toBeDefined();
      expect(settings.hooks.Stop).toBeDefined();
      expect(settings.hooks.PreCompact).toBeDefined();
    });

    it('should have PreToolUse hooks for Bash and Edit|Write', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      const preToolUseMatchers = settings.hooks.PreToolUse.map(h => h.matcher);
      expect(preToolUseMatchers).toContain('Bash');
      expect(preToolUseMatchers).toContain('Edit|Write');
    });

    it('should reference helper scripts in hooks', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('settings.json', templateData);

      expect(result).toContain('validate-bash-command.sh');
      expect(result).toContain('pre-edit-check.sh');
      expect(result).toContain('post-edit-log.sh');
      expect(result).toContain('error-detector.sh');
      expect(result).toContain('notify-idle.sh');
    });
  });

  describe('Phase 4 - Skills Documentation', () => {
    it('should include skills documentation in CLAUDE.md', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('CLAUDE.md', templateData);

      expect(result).toContain('Muad\'Dib Skills');
      expect(result).toContain('muaddib-explore');
      expect(result).toContain('forked');
    });

    it('should include wildcard permission documentation in CLAUDE.md', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderTemplate('CLAUDE.md', templateData);

      expect(result).toContain('Wildcard Syntax');
      expect(result).toContain('Bash(npm *)');
    });
  });
});
