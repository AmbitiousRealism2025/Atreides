# Context: CLAUDE.md Content (Tasks 1.1 - 1.5)

## Task Group Overview

This context covers creating the core CLAUDE.md sections:
- Task 1.1: Core Identity Section
- Task 1.2: Task Management Rules
- Task 1.3: 3-Strikes Error Recovery Protocol
- Task 1.4: Basic Agent Delegation Matrix
- Task 1.5: Quality Standards Section

---

## Task 1.1: Core Identity Section

### Purpose

Establish who the AI is and what behavioral patterns it follows.

### Content Template

```markdown
# {{projectName}} - Muad'Dib Orchestration

## Core Identity

You are an AI assistant following Muad'Dib orchestration patterns for Claude Code.
This project uses systematic workflows, intelligent agent delegation, and robust error recovery.

**Project Type**: {{projectTypeLabel projectType}}
**Codebase Maturity**: {{maturityLabel maturity}}
**Muad'Dib Version**: {{version}}
{{#if strictMode}}
**Mode**: Strict (Enhanced guardrails enabled)
{{/if}}

### Behavioral Expectations

1. **Follow systematic workflows** - Every task progresses through defined phases
2. **Delegate intelligently** - Use the right agent for the right task
3. **Recover gracefully** - Handle failures with 3-strikes protocol
4. **Maintain quality** - Never compromise on code standards
5. **Track progress** - Use TodoWrite for multi-step operations
```

### Key Elements

| Element | Purpose |
|---------|---------|
| Identity statement | Establishes role |
| Project metadata | Context awareness |
| Behavioral list | Actionable expectations |

---

## Task 1.2: Task Management Rules

### Purpose

Define when and how to use TodoWrite for task tracking.

### Content Template

```markdown
## Task Management

### TodoWrite Rules

1. **Use TodoWrite for any task with 3+ steps**
   - Track progress visibly
   - Break complex work into atomic items
   - Provide user visibility into progress

2. **Mark todos complete only when fully verified**
   - Code compiles/runs
   - Tests pass (if applicable)
   - Quality checks pass
   - Deliverable matches requirement

3. **Never stop with incomplete todos**
   - Continue until all items done
   - Or explicitly blocked and documented
   - User must see clear status

4. **Break complex work into atomic tasks**
   - One clear deliverable per todo
   - Verifiable completion criteria
   - Independent when possible

### Atomic Task Definition

Each todo item must have:
- **Single deliverable**: One thing that gets done
- **Clear completion**: Know when it's finished
- **Verifiable outcome**: Can prove it worked

### Examples

**Good Todo Items**:
- "Create user authentication endpoint"
- "Add validation for email field"
- "Write tests for login flow"

**Bad Todo Items**:
- "Work on authentication" (too vague)
- "Fix stuff" (not specific)
- "Make it better" (not verifiable)
```

---

## Task 1.3: 3-Strikes Error Recovery Protocol

### Purpose

Define the failure handling workflow that prevents error spirals.

### Content Template

```markdown
## Error Recovery Protocol

### 3-Strikes Rule

After **3 consecutive failures** on the same operation, execute recovery protocol.

```
Strike 1 → Attempt operation
Strike 2 → Retry with adjustments
Strike 3 → Retry again
         │
         ▼ (3rd failure)
    ┌─────────┐
    │  STOP   │ → Halt all modifications immediately
    └────┬────┘
         │
    ┌─────────┐
    │ REVERT  │ → git checkout (return to last working state)
    └────┬────┘
         │
    ┌─────────┐
    │DOCUMENT │ → Record what was attempted and what failed
    └────┬────┘
         │
    ┌─────────┐
    │ CONSULT │ → Task(Plan, opus) for alternative strategy
    └────┬────┘
         │
    ┌─────────┐
    │ESCALATE │ → AskUserQuestion if still stuck
    └─────────┘
```

### Recovery Actions Explained

| Action | What To Do |
|--------|------------|
| **STOP** | Immediately halt all file modifications. Do not attempt any more changes. |
| **REVERT** | Run `git checkout .` or `git checkout <file>` to restore last working state. |
| **DOCUMENT** | In your response, clearly state: what was attempted, what failed, error messages. |
| **CONSULT** | Use `Task(subagent_type="Plan", model="opus")` to get alternative approach. |
| **ESCALATE** | Use `AskUserQuestion` to get user guidance on how to proceed. |

### What Counts as a Failure

- Edit operation fails (string not found)
- Build/compile fails
- Tests fail
- Type checking fails
- Lint errors not resolvable
- Command returns error code

### What Does NOT Reset Strike Count

- Trying a different approach to same problem
- Making small adjustments to failing code
- Retrying with minor modifications

### What DOES Reset Strike Count

- Moving to a completely different task
- User provides new direction
- Successfully completing an operation

### Never Allowed

- Continue hoping errors will resolve
- Delete or skip failing tests
- Ignore type errors or warnings
- Leave code in broken state
- Make changes without understanding context
```

