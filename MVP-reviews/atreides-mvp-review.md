# Atreides MVP Review (Phase 0-2)

## Scope
- **MVP definition**: Phase 0-2 from `MASTER-PLAN.md` (package architecture + MVP foundation + core orchestration).
- **Reviewed areas**: CLI commands, template engine, config merge, MVP templates/partials, hook scripts, tests.
- **Out of scope**: Phase 3-5 features (skills, LSP/AST integrations, extended workflows) except where they directly affect MVP behavior.

## Findings (ordered by severity)

### High
1) **`--minimal`/`--full` flags do not normalize dependent settings in interactive mode**
   - When `--minimal` or `--full` is passed without `--yes`, `orchestrationLevel` is overridden after prompts, but `useHooks` and `useAgentDelegation` are not updated. This means `--minimal` can still copy hooks/scripts and `--full` can leave `useAgentDelegation` unset/false in `.muaddib/config.json`.
   - Evidence: `muaddib-claude/src/cli/init.js:102-105`, `muaddib-claude/src/cli/init.js:188-195`, `muaddib-claude/templates/config.json.hbs:6-12`.
   - Impact: mode semantics drift from CLI flags; project config does not reflect selected orchestration mode.
   - Fix: after overriding `orchestrationLevel`, explicitly set `useHooks`/`useAgentDelegation` according to the selected mode.

### Medium
2) **Edit/Write hooks pass `$FILE` but hook scripts ignore arguments**
   - `settings.json` invokes `pre-edit-check.sh` and `post-edit-log.sh` with `"$FILE"`, but both scripts read only `TOOL_INPUT`. If `TOOL_INPUT` is absent or not a file path, the hooks silently no-op, weakening safety checks and logging/formatting.
   - Evidence: `muaddib-claude/templates/settings.json.hbs:12-48`, `muaddib-claude/scripts/pre-edit-check.sh:15-20`, `muaddib-claude/scripts/post-edit-log.sh:15-20`.
   - Impact: blocked-file guardrails can be bypassed and edit logs can be incomplete.
   - Fix: accept the first argument and fall back to `TOOL_INPUT` (e.g., `FILE="${1:-${TOOL_INPUT:-}}"`).

3) **Minimal mode still creates `.claude/` directory**
   - The CLI advertises “minimal initialization (CLAUDE.md only)”, but `.claude/` is always created.
   - Evidence: `muaddib-claude/src/cli/init.js:120-121`.
   - Impact: behavior diverges from documented expectation; creates extra filesystem artifacts.
   - Fix: only create `.claude/` when not minimal, or update CLI messaging/documentation to match behavior.

4) **Recovery guidance risks data loss without guardrails**
   - The MVP 3-strikes protocol instructs `git checkout .` without checking for git presence or warning about uncommitted work. In a repo with local changes, this can discard work.
   - Evidence: `muaddib-claude/templates/partials/orchestration-rules.hbs:68-90`.
   - Impact: encourages destructive recovery in real projects.
   - Fix: update guidance to verify git status first and prefer `git restore` or file-scoped restore.

### Low
5) **Fallback settings are permissive if template rendering fails**
   - The fallback settings file is `{ hooks: {}, permissions: { allow: [], deny: [] } }`. If rendering fails, safety policies are effectively absent.
   - Evidence: `muaddib-claude/src/cli/init.js:142-150`, `muaddib-claude/src/cli/init.js:280-287`.
   - Impact: rare, but degrades security posture in failure scenarios.
   - Fix: use a minimal deny list in the fallback or abort initialization if settings generation fails.

## Test Coverage Gaps (MVP-specific)
- No integration tests that assert **flag behavior** (`--minimal`/`--full`) or the resulting file set and config values.
- No tests for **hook script behavior**, argument handling, or environment expectations.
- No tests for **fallback templates**, which are critical for failure paths.

## Strengths Observed
- CLI commands are well-structured and consistently logged.
- Template engine helpers and partial loading are clear and extensible.
- File manager utilities are covered with robust unit tests.

## Open Questions
- Should minimal mode intentionally create `.claude/`, or should it truly be CLAUDE.md only?
- Do Claude Code hooks reliably set `TOOL_INPUT` to file paths, or should `$FILE` be the primary input?
- Is `useAgentDelegation` meant to be enforced automatically whenever `--full` is selected?

## Suggested Next Steps
1) Normalize config flags after interactive overrides in `init`.
2) Update hook scripts to honor passed arguments and add tests for hook behavior.
3) Clarify minimal mode expectations and align CLI behavior or messaging.
4) Add MVP-focused integration tests for `init` and `settings.json` generation.
