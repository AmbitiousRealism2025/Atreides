# Muad'Dib Codebase Maturity Assessment

## Overview

Codebase maturity assessment helps calibrate orchestration behavior to match the project's current state. Different codebases require different approaches.

---

## Why Maturity Matters

- **Disciplined** codebases have patterns that must be followed exactly
- **Transitional** codebases are evolving and need careful balance
- **Legacy** codebases need conservative, incremental changes
- **Greenfield** projects can establish best practices from the start

Assess maturity when first working with a codebase to calibrate behavior appropriately.

---

## Maturity Levels

| Level | Description | Indicators | Approach |
|-------|-------------|------------|----------|
| **DISCIPLINED** | Well-maintained, consistent patterns | High test coverage, enforced style, clear architecture | Follow existing patterns EXACTLY |
| **TRANSITIONAL** | Evolving codebase, mixed patterns | Partial coverage, some legacy code, ongoing improvements | Respect existing, introduce new carefully |
| **LEGACY** | Technical debt, inconsistent patterns | Low coverage, varied styles, limited docs | Be conservative, propose improvements |
| **GREENFIELD** | New project, no existing patterns | Empty or minimal codebase | Establish best practices from start |

---

## Level Indicators

### DISCIPLINED Codebase

**Observable Indicators**:
- Test coverage > 70%
- Consistent code style across all files
- Clear directory structure with logical organization
- Comprehensive documentation
- CI/CD with quality gates enforced
- Type safety strictly enforced
- Linting/formatting automated

**Behavioral Adjustments**:
- Match existing patterns exactly
- Don't introduce new patterns without discussion
- All changes require corresponding tests
- Respect existing architecture
- Documentation updates required when behavior changes

### TRANSITIONAL Codebase

**Observable Indicators**:
- Test coverage 30-70%
- Mix of old and new patterns
- Some legacy code remaining
- Partial documentation
- CI exists but may have gaps
- Types partially enforced

**Behavioral Adjustments**:
- Follow new patterns for new code
- Respect legacy patterns in old areas
- Propose cleanups when touching old code
- Add tests for new functionality
- Gradual improvement is acceptable

### LEGACY Codebase

**Observable Indicators**:
- Test coverage < 30%
- Inconsistent styles across files
- Unclear or undocumented architecture
- Minimal or outdated documentation
- Technical debt visible everywhere
- Missing or inconsistent types

**Behavioral Adjustments**:
- Be very conservative with changes
- Document unexpected behaviors when found
- Add tests before making modifications
- Propose but don't force cleanups
- Extra verification before and after changes
- Small, incremental improvements preferred

### GREENFIELD Project

**Observable Indicators**:
- New or nearly empty project
- No established patterns yet
- Fresh start opportunity
- Minimal existing code

**Behavioral Adjustments**:
- Establish best practices immediately
- Set up proper structure from the start
- Implement comprehensive testing from day one
- Create documentation as you go
- Use modern patterns and tools
- Set quality standards early

---

## Assessment Checklist

### Step 1: Quick Scan

Run these commands to gather data:

```bash
# Check for test files
find . -name "*test*" -o -name "*spec*" | grep -v node_modules | wc -l

# Check for config files
ls -la *.config.* .eslintrc* .prettierrc* pyproject.toml Cargo.toml 2>/dev/null

# Check for CI
ls -la .github/workflows/ .gitlab-ci.yml .circleci/ 2>/dev/null

# Check for type definitions
find . -name "*.d.ts" -o -name "py.typed" | grep -v node_modules | wc -l
```

### Step 2: Evaluate Criteria

| Criterion | Score |
|-----------|-------|
| **Test Coverage** | |
| - High (>70%) | +3 |
| - Medium (30-70%) | +2 |
| - Low (<30%) | +1 |
| - None | 0 |
| **Code Consistency** | |
| - Very consistent | +3 |
| - Mostly consistent | +2 |
| - Mixed | +1 |
| - Inconsistent | 0 |
| **Documentation** | |
| - Comprehensive | +3 |
| - Partial | +2 |
| - Minimal | +1 |
| - None | 0 |
| **CI/CD** | |
| - Full pipeline | +2 |
| - Basic CI | +1 |
| - None | 0 |
| **Type Safety** | |
| - Strict types | +2 |
| - Partial types | +1 |
| - No types | 0 |

**Total Score: ___/13**

### Step 3: Determine Level

| Score Range | Maturity Level |
|-------------|----------------|
| 10-13 | DISCIPLINED |
| 6-9 | TRANSITIONAL |
| 3-5 | LEGACY |
| 0-2 | Check if GREENFIELD |

---

## Quick Assessment Questions

If you can't run commands, answer these:

1. **Are there test files visible?**
   - Many → Likely DISCIPLINED or TRANSITIONAL
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

---

## Maturity-Aware Behavior Summary

| Action | DISCIPLINED | TRANSITIONAL | LEGACY | GREENFIELD |
|--------|-------------|--------------|--------|------------|
| **New patterns** | Never without discussion | Carefully in new code | Avoid | Establish best practices |
| **Test changes** | Required | Required for new | Add before modifying | Required from start |
| **Documentation** | Update when behavior changes | Add when missing | Document discoveries | Create as you go |
| **Refactoring** | Follow existing patterns | Gradual improvement | Small incremental | Set good patterns |
| **Style** | Match exactly | Match local style | Improve when touching | Establish standards |

---

*Muad'Dib Codebase Maturity Assessment v1.0.0*
