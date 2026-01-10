# Implementation Phase 2: Core Orchestration

## Phase Overview

**Goal**: Enable intelligent task routing with intent classification, comprehensive delegation templates, and automated quality hooks.

**Phase Duration**: 2 days (~4 hours actual work)
**Dependencies**: Phase 1 complete (MVP foundation exists)

---

## Success Criteria

Before marking this phase complete, verify:

- [ ] Intent classification occurs before task start
- [ ] Ambiguous requests trigger AskUserQuestion
- [ ] Delegation prompts follow 7-section template
- [ ] Model selection matches task complexity
- [ ] PostToolUse hooks fire on Edit/Write operations
- [ ] Codebase maturity documented and referenced

---

## Task Breakdown

### Group 1: Intent Classification

<!-- LOAD_CONTEXT: context/01-intent-classification.md -->

#### Task 1.1: Add Intent Classification Section
**Objective**: Define request categories and their handling.

**Content to Create**:
- 5 request categories (Trivial, Explicit, Exploratory, Open-ended, Ambiguous)
- Category descriptions
- Default actions per category

**Acceptance Criteria**:
- All 5 categories defined
- Actions are unambiguous
- Decision tree is clear

---

#### Task 1.2: Add Classification Decision Rules
**Objective**: Define how to classify incoming requests.

**Content to Create**:
- Decision questions to ask
- Ambiguous request handling
- Exploratory request handling
- Clear routing logic

**Acceptance Criteria**:
- Decision process is step-by-step
- Edge cases addressed
- Examples provided

---

### Group 2: Delegation Template

<!-- LOAD_CONTEXT: context/02-delegation-template.md -->

#### Task 2.1: Add 7-Section Delegation Template
**Objective**: Create comprehensive delegation prompt structure.

**Content to Create**:
- 7-section template
- Section descriptions
- When each section is required/optional

**Acceptance Criteria**:
- All 7 sections documented
- Purpose of each clear
- Template is copy-paste ready

---

#### Task 2.2: Create Example Delegations
**Objective**: Provide concrete examples for each agent type.

**Content to Create**:
- Explore agent example
- Plan agent example
- security-engineer example
- Other specialized agent examples

**Acceptance Criteria**:
- At least 4 complete examples
- Examples are realistic
- Cover different complexity levels

---

### Group 3: Model Selection

<!-- LOAD_CONTEXT: context/03-model-selection.md -->

#### Task 3.1: Add Model Selection Rules
**Objective**: Define when to use haiku/sonnet/opus.

**Content to Create**:
- Complexity-to-model mapping
- Decision criteria
- Cost considerations

**Acceptance Criteria**:
- Clear decision matrix
- Rationale for each choice
- Default recommendations

---

#### Task 3.2: Add Cost Tier Documentation
**Objective**: Document cost/capability tradeoffs.

**Content to Create**:
- Cost tier explanations
- When to upgrade model
- When to downgrade model

**Acceptance Criteria**:
- Cost awareness embedded
- Practical guidance
- No over-engineering

---

### Group 4: Quality Hooks

<!-- LOAD_CONTEXT: context/04-quality-hooks.md -->

#### Task 4.1: Add PostToolUse Formatting Hooks
**Objective**: Auto-format code after edits.

**Content to Create**:
- Prettier/black/gofmt hook configs
- Project type conditionals
- Error suppression

**Acceptance Criteria**:
- Hooks work for each project type
- Failures don't block workflow
- Format on every edit

---

#### Task 4.2: Add PostToolUse Linting Hooks
**Objective**: Auto-lint code after edits.

**Content to Create**:
- ESLint/ruff/golint hook configs
- Auto-fix mode
- Error handling

**Acceptance Criteria**:
- Hooks work for each project type
- Auto-fix applied
- Errors logged but not blocking

---

#### Task 4.3: Test Hook Execution
**Objective**: Verify hooks fire correctly.

**Test Cases**:
1. Edit a JS file → prettier runs
2. Edit a Python file → black runs
3. Create new file → hooks run
4. Hook failure → continues gracefully

**Acceptance Criteria**:
- All test cases pass
- Hooks execute in order
- Failures handled gracefully

---

### Group 5: Maturity Assessment

<!-- LOAD_CONTEXT: context/05-maturity-assessment.md -->

#### Task 5.1: Add Maturity Assessment Section
**Objective**: Define codebase maturity levels.

**Content to Create**:
- 4 maturity levels
- Indicators for each level
- Approach for each level

**Acceptance Criteria**:
- Levels are distinguishable
- Indicators are observable
- Approaches are actionable

---

#### Task 5.2: Create Maturity Assessment Checklist
**Objective**: Provide assessment tool.

**Content to Create**:
- Assessment questions
- Scoring mechanism
- Maturity determination logic

**Acceptance Criteria**:
- Checklist is usable
- Scoring is objective
- Output is clear level

---

### Group 6: Validation

<!-- LOAD_CONTEXT: context/06-validation.md -->

#### Task 6.1: Integration Test: Classification → Delegation
**Objective**: Verify end-to-end orchestration.

**Test Cases**:
1. Trivial request → direct answer
2. Explicit request → immediate execution
3. Exploratory request → exploration first
4. Ambiguous request → clarification asked
5. Open-ended → full assessment

**Acceptance Criteria**:
- All paths tested
- Correct routing verified
- 7-section template used in delegations

---

## Exit Criteria

Phase 2 is complete when:

1. Requests are classified before action
2. All delegations use 7-section template
3. Model selection is cost-aware
4. Quality hooks run automatically
5. Project maturity is documented

---

## Deliverables Summary

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| Intent Classification | CLAUDE.md | Request routing |
| 7-Section Template | CLAUDE.md | Delegation structure |
| Model Selection Rules | CLAUDE.md | Cost optimization |
| Quality Hooks | settings.json | Auto-formatting/linting |
| Maturity Assessment | CLAUDE.md | Project adaptation |

---

## Dependencies Graph

```
Task 1.1 (Classification)
    └── Task 1.2 (Decision Rules)
            │
            └──────────────────────┐
                                   ▼
Task 2.1 (7-Section Template) ──→ Task 2.2 (Examples)
                                   │
Task 3.1 (Model Selection) ──────→│
    └── Task 3.2 (Cost Tiers)     │
                                   │
Task 4.1 (Format Hooks) ──────────│
    └── Task 4.2 (Lint Hooks)     │
        └── Task 4.3 (Test Hooks) │
                                   │
Task 5.1 (Maturity Levels) ───────│
    └── Task 5.2 (Checklist)      │
                                   ▼
                            Task 6.1 (Integration Test)
```

---

## Context Loading Instructions

For coding agents executing this phase:

1. **Always load first**: `context/00-base-context.md`
2. **Then load task-specific context** as indicated by `<!-- LOAD_CONTEXT: -->` markers
3. **Reference Phase 1 content** for foundation
4. **Mark tasks complete** in this README as you finish them

---

*Phase 2 of the Muad'Dib Implementation Plan*
