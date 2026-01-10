# Context: Project Setup (Tasks 1.1 - 1.3)

## Task Group Overview

This context covers the initial project setup:
- Task 1.1: Design final package structure
- Task 1.2: Create package.json
- Task 1.3: Set up project scaffolding

---

## Task 1.1: Design Final Package Structure

### Objective

Finalize the directory structure ensuring:
- NPM can install globally and link bin commands
- Templates are accessible at runtime
- Scripts are executable
- Documentation is discoverable

### Final Structure

```
muaddib-claude/
├── package.json           # NPM configuration
├── README.md              # Package documentation
├── LICENSE                # MIT license
├── .gitignore             # Git ignore patterns
├── .npmignore             # NPM ignore patterns
├── .eslintrc.json         # ESLint configuration
├── bin/
│   └── muaddib.js         # CLI entry (must have hashbang)
├── src/
│   ├── cli/
│   │   ├── index.js       # Commander.js router
│   │   ├── install.js     # install command
│   │   ├── init.js        # init command
│   │   ├── update.js      # update command
│   │   ├── doctor.js      # doctor command
│   │   ├── config.js      # config command
│   │   └── reset.js       # reset command
│   ├── lib/
│   │   ├── index.js       # Library exports
│   │   ├── file-manager.js
│   │   ├── template-engine.js
│   │   ├── config-merger.js
│   │   └── validator.js
│   └── utils/
│       ├── logger.js      # Chalk-based logging
│       ├── prompts.js     # Inquirer helpers
│       └── paths.js       # Path constants
├── templates/
│   ├── CLAUDE.md.hbs
│   ├── settings.json.hbs
│   ├── context.md.hbs
│   ├── critical-context.md.hbs
│   ├── config.json.hbs
│   └── partials/
│       ├── orchestration-rules.hbs
│       ├── workflow-phases.hbs
│       ├── agent-definitions.hbs
│       └── quality-standards.hbs
├── scripts/
│   ├── validate-bash-command.sh
│   ├── pre-edit-check.sh
│   ├── post-edit-log.sh
│   ├── error-detector.sh
│   └── notify-idle.sh
├── lib/
│   ├── core/
│   │   ├── orchestration-rules.md
│   │   ├── agent-definitions.md
│   │   └── workflow-phases.md
│   └── skills/
│       └── muaddib/
│           └── SKILL.md
└── tests/
    ├── cli/
    │   ├── install.test.js
    │   ├── init.test.js
    │   └── doctor.test.js
    └── lib/
        ├── template-engine.test.js
        └── config-merger.test.js
```

### Key Directories

| Directory | Purpose | NPM Handling |
|-----------|---------|--------------|
| `bin/` | CLI entry points | Linked to PATH on global install |
| `src/` | Source code | Included in package |
| `templates/` | Handlebars templates | Included, accessed at runtime |
| `scripts/` | Shell scripts | Included, made executable |
| `lib/` | Core documentation | Included for reference |
| `tests/` | Test files | Excluded from package |

---

## Task 1.2: Create package.json

### Complete package.json

```json
{
  "name": "muaddib-claude",
  "version": "1.0.0",
  "description": "OmO-style orchestration for Claude Code - systematic workflows, intelligent agent delegation, and robust error recovery",
  "keywords": [
    "claude",
    "claude-code",
    "ai",
    "orchestration",
    "omo",
    "opencode",
    "ai-assistant",
    "developer-tools",
    "cli"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/muaddib-claude.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/muaddib-claude/issues"
  },
  "homepage": "https://github.com/yourusername/muaddib-claude#readme",
  "type": "module",
  "bin": {
    "muaddib": "./bin/muaddib.js"
  },
  "main": "./src/lib/index.js",
  "exports": {
    ".": "./src/lib/index.js",
    "./templates": "./templates/",
    "./scripts": "./scripts/"
  },
  "files": [
    "bin/",
    "src/",
    "templates/",
    "scripts/",
    "lib/"
  ],
  "scripts": {
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "npm test -- --watch",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "prepare": "chmod +x scripts/*.sh bin/*.js"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "handlebars": "^4.7.8",
    "inquirer": "^9.2.12",
    "chalk": "^5.3.0",
    "fs-extra": "^11.2.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.56.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### Key Configuration Notes

1. **`"type": "module"`**: Enables ES modules (import/export syntax)
2. **`"bin"`**: Maps `muaddib` command to `bin/muaddib.js`
3. **`"files"`**: Specifies what's included in npm package
4. **`"exports"`**: Allows importing templates/scripts programmatically
5. **`"prepare"`**: Makes scripts executable after install

---

## Task 1.3: Set Up Project Scaffolding

### Directory Creation Commands

```bash
# Create all directories
mkdir -p muaddib-claude/{bin,src/{cli,lib,utils},templates/partials,scripts,lib/{core,skills/muaddib},tests/{cli,lib}}
```

### Files to Create

#### bin/muaddib.js
```javascript
#!/usr/bin/env node

import { run } from '../src/cli/index.js';
run();
```

#### .gitignore
```
# Dependencies
node_modules/

# Build outputs
dist/
coverage/

# OS files
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp
*.swo

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local

# Test artifacts
.jest/

# Package artifacts
*.tgz
```

#### .npmignore
```
# Source of truth is package.json "files" field
# This file catches anything missed

# Development files
tests/
coverage/
.github/
.eslintrc.json

# Documentation sources
docs/

# Git
.git/
.gitignore

# IDE
.idea/
.vscode/

# OS
.DS_Store
```

#### .eslintrc.json
```json
{
  "env": {
    "node": true,
    "es2022": true,
    "jest": true
  },
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "extends": "eslint:recommended",
  "rules": {
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": "off",
    "prefer-const": "error"
  }
}
```

#### LICENSE
```
MIT License

Copyright (c) 2026 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Placeholder Files

Create empty placeholder files for each source file:

```bash
# Create placeholder files
touch muaddib-claude/src/cli/{index,install,init,update,doctor,config,reset}.js
touch muaddib-claude/src/lib/{index,file-manager,template-engine,config-merger,validator}.js
touch muaddib-claude/src/utils/{logger,prompts,paths}.js
```

---

## Acceptance Criteria

### Task 1.1 Complete When:
- [ ] Directory structure documented
- [ ] All directories created
- [ ] Purpose of each directory clear

### Task 1.2 Complete When:
- [ ] package.json created with all fields
- [ ] `npm install` succeeds
- [ ] All dependencies specified

### Task 1.3 Complete When:
- [ ] All directories created
- [ ] Placeholder files in place
- [ ] .gitignore configured
- [ ] .npmignore configured
- [ ] LICENSE file added
- [ ] ESLint configured
- [ ] `git init` succeeds

---

## Verification Steps

```bash
# After completing all three tasks:

# 1. Install dependencies
cd muaddib-claude
npm install

# 2. Verify structure
find . -type f | head -30

# 3. Verify bin is executable
ls -la bin/muaddib.js

# 4. Verify lint works
npm run lint

# 5. Verify git ready
git init
git add .
git status
```

---

*Context for Tasks 1.1, 1.2, 1.3*
