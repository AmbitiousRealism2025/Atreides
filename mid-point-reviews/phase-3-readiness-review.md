# Phase 3 Readiness Review (Claude Opus Work)

## Scope
Review of work through Phase 3 completion to assess readiness for Phase 4 and Phase 5 features.

## Findings (Ordered by Severity)

### Medium: Project updates will not pick up new hooks/permissions
`updateProject` spreads existing settings over new defaults and only shallow-merges `hooks`, so new hook types or permission rules added in Phase 4/5 will not propagate to existing projects.
- Impact: Projects upgraded via `muaddib update --project` will miss critical hooks/permissions needed for Phase 4/5.
- Evidence: `muaddib-claude/src/cli/update.js:163`

### Medium: Documentation claims context injection that settings don’t enable
Templates state that context/critical-context files are auto-injected via hooks, but the generated settings only define `PostToolUse` hooks.
- Impact: Users will assume hooks are active; context injection won’t actually occur.
- Evidence: `muaddib-claude/templates/context.md.hbs:3`, `muaddib-claude/templates/partials/context-management.hbs:144`, `muaddib-claude/templates/settings.json.hbs:1`

### Medium: Codebase maturity is miswired
`Codebase Maturity` in `CLAUDE.md` is filled from `orchestrationLevel`, and no prompt collects a maturity value. This makes maturity-specific guidance unreliable.
- Impact: Guidance based on maturity levels is inaccurate by default.
- Evidence: `muaddib-claude/templates/CLAUDE.md.hbs:9`, `muaddib-claude/src/utils/prompts.js:109`

### Medium: Global update does not refresh skills
`muaddib update` updates templates/scripts/lib core but does not copy skills or refresh the skill symlink.
- Impact: Changes to `lib/skills/muaddib/SKILL.md` will not reach existing global installs.
- Evidence: `muaddib-claude/src/cli/update.js:83`

### Low: Template version is hard-coded
`getDefaultData` returns a fixed version, so regenerated files can show stale versions after package updates.
- Impact: Confusing or misleading version labeling.
- Evidence: `muaddib-claude/src/lib/template-engine.js:213`, `muaddib-claude/templates/CLAUDE.md.hbs:10`

### Medium: No automated tests
Jest is configured, but no tests are present for CLI behavior or template rendering.
- Impact: Regressions in Phase 4/5 changes are likely to slip through unnoticed.
- Evidence: No test files found in `muaddib-claude/`

## Readiness Assessment
- Phase 0–3 foundations are in place, but Phase 4/5 readiness is **blocked by upgrade/propagation gaps**.
- The primary risk is that existing users will not receive new hooks, permissions, or skill updates without manual intervention.

## Questions / Clarifications
1. Should Phase 4+ upgrades auto-merge new hooks and permissions into existing projects, or should updates require a full re-init/regeneration flow?
2. Should codebase maturity be prompted during `muaddib init`, or left as a manual edit in `CLAUDE.md`?

## Suggested Remediations (Next Steps)
1. Deep-merge settings on project update so new hooks/permissions propagate safely.
2. Align documentation with actual hook config, or expand settings template to include SessionStart/PreCompact hooks as described.
3. Add a maturity prompt and wire it to `CLAUDE.md`.
4. Update global update to refresh skills and the symlink.
5. Add a minimal test suite for `init`, `update`, and template rendering.
