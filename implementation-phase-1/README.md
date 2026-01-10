# Implementation Phase 1: MVP Foundation

## Phase Overview

**Goal**: Create the core template content for CLAUDE.md and settings.json that delivers 70% of OmO orchestration value with minimal effort.

**Phase Duration**: 1-2 days (~2 hours actual work)
**Dependencies**: Phase 0 complete (package structure exists)

**Note**: This phase creates the **content** that goes into the templates created in Phase 0. The templates (`.hbs` files) are the containers; this phase defines what goes inside them.

---

## Success Criteria

Before marking this phase complete, verify:

- [ ] CLAUDE.md loads correctly at session start
- [ ] TodoWrite used automatically for 3+ step tasks
- [ ] Error recovery referenced when failures occur
- [ ] Task delegation uses correct subagent_types
- [ ] Quality standards followed during implementation

---

## Task Breakdown

### Group 1: Core CLAUDE.md Content

<!-- LOAD_CONTEXT: context/01-claude-md-content.md -->

#### Task 1.1: Create Core Identity Section
**Objective**: Define the foundational identity and behavior expectations.

**Content to Create**:
- AI identity statement (Muad'Dib orchestration)
- Systematic workflow expectations
- Quality and completion standards
- Project metadata placeholders

**Acceptance Criteria**:
- Clear identity statement
- Expectations are actionable
- Tone is professional and directive

---

#### Task 1.2: Add Task Management Rules
**Objective**: Define when and how to use TodoWrite.

**Content to Create**:
- TodoWrite trigger rules (3+ steps)
- Atomic task definition
- Completion verification requirements
- "Never stop with incomplete todos" rule

**Acceptance Criteria**:
- Rules are unambiguous
- Examples provided
- Edge cases addressed

---

#### Task 1.3: Add 3-Strikes Error Recovery Protocol
**Objective**: Define the failure handling workflow.

**Content to Create**:
- Strike counting mechanism
- STOP action definition
- REVERT action (git checkout)
- DOCUMENT action
- CONSULT action (Task with Plan agent)
- ESCALATE action (AskUserQuestion)
- ASCII flow diagram

**Acceptance Criteria**:
- Protocol is clear and sequential
- Each action is well-defined
- Recovery path is explicit

---

#### Task 1.4: Add Basic Agent Delegation Matrix
**Objective**: Define which agents to use for which tasks.

**Content to Create**:
- Agent type to task type mapping
- Model selection (haiku/sonnet/opus)
- When to delegate vs. handle directly
- Basic delegation prompt structure

**Acceptance Criteria**:
- Matrix covers common scenarios
- Model choices are justified
- Clear decision criteria

---

#### Task 1.5: Add Quality Standards Section
**Objective**: Define code quality expectations.

**Content to Create**:
- Linting requirements
- No TODO comments rule
- Style matching requirements
- Testing expectations

**Acceptance Criteria**:
- Standards are measurable
- Applies to all code changes
- Matches common best practices

---

### Group 2: Settings and Structure

<!-- LOAD_CONTEXT: context/02-settings-structure.md -->

#### Task 2.1: Create Directory Structure Template
**Objective**: Define the project structure that `muaddib init` creates.

**Content to Create**:
- Directory layout diagram
- Purpose of each directory
- File descriptions

**Acceptance Criteria**:
- Structure is clear
- All files have purpose
- Matches Phase 0 implementation

---

#### Task 2.2: Create settings.json Template Content
**Objective**: Define the base settings.json configuration.

**Content to Create**:
- Empty hooks structure (placeholder)
- Permission deny list
- Permission allow list (basic)
- Comments explaining each section

**Acceptance Criteria**:
- Valid JSON structure
- Dangerous operations blocked
- Safe operations allowed

---

### Group 3: Validation and Testing

<!-- LOAD_CONTEXT: context/03-validation.md -->

#### Task 3.1: Test TodoWrite Integration
**Objective**: Verify TodoWrite triggers correctly with new content.

**Test Cases**:
1. Single-step task (should NOT trigger TodoWrite)
2. 3-step task (should trigger TodoWrite)
3. Multi-file operation (should trigger TodoWrite)
4. Todo completion verification

**Acceptance Criteria**:
- All test cases pass
- Behavior matches documentation

---

#### Task 3.2: Test 3-Strikes Protocol
**Objective**: Verify error recovery protocol works.

**Test Cases**:
1. Simulate first failure (continue)
2. Simulate second failure (continue with adjustment)
3. Simulate third failure (trigger protocol)
4. Verify STOP/REVERT sequence

**Acceptance Criteria**:
- Protocol triggers at right time
- Actions execute in order
- Documentation referenced

---

#### Task 3.3: Test Task Delegation
**Objective**: Verify agent delegation works correctly.

**Test Cases**:
1. Delegate exploration task (Explore agent)
2. Delegate research task (general-purpose agent)
3. Verify model selection (haiku for exploration)
4. Check response integration

**Acceptance Criteria**:
- Correct agent types used
- Correct models selected
- Results properly integrated

---

## Exit Criteria

Phase 1 is complete when:

1. A new session references CLAUDE.md rules
2. Multi-step tasks are tracked via TodoWrite
3. 3-strikes protocol is documented and understood
4. Basic Task delegation works (Explore, general-purpose)

---

## Deliverables Summary

| Deliverable | Location | Purpose |
|-------------|----------|---------|
| Core Identity Content | CLAUDE.md section 1 | Define AI behavior |
| Task Management Rules | CLAUDE.md section 2 | TodoWrite integration |
| Error Recovery Protocol | CLAUDE.md section 3 | 3-strikes handling |
| Agent Delegation Matrix | CLAUDE.md section 4 | Task routing |
| Quality Standards | CLAUDE.md section 5 | Code quality |
| Settings Template | settings.json | Hooks & permissions |

---

## Dependencies Graph

```
Task 1.1 (Core Identity)
    ├── Task 1.2 (Task Management) ──→ Task 3.1 (Test TodoWrite)
    ├── Task 1.3 (Error Recovery) ──→ Task 3.2 (Test 3-Strikes)
    ├── Task 1.4 (Delegation) ──→ Task 3.3 (Test Delegation)
    └── Task 1.5 (Quality Standards)

Task 2.1 (Directory Structure)
    └── Task 2.2 (Settings Template)
```

---

## Integration with Phase 0

This phase creates content that integrates with Phase 0's templates:

| Phase 1 Content | Phase 0 Template | Integration Point |
|-----------------|------------------|-------------------|
| Core Identity | `CLAUDE.md.hbs` | Main body |
| Task Management | `partials/orchestration-rules.hbs` | Partial |
| Error Recovery | `partials/orchestration-rules.hbs` | Partial |
| Delegation | `partials/agent-definitions.hbs` | Partial |
| Quality Standards | `partials/quality-standards.hbs` | Partial |
| Settings | `settings.json.hbs` | Direct |

---

## Context Loading Instructions

For coding agents executing this phase:

1. **Always load first**: `context/00-base-context.md`
2. **Then load task-specific context** as indicated by `<!-- LOAD_CONTEXT: -->` markers
3. **Reference Phase 0 templates** when determining format
4. **Mark tasks complete** in this README as you finish them

---

*Phase 1 of the Muad'Dib Implementation Plan*
