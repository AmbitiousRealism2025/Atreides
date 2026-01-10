# Context: Extended Automation Patterns (Tasks 5.4.1 - 5.4.4)

## Task Group Overview

- Task 5.4.1: Document test-driven pattern
- Task 5.4.2: Document parallel+sequential pattern
- Task 5.4.3: Document incremental refactoring pattern
- Task 5.4.4: Document documentation sync pattern

---

## Task 5.4.1: Test-Driven Pattern

### Content Template for CLAUDE.md

```markdown
## Automation Pattern: Test-Driven Development

### When to Use

- Adding new features with clear requirements
- Fixing bugs (reproduce first)
- Refactoring with safety net needed
- When test infrastructure exists

### Pattern Flow

```
┌─────────────────────────────────────────────────────────┐
│                  TEST-DRIVEN PATTERN                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. WRITE TEST                                          │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Write failing   │ ← Test describes expected behavior │
│  │ test first      │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  2. RUN TEST (expect failure)                           │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Confirm test    │ ← Must fail! Proves test works    │
│  │ fails as        │                                    │
│  │ expected        │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  3. IMPLEMENT                                           │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Write minimum   │ ← Just enough to pass             │
│  │ code to pass    │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  4. RUN TEST (expect pass)                              │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Confirm test    │ ← Must pass! Implementation works │
│  │ passes          │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  5. REFACTOR (optional)                                 │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Improve code    │ ← Clean up while tests protect    │
│  │ quality         │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  6. RUN TEST (confirm still passes)                     │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Confirm         │ ← Refactoring didn't break        │
│  │ still passing   │                                    │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### TodoWrite Integration

```
TodoWrite:
1. Write test for [feature] - pending
2. Run test, confirm failure - pending
3. Implement [feature] - pending
4. Run test, confirm pass - pending
5. Refactor if needed - pending
6. Final test verification - pending
```

### Example: Adding Login Validation

```markdown
## Step 1: Write Test
```javascript
// tests/auth.test.ts
describe('login validation', () => {
  it('should reject invalid email format', () => {
    expect(() => validateLogin('invalid-email', 'password'))
      .toThrow('Invalid email format');
  });
});
```

## Step 2: Run Test
```bash
npm test tests/auth.test.ts
# Expected: FAIL - validateLogin not implemented
```

## Step 3: Implement
```javascript
// src/auth/validate.ts
export function validateLogin(email: string, password: string) {
  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }
}
```

## Step 4: Run Test
```bash
npm test tests/auth.test.ts
# Expected: PASS
```
```

### Anti-Patterns

❌ **Don't skip the failing test step** - You won't know if test actually tests anything
❌ **Don't write test after implementation** - Loses design benefits
❌ **Don't write too much code** - Just enough to pass
❌ **Don't skip refactoring** - Technical debt accumulates
```

---

## Task 5.4.2: Parallel+Sequential Pattern

### Content Template for CLAUDE.md

```markdown
## Automation Pattern: Parallel Exploration + Sequential Implementation

### When to Use

- Complex tasks requiring research
- Unfamiliar codebases
- Tasks with internal and external context needs
- When exploration can be parallelized

### Pattern Flow

```
┌─────────────────────────────────────────────────────────┐
│          PARALLEL + SEQUENTIAL PATTERN                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  PHASE A: PARALLEL EXPLORATION                          │
│  ─────────────────────────────                          │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ Task        │  │ Task        │  │ Task        │     │
│  │ (Explore)   │  │ (Explore)   │  │ (general-   │     │
│  │ Internal    │  │ Patterns    │  │ purpose)    │     │
│  │ codebase    │  │ & tests     │  │ External    │     │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘     │
│         │                │                │             │
│         └────────────────┼────────────────┘             │
│                          │                              │
│                          ▼                              │
│                 ┌─────────────────┐                     │
│                 │   Wait for all   │                    │
│                 │   to complete    │                    │
│                 └────────┬────────┘                     │
│                          │                              │
│  PHASE B: SYNTHESIS                                     │
│  ──────────────────                                     │
│                          │                              │
│                          ▼                              │
│                 ┌─────────────────┐                     │
│                 │   Synthesize    │                     │
│                 │   findings      │                     │
│                 └────────┬────────┘                     │
│                          │                              │
│  PHASE C: SEQUENTIAL IMPLEMENTATION                     │
│  ──────────────────────────────────                     │
│                          │                              │
│                          ▼                              │
│                 ┌─────────────────┐                     │
│                 │ Step 1: Plan    │                     │
│                 └────────┬────────┘                     │
│                          │                              │
│                          ▼                              │
│                 ┌─────────────────┐                     │
│                 │ Step 2: Core    │                     │
│                 │ implementation  │                     │
│                 └────────┬────────┘                     │
│                          │                              │
│                          ▼                              │
│                 ┌─────────────────┐                     │
│                 │ Step 3: Tests   │                     │
│                 └────────┬────────┘                     │
│                          │                              │
│                          ▼                              │
│                 ┌─────────────────┐                     │
│                 │ Step 4: Verify  │                     │
│                 └─────────────────┘                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Implementation

```markdown
## Phase A: Parallel Exploration