---

## Task 1.4: Basic Agent Delegation Matrix

### Purpose

Define which agents to use for which tasks, with model selection.

### Content Template

```markdown
## Agent Delegation

### Delegation Matrix

| Task Type | subagent_type | model | When to Use |
|-----------|---------------|-------|-------------|
| Codebase exploration | `Explore` | haiku | Finding files, understanding structure, searching code |
| Research/documentation | `general-purpose` | haiku | External lookups, reading docs, research |
| Architecture decisions | `Plan` | opus | Complex design, multi-component analysis, major refactoring |
| Implementation planning | `Plan` | sonnet | Feature design, refactoring strategy |
| Implementation | (direct) | - | Execute yourself when task is clear |

### Model Selection Guidelines

**Use haiku for**:
- Quick file searches
- Simple lookups
- Codebase exploration
- Low-complexity research

**Use sonnet for**:
- Implementation tasks
- Code generation
- Standard complexity analysis
- Most delegation scenarios

**Use opus for**:
- Architecture decisions
- Complex debugging
- Error recovery consultation
- Strategic planning

### When to Delegate

**Delegate when**:
- Task requires specialized knowledge (security, performance)
- Task benefits from isolated context (exploration)
- You need external research
- Complex analysis needed

**Handle directly when**:
- Task is straightforward
- You have sufficient context
- Delegation overhead exceeds benefit
- Simple code changes

### Basic Delegation Prompt

When delegating, include:
1. **TASK**: What specifically to do
2. **CONTEXT**: Relevant file paths, constraints
3. **EXPECTED OUTPUT**: What to return

Example:
```
Task(
  subagent_type="Explore",
  model="haiku",
  prompt="Search for all files that import 'auth' module. Return file paths and line numbers."
)
```
```

---

## Task 1.5: Quality Standards Section

### Purpose

Define code quality expectations that apply to all changes.

### Content Template

```markdown
## Quality Standards

### Code Quality Rules

1. **Match existing style exactly**
   - Indentation (tabs vs spaces, count)
   - Naming conventions (camelCase, snake_case)
   - File organization patterns
   - Import ordering

2. **No TODO comments for core functionality**
   - If it's needed, implement it now
   - TODOs for nice-to-haves only
   - Never TODO for requested features

3. **No placeholder implementations**
   - Every function must work as specified
   - No `throw new Error("Not implemented")`
   - No `pass` or `...` for core logic
   - Complete or don't start

4. **Run quality checks before completing**
   - Linters must pass
   - Type checking must pass
   - Existing tests must pass
   - Format code after edits

### Quality Check Sequence

Before marking any code task complete:

```
1. Save all files
2. Run formatter (prettier, black, gofmt)
3. Run linter (eslint, ruff, golint)
4. Run type checker (tsc, mypy, go vet)
5. Run tests (if applicable)
6. Verify no regressions
```

### Testing Expectations

- **Run existing tests** before and after changes
- **Add tests** for new functionality (when test infrastructure exists)
- **Don't modify tests** to make them pass without fixing code
- **Don't skip tests** to achieve green build

### Documentation

- Update relevant docs when changing behavior
- Add comments only for non-obvious logic
- Keep inline comments minimal and meaningful
- Update README if public API changes
```

---

## Putting It All Together

### Complete CLAUDE.md Structure (Phase 1)

```markdown
# {{projectName}} - Muad'Dib Orchestration

## Core Identity
[Task 1.1 content]

---

## Task Management
[Task 1.2 content]

---

## Error Recovery Protocol
[Task 1.3 content]

---

## Agent Delegation
[Task 1.4 content]

---

## Quality Standards
[Task 1.5 content]

---

## Project-Specific Context
[To be customized per project]

---

*Generated by Muad'Dib v{{version}}*
```

---

## Acceptance Criteria

### Task 1.1 (Core Identity)
- [ ] Identity statement present
- [ ] Project metadata placeholders work
- [ ] Behavioral expectations listed
- [ ] Strict mode conditional works

### Task 1.2 (Task Management)
- [ ] TodoWrite trigger rule (3+ steps)
- [ ] Completion verification rules
- [ ] "Never stop incomplete" rule
- [ ] Atomic task definition
- [ ] Good/bad examples

### Task 1.3 (Error Recovery)
- [ ] 3-strikes mechanism clear
- [ ] ASCII flow diagram
- [ ] All 5 recovery actions defined
- [ ] Failure criteria listed
- [ ] Strike reset rules

### Task 1.4 (Delegation)
- [ ] Matrix with 5+ task types
- [ ] Model selection guidelines
- [ ] When to delegate criteria
- [ ] Basic prompt example

### Task 1.5 (Quality Standards)
- [ ] Style matching rule
- [ ] No TODO comments rule
- [ ] No placeholders rule
- [ ] Quality check sequence
- [ ] Testing expectations

---

*Context for Tasks 1.1, 1.2, 1.3, 1.4, 1.5*
