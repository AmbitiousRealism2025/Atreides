# Core Library

This directory is synced to `~/.hawat/lib/core/` during installation.

**Source of truth:** `templates/partials/*.hbs`

The orchestration content (agent definitions, workflow phases, context management, etc.) 
lives in Handlebars partials under `templates/partials/`. Those partials are assembled 
into the generated CLAUDE.md during `hawat init`.

The `.md` files previously in this directory were ~80% duplicates of the partials and 
have been removed. Any documentation content should be maintained in the templates.

## Directory Structure (After Cleanup)

```
lib/
  core/
    README.md    ← This file
  skills/
    hawat/     ← Skill definitions loaded on demand
```
