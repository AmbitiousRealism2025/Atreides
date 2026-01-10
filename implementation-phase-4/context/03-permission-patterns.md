# Context: Advanced Permission Patterns (Tasks 4.3.1 - 4.3.2)

## Task Group Overview

- Task 4.3.1: Create comprehensive allow list
- Task 4.3.2: Create comprehensive deny list

---

## Task 4.3.1: Comprehensive Allow List

### Purpose

Explicitly permit safe operations to improve workflow efficiency.

### Allow List Categories

#### 1. Version Control Operations

```json
"allow": [
  "Bash(git:*)",
  "Bash(gh:*)"
]
```

**Rationale**: Git operations are essential for development workflow.

#### 2. Package Manager Operations

```json
"allow": [
  "Bash(npm:*)",
  "Bash(npm run:*)",
  "Bash(npm test:*)",
  "Bash(npx:*)",
  "Bash(yarn:*)",
  "Bash(pnpm:*)",
  "Bash(pip:*)",
  "Bash(pip3:*)",
  "Bash(poetry:*)",
  "Bash(cargo:*)",
  "Bash(go:*)",
  "Bash(go get:*)",
  "Bash(go mod:*)"
]
```

**Rationale**: Package management is routine development activity.

#### 3. Build and Test Commands

```json
"allow": [
  "Bash(make:*)",
  "Bash(cmake:*)",
  "Bash(pytest:*)",
  "Bash(jest:*)",
  "Bash(vitest:*)",
  "Bash(mocha:*)",
  "Bash(cargo test:*)",
  "Bash(go test:*)"
]
```

**Rationale**: Building and testing are core development tasks.

#### 4. Language Runtime Operations

```json
"allow": [
  "Bash(node:*)",
  "Bash(python:*)",
  "Bash(python3:*)",
  "Bash(ruby:*)",
  "Bash(java:*)",
  "Bash(javac:*)"
]
```

**Rationale**: Running code is essential for development.

#### 5. Safe File Operations

```json
"allow": [
  "Bash(ls:*)",
  "Bash(cat:*)",
  "Bash(head:*)",
  "Bash(tail:*)",
  "Bash(grep:*)",
  "Bash(find:*)",
  "Bash(wc:*)",
  "Bash(sort:*)",
  "Bash(uniq:*)",
  "Bash(diff:*)"
]
```

**Rationale**: Read-only file inspection is safe.

#### 6. System Information

```json
"allow": [
  "Bash(which:*)",
  "Bash(pwd:*)",
  "Bash(echo:*)",
  "Bash(whoami:*)",
  "Bash(date:*)",
  "Bash(uname:*)",
  "Bash(env:*)"
]
```

**Rationale**: System queries don't modify state.

#### 7. Container Operations (Optional)

```json
"allow": [
  "Bash(docker:*)",
  "Bash(docker-compose:*)",
  "Bash(kubectl:*)"
]
```

**Rationale**: Container management is common in modern development.

