# Repository Guidelines

## Project Structure
- `muaddib-claude/` is the main Node.js CLI package (source in `muaddib-claude/src/`, entry point `muaddib-claude/bin/muaddib.js`).
- `muaddib-claude/__tests__/` holds Jest tests for the CLI and lib modules.
- `muaddib-claude/templates/` and `muaddib-claude/scripts/` contain generated project templates and hook scripts.
- `implementation-phase-*`, `mid-point-reviews/`, and `research-archive/` are planning and design docs; treat as reference material.

## Build, Test, and Development Commands
Run these from `muaddib-claude/`:
- `npm install` — install dependencies.
- `npm test` — run Jest suite once.
- `npm run test:watch` — watch mode for tests.
- `npm run lint` — ESLint on `src/`.
- `npm run lint:fix` — auto-fix lint issues in `src/`.
- `npm run prepare` — ensure `scripts/` and `bin/` are executable (packaging/installation step).
- `node ./bin/muaddib.js --help` — smoke-test the CLI locally.

## Coding Style & Naming Conventions
- Use ES modules (`import`/`export`) and Node 18+ features.
- Indentation: 2 spaces; prefer `const` and allow unused parameters only when prefixed with `_` (see `muaddib-claude/.eslintrc.json`).
- File names: kebab-case for modules (`file-manager.js`, `config-merger.js`); functions and variables: camelCase.
- Run ESLint before submitting changes.

## Testing Guidelines
- Framework: Jest, tests live in `muaddib-claude/__tests__/` and use `*.test.js` naming.
- Add or update tests when changing CLI behavior, template output, or file operations.
- No explicit coverage threshold is configured; keep changes covered by relevant unit/integration tests.

## Commit & Pull Request Guidelines
- Commit history is minimal (only an "Initial commit"), so no established convention. Use short, imperative messages (e.g., "Add CLI update command").
- PRs should include a clear description, list of affected areas (e.g., `src/`, `templates/`), and test results; add screenshots only for documentation/CLI output changes.
