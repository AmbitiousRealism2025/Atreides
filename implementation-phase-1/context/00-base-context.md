# Phase 1 Base Context

## Always Load This Document First

This document provides the foundational context for Phase 1: MVP Foundation implementation.

---

## Phase 1 Overview

**Goal**: Create the core template content that delivers 70% of OmO orchestration value.

**Key Outcomes**:
1. Complete CLAUDE.md content with all core sections
2. Settings.json template with permissions
3. Validated integration of TodoWrite, error recovery, and delegation

**Relationship to Phase 0**: Phase 0 created the package structure and templates (.hbs files). Phase 1 fills those templates with the actual orchestration content.

---

## What We're Creating

### CLAUDE.md Sections

```
1. Core Identity
   └── Who the AI is, what it follows

2. Task Management Rules
   └── TodoWrite triggers, completion rules

3. Error Recovery Protocol
   └── 3-strikes, STOP/REVERT/DOCUMENT/CONSULT/ESCALATE

4. Agent Delegation Matrix
   └── Which agents for which tasks

5. Quality Standards
   └── Linting, testing, style requirements
```

### settings.json Structure

```json
{
  "hooks": {
    "PostToolUse": [...]  // Placeholder for Phase 2
  },
  "permissions": {
    "allow": [...],       // Safe operations
    "deny": [...]         // Dangerous operations
  }
}
```

---

## OmO Patterns Being Adapted

### From OmO's Sisyphus Orchestrator

| OmO Feature | Phase 1 Adaptation |
|-------------|-------------------|
| 504-line system prompt | Modular CLAUDE.md sections |
| 9 workflow phases | Simplified 4-phase model |
| Dynamic routing | Static delegation matrix |
| Automatic model switching | Manual model selection |

### Core Principles Preserved

1. **Systematic Workflow**: Every task follows defined phases
2. **Intelligent Delegation**: Right agent for right task
3. **Robust Recovery**: 3-strikes with clear escalation
4. **Quality First**: Never compromise on code quality

---

## Content Guidelines

### Writing Style

- **Directive**: Use imperative mood ("Do this", not "You should do this")
- **Unambiguous**: No room for interpretation
- **Actionable**: Every rule has clear action
- **Concise**: Minimum words for maximum clarity

### Format Standards

- Use markdown tables for matrices
- Use ASCII diagrams for flows
- Use numbered lists for sequences
- Use bullet lists for requirements

### Examples

Good:
```markdown
## Task Management

1. **Use TodoWrite for any task with 3+ steps**
2. **Mark complete only when verified**
3. **Never stop with incomplete todos**
```

Bad:
```markdown
## Task Management

You might want to consider using TodoWrite when you have
multiple steps. It's generally a good idea to mark things
complete when they're done. Try not to stop early.
```

---

## Key Terminology

| Term | Definition |
|------|------------|
| **Strike** | A failed attempt at an operation |
| **3-Strikes** | Protocol triggered after 3 consecutive failures |
| **STOP** | Halt all modifications immediately |
| **REVERT** | Return to last known working state |
| **CONSULT** | Delegate to Plan agent for guidance |
| **ESCALATE** | Ask user for intervention |
| **Atomic Task** | Single, clear deliverable |
| **Delegation** | Routing task to specialized agent |

---

## Reference Documents

| Document | Location | Use For |
|----------|----------|---------|
| Master Plan | `/MASTER-PLAN.md` | Phase 1 specifications |
| OmO Internals | `/omo-internals-deep-dive.md` | Sisyphus patterns |
| Error Recovery | `/planning-context/09-error-recovery-protocols.md` | 3-strikes details |
| Agent Hierarchy | `/planning-context/03-agent-hierarchy-and-types.md` | Agent mappings |
| Task Management | `/planning-context/10-task-management-patterns.md` | Task patterns |

---

## Integration Points

### With Phase 0 Templates

Content created in Phase 1 must work with:

1. **CLAUDE.md.hbs** - Main template
   - Uses Handlebars partials
   - Has variable placeholders ({{projectName}}, etc.)

2. **Partials** - Section templates
   - `orchestration-rules.hbs` - Tasks 1.2, 1.3
   - `agent-definitions.hbs` - Task 1.4
   - `quality-standards.hbs` - Task 1.5
   - `workflow-phases.hbs` - Used in Phase 3

3. **settings.json.hbs** - Settings template
   - Task 2.2 defines the content

### Variable Placeholders

When writing content, use these placeholders:

| Placeholder | Example Value |
|-------------|---------------|
| `{{projectName}}` | "my-project" |
| `{{projectType}}` | "node" |
| `{{maturity}}` | "transitional" |
| `{{strictMode}}` | true/false |
| `{{version}}` | "1.0.0" |

---

## Success Metrics

Phase 1 is successful when:

| Metric | Target |
|--------|--------|
| CLAUDE.md completeness | All 5 sections done |
| Settings.json validity | Valid JSON, blocks dangerous ops |
| TodoWrite triggers | 100% for 3+ step tasks |
| Error recovery clarity | Unambiguous protocol |
| Delegation accuracy | Correct agent selection |

---

## Constraints

1. **No Phase 2+ Content**: Don't add intent classification, 7-section template, etc.
2. **Minimal Hooks**: Only placeholder hooks structure
3. **Basic Permissions**: Start conservative, expand in Phase 4
4. **Single Maturity**: Content should work for all maturity levels

---

*Base context for Phase 1 implementation*
*Load task-specific context as needed per README.md markers*
