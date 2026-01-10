# Context: Context Injection Files (Tasks 4.4.1 - 4.4.2)

## Task Group Overview

- Task 4.4.1: Create context.md template
- Task 4.4.2: Create critical-context.md template

---

## Task 4.4.1: context.md Template

### Purpose

Provide project context at the start of every session via SessionStart hook.

### File Location

`.claude/context.md`

### Template Content

```markdown
# Project Context

## Project Overview

**Name**: [Project Name]
**Type**: [Web App / CLI Tool / Library / API / etc.]
**Language**: [Primary language]
**Framework**: [Primary framework if applicable]

### Brief Description
[1-2 sentences describing what this project does]

---

## Current Development State

**Status**: [Active / Maintenance / Early Development / etc.]
**Last Updated**: [Date]

### Active Work Areas
- [Area 1]: [Brief description]
- [Area 2]: [Brief description]

### Recent Changes
- [Date]: [Change description]
- [Date]: [Change description]

---

## Key Patterns to Follow

### Code Style
- [Style guide reference or key rules]
- [Naming conventions]
- [File organization patterns]

### Architecture Patterns
- [Pattern 1]: [Where/how used]
- [Pattern 2]: [Where/how used]

### Testing Patterns
- Test location: [path]
- Test command: [command]
- Coverage requirements: [if any]

---

## Important Files

| File/Directory | Purpose |
|----------------|---------|
| src/index.ts | Main entry point |
| src/config/ | Configuration files |
| src/utils/ | Utility functions |
| tests/ | Test files |

---

## Dependencies of Note

- [Dependency 1]: [Why important / version notes]
- [Dependency 2]: [Why important / version notes]

---

## Known Issues / Constraints

- [Issue 1]: [Brief description]
- [Constraint 1]: [Brief description]

---

*This context is injected at session start via SessionStart hook.*
*Update this file as the project evolves.*
```

### Usage Notes

1. **Keep it concise**: This is injected at every session start
2. **Update regularly**: Stale context is worse than no context
3. **Focus on current state**: Not historical documentation
4. **Include actionable info**: Patterns to follow, commands to use

### Customization Guide

**For a Node.js Project**:
```markdown
## Key Patterns to Follow

### Code Style
- ESLint + Prettier enforced
- TypeScript strict mode
- camelCase for variables, PascalCase for components

### Testing Patterns
- Test location: `__tests__/` directories
- Test command: `npm test`
- Framework: Jest with React Testing Library
```

**For a Python Project**:
```markdown
## Key Patterns to Follow

### Code Style
- Black formatter, 88 char line length
- Type hints required for public functions
- snake_case for functions and variables

### Testing Patterns
- Test location: `tests/`
- Test command: `pytest`
- Framework: pytest with pytest-cov
```

---

## Task 4.4.2: critical-context.md Template

### Purpose

Preserve absolutely critical information during context compaction via PreCompact hook.

### File Location

`.claude/critical-context.md`

### Template Content

```markdown
# Critical Context

## ⚠️ NEVER FORGET

These items must be remembered across any context compaction:

1. [Critical item 1]
2. [Critical item 2]
3. [Critical item 3]

---

## 🎯 CURRENT OBJECTIVE

[Single clear statement of what we're currently trying to accomplish]

**Success looks like**: [Concrete description of done state]

---

## 📁 KEY FILES IN PROGRESS

Currently being modified:
- `[path/to/file1]` - [What we're doing to it]
- `[path/to/file2]` - [What we're doing to it]

Do NOT forget about these files.

---

## 📝 DECISIONS MADE

Key decisions that inform current work:

| Decision | Rationale |
|----------|-----------|
| [Decision 1] | [Why we chose this] |
| [Decision 2] | [Why we chose this] |

These decisions should NOT be reconsidered without explicit user request.

---

## 🚫 DO NOT

- [Something we decided not to do and why]
- [Approach we rejected]

---

## 🔧 RECOVERY INSTRUCTIONS

If this context is read after compaction:

1. Current task: [What we were doing]
2. Next step would be: [The immediate next action]
3. Check: `[file or git command to see current state]`

---

*This context is injected during PreCompact.*
*Keep this file SHORT - only truly critical information.*
*Update this file actively during complex work.*
```

### Usage Notes

1. **Keep it VERY short**: Compaction means context is limited
2. **Update during work**: Not just at session start
3. **Focus on recovery**: Help future context understand current state
4. **Critical = can't continue without**: Not nice-to-have

### Size Guidelines

| Section | Max Size | Priority |
|---------|----------|----------|
| NEVER FORGET | 3-5 items | Critical |
| CURRENT OBJECTIVE | 2-3 sentences | Critical |
| KEY FILES | 3-5 files | High |
| DECISIONS MADE | 3-5 rows | High |
| DO NOT | 2-3 items | Medium |
| RECOVERY | 3-5 lines | Medium |

**Total target**: <500 words

### When to Update critical-context.md

```markdown
Update critical-context.md when:
☐ Starting a complex multi-step task
☐ Making architectural decisions
☐ Before any risky operations
☐ When context is getting long
☐ Every 30 minutes of active work
☐ Changing direction or approach
```

---

## Comparison: context.md vs critical-context.md

| Aspect | context.md | critical-context.md |
|--------|------------|---------------------|
| **Injected** | SessionStart | PreCompact |
| **Size** | Medium (1-2 pages) | Small (<500 words) |
| **Content** | Project overview | Current task state |
| **Update frequency** | Weekly | During active work |
| **Purpose** | Orient to project | Survive compaction |
| **Focus** | Patterns, structure | Immediate objectives |

---

## Integration Flow

```
Session Start
      │
      ▼
SessionStart Hook
      │
      ▼
cat .claude/context.md
      │
      ▼
[Project context injected]
      │
      ▼
... Work happens ...
      │
      ▼
Context fills up (~95%)
      │
      ▼
PreCompact Hook
      │
      ▼
cat .claude/critical-context.md
      │
      ▼
[Critical context preserved]
      │
      ▼
Compaction occurs
      │
      ▼
[Continue with critical context intact]
```

---

## File Creation

### Create context.md

```bash
mkdir -p .claude
cat > .claude/context.md << 'EOF'
# Project Context

## Project Overview

**Name**: [Project Name]
**Type**: [Project Type]
**Language**: [Language]

### Brief Description
[Description here]

---

*Update this file as the project evolves.*
EOF
```

### Create critical-context.md

```bash
cat > .claude/critical-context.md << 'EOF'
# Critical Context

## ⚠️ NEVER FORGET

1. [Item 1]

## 🎯 CURRENT OBJECTIVE

[Objective here]

---

*Keep this file SHORT.*
EOF
```

---

## Acceptance Criteria

### Task 4.4.1
- [ ] context.md template created
- [ ] Contains project overview section
- [ ] Contains current state section
- [ ] Contains patterns section
- [ ] Contains important files section
- [ ] Has usage notes for customization
- [ ] Located at .claude/context.md

### Task 4.4.2
- [ ] critical-context.md template created
- [ ] Contains NEVER FORGET section
- [ ] Contains CURRENT OBJECTIVE section
- [ ] Contains KEY FILES section
- [ ] Contains DECISIONS MADE section
- [ ] Contains RECOVERY INSTRUCTIONS section
- [ ] Is appropriately short (<500 words)
- [ ] Located at .claude/critical-context.md

---

*Context for Tasks 4.4.1 - 4.4.2*
