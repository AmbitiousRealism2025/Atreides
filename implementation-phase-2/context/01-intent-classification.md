# Context: Intent Classification (Tasks 1.1 - 1.2)

## Task Group Overview

- Task 1.1: Add Intent Classification Section
- Task 1.2: Add Classification Decision Rules

---

## Task 1.1: Intent Classification Section

### Purpose

Define how to categorize incoming requests before taking action.

### Content Template

```markdown
## Intent Classification

Before starting ANY task, classify the request:

### Request Categories

| Category | Description | Examples | Action |
|----------|-------------|----------|--------|
| **Trivial** | Simple questions requiring no code changes | "What does this function do?", "Explain async/await" | Direct answer, no tools needed |
| **Explicit** | Clear implementation with known solution | "Add a login button", "Fix the typo in README" | Execute immediately |
| **Exploratory** | Requires investigation before implementation | "Find where user auth is handled", "Why is this slow?" | Explore first, then implement |
| **Open-ended** | Architectural decisions, major changes | "Refactor the authentication system", "Add caching" | Full assessment, planning required |
| **Ambiguous** | Unclear requirements or multiple interpretations | "Make it better", "Fix the issues", "Improve performance" | Clarify before proceeding |

### Category Indicators

**Trivial Indicators**:
- Questions about existing code
- Conceptual explanations
- Quick lookups
- No code changes needed

**Explicit Indicators**:
- Specific file/function mentioned
- Clear success criteria
- Single-step or simple multi-step
- Known solution pattern

**Exploratory Indicators**:
- "Find", "search", "where", "how does" keywords
- Understanding required before action
- Multiple potential locations
- Investigation needed

**Open-ended Indicators**:
- "Refactor", "redesign", "architect" keywords
- Multiple files/components affected
- Trade-off decisions required
- No single correct answer

**Ambiguous Indicators**:
- Vague descriptors ("better", "cleaner", "faster")
- Missing success criteria
- Multiple possible interpretations
- Scope undefined
```

---

## Task 1.2: Classification Decision Rules

### Purpose

Define the decision process for classifying requests.

### Content Template

```markdown
### Classification Decision Process

Before starting ANY task, follow this process:

```
┌─────────────────────────────────────────────┐
│            CLASSIFY THE REQUEST              │
└─────────────────────────────────────────────┘
                    │
                    ▼
        ┌─────────────────────┐
        │ Is it a question    │
        │ about code/concepts │──Yes──→ TRIVIAL
        │ with no changes?    │         (Direct answer)
        └─────────────────────┘
                    │ No
                    ▼
        ┌─────────────────────┐
        │ Are requirements    │
        │ clear and specific? │──No───→ AMBIGUOUS
        │                     │         (Ask for clarification)
        └─────────────────────┘
                    │ Yes
                    ▼
        ┌─────────────────────┐
        │ Is investigation    │
        │ needed first?       │──Yes──→ EXPLORATORY
        │                     │         (Explore, then implement)
        └─────────────────────┘
                    │ No
                    ▼
        ┌─────────────────────┐
        │ Are architectural   │
        │ decisions needed?   │──Yes──→ OPEN-ENDED
        │                     │         (Full assessment)
        └─────────────────────┘
                    │ No
                    ▼
                 EXPLICIT
           (Execute immediately)
```

### Handling Each Category

#### TRIVIAL Requests
```
→ Answer directly
→ No tools needed (usually)
→ May reference code for accuracy
→ Keep response concise
```

#### EXPLICIT Requests
```
→ Execute immediately
→ Use TodoWrite if 3+ steps
→ Apply quality standards
→ Complete and verify
```

#### EXPLORATORY Requests
```
→ Launch Task(Explore) first
→ Gather context systematically
→ Confirm understanding
→ Then proceed to implementation
```

#### OPEN-ENDED Requests
```
→ Assess codebase maturity
→ Identify existing patterns
→ Consider alternatives
→ May use Task(Plan, opus) for strategy
→ Create comprehensive plan before implementation
```

#### AMBIGUOUS Requests
```
→ DO NOT proceed without clarification
→ Use AskUserQuestion to clarify:
  - Expected outcomes
  - Scope boundaries
  - Success criteria
  - Constraints
```

### Clarification Questions for Ambiguous Requests

When a request is ambiguous, ask about:

1. **Expected Outcome**: "What should the result look like?"
2. **Scope**: "Which files/components should be affected?"
3. **Success Criteria**: "How will we know it's done correctly?"
4. **Constraints**: "Are there any limitations I should know about?"
5. **Priority**: "What's most important to get right?"

### Examples

**Ambiguous → Clarified**:

| Ambiguous Request | Clarifying Question | Clarified Request |
|-------------------|--------------------|--------------------|
| "Make it faster" | "Which operations are slow? What's acceptable performance?" | "Optimize the database queries in getUserById to under 50ms" |
| "Fix the issues" | "Which issues? Are there error messages or bug reports?" | "Fix the null pointer exception in auth.js line 45" |
| "Improve the code" | "What aspects? Readability, performance, maintainability?" | "Refactor the UserService class to use dependency injection" |
```

---

## Integration Point

This content goes at the **beginning** of the orchestration rules, before task management.

### CLAUDE.md Structure After Phase 2

```markdown
# Project - Muad'Dib Orchestration

## Core Identity
[Phase 1 content]

---

## Intent Classification    ← NEW (Tasks 1.1, 1.2)
[This content]

---

## Task Management
[Phase 1 content]

...
```

---

## Acceptance Criteria

### Task 1.1
- [ ] 5 categories defined
- [ ] Each has description
- [ ] Each has examples
- [ ] Each has action
- [ ] Indicators listed

### Task 1.2
- [ ] Decision flowchart
- [ ] Handling for each category
- [ ] Clarification questions
- [ ] Examples of ambiguous → clarified

---

*Context for Tasks 1.1, 1.2*
