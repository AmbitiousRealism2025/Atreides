# Context: Model Selection (Tasks 3.1 - 3.2)

## Task Group Overview

- Task 3.1: Add Model Selection Rules
- Task 3.2: Add Cost Tier Documentation

---

## Task 3.1: Model Selection Rules

### Purpose

Define when to use haiku, sonnet, or opus for optimal cost/capability balance.

### Content Template

```markdown
## Model Selection Guidelines

### Quick Reference Matrix

| Task Type | Model | Rationale |
|-----------|-------|-----------|
| File search, pattern matching | haiku | Fast, cheap, sufficient capability |
| Simple research questions | haiku | Low complexity, quick turnaround |
| Codebase exploration | haiku | Pattern matching doesn't need deep reasoning |
| Standard implementation | sonnet | Balanced capability for code generation |
| Documentation writing | sonnet | Good language ability, cost-effective |
| Code review | sonnet | Sufficient for standard patterns |
| Architecture decisions | opus | Maximum reasoning for complex trade-offs |
| Complex debugging | opus | Deep analysis required |
| Multi-component design | opus | System-level thinking needed |
| Error recovery consultation | opus | Strategic problem-solving |

### Selection Decision Tree

```
┌─────────────────────────────────────┐
│         SELECT MODEL                 │
└─────────────────────────────────────┘
                │
                ▼
    ┌─────────────────────┐
    │ Is it search/lookup │
    │ with clear answer?  │──Yes──→ haiku
    └─────────────────────┘
                │ No
                ▼
    ┌─────────────────────┐
    │ Is it exploration   │
    │ or simple research? │──Yes──→ haiku
    └─────────────────────┘
                │ No
                ▼
    ┌─────────────────────┐
    │ Does it require     │
    │ architectural       │──Yes──→ opus
    │ reasoning?          │
    └─────────────────────┘
                │ No
                ▼
    ┌─────────────────────┐
    │ Is it complex       │
    │ debugging or        │──Yes──→ opus
    │ error recovery?     │
    └─────────────────────┘
                │ No
                ▼
              sonnet
        (default choice)
```

### Detailed Selection Rules

#### Use haiku for:

1. **Codebase Exploration**
   ```
   Task(subagent_type="Explore", model="haiku")
   ```
   - Finding files by pattern
   - Searching for function definitions
   - Locating imports/dependencies
   - Quick structural analysis

2. **Simple Research**
   - Looking up documentation
   - Finding configuration syntax
   - Quick fact-checking

3. **Pattern Matching**
   - Grep-like operations
   - File listing
   - Simple code counting

**Haiku Limits**: Don't use for code generation, complex analysis, or architectural decisions.

#### Use sonnet for:

1. **Implementation Tasks**
   ```
   Task(subagent_type="general-purpose", model="sonnet")
   ```
   - Writing new functions
   - Implementing features
   - Refactoring code
   - Bug fixes

2. **Documentation**
   - Writing README sections
   - API documentation
   - Code comments

3. **Standard Code Review**
   - Reviewing PRs
   - Checking for common issues
   - Style compliance

4. **Default Choice**
   - When unsure, sonnet is the safe choice
   - Good balance of capability and cost

**Sonnet Limits**: May struggle with complex architectural trade-offs or deep multi-system analysis.

#### Use opus for:

1. **Architecture Decisions**
   ```
   Task(subagent_type="Plan", model="opus")
   ```
   - System design
   - Technology selection
   - Trade-off analysis
   - Migration planning

2. **Complex Debugging**
   - Multi-file issues
   - Race conditions
   - Performance mysteries
   - Intermittent failures

3. **Error Recovery**
   - When 3-strikes triggers
   - Strategic problem-solving
   - Alternative approach generation

4. **Multi-Component Analysis**
   - Cross-system integration
   - Dependency impact analysis
   - Major refactoring planning

**Opus Usage**: Reserve for high-value, complex scenarios. Cost is significantly higher.
```

---

## Task 3.2: Cost Tier Documentation

### Purpose

Document the cost/capability trade-offs to enable informed decisions.

### Content Template

```markdown
### Cost Tier Documentation

#### Tier Overview

| Tier | Model | Relative Cost | Capability | Best For |
|------|-------|---------------|------------|----------|
| Economy | haiku | $ | Good for simple tasks | Exploration, search |
| Standard | sonnet | $$ | Great for most tasks | Implementation, review |
| Premium | opus | $$$ | Best for complex tasks | Architecture, debugging |

#### When to Upgrade

**haiku → sonnet**:
- Task requires code generation
- Response quality is insufficient
- Need more nuanced analysis
- Writing documentation

**sonnet → opus**:
- Architectural decisions needed
- Complex trade-off analysis
- Multi-system reasoning
- 3-strikes error recovery
- Strategic planning

#### When to Downgrade

**opus → sonnet**:
- Task is more implementation than design
- Clear requirements exist
- Single-component focus
- Straightforward coding

**sonnet → haiku**:
- Pure search/exploration
- Simple lookups
- File pattern matching
- Quick research

#### Cost-Aware Patterns

1. **Start Low, Escalate if Needed**
   ```
   # First try with haiku
   result = Task(Explore, haiku, "Find auth files")

   # If insufficient, escalate
   result = Task(Plan, sonnet, "Analyze auth architecture")

   # If complex, use opus
   result = Task(Plan, opus, "Design new auth system")
   ```

2. **Parallel Economy Tasks**
   ```
   # Multiple haiku tasks in parallel is cost-effective
   Task(Explore, haiku, "Find user files")  # parallel
   Task(Explore, haiku, "Find auth files")  # parallel
   Task(Explore, haiku, "Find config files")  # parallel
   ```

3. **Strategic Premium Usage**
   ```
   # Use opus for the critical decision
   design = Task(Plan, opus, "Design overall architecture")

   # Then sonnet for implementation details
   Task(general-purpose, sonnet, "Implement based on design")
   ```

#### Anti-Patterns

**Don't Do**:
- ❌ Use opus for simple file searches
- ❌ Use haiku for code generation
- ❌ Use opus when sonnet would suffice
- ❌ Retry with same model after failure (consider upgrade)

**Do**:
- ✅ Match model to task complexity
- ✅ Start economical, upgrade when needed
- ✅ Use opus sparingly but confidently when appropriate
- ✅ Parallel haiku tasks for broad exploration
```

---

## Acceptance Criteria

### Task 3.1 (Model Selection Rules)
- [ ] Quick reference matrix
- [ ] Decision tree
- [ ] Detailed rules for each model
- [ ] Clear limits documented

### Task 3.2 (Cost Tier Documentation)
- [ ] Tier overview table
- [ ] When to upgrade guidelines
- [ ] When to downgrade guidelines
- [ ] Cost-aware patterns
- [ ] Anti-patterns listed

---

*Context for Tasks 3.1, 3.2*
