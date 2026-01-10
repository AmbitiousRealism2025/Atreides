# Context: Delegation Template (Tasks 2.1 - 2.2)

## Task Group Overview

- Task 2.1: Add 7-Section Delegation Template
- Task 2.2: Create Example Delegations

---

## Task 2.1: 7-Section Delegation Template

### Purpose

Provide a comprehensive, structured format for delegating tasks to agents.

### Content Template

```markdown
## Agent Delegation Template

When delegating via the Task tool, structure prompts using this 7-section template:

### Template Structure

```
## 1. TASK
[Specific, atomic goal with single deliverable]

## 2. EXPECTED OUTCOME
[Concrete, verifiable deliverables - what you'll receive back]

## 3. CONTEXT
- **Files**: [Relevant file paths]
- **Patterns**: [Existing conventions to follow]
- **Constraints**: [Limitations, boundaries, requirements]
- **Background**: [Why this task exists, what problem it solves]

## 4. MUST DO
- [Explicit requirement 1]
- [Explicit requirement 2]
- [Explicit requirement 3]

## 5. MUST NOT DO
- [Forbidden action 1]
- [Forbidden action 2]
- Do NOT modify files outside the specified scope
- Do NOT spawn additional sub-agents
- Do NOT make assumptions about missing information

## 6. TOOLS ALLOWED (optional)
[Whitelist of permitted tools, if constraining]
- Glob, Grep, Read (for exploration)
- Edit, Write (for implementation)
- Bash (for specific commands only)

## 7. SUCCESS CRITERIA
[How to verify the task is complete]
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### Section Requirements

| Section | Required | Purpose |
|---------|----------|---------|
| TASK | Yes | Defines what to accomplish |
| EXPECTED OUTCOME | Yes | Defines deliverables |
| CONTEXT | Yes | Provides necessary information |
| MUST DO | Yes | Explicit requirements |
| MUST NOT DO | Yes | Guards against errors |
| TOOLS ALLOWED | No | Optional constraint |
| SUCCESS CRITERIA | Yes | Verifies completion |

### Writing Effective Sections

#### TASK Section
- One sentence, one goal
- Atomic (not decomposable)
- Measurable outcome
- Action verb first

**Good**: "Find all files that import the UserService class"
**Bad**: "Look around the codebase and see what uses UserService and maybe fix some issues"

#### EXPECTED OUTCOME Section
- List specific deliverables
- Include format expectations
- Quantify when possible

**Good**: "Return a list of file paths with line numbers where UserService is imported"
**Bad**: "Let me know what you find"

#### CONTEXT Section
- Only relevant information
- File paths should be absolute or relative to project root
- Include "why" for better decisions

#### MUST DO Section
- Positive requirements
- Specific actions
- Observable behaviors

#### MUST NOT DO Section
- Always include scope limits
- Always include "no sub-agents" for simple tasks
- Include any dangerous operations to avoid

#### SUCCESS CRITERIA Section
- Checkable items
- Objective criteria
- Match expected outcome
```

---

## Task 2.2: Example Delegations

### Purpose

Provide concrete, copy-paste-ready examples for common delegation scenarios.

### Content Template

```markdown
### Example Delegations

#### Example 1: Codebase Exploration (Explore Agent)

```
Task(
  subagent_type="Explore",
  model="haiku",
  prompt="""
## 1. TASK
Find all React components that use the useState hook for form handling.

## 2. EXPECTED OUTCOME
- List of file paths containing form-related useState usage
- For each file: component name and line numbers
- Brief summary of form patterns found

## 3. CONTEXT
- **Files**: src/components/**/*.tsx, src/pages/**/*.tsx
- **Patterns**: Project uses functional components with hooks
- **Background**: Planning to standardize form handling with react-hook-form

## 4. MUST DO
- Search all .tsx files in src/
- Include the specific useState variable names (e.g., formData, values)
- Group findings by directory

## 5. MUST NOT DO
- Do NOT modify any files
- Do NOT analyze node_modules
- Do NOT spend time on non-form useState usage

## 6. TOOLS ALLOWED
- Glob, Grep, Read

## 7. SUCCESS CRITERIA
- [ ] All relevant directories searched
- [ ] Form-related useState patterns identified
- [ ] Results organized by location
"""
)
```

#### Example 2: Architecture Planning (Plan Agent with opus)

```
Task(
  subagent_type="Plan",
  model="opus",
  prompt="""
## 1. TASK
Design the database schema for a multi-tenant SaaS application's user management system.

## 2. EXPECTED OUTCOME
- Entity-relationship diagram (text format)
- Table definitions with columns and types
- Relationship descriptions
- Multi-tenancy strategy recommendation

## 3. CONTEXT
- **Files**: Current schema at src/db/schema.prisma
- **Patterns**: Using Prisma ORM with PostgreSQL
- **Constraints**: Must support 1000+ tenants, GDPR compliance required
- **Background**: Migrating from single-tenant to multi-tenant architecture

## 4. MUST DO
- Consider row-level security vs. schema separation
- Include audit fields (createdAt, updatedAt, deletedAt)
- Plan for tenant isolation
- Address GDPR data deletion requirements

## 5. MUST NOT DO
- Do NOT implement the schema (planning only)
- Do NOT modify existing files
- Do NOT make technology change recommendations

## 7. SUCCESS CRITERIA
- [ ] All user management entities identified
- [ ] Multi-tenancy approach justified
- [ ] GDPR compliance addressed
- [ ] Scalability considered
"""
)
```

#### Example 3: Security Review (security-engineer Agent)

```
Task(
  subagent_type="security-engineer",
  model="sonnet",
  prompt="""
## 1. TASK
Review the authentication middleware for security vulnerabilities.

## 2. EXPECTED OUTCOME
- List of identified vulnerabilities with severity ratings
- Location of each issue (file:line)
- Recommended fixes for each issue
- Overall security assessment

## 3. CONTEXT
- **Files**: src/middleware/auth.ts, src/utils/jwt.ts
- **Patterns**: Express middleware, JWT-based auth
- **Constraints**: Must remain backwards compatible
- **Background**: Preparing for security audit

## 4. MUST DO
- Check for OWASP Top 10 vulnerabilities
- Verify JWT implementation best practices
- Check for timing attacks in token validation
- Review error messages for information leakage

## 5. MUST NOT DO
- Do NOT modify any code
- Do NOT test against production
- Do NOT expose any secrets in your response

## 6. TOOLS ALLOWED
- Read, Grep, Glob

## 7. SUCCESS CRITERIA
- [ ] All auth-related files reviewed
- [ ] Each finding has severity rating
- [ ] Actionable recommendations provided
- [ ] No false positives from superficial analysis
"""
)
```

#### Example 4: Implementation Task (general-purpose Agent)

```
Task(
  subagent_type="general-purpose",
  model="sonnet",
  prompt="""
## 1. TASK
Add input validation to the createUser API endpoint.

## 2. EXPECTED OUTCOME
- Validation logic added to src/api/users.ts
- Validation schema defined
- Error responses standardized
- Tests added for validation cases

## 3. CONTEXT
- **Files**: src/api/users.ts, src/validators/index.ts
- **Patterns**: Project uses Zod for validation, see existing validators
- **Constraints**: Must return 400 with { error: string, field: string } format

## 4. MUST DO
- Validate email format
- Validate password strength (min 8 chars, 1 number, 1 special)
- Validate username (alphanumeric, 3-20 chars)
- Follow existing Zod patterns in validators/

## 5. MUST NOT DO
- Do NOT change the API response format for success cases
- Do NOT modify other endpoints
- Do NOT add new dependencies

## 7. SUCCESS CRITERIA
- [ ] All three fields validated
- [ ] Error format matches specification
- [ ] Existing tests still pass
- [ ] New validation tests added
"""
)
```

#### Example 5: Quick Research (general-purpose with haiku)

```
Task(
  subagent_type="general-purpose",
  model="haiku",
  prompt="""
## 1. TASK
Find the correct way to configure TypeScript strict mode in this project.

## 2. EXPECTED OUTCOME
- Current tsconfig.json strict settings
- Recommendation for enabling strict mode
- List of potential breaking changes

## 3. CONTEXT
- **Files**: tsconfig.json, src/**/*.ts
- **Background**: Considering enabling strict mode for better type safety

## 4. MUST DO
- Read current tsconfig.json
- Check for any existing strict-related settings
- Identify files that might have issues with strict mode

## 5. MUST NOT DO
- Do NOT modify tsconfig.json
- Do NOT spend more than a few minutes on this

## 7. SUCCESS CRITERIA
- [ ] Current config documented
- [ ] Strict mode recommendation provided
"""
)
```
```

---

## Acceptance Criteria

### Task 2.1 (7-Section Template)
- [ ] All 7 sections defined
- [ ] Purpose of each section clear
- [ ] Required vs optional indicated
- [ ] Writing guidelines for each
- [ ] Good/bad examples

### Task 2.2 (Example Delegations)
- [ ] At least 5 examples
- [ ] Different agent types covered
- [ ] Different complexity levels
- [ ] Realistic scenarios
- [ ] Copy-paste ready

---

*Context for Tasks 2.1, 2.2*
