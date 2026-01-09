# Muad'Dib Agent Definitions

## Overview

Muad'Dib uses Claude Code's Task tool to delegate work to specialized agents.
This document defines when and how to use different agent types.

---

## Agent Reference

### Exploration Agents

#### Explore Agent
**subagent_type**: `Explore`
**model**: `sonnet`

**Use For**:
- Finding files by pattern
- Understanding project structure
- Locating code patterns
- Quick codebase searches

**Example**:
```javascript
Task({
  subagent_type: "Explore",
  model: "sonnet",
  prompt: "Find all API route handlers in the src directory"
})
```

#### General-Purpose Agent
**subagent_type**: `general-purpose`
**model**: `sonnet`

**Use For**:
- Documentation research
- External information lookup
- General questions
- Multi-step searches

**Example**:
```javascript
Task({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "Research best practices for JWT refresh token rotation"
})
```

---

### Planning Agents

#### Plan Agent (Strategic)
**subagent_type**: `Plan`
**model**: `opus`

**Use For**:
- Architectural decisions
- Complex design problems
- Multi-component analysis
- Critical path planning

**Example**:
```javascript
Task({
  subagent_type: "Plan",
  model: "opus",
  prompt: "Design the architecture for adding multi-tenancy to this application"
})
```

#### Plan Agent (Tactical)
**subagent_type**: `Plan`
**model**: `opus`

**Use For**:
- Feature design
- Refactoring strategy
- Implementation planning
- Technical decisions

**Example**:
```javascript
Task({
  subagent_type: "Plan",
  model: "opus",
  prompt: "Plan the refactoring of the authentication module from callbacks to async/await"
})
```

---

### Specialist Agents

#### Security Engineer
**subagent_type**: `security-engineer`
**model**: `opus`

**Use For**:
- Vulnerability analysis
- Security code review
- Authentication/authorization design
- Compliance checking

**Example**:
```javascript
Task({
  subagent_type: "security-engineer",
  model: "opus",
  prompt: "Review this authentication flow for security vulnerabilities"
})
```

#### Performance Engineer
**subagent_type**: `performance-engineer`
**model**: `opus`

**Use For**:
- Performance optimization
- Bottleneck analysis
- Query optimization
- Resource profiling

**Example**:
```javascript
Task({
  subagent_type: "performance-engineer",
  model: "opus",
  prompt: "Analyze this database query pattern for performance issues"
})
```

#### Frontend Architect
**subagent_type**: `frontend-architect`
**model**: `opus`

**Use For**:
- UI/UX implementation
- Component design
- State management
- Accessibility review

**Example**:
```javascript
Task({
  subagent_type: "frontend-architect",
  model: "opus",
  prompt: "Design a reusable data table component with sorting and pagination"
})
```

#### Backend Architect
**subagent_type**: `backend-architect`
**model**: `opus`

**Use For**:
- API design
- Data modeling
- Service architecture
- Integration patterns

**Example**:
```javascript
Task({
  subagent_type: "backend-architect",
  model: "opus",
  prompt: "Design the REST API endpoints for user management"
})
```

---

## Model Selection Matrix

| Task Complexity | Model | Cost | Speed | Use When |
|-----------------|-------|------|-------|----------|
| Low | sonnet | $ | Fast | Simple searches, lookups |
| Medium-High | opus | $$ | Medium | Implementation, review, architecture |

### Complexity Indicators

**Use sonnet when**:
- Single file operations
- Pattern matching
- Documentation lookup
- Quick questions

**Use opus when**:
- Multi-file changes
- Code implementation
- Testing and review
- Standard features
- Architectural decisions
- Complex debugging
- Security critical
- Performance critical
- Legacy understanding

---

## Delegation Prompt Template

When delegating via Task tool, structure your prompt using this template:

```markdown
## TASK
[Specific, atomic goal - what needs to be done]

## EXPECTED OUTCOME
[Concrete deliverable - what success looks like]

## CONTEXT
[Relevant information]
- Key files: [list paths]
- Patterns to follow: [describe]
- Constraints: [list any]

## MUST DO
- [Explicit requirement 1]
- [Explicit requirement 2]

## MUST NOT DO
- [Forbidden action 1]
- [Forbidden action 2]

## SUCCESS CRITERIA
- [How to know the task is complete]
```

### Example Delegation

```javascript
Task({
  subagent_type: "Explore",
  model: "sonnet",
  prompt: `## TASK
Find all files that import from the deprecated 'old-utils' module.

## EXPECTED OUTCOME
A list of file paths with line numbers where the import occurs.

## CONTEXT
- The deprecated module is at: src/lib/old-utils.js
- We're preparing to migrate to: src/lib/new-utils.js

## MUST DO
- Check all .js and .ts files in src/
- Include the exact import statement found

## MUST NOT DO
- Modify any files
- Check files outside src/

## SUCCESS CRITERIA
- Complete list of all imports from old-utils
- No false positives`
})
```

---

## Parallel Execution

When appropriate, launch multiple agents in parallel:

```javascript
// Parallel exploration
Promise.all([
  Task({ subagent_type: "Explore", prompt: "Find all API routes" }),
  Task({ subagent_type: "Explore", prompt: "Find all database models" }),
  Task({ subagent_type: "Explore", prompt: "Find all test files" })
])
```

### When to Parallelize

✅ **Good candidates**:
- Independent searches
- Multiple file explorations
- Gathering diverse context

❌ **Don't parallelize**:
- Sequential dependencies
- Modifying same files
- When results inform next steps

---

## Error Handling

When an agent fails:

1. **Check the error message** - Understand what went wrong
2. **Adjust the prompt** - Be more specific or add constraints
3. **Try different agent** - Maybe wrong specialization
4. **Escalate if needed** - 3 failures → recovery protocol

---

*Muad'Dib Agent Definitions v1.0.0*