Launch in SINGLE message:
```
Task(Explore, haiku, "Find all authentication-related code in src/")
Task(Explore, haiku, "Find tests for authentication")
Task(general-purpose, haiku, "Research JWT refresh token best practices")
```

## Wait for Results

All three complete before continuing.

## Phase B: Synthesis

```markdown
### Exploration Summary

**Internal Findings**:
- Auth code in: src/auth/
- Key files: login.ts, session.ts, middleware.ts
- Pattern: JWT with refresh tokens
- Tests: tests/auth/

**External Findings**:
- Best practice: Rotate refresh tokens on use
- Security: Store in httpOnly cookies
- Expiration: Access 15min, Refresh 7days
```

## Phase C: Sequential Implementation

```
TodoWrite:
1. Update token rotation logic - pending
2. Add cookie storage - pending
3. Update expiration times - pending
4. Add/update tests - pending
5. Integration test - pending
```

Then execute each in order.
```

### When to Use Parallel vs Sequential

| Phase | Execution | Why |
|-------|-----------|-----|
| Exploration | Parallel | Independent, faster |
| Synthesis | Sequential | Requires all results |
| Implementation | Sequential | Dependencies between steps |
| Testing | Can be parallel | Independent test files |
```

---

## Task 5.4.3: Incremental Refactoring Pattern

### Content Template for CLAUDE.md

```markdown
## Automation Pattern: Incremental Refactoring

### When to Use

- Large-scale refactoring (5+ files)
- Renaming across codebase
- Pattern migration
- Technical debt cleanup

### Pattern Flow

```
┌─────────────────────────────────────────────────────────┐
│           INCREMENTAL REFACTORING PATTERN                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. IDENTIFY SCOPE                                      │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ List all files  │ ← Know full scope upfront         │
│  │ to refactor     │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  2. CREATE TODOS                                        │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ One todo per    │ ← Track progress explicitly       │
│  │ file/change     │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  3. FOR EACH FILE                                       │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ a. Read current implementation                   │    │
│  │ b. Identify specific refactoring                 │    │
│  │ c. Apply change                                  │    │
│  │ d. Run tests                                     │    │
│  │    ├── If PASS: Mark complete, continue          │    │
│  │    └── If FAIL: Fix or revert, then continue     │    │
│  └─────────────────────────────────────────────────┘    │
│           │                                             │
│           │ Repeat for each file                        │
│           │                                             │
│  4. FINAL VERIFICATION                                  │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Full test suite │ ← Catch any interactions          │
│  │ Type check      │                                    │
│  │ Lint check      │                                    │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### TodoWrite Structure

```
TodoWrite:
1. Identify all files using old pattern - in_progress
2. Refactor src/auth/login.ts - pending
3. Refactor src/auth/logout.ts - pending
4. Refactor src/api/users.ts - pending
5. Refactor src/api/admin.ts - pending
6. Update tests/auth.test.ts - pending
7. Run full test suite - pending
8. Run type check - pending
```

### Example: Rename Function Across Codebase

```markdown
## Step 1: Identify Scope

```bash
grep -r "oldFunctionName" --include="*.ts" src/
# Found in: auth.ts, users.ts, admin.ts, helpers.ts
```

## Step 2: Create Todos

One todo per file.

## Step 3: For Each File

### File: src/auth/login.ts

```bash
# Read
Read src/auth/login.ts

# Refactor
Edit: oldFunctionName → newFunctionName

# Test
npm test tests/auth.test.ts
# PASS ✓

# Mark complete
```

### File: src/api/users.ts

```bash
# Read
Read src/api/users.ts

# Refactor
Edit: oldFunctionName → newFunctionName

# Test
npm test tests/api.test.ts
# FAIL ✗ - forgot to update import

# Fix
Edit: import { oldFunctionName } → import { newFunctionName }

# Re-test
npm test tests/api.test.ts
# PASS ✓

# Mark complete
```

## Step 4: Final Verification

```bash
npm test
npm run typecheck
npm run lint
# All passing ✓
```
```

### Safety Rules

1. **Never skip tests between files** - Catch issues early
2. **Commit after each file** (optional) - Easy rollback
3. **Don't batch too many changes** - Harder to debug
4. **Keep checkpoint updated** - Know progress if interrupted
```

---

## Task 5.4.4: Documentation Sync Pattern

### Content Template for CLAUDE.md

```markdown
## Automation Pattern: Documentation Sync

