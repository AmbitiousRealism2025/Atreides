# Context: Maturity Assessment (Tasks 5.1 - 5.2)

## Task Group Overview

- Task 5.1: Add Maturity Assessment Section
- Task 5.2: Create Maturity Assessment Checklist

---

## Task 5.1: Maturity Assessment Section

### Purpose

Define codebase maturity levels and how they affect orchestration behavior.

### Content Template

```markdown
## Codebase Maturity Assessment

### Why Maturity Matters

Different codebases require different approaches:
- **Disciplined** codebases have patterns that must be followed exactly
- **Legacy** codebases need careful, incremental changes
- **Greenfield** projects can establish new patterns

Assess maturity at project start to calibrate behavior.

### Maturity Levels

| Level | Description | Indicators | Approach |
|-------|-------------|------------|----------|
| **DISCIPLINED** | Well-maintained, consistent patterns | High test coverage, enforced style, clear architecture | Follow existing patterns EXACTLY |
| **TRANSITIONAL** | Evolving codebase, mixed patterns | Partial coverage, some legacy code, ongoing improvements | Respect existing, introduce new carefully |
| **LEGACY** | Technical debt, inconsistent patterns | Low coverage, varied styles, limited docs | Be conservative, propose improvements |
| **GREENFIELD** | New project, no existing patterns | Empty or minimal codebase | Establish best practices from start |

### Level Indicators

#### DISCIPLINED Codebase

**Observable Indicators**:
- [ ] Test coverage > 70%
- [ ] Consistent code style across all files
- [ ] Clear directory structure
- [ ] Comprehensive documentation
- [ ] CI/CD with quality gates
- [ ] Type safety enforced

**Behavioral Adjustments**:
- Match existing patterns exactly
- Don't introduce new patterns without discussion
- Follow established conventions precisely
- All changes require corresponding tests
- Respect existing architecture

#### TRANSITIONAL Codebase

**Observable Indicators**:
- [ ] Test coverage 30-70%
- [ ] Mix of old and new patterns
- [ ] Some legacy code remaining
- [ ] Partial documentation
- [ ] CI exists but may have gaps

**Behavioral Adjustments**:
- Follow new patterns for new code
- Respect legacy patterns in old areas
- Propose cleanups when touching old code
- Add tests for new functionality
- Gradual improvement is acceptable

#### LEGACY Codebase

**Observable Indicators**:
- [ ] Test coverage < 30%
- [ ] Inconsistent styles across files
- [ ] Unclear architecture
- [ ] Minimal documentation
- [ ] Technical debt visible

**Behavioral Adjustments**:
- Be very conservative with changes
- Document unexpected behaviors
- Add tests before modifications
- Propose but don't force cleanups
- Extra verification before changes

#### GREENFIELD Project

**Observable Indicators**:
- [ ] New or nearly empty project
- [ ] No established patterns
- [ ] Fresh start opportunity

**Behavioral Adjustments**:
- Establish best practices immediately
- Set up proper structure from start
- Implement comprehensive testing
- Create documentation as you go
- Use modern patterns and tools
```

---

## Task 5.2: Maturity Assessment Checklist

### Purpose

Provide a systematic way to assess and document codebase maturity.

### Content Template

```markdown
### Maturity Assessment Checklist

Use this checklist when first working with a codebase:

#### Step 1: Quick Scan

Run these commands to gather data:

```bash
# Check for test files
find . -name "*test*" -o -name "*spec*" | wc -l

# Check for config files
ls -la *.config.* .eslintrc* .prettierrc* pyproject.toml Cargo.toml 2>/dev/null

# Check for CI
ls -la .github/workflows/ .gitlab-ci.yml .circleci/ 2>/dev/null

# Check for type definitions
find . -name "*.d.ts" -o -name "py.typed" | wc -l
```

#### Step 2: Evaluate Criteria

| Criterion | Score | Notes |
|-----------|-------|-------|
| **Test Coverage** | | |
| - High (>70%) | +3 | |
| - Medium (30-70%) | +2 | |
| - Low (<30%) | +1 | |
| - None | 0 | |
| **Code Consistency** | | |
| - Very consistent | +3 | |
| - Mostly consistent | +2 | |
| - Mixed | +1 | |
| - Inconsistent | 0 | |
| **Documentation** | | |
| - Comprehensive | +3 | |
| - Partial | +2 | |
| - Minimal | +1 | |
| - None | 0 | |
| **CI/CD** | | |
| - Full pipeline | +2 | |
| - Basic CI | +1 | |
| - None | 0 | |
| **Type Safety** | | |
| - Strict types | +2 | |
| - Partial types | +1 | |
| - No types | 0 | |

**Total Score: ___/13**

#### Step 3: Determine Level

| Score Range | Maturity Level |
|-------------|----------------|
| 10-13 | DISCIPLINED |
| 6-9 | TRANSITIONAL |
| 3-5 | LEGACY |
| 0-2 | Check if GREENFIELD |

#### Step 4: Document in CLAUDE.md

Add to the project-specific section:

```markdown
## Codebase Maturity: [LEVEL]

Assessed on: [DATE]

### Assessment Summary
- Test coverage: [high/medium/low/none]
- Code consistency: [consistent/mixed/inconsistent]
- Documentation: [comprehensive/partial/minimal/none]
- CI/CD: [full/basic/none]
- Type safety: [strict/partial/none]

### Notes
[Any specific observations about the codebase]

### Approach Guidelines
[Specific guidelines based on maturity level]
```

### Quick Assessment Questions

If you can't run commands, answer these questions:

1. **Are there test files visible?**
   - Yes, many → Likely DISCIPLINED/TRANSITIONAL
   - Some → Likely TRANSITIONAL
   - Few/None → Likely LEGACY

2. **Is there a linter/formatter config?**
   - Yes, actively used → Higher maturity
   - Exists but inconsistent → TRANSITIONAL
   - None → LEGACY

3. **Is the code consistently styled?**
   - Yes → DISCIPLINED
   - Mostly → TRANSITIONAL
   - No → LEGACY

4. **Is there documentation?**
   - README + docs folder → Higher maturity
   - Just README → TRANSITIONAL
   - Minimal/None → LEGACY

5. **Is this a new project?**
   - Yes, mostly empty → GREENFIELD
```

---

## Integration Example

After assessment, CLAUDE.md should include:

```markdown
## Project-Specific Context

### Codebase Maturity: TRANSITIONAL

Assessed on: 2026-01-08

**Assessment Summary**:
- Test coverage: Medium (~50%)
- Code consistency: Mostly consistent
- Documentation: Partial (README + some inline)
- CI/CD: Basic (runs tests on PR)
- Type safety: Partial (TypeScript with some `any`)

**Approach Guidelines**:
- Follow new patterns for new code
- When modifying old files, match existing style
- Add tests for new functionality
- Propose type improvements when touching files
```

---

## Acceptance Criteria

### Task 5.1 (Maturity Section)
- [ ] 4 maturity levels defined
- [ ] Indicators for each level
- [ ] Behavioral adjustments documented
- [ ] Why maturity matters explained

### Task 5.2 (Checklist)
- [ ] Quick scan commands
- [ ] Scoring criteria
- [ ] Score-to-level mapping
- [ ] Documentation template
- [ ] Quick assessment questions

---

*Context for Tasks 5.1, 5.2*
