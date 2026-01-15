# Contributing to Atreides

Technical documentation for developers who want to contribute to or customize the Atreides orchestration framework.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Key APIs](#key-apis)
- [Template System](#template-system)
- [Skills Architecture](#skills-architecture)
- [Hook System](#hook-system)
- [Testing](#testing)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Security Practices](#security-practices)

---

## Tech Stack

### Runtime
- **Node.js 18+** (ES Modules required)
- **No external APIs** — Everything runs locally

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `commander` | ^11.1.0 | CLI framework |
| `handlebars` | ^4.7.8 | Template engine |
| `inquirer` | ^9.2.12 | Interactive prompts |
| `chalk` | ^5.3.0 | Colored terminal output |
| `fs-extra` | ^11.2.0 | Enhanced file operations |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `jest` | ^29.7.0 | Test framework |
| `eslint` | ^8.56.0 | Code linting |

---

## Architecture Overview

### Directory Structure

```
muaddib-claude/
├── bin/                        # CLI entry point
│   └── muaddib.js             # Executable (#!/usr/bin/env node)
│
├── src/                        # Source code
│   ├── cli/                   # CLI command implementations
│   │   ├── index.js          # Command router (Commander.js)
│   │   ├── init.js           # Project initialization
│   │   ├── install.js        # Global installation
│   │   ├── update.js         # Update components
│   │   ├── doctor.js         # Health checks
│   │   └── uninstall.js      # Cleanup
│   │
│   ├── lib/                   # Core libraries
│   │   ├── template-engine.js # Handlebars rendering
│   │   ├── file-manager.js   # Safe file operations
│   │   ├── config-merger.js  # Deep merge logic
│   │   ├── validator.js      # Input validation
│   │   └── index.js          # Module exports
│   │
│   └── utils/                 # Utilities
│       ├── paths.js          # Path constants
│       ├── logger.js         # Logging with redaction
│       └── prompts.js        # User interaction
│
├── templates/                  # Handlebars templates
│   ├── CLAUDE.md.hbs         # Main orchestration guide (~6700 lines)
│   ├── settings.json.hbs     # Claude Code hooks/permissions (~6600 lines)
│   ├── config.json.hbs       # Muaddib configuration
│   ├── context.md.hbs        # Session context
│   ├── critical-context.md.hbs # Compaction-safe context
│   ├── checkpoint.md.hbs     # Session checkpoints
│   └── partials/             # 15 template partials
│       ├── intent-classification.hbs
│       ├── workflow-phases.hbs
│       ├── orchestration-rules.hbs
│       ├── agent-definitions.hbs
│       ├── maturity-assessment.hbs
│       ├── completion-checking.hbs
│       ├── session-continuity.hbs
│       ├── context-management.hbs
│       ├── exploration-patterns.hbs
│       ├── skills-and-hooks.hbs
│       ├── lsp-operations.hbs
│       ├── ast-grep-patterns.hbs
│       ├── skill-composition.hbs
│       ├── quality-standards.hbs
│       └── checkpoint-system.hbs
│
├── lib/                        # Static distribution files
│   ├── core/                  # Reference documentation (9 files)
│   │   ├── intent-classification.md
│   │   ├── maturity-assessment.md
│   │   ├── orchestration-rules.md
│   │   ├── workflow-phases.md
│   │   ├── agent-definitions.md
│   │   ├── completion-checking.md
│   │   ├── session-continuity.md
│   │   ├── context-management.md
│   │   └── exploration-patterns.md
│   │
│   └── skills/muaddib/        # Skill definitions (12 files)
│       ├── SKILL.md          # Skill package manifest
│       ├── orchestrate.md    # Main workflow coordination
│       ├── explore.md        # Forked context exploration
│       ├── validate.md       # Pre-completion validation
│       ├── lsp.md            # Semantic code operations
│       ├── refactor.md       # AST-grep transformations
│       ├── checkpoint.md     # Session state management
│       ├── tdd.md            # Test-driven development
│       ├── parallel-explore.md
│       ├── incremental-refactor.md
│       ├── doc-sync.md
│       └── quality-gate.md
│
├── scripts/                    # Hook implementation scripts
│   ├── validate-bash-command.sh  # Command safety validation
│   ├── pre-edit-check.sh        # Pre-edit file validation
│   ├── post-edit-log.sh         # Post-edit logging
│   ├── error-detector.sh        # Build/test error detection
│   └── notify-idle.sh           # Idle notifications
│
├── __tests__/                  # Test suite (456 tests)
│   ├── cli.test.js
│   ├── file-manager.test.js
│   ├── init.test.js
│   ├── template-engine.test.js
│   ├── settings-merge.test.js
│   ├── security-verification.test.js
│   ├── hooks.test.js
│   ├── shell-scripts.test.js
│   └── e2e.test.js
│
├── docs/                       # Documentation
│   ├── OVERVIEW.md
│   ├── CONTRIBUTING.md        # This file
│   ├── API-FILE-MANAGER.md
│   └── DUAL-ENVIRONMENT-SETUP.md
│
├── package.json
├── README.md
└── CHANGELOG.md
```

### Module Responsibilities

| Module | Responsibility |
|--------|----------------|
| **src/cli/index.js** | Commander.js router, command registration |
| **src/cli/init.js** | Interactive prompts, template rendering, file creation |
| **src/cli/install.js** | Copy assets to ~/.muaddib, create symlinks |
| **src/cli/update.js** | Smart merge updates, preserve customizations |
| **src/cli/doctor.js** | Installation health checks, diagnostics |
| **src/cli/uninstall.js** | Remove global/project components |
| **src/lib/template-engine.js** | Handlebars rendering, custom helpers, partials |
| **src/lib/file-manager.js** | Safe file ops, backup/restore, symlinks |
| **src/lib/config-merger.js** | Deep merge with prototype pollution protection |
| **src/lib/validator.js** | Input validation, JSON validation, hook validation |
| **src/utils/paths.js** | Path constants (GLOBAL_DIR, PROJECT_DIR, etc.) |
| **src/utils/logger.js** | Colored output, sensitive data redaction |
| **src/utils/prompts.js** | Inquirer wrapper for consistent prompts |

---

## Key APIs

### file-manager.js

Full documentation: [API-FILE-MANAGER.md](./API-FILE-MANAGER.md)

#### Critical Note: listFiles() Return Type

```javascript
// listFiles() returns an OBJECT, not an array!
const { files, limitReached } = await listFiles(dir, { extensions: ['.js'] });

// WRONG - will throw "TypeError: is not iterable"
const files = await listFiles(dir);
for (const f of files) { ... }  // ERROR!
```

#### Key Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `listFiles` | `(dir, opts) → {files[], limitReached}` | List files with filtering |
| `validatePath` | `(filePath, baseDir) → boolean` | Prevent path traversal |
| `readFile` | `(path) → string` | Read file as UTF-8 |
| `readJson` | `(path) → object` | Parse JSON file |
| `writeFile` | `(path, content, opts) → void` | Write with optional backup |
| `writeJson` | `(path, obj, opts) → void` | Write formatted JSON |
| `ensureDir` | `(dirPath) → void` | Create directory recursively |
| `copyDir` | `(src, dest, opts) → void` | Copy with DoS protection |
| `copyFile` | `(src, dest, opts) → void` | Copy single file |
| `symlink` | `(target, link, opts) → void` | Create symlink atomically |
| `isSymlink` | `(path) → boolean` | Check if path is symlink |
| `exists` | `(path) → boolean` | Check file/dir existence |
| `remove` | `(path) → void` | Remove file or directory |
| `backup` | `(path, dest) → string` | Create timestamped backup |
| `restore` | `(backup, original) → void` | Restore from backup |
| `rotateBackups` | `(dir, opts) → {kept, deleted}` | Keep N most recent |
| `cleanupBackups` | `(dir, opts) → {deleted, retained}` | Remove old backups |

### template-engine.js

```javascript
import { render, registerHelper, validateInputLength, validateJson } from './template-engine.js';

// Render a template with context
const output = await render('CLAUDE.md', {
  projectName: 'my-project',
  projectType: 'node',
  codebaseMaturity: 'DISCIPLINED',
  orchestrationLevel: 'full',
  useHooks: true,
  useAgentDelegation: true
});

// Validate input length (DoS protection)
validateInputLength(data, { maxLength: 100000 });

// Validate JSON content
const { valid, error, parsed } = validateJson(jsonString);
```

#### Built-in Handlebars Helpers

| Helper | Usage | Description |
|--------|-------|-------------|
| `if-eq` | `{{#if-eq a b}}...{{/if-eq}}` | Equality comparison |
| `if-ne` | `{{#if-ne a b}}...{{/if-ne}}` | Not-equal comparison |
| `contains` | `{{#contains arr val}}...{{/contains}}` | Array includes |
| `json` | `{{json object}}` | Pretty-print JSON |
| `uppercase` | `{{uppercase str}}` | Convert to uppercase |
| `lowercase` | `{{lowercase str}}` | Convert to lowercase |

### config-merger.js

```javascript
import { deepMerge } from './config-merger.js';

// Safely merge configs with prototype pollution protection
const merged = deepMerge(defaultConfig, userConfig);

// Arrays are concatenated and deduplicated
// Objects are recursively merged
// Primitives: source overrides target
// Blocked keys: __proto__, constructor, prototype
```

### validator.js

```javascript
import { validatePath, validateJson, validateHookDefinition } from './validator.js';

// Prevent path traversal attacks
const safe = validatePath('/some/path/../../../etc/passwd', '/safe/base');
// Returns false - traversal detected

// Validate hook configuration
const { valid, errors } = validateHookDefinition({
  type: 'command',
  command: 'echo "hello"'
});
```

---

## Template System

### Main Templates

| Template | Output | Description |
|----------|--------|-------------|
| `CLAUDE.md.hbs` | `CLAUDE.md` | Orchestration rules (~2600 lines) |
| `settings.json.hbs` | `.claude/settings.json` | Hooks and permissions |
| `config.json.hbs` | `.muaddib/config.json` | Project configuration |
| `context.md.hbs` | `.claude/context.md` | Session context |
| `critical-context.md.hbs` | `.claude/critical-context.md` | Compaction-safe context |
| `checkpoint.md.hbs` | `.claude/checkpoint.md` | Session checkpoints |

### Partials (15 files)

Partials are reusable template fragments in `templates/partials/`:

```handlebars
{{!-- In CLAUDE.md.hbs --}}
{{> intent-classification}}
{{> workflow-phases}}
{{> orchestration-rules}}
```

### Context Variables

Templates receive these context variables:

| Variable | Type | Description |
|----------|------|-------------|
| `projectName` | string | Project name |
| `projectType` | string | node/typescript/python/go/rust |
| `codebaseMaturity` | string | GREENFIELD/TRANSITIONAL/DISCIPLINED/LEGACY |
| `orchestrationLevel` | string | minimal/standard/full |
| `useHooks` | boolean | Enable hooks |
| `useAgentDelegation` | boolean | Enable agent delegation |
| `version` | string | Package version |

### Adding New Templates

1. Create `.hbs` file in `templates/`
2. Add context type definitions (JSDoc or TypeScript)
3. Register in template-engine.js if needed
4. Add tests for rendering

### Adding New Partials

1. Create `.hbs` file in `templates/partials/`
2. Use `{{> partial-name}}` in parent templates
3. Partials auto-register on first render

---

## Skills Architecture

### Skill File Format

Skills use YAML frontmatter + Markdown body:

```markdown
---
name: muaddib-explore
description: Isolated codebase exploration
context: fork           # fork (isolated) or main
agent: Explore          # Agent type to use
model: sonnet           # Model: sonnet or opus
allowed-tools:          # Tool whitelist (optional)
  - Read
  - Glob
  - Grep
hooks:                  # Skill-specific hooks (optional)
  Stop:
    - type: command
      command: "echo 'Returning to main context'"
---

# Skill Content

Markdown content with instructions for the skill...
```

### Context Types

| Context | Behavior | Use For |
|---------|----------|---------|
| `main` | Runs in main session | Coordination, validation, checkpoints |
| `fork` | Isolated context | Exploration, research, refactoring |

### Forked Context Benefits

- Read 50+ files without bloating main context
- Multiple searches don't accumulate
- Only summarized results return to main
- Perfect for research and parallel investigations

### Creating New Skills

1. Create `skill-name.md` in `lib/skills/muaddib/`
2. Add frontmatter with required fields:
   - `name`: Skill identifier (muaddib-*)
   - `description`: Brief description
   - `context`: fork or main
3. Write skill instructions in Markdown body
4. Update `SKILL.md` manifest if needed

### Skill Invocation

Users invoke skills with slash commands:

```
/muaddib-orchestrate   # Main workflow coordination
/muaddib-explore       # Forked context exploration
/muaddib-lsp           # Semantic code operations
/muaddib-refactor      # AST-grep transformations
```

---

## Hook System

### Hook Types

| Type | Trigger | Use For |
|------|---------|---------|
| `PreToolUse` | Before tool execution | Command validation, file checks |
| `PostToolUse` | After tool execution | Formatting, logging |
| `SessionStart` | Session begins | Load context, check todos |
| `Stop` | Session ends | Verify completion, cleanup |
| `PreCompact` | Before compaction | Save critical context |

### Hook Definition Format

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": ".claude/scripts/validate-bash-command.sh \"$INPUT\""
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Edit",
        "hooks": [
          {
            "type": "command",
            "command": "prettier --write \"$FILEPATH\""
          }
        ]
      }
    ]
  }
}
```

### Hook Scripts

Scripts in `scripts/` implement hook logic:

| Script | Purpose | Trigger |
|--------|---------|---------|
| `validate-bash-command.sh` | Block dangerous commands | PreToolUse(Bash) |
| `pre-edit-check.sh` | Validate file before edit | PreToolUse(Edit) |
| `post-edit-log.sh` | Log file changes | PostToolUse(Edit) |
| `error-detector.sh` | Detect build/test errors | PostToolUse |
| `notify-idle.sh` | Idle notifications | Idle timer |

### Security in Hooks

- Scripts validate and sanitize input
- Blocked patterns: `rm -rf`, `sudo`, `curl | sh`
- Path validation prevents traversal
- Environment variables redacted from logs

---

## Testing

### Test Suite Overview

**466 tests** across **9 test files**:

| Test File | Coverage Area | Focus |
|-----------|---------------|-------|
| `cli.test.js` | CLI commands | Command routing, options |
| `file-manager.test.js` | File operations | Read/write, backup, symlinks |
| `init.test.js` | Initialization | Templates, hooks, skills |
| `template-engine.test.js` | Templates | Rendering, helpers, partials |
| `settings-merge.test.js` | Config merging | Deep merge, deduplication |
| `security-verification.test.js` | Security | Path traversal, injection |
| `hooks.test.js` | Hook system | Configuration, validation |
| `shell-scripts.test.js` | Shell scripts | Script validation |
| `e2e.test.js` | End-to-end | Full workflows |

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Run specific test file
npm test -- cli.test.js

# Run tests matching pattern
npm test -- --testNamePattern="listFiles"

# Verbose output
npm test -- --verbose
```

### Test Patterns

```javascript
// Jest with ES modules
import { jest } from '@jest/globals';

// Mock file system
jest.unstable_mockModule('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn()
}));

// Test async functions
test('listFiles returns object with files array', async () => {
  const { files, limitReached } = await listFiles(testDir);
  expect(Array.isArray(files)).toBe(true);
  expect(typeof limitReached).toBe('boolean');
});

// Test error cases
test('validatePath rejects traversal', () => {
  expect(validatePath('../../../etc/passwd', '/safe')).toBe(false);
});
```

### Adding Tests

1. Create test in `__tests__/` directory
2. Name pattern: `*.test.js`
3. Use Jest assertions and mocking
4. Test both success and error cases
5. Run full suite before committing

---

## Development Workflow

### Setting Up

```bash
# Clone repository
git clone https://github.com/AmbitiousRealism2025/Atreides.git
cd Atreides/muaddib-claude

# Install dependencies
npm install

# Run tests to verify setup
npm test
```

### Making Changes

1. **Create branch** from `main`
2. **Make changes** following code standards
3. **Run tests**: `npm test`
4. **Run linter**: `npm run lint`
5. **Fix issues**: `npm run lint:fix`
6. **Commit** with descriptive message
7. **Push** and create PR

### Commit Messages

```
type: Brief description

[Optional body with details]

Co-Authored-By: Your Name <email@example.com>
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

### Pull Requests

- Reference related issues
- Include test coverage for new features
- Update documentation if needed
- Ensure all tests pass
- Request review from maintainers

---

## Code Standards

### ES Modules

```javascript
// Always use ES module syntax
import { something } from './module.js';
export function myFunction() { ... }

// Never use CommonJS
const x = require('./x');  // ❌ Wrong
module.exports = x;        // ❌ Wrong
```

### JSDoc Comments

```javascript
/**
 * Brief description of function.
 *
 * @param {string} filePath - Path to file
 * @param {Object} options - Configuration options
 * @param {boolean} [options.backup=false] - Create backup
 * @returns {Promise<string>} File contents
 * @throws {Error} If file doesn't exist
 *
 * @example
 * const content = await readFile('/path/to/file.js');
 */
export async function readFile(filePath, options = {}) {
  // ...
}
```

### Error Handling

```javascript
// Always use descriptive error messages
throw new Error(`File not found: ${filePath}`);

// Catch and wrap external errors
try {
  await fs.readFile(path);
} catch (err) {
  throw new Error(`Failed to read ${path}: ${err.message}`);
}

// Validate inputs early
if (!filePath || typeof filePath !== 'string') {
  throw new Error('filePath must be a non-empty string');
}
```

### Async/Await

```javascript
// Prefer async/await over promises
async function processFiles(files) {
  const results = [];
  for (const file of files) {
    const content = await readFile(file);
    results.push(await process(content));
  }
  return results;
}

// Use Promise.all for parallel operations
const results = await Promise.all(files.map(f => readFile(f)));
```

---

## Security Practices

### Path Traversal Prevention

```javascript
import { validatePath } from './validator.js';

// Always validate paths against base directory
const safePath = validatePath(userInput, baseDir);
if (!safePath) {
  throw new Error('Invalid path: traversal detected');
}
```

### Prototype Pollution Prevention

```javascript
// deepMerge blocks dangerous keys
const BLOCKED_KEYS = ['__proto__', 'constructor', 'prototype'];

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (BLOCKED_KEYS.includes(key)) continue;  // Skip dangerous keys
    // ... merge logic
  }
}
```

### Command Injection Prevention

```javascript
// Never interpolate user input into shell commands
// Use proper escaping or avoid shell entirely

// ❌ Dangerous
exec(`cat ${userInput}`);

// ✅ Safe - use file operations instead
await readFile(userInput);
```

### Sensitive Data Redaction

```javascript
import { debug } from './logger.js';

// Logger automatically redacts sensitive patterns
debug('Processing config', config);
// Redacts: .env, credentials, secrets, .ssh, .aws, tokens
```

### Input Validation

```javascript
// Validate all external input
validateInputLength(data, { maxLength: 100000 });
validateJson(content);
validateHookDefinition(hookConfig);
validatePath(filePath, baseDir);
```

---

## Questions?

- Open an issue for bugs or feature requests
- Check existing documentation in `docs/`
- Review test files for usage examples
- See CHANGELOG.md for version history

---

*Happy contributing!*