### When to Use

- After implementing features
- After changing APIs
- After refactoring
- When documentation may be stale

### Pattern Flow

```
┌─────────────────────────────────────────────────────────┐
│            DOCUMENTATION SYNC PATTERN                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. IDENTIFY AFFECTED DOCS                              │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ What docs might │ ← README, API docs, inline        │
│  │ be affected?    │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  2. REVIEW EACH DOC TYPE                                │
│     │                                                   │
│     ├──► Inline Comments                                │
│     │    └── Do they match new behavior?                │
│     │                                                   │
│     ├──► README                                         │
│     │    └── Is usage example correct?                  │
│     │                                                   │
│     ├──► API Documentation                              │
│     │    └── Are endpoints/params current?              │
│     │                                                   │
│     └──► Change Log                                     │
│          └── Is change documented?                      │
│           │                                             │
│  3. UPDATE EACH AS NEEDED                               │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Make updates    │                                    │
│  │ one at a time   │                                    │
│  └────────┬────────┘                                    │
│           │                                             │
│  4. VERIFY ACCURACY                                     │
│     │                                                   │
│     ▼                                                   │
│  ┌─────────────────┐                                    │
│  │ Read updated    │ ← Does it match implementation?   │
│  │ docs vs code    │                                    │
│  └─────────────────┘                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Documentation Checklist

```markdown
After implementation complete:

### Inline Documentation
- [ ] Function/method comments updated
- [ ] Parameter descriptions accurate
- [ ] Return value descriptions accurate
- [ ] Example usage current

### README
- [ ] Installation instructions current
- [ ] Usage examples work
- [ ] API overview accurate
- [ ] Configuration options listed

### API Documentation
- [ ] Endpoints documented
- [ ] Request/response formats correct
- [ ] Error codes listed
- [ ] Authentication requirements noted

### Change Log
- [ ] Version number updated
- [ ] Changes described
- [ ] Breaking changes highlighted
- [ ] Migration notes if needed

### Code Comments
- [ ] TODO comments addressed or documented
- [ ] Complex logic explained
- [ ] Non-obvious decisions documented
```

### Example: Feature Added Documentation Sync

```markdown
## After adding OAuth2 login feature:

### 1. Identify Affected Docs

- README.md (usage)
- docs/api/auth.md (API)
- src/auth/oauth.ts (inline)
- CHANGELOG.md

### 2. Update Inline Comments

```typescript
// src/auth/oauth.ts

/**
 * Initiates OAuth2 login flow
 * @param provider - OAuth provider ('google' | 'github' | 'microsoft')
 * @param redirectUri - Where to redirect after auth
 * @returns Authorization URL to redirect user to
 * @example
 * const authUrl = initiateOAuth('google', 'https://myapp.com/callback');
 * // Redirect user to authUrl
 */
export function initiateOAuth(provider: OAuthProvider, redirectUri: string): string {
```

### 3. Update README

```markdown
## Authentication

### OAuth2 Login (NEW)

```javascript
import { initiateOAuth } from './auth';

// Start OAuth flow
const authUrl = initiateOAuth('google', 'https://myapp.com/callback');
res.redirect(authUrl);
```

Supported providers: Google, GitHub, Microsoft
```

### 4. Update API Docs

```markdown
## POST /auth/oauth/initiate

Initiates OAuth2 authentication flow.

**Request Body**:
```json
{
  "provider": "google",
  "redirectUri": "https://myapp.com/callback"
}
```

**Response**:
```json
{
  "authorizationUrl": "https://accounts.google.com/..."
}
```
```

### 5. Update CHANGELOG

```markdown
## [1.2.0] - 2026-01-08

### Added
- OAuth2 login support for Google, GitHub, and Microsoft
- New `/auth/oauth/initiate` and `/auth/oauth/callback` endpoints
```
```
```

---

## Acceptance Criteria

### Task 5.4.1
- [ ] Pattern purpose documented
- [ ] Flow diagram included
- [ ] TodoWrite integration shown
- [ ] Example provided
- [ ] Anti-patterns listed

### Task 5.4.2
- [ ] Pattern purpose documented
- [ ] Flow diagram included
- [ ] Parallel vs sequential explained
- [ ] Example provided
- [ ] When to use each phase

### Task 5.4.3
- [ ] Pattern purpose documented
- [ ] Flow diagram included
- [ ] TodoWrite structure shown
- [ ] Example provided
- [ ] Safety rules included

### Task 5.4.4
- [ ] Pattern purpose documented
- [ ] Flow diagram included
- [ ] Checklist provided
- [ ] Example provided
- [ ] All doc types covered

---

*Context for Tasks 5.4.1 - 5.4.4*