### Complete Allow List

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(gh:*)",
      "Bash(npm:*)",
      "Bash(npm run:*)",
      "Bash(npm test:*)",
      "Bash(npx:*)",
      "Bash(yarn:*)",
      "Bash(pnpm:*)",
      "Bash(pip:*)",
      "Bash(pip3:*)",
      "Bash(poetry:*)",
      "Bash(cargo:*)",
      "Bash(go:*)",
      "Bash(go get:*)",
      "Bash(go mod:*)",
      "Bash(make:*)",
      "Bash(cmake:*)",
      "Bash(pytest:*)",
      "Bash(jest:*)",
      "Bash(vitest:*)",
      "Bash(mocha:*)",
      "Bash(cargo test:*)",
      "Bash(go test:*)",
      "Bash(node:*)",
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(ruby:*)",
      "Bash(java:*)",
      "Bash(javac:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(wc:*)",
      "Bash(sort:*)",
      "Bash(uniq:*)",
      "Bash(diff:*)",
      "Bash(which:*)",
      "Bash(pwd:*)",
      "Bash(echo:*)",
      "Bash(whoami:*)",
      "Bash(date:*)",
      "Bash(uname:*)",
      "Bash(env:*)",
      "Bash(docker:*)",
      "Bash(docker-compose:*)",
      "Bash(kubectl:*)"
    ]
  }
}
```

---

## Task 4.3.2: Comprehensive Deny List

### Purpose

Block dangerous operations that could cause harm.

### Deny List Categories

#### 1. Destructive File Operations

```json
"deny": [
  "Bash(rm -rf /*:*)",
  "Bash(rm -rf ~:*)",
  "Bash(rm -rf .:*)",
  "Bash(rm -rf ..:*)"
]
```

**Rationale**: Prevent catastrophic data loss.

#### 2. Network Download & Execute

```json
"deny": [
  "Bash(curl:*)",
  "Bash(wget:*)",
  "Bash(curl*|*sh:*)",
  "Bash(wget*|*sh:*)"
]
```

**Rationale**: Prevent remote code execution.

#### 3. Privilege Escalation

```json
"deny": [
  "Bash(sudo:*)",
  "Bash(su:*)",
  "Bash(chmod 777:*)",
  "Bash(chmod -R 777:*)",
  "Bash(chown -R:*)"
]
```

**Rationale**: Prevent privilege escalation and insecure permissions.

#### 4. System Modification

```json
"deny": [
  "Bash(mkfs:*)",
  "Bash(dd if=:*)",
  "Bash(fdisk:*)",
  "Bash(parted:*)"
]
```

**Rationale**: Prevent disk/partition damage.

#### 5. Sensitive File Access (Read)

```json
"deny": [
  "Read(.env)",
  "Read(.env.*)",
  "Read(.env.local)",
  "Read(.env.production)",
  "Read(**/secrets/**)",
  "Read(**/.git/config)",
  "Read(**/*credentials*)",
  "Read(**/*password*)",
  "Read(**/id_rsa)",
  "Read(**/id_ed25519)",
  "Read(**/.npmrc)",
  "Read(**/.pypirc)",
  "Read(**/.netrc)"
]
```

**Rationale**: Prevent secrets exposure.

#### 6. Sensitive File Access (Write)

```json
"deny": [
  "Write(.env)",
  "Write(.env.*)",
  "Write(**/secrets/**)",
  "Write(**/.git/config)",
  "Write(**/*credentials*)",
  "Write(**/id_rsa)",
  "Write(**/id_ed25519)",
  "Write(**/.npmrc)",
  "Write(**/.pypirc)"
]
```

**Rationale**: Prevent secrets modification.

#### 7. Process/System Control

```json
"deny": [
  "Bash(kill -9:*)",
  "Bash(killall:*)",
  "Bash(pkill:*)",
  "Bash(shutdown:*)",
  "Bash(reboot:*)",
  "Bash(init:*)"
]
```

**Rationale**: Prevent system disruption.

### Complete Deny List

```json
{
  "permissions": {
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(rm -rf ~:*)",
      "Bash(rm -rf .:*)",
      "Bash(rm -rf ..:*)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(curl*|*sh:*)",
      "Bash(wget*|*sh:*)",
      "Bash(sudo:*)",
      "Bash(su:*)",
      "Bash(chmod 777:*)",
      "Bash(chmod -R 777:*)",
      "Bash(chown -R:*)",
      "Bash(mkfs:*)",
      "Bash(dd if=:*)",
      "Bash(fdisk:*)",
      "Bash(parted:*)",
      "Bash(kill -9:*)",
      "Bash(killall:*)",
      "Bash(pkill:*)",
      "Bash(shutdown:*)",
      "Bash(reboot:*)",
      "Bash(init:*)",
      "Read(.env)",
      "Read(.env.*)",
      "Read(.env.local)",
      "Read(.env.production)",
      "Read(**/secrets/**)",
      "Read(**/.git/config)",
      "Read(**/*credentials*)",
      "Read(**/*password*)",
      "Read(**/id_rsa)",
      "Read(**/id_ed25519)",
      "Read(**/.npmrc)",
      "Read(**/.pypirc)",
      "Read(**/.netrc)",
      "Write(.env)",
      "Write(.env.*)",
      "Write(**/secrets/**)",
      "Write(**/.git/config)",
      "Write(**/*credentials*)",
      "Write(**/id_rsa)",
      "Write(**/id_ed25519)",
      "Write(**/.npmrc)",
      "Write(**/.pypirc)"
    ]
  }
}
```

---

## Complete Permissions Configuration

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(gh:*)",
      "Bash(npm:*)",
      "Bash(npm run:*)",
      "Bash(npm test:*)",
      "Bash(npx:*)",
      "Bash(yarn:*)",
      "Bash(pnpm:*)",
      "Bash(pip:*)",
      "Bash(pip3:*)",
      "Bash(poetry:*)",
      "Bash(cargo:*)",
      "Bash(go:*)",
      "Bash(make:*)",
      "Bash(cmake:*)",
      "Bash(pytest:*)",
      "Bash(jest:*)",
      "Bash(vitest:*)",
      "Bash(node:*)",
      "Bash(python:*)",
      "Bash(python3:*)",
      "Bash(ls:*)",
      "Bash(cat:*)",
      "Bash(head:*)",
      "Bash(tail:*)",
      "Bash(grep:*)",
      "Bash(find:*)",
      "Bash(which:*)",
      "Bash(pwd:*)",
      "Bash(echo:*)",
      "Bash(docker:*)",
      "Bash(kubectl:*)"
    ],
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(rm -rf ~:*)",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(sudo:*)",
      "Bash(su:*)",
      "Bash(chmod 777:*)",
      "Bash(mkfs:*)",
      "Bash(dd if=:*)",
      "Bash(kill -9:*)",
      "Bash(shutdown:*)",
      "Bash(reboot:*)",
      "Read(.env)",
      "Read(.env.*)",
      "Read(**/secrets/**)",
      "Read(**/.git/config)",
      "Read(**/*credentials*)",
      "Read(**/id_rsa)",
      "Read(**/id_ed25519)",
      "Write(.env)",
      "Write(.env.*)",
      "Write(**/secrets/**)",
      "Write(**/*credentials*)"
    ]
  }
}
```

