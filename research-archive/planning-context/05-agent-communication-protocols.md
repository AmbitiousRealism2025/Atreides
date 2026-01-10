# OmO Agent Communication Protocols

## Executive Summary

Oh My OpenCode (OmO) employs a structured, hierarchical approach to inter-agent communication, primarily orchestrated by the **Sisyphus** agent. The protocols are designed to maintain parallel execution while preventing common pitfalls like infinite recursion or context bloat.

---

## 1. Communication Methods

Agents communicate through a **tool-driven mandate** - they must use specific tools rather than plain text to interact.

### Primary Communication Mechanisms

| Method | Description |
|--------|-------------|
| **Tool-based Delegation** | Sisyphus uses `call_omo_agent` tool to trigger subagents |
| **Direct Invocation** | Users/agents invoke specific agents using `@agent` syntax |
| **Recursive Blocking** | Subagents are strictly blocked from calling other agents |

### Communication Flow

```
User Request
     │
     ▼
┌─────────────┐
│  Sisyphus   │◄──── Tool-driven mandate
│ (Primary)   │      (no plain text)
└──────┬──────┘
       │
       ├── call_omo_agent ──► explore
       │
       ├── call_omo_agent ──► librarian
       │
       └── call_omo_agent ──► frontend-ui-ux-engineer
                                    │
                                    ╳ (cannot call other agents)
```

---

## 2. State Sharing Between Agents

State management is highly intentional and partitioned.

### State Isolation

| Scope | Description |
|-------|-------------|
| **Isolated Sessions** | Background agents run in isolated child sessions |
| **No Auto-Sharing** | Internal state not automatically shared with parent/peers |

### Shared State Mechanisms

| Mechanism | Location | Purpose |
|-----------|----------|---------|
| **Todo Persistence** | `~/.claude/todos/{sessionId}` | Multi-step work state |
| **Global Configuration** | `oh-my-opencode.json` | Provider limits, tool permissions |
| **Project Configuration** | `.opencode/oh-my-opencode.json` | Project-specific settings |

---

## 3. Context Flow (Parent to Child)

### Delegation Prompts
Parent provides specific "Context" section containing:
- File paths
- Existing patterns
- Constraints

### Static Injection
Child agents receive directory-specific context:
- `AGENTS.md` files
- `README.md` files
- Injected into initial session state

### Tool Whitelisting
Parents restrict child context by providing explicit **tool whitelist**:
- Ensures subagent only has required capabilities
- Prevents unauthorized tool access

### What Gets Transferred

| ✅ Transferred | ❌ NOT Transferred |
|----------------|-------------------|
| Task-specific context | Full conversation history |
| Relevant file paths | Unrelated prior discussions |
| Current TODO state | Raw tool outputs from other tasks |
| Decision rationale | Intermediate failed attempts |

---

## 4. Result Reporting (Child to Parent)

Results are **NOT automatically merged** into parent context.

### Pull-Based Retrieval

```
Background Agent Completes
         │
         ▼
   ┌─────────────┐
   │  Completed  │
   │   Result    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Notification │──► Parent alerted
   │   System    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ Parent uses │
   │ background_ │
   │ output tool │
   └─────────────┘
```

### Notification System
- Managed by `BackgroundManager`
- Alerts parent session when agent finishes
- Asynchronous notification

---

## 5. Error and Failure Signaling

### Propagation
- Errors encountered by subagents propagate back to parent
- Recorded in session logs

### Timeout Handling
- Failed background tasks return timeout message
- Includes current status

### 3-Strikes Recovery Protocol

```
Failure 1 → Log and retry
Failure 2 → Log and retry with adjustments
Failure 3 → Trigger recovery protocol:
            1. STOP all modifications
            2. REVERT via git checkout
            3. DOCUMENT failure details
            4. CONSULT oracle agent
            5. ESCALATE to user if needed
```

---

## 6. Coordination Patterns

### Multi-Phase Workflow Coordination

| Phase | Coordination Pattern |
|-------|---------------------|
| **Phase 0 (Intent Gate)** | Classify request type |
| **Phase 2A (Research)** | Fire `explore` + `librarian` in parallel |
| **Phase 2B (Implementation)** | Sequential task execution |
| **Phase 3 (Completion)** | Verify all TODOs, cancel background tasks |

### Convergent Search Strategy

```
       Sisyphus
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
 explore      librarian
 (internal)   (external)
    │             │
    └──────┬──────┘
           │
           ▼
    Results Converge
    (or iteration limit)
           │
           ▼
      Synthesize
```

### Todo Enforcer
- Forces "bouldering mode"
- Agents must complete all TODOs before stopping
- Prevents premature termination

---

## 7. Message Format and Structure

### 7-Section Delegation Template

```markdown
## 1. TASK
[Atomic, specific goal]

## 2. EXPECTED OUTCOME
[Concrete deliverables and success criteria]

## 3. REQUIRED SKILLS
[Specific skills to invoke]

## 4. REQUIRED TOOLS
[Explicit tool whitelist]

## 5. MUST DO
[Exhaustive mandatory requirements]

## 6. MUST NOT DO
[Forbidden actions / "rogue behavior" prevention]

## 7. CONTEXT
[File paths, patterns, environmental constraints]
```

### Example Message

```markdown
## 1. TASK
Find all authentication middleware functions

## 2. EXPECTED OUTCOME
- List of all middleware files
- Function signatures for each
- Import chain documentation

## 3. REQUIRED SKILLS
- codebase_exploration

## 4. REQUIRED TOOLS
- grep
- glob
- lsp_references

## 5. MUST DO
- Search src/middleware directory
- Include nested directories
- Document all findings

## 6. MUST NOT DO
- Modify any files
- Execute any code
- Access external APIs

## 7. CONTEXT
- Framework: Express.js
- Auth pattern: JWT middleware
- Entry: src/middleware/auth.ts
```

---

## Mapping to Claude Code

### Communication Pattern Adaptation

| OmO Pattern | Claude Code Equivalent |
|-------------|----------------------|
| `call_omo_agent` | `Task` tool with `subagent_type` |
| `@agent` syntax | Direct Task tool invocation |
| `background_output` | Task tool result (automatic) |
| Isolated sessions | Task agents have separate context |

### Notification Adaptation
- Claude Code Task tool returns results directly
- No explicit `background_output` needed
- Use `run_in_background` parameter for async execution

---

## Analogy

Think of this coordination like a **Construction Site Foreman (Sisyphus)** who:
1. Hands a **detailed blueprint (7-Section Template)** to a **specialized subcontractor (Subagent)**
2. The subcontractor works in a **private workshop (Isolated Context)**
3. When finished, places work in a **loading dock (Background Output)**
4. Rings a **bell (Notification)** to alert the foreman it's ready for inspection

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
