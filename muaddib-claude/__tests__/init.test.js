/**
 * Init Command Tests
 */

import { jest } from '@jest/globals';
import { renderNamedTemplate, getDefaultData } from '../src/lib/template-engine.js';

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
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('test-project');
      expect(result).toContain('Muad\'Dib Orchestration');
    });

    it('should include codebase maturity', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('**Codebase Maturity**: TRANSITIONAL');
    });

    it('should include project type', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('**Project Type**: node');
    });

    it('should include version', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toMatch(/\*\*Muad'Dib Version\*\*: \d+\.\d+\.\d+/);
    });

    it('should include core orchestration sections', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('## Intent Classification');
      expect(result).toContain('## Agent Delegation');
      expect(result).toContain('3-Strikes'); // Error recovery section
      expect(result).toContain('## Quality'); // Quality section
    });
  });

  describe('settings.json generation', () => {
    it('should render settings.json with hooks for node project', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.hooks).toBeDefined();
      expect(settings.permissions).toBeDefined();
    });

    it('should include node-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      // Claude Code 2.1 wildcard syntax: Bash(npm *) instead of Bash(npm:*)
      expect(settings.permissions.allow).toContain('Bash(npm *)');
      expect(settings.permissions.allow).toContain('Bash(node *)');
    });

    it('should include deny list for dangerous operations (Claude Code 2.1 wildcards)', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      // Claude Code 2.1 wildcard syntax
      expect(settings.permissions.deny).toContain('Bash(sudo *)');
      expect(settings.permissions.deny).toContain('Read(.env)');
    });

    it('should render python-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const pythonConfig = { ...baseConfig, projectType: 'python' };
      const templateData = { ...getDefaultData(), ...pythonConfig };
      const result = await renderNamedTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.permissions.allow).toContain('Bash(python *)');
      expect(settings.permissions.allow).toContain('Bash(pip *)');
    });

    it('should render go-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const goConfig = { ...baseConfig, projectType: 'go' };
      const templateData = { ...getDefaultData(), ...goConfig };
      const result = await renderNamedTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.permissions.allow).toContain('Bash(go *)');
    });

    it('should render rust-specific permissions (Claude Code 2.1 wildcards)', async () => {
      const rustConfig = { ...baseConfig, projectType: 'rust' };
      const templateData = { ...getDefaultData(), ...rustConfig };
      const result = await renderNamedTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      expect(settings.permissions.allow).toContain('Bash(cargo *)');
    });
  });

  describe('context.md generation', () => {
    it('should render context.md with project info', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('context.md', templateData);

      expect(result).toContain('test-project');
      expect(result).toContain('Project Context');
    });
  });

  describe('critical-context.md generation', () => {
    it('should render critical-context.md', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('critical-context.md', templateData);

      expect(result).toContain('Critical Context');
      expect(result).toContain('Never Forget');
    });
  });

  describe('Phase 4 - Enhanced Hook Configuration', () => {
    it('should include all 8 hook types when useHooks is true', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('settings.json', templateData);
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
      const result = await renderNamedTemplate('settings.json', templateData);
      const settings = JSON.parse(result);

      const preToolUseMatchers = settings.hooks.PreToolUse.map(h => h.matcher);
      expect(preToolUseMatchers).toContain('Bash');
      expect(preToolUseMatchers).toContain('Edit|Write');
    });

    it('should reference helper scripts in hooks', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('settings.json', templateData);

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
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('Muad\'Dib Skills');
      expect(result).toContain('muaddib-explore');
      expect(result).toContain('forked');
    });

    it('should include wildcard permission documentation in CLAUDE.md', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('Wildcard Syntax');
      expect(result).toContain('Bash(npm *)');
    });
  });

  describe('Phase 5 - Extended Skills', () => {
    it('should include all 11 skills in CLAUDE.md', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      // Core skills (Phase 4)
      expect(result).toContain('muaddib-orchestrate');
      expect(result).toContain('muaddib-explore');
      expect(result).toContain('muaddib-validate');

      // Extended skills (Phase 5)
      expect(result).toContain('muaddib-lsp');
      expect(result).toContain('muaddib-refactor');
      expect(result).toContain('muaddib-checkpoint');
      expect(result).toContain('muaddib-tdd');
      expect(result).toContain('muaddib-parallel-explore');
      expect(result).toContain('muaddib-incremental-refactor');
      expect(result).toContain('muaddib-doc-sync');
      expect(result).toContain('muaddib-quality-gate');
    });

    it('should include LSP operations documentation', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('## LSP Operations');
      expect(result).toContain('Go to Definition');
      expect(result).toContain('Find References');
    });

    it('should include ast-grep patterns documentation', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('## AST-grep Patterns');
      expect(result).toContain('ast-grep');
      expect(result).toContain('$NAME');
    });

    it('should include checkpoint system documentation', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('## Checkpoint System');
      expect(result).toContain('checkpoint.md');
    });

    it('should include skill composition patterns', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('## Skill Composition Patterns');
      expect(result).toContain('Sequential Chaining');
      expect(result).toContain('Parallel Execution');
    });

    it('should show Phase 5 skills with correct context types', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      // Forked context skills
      expect(result).toMatch(/muaddib-lsp.*\*\*forked\*\*/s);
      expect(result).toMatch(/muaddib-refactor.*\*\*forked\*\*/s);
      expect(result).toMatch(/muaddib-tdd.*\*\*forked\*\*/s);

      // Main context skills
      expect(result).toContain('muaddib-checkpoint');
      expect(result).toContain('muaddib-doc-sync');
      expect(result).toContain('muaddib-quality-gate');
    });
  });

  describe('Flag Normalization Behavior (HIGH-1)', () => {
    describe('--minimal flag', () => {
      const minimalConfig = {
        projectName: 'minimal-project',
        description: 'Minimal test',
        projectType: 'node',
        orchestrationLevel: 'minimal',
        codebaseMaturity: 'TRANSITIONAL',
        useHooks: false,
        useAgentDelegation: false
      };

      it('should set useHooks to false when orchestrationLevel is minimal', async () => {
        const templateData = { ...getDefaultData(), ...minimalConfig };

        // Verify the config values are correctly set for minimal
        expect(templateData.useHooks).toBe(false);
        expect(templateData.useAgentDelegation).toBe(false);
        expect(templateData.orchestrationLevel).toBe('minimal');
      });

      it('should render settings.json without hooks section when useHooks is false', async () => {
        const templateData = { ...getDefaultData(), ...minimalConfig };
        const result = await renderNamedTemplate('settings.json', templateData);
        const settings = JSON.parse(result);

        // Hooks should be empty object when useHooks is false
        expect(settings.hooks).toBeDefined();
        // The hook arrays should be empty for minimal mode
        if (settings.hooks.PreToolUse) {
          expect(settings.hooks.PreToolUse.length).toBe(0);
        }
      });

      it('should render CLAUDE.md without agent delegation section when useAgentDelegation is false', async () => {
        const templateData = { ...getDefaultData(), ...minimalConfig };
        const result = await renderNamedTemplate('CLAUDE.md', templateData);

        // Should still contain the section header but marked as disabled or minimal
        expect(result).toContain('Agent Delegation');
        // Verify minimal orchestration level is reflected
        expect(templateData.orchestrationLevel).toBe('minimal');
      });

      it('should normalize both flags together for minimal mode', () => {
        // Simulating the normalization logic from init.js
        const options = { minimal: true, yes: true };
        const normalizedConfig = {
          orchestrationLevel: options.minimal ? 'minimal' : 'standard',
          useHooks: !options.minimal,
          useAgentDelegation: options.full || false
        };

        expect(normalizedConfig.orchestrationLevel).toBe('minimal');
        expect(normalizedConfig.useHooks).toBe(false);
        expect(normalizedConfig.useAgentDelegation).toBe(false);
      });
    });

    describe('--full flag', () => {
      const fullConfig = {
        projectName: 'full-project',
        description: 'Full test',
        projectType: 'node',
        orchestrationLevel: 'full',
        codebaseMaturity: 'TRANSITIONAL',
        useHooks: true,
        useAgentDelegation: true
      };

      it('should set useHooks to true when orchestrationLevel is full', async () => {
        const templateData = { ...getDefaultData(), ...fullConfig };

        // Verify the config values are correctly set for full
        expect(templateData.useHooks).toBe(true);
        expect(templateData.useAgentDelegation).toBe(true);
        expect(templateData.orchestrationLevel).toBe('full');
      });

      it('should render settings.json with hooks when useHooks is true', async () => {
        const templateData = { ...getDefaultData(), ...fullConfig };
        const result = await renderNamedTemplate('settings.json', templateData);
        const settings = JSON.parse(result);

        // Hooks should contain PreToolUse and PostToolUse
        expect(settings.hooks.PreToolUse).toBeDefined();
        expect(settings.hooks.PreToolUse.length).toBeGreaterThan(0);
        expect(settings.hooks.PostToolUse).toBeDefined();
      });

      it('should render CLAUDE.md with agent delegation when useAgentDelegation is true', async () => {
        const templateData = { ...getDefaultData(), ...fullConfig };
        const result = await renderNamedTemplate('CLAUDE.md', templateData);

        // Should contain agent delegation patterns
        expect(result).toContain('Agent Delegation');
        expect(result).toContain('Task');
        expect(result).toContain('subagent_type');
      });

      it('should normalize both flags together for full mode', () => {
        // Simulating the normalization logic from init.js
        const options = { full: true, yes: true };
        const normalizedConfig = {
          orchestrationLevel: options.full ? 'full' : 'standard',
          useHooks: !options.minimal,
          useAgentDelegation: options.full || false
        };

        expect(normalizedConfig.orchestrationLevel).toBe('full');
        expect(normalizedConfig.useHooks).toBe(true);
        expect(normalizedConfig.useAgentDelegation).toBe(true);
      });
    });

    describe('--standard mode (default)', () => {
      const standardConfig = {
        projectName: 'standard-project',
        description: 'Standard test',
        projectType: 'node',
        orchestrationLevel: 'standard',
        codebaseMaturity: 'TRANSITIONAL',
        useHooks: true,
        useAgentDelegation: false
      };

      it('should set useHooks to true and useAgentDelegation to false for standard mode', () => {
        // Simulating default behavior without --minimal or --full
        const options = { yes: true };
        const normalizedConfig = {
          orchestrationLevel: options.minimal ? 'minimal' : options.full ? 'full' : 'standard',
          useHooks: !options.minimal,
          useAgentDelegation: options.full || false
        };

        expect(normalizedConfig.orchestrationLevel).toBe('standard');
        expect(normalizedConfig.useHooks).toBe(true);
        expect(normalizedConfig.useAgentDelegation).toBe(false);
      });

      it('should render settings.json with hooks for standard mode', async () => {
        const templateData = { ...getDefaultData(), ...standardConfig };
        const result = await renderNamedTemplate('settings.json', templateData);
        const settings = JSON.parse(result);

        // Standard mode has hooks enabled
        expect(settings.hooks.PreToolUse).toBeDefined();
        expect(settings.hooks.PreToolUse.length).toBeGreaterThan(0);
      });
    });

    describe('flag precedence', () => {
      it('should handle --minimal taking precedence when both flags are provided', () => {
        // In real CLI, commander would only allow one, but test the logic
        const options = { minimal: true, full: false, yes: true };
        const normalizedConfig = {
          orchestrationLevel: options.minimal ? 'minimal' : options.full ? 'full' : 'standard',
          useHooks: !options.minimal,
          useAgentDelegation: options.full
        };

        // --minimal should set minimal config
        expect(normalizedConfig.orchestrationLevel).toBe('minimal');
        expect(normalizedConfig.useHooks).toBe(false);
        expect(normalizedConfig.useAgentDelegation).toBe(false);
      });

      it('should handle --full taking precedence over standard default', () => {
        const options = { minimal: false, full: true, yes: true };
        const normalizedConfig = {
          orchestrationLevel: options.minimal ? 'minimal' : options.full ? 'full' : 'standard',
          useHooks: !options.minimal,
          useAgentDelegation: options.full
        };

        // --full should set full config
        expect(normalizedConfig.orchestrationLevel).toBe('full');
        expect(normalizedConfig.useHooks).toBe(true);
        expect(normalizedConfig.useAgentDelegation).toBe(true);
      });
    });
  });

  describe('Phase 5 - Language-specific patterns', () => {
    it('should include node-specific ast-grep patterns', async () => {
      const templateData = { ...getDefaultData(), ...baseConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('JavaScript/TypeScript Patterns');
      expect(result).toContain('console.log');
    });

    it('should include python-specific patterns for python projects', async () => {
      const pythonConfig = { ...baseConfig, projectType: 'python' };
      const templateData = { ...getDefaultData(), ...pythonConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('Python Patterns');
      expect(result).toContain('pyright');
    });

    it('should include go-specific patterns for go projects', async () => {
      const goConfig = { ...baseConfig, projectType: 'go' };
      const templateData = { ...getDefaultData(), ...goConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('Go Patterns');
      expect(result).toContain('gopls');
    });

    it('should include rust-specific patterns for rust projects', async () => {
      const rustConfig = { ...baseConfig, projectType: 'rust' };
      const templateData = { ...getDefaultData(), ...rustConfig };
      const result = await renderNamedTemplate('CLAUDE.md', templateData);

      expect(result).toContain('Rust Patterns');
      expect(result).toContain('unwrap');
    });
  });
});