---

## Permission Priority

**Deny rules take precedence over allow rules.**

If a command matches both an allow and deny pattern, it will be **denied**.

Example:
- Allow: `"Bash(rm:*)"` ← allows rm commands
- Deny: `"Bash(rm -rf /*:*)"` ← denies rm -rf /
- Result: `rm file.txt` ✅ allowed, `rm -rf /` ❌ denied

---

## Project-Specific Customization

### Minimal (High Security)

```json
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(npm test:*)",
      "Bash(ls:*)",
      "Bash(cat:*)"
    ],
    "deny": ["*"]
  }
}
```

### Balanced (Default)

Use the complete configuration above.

### Permissive (Trusted Environment)

```json
{
  "permissions": {
    "allow": ["*"],
    "deny": [
      "Bash(rm -rf /*:*)",
      "Bash(sudo:*)",
      "Read(.env*)",
      "Write(.env*)"
    ]
  }
}
```

---

## Acceptance Criteria

### Task 4.3.1
- [ ] Allow list covers version control
- [ ] Allow list covers package managers
- [ ] Allow list covers build/test commands
- [ ] Allow list covers language runtimes
- [ ] Allow list covers safe file operations
- [ ] Allow list covers system info commands
- [ ] Valid JSON syntax

### Task 4.3.2
- [ ] Deny list blocks destructive file operations
- [ ] Deny list blocks network download/execute
- [ ] Deny list blocks privilege escalation
- [ ] Deny list blocks system modification
- [ ] Deny list blocks sensitive file read
- [ ] Deny list blocks sensitive file write
- [ ] Deny list blocks process/system control
- [ ] Valid JSON syntax

---

*Context for Tasks 4.3.1 - 4.3.2*
