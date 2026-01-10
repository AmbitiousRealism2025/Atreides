# OmO Cross-Session Continuity

## Executive Summary

Oh My OpenCode (OmO) employs several mechanisms to ensure continuity across sessions, primarily through file-based state persistence, hierarchical configuration, and specialized hooks.

---

## 1. Information Persisting Between Sessions

### Persistent State Data

| Data Type | Storage Location | Purpose |
|-----------|-----------------|---------|
| Todo Items | `~/.claude/todos/{sessionId}` | Track multi-step work |
| Ralph Loop State | File system | Track iteration progress |
| Iteration Counts | Memory + files | Manage loop limits |
| Critical Context | Various | Avoid redundant work |

### Critical Context Preserved
- Decisions made and rationale
- File paths being modified
- Errors encountered
- Task completion status

---

## 2. Project-Specific Context Persistence

### Configuration Hierarchy

```
Priority Order (highest to lowest):
┌─────────────────────────────────────┐
│ .opencode/oh-my-opencode.json      │ ◄── Project-level (highest)
├─────────────────────────────────────┤
│ ~/.config/opencode/oh-my-opencode  │
│ .json                               │ ◄── User-level (fallback)
└─────────────────────────────────────┘
```

### Knowledge Bases

| File | Purpose |
|------|---------|
| `AGENTS.md` | Codebase knowledge, architectural decisions |
| `README.md` | Project documentation |
| `CLAUDE.md` | Project-specific rules and context |

**Auto-injection:** These files are automatically injected into session context

### Directory Discovery

Skills and commands discovered from project-specific directories:
- `.opencode/skill/`
- `.claude/skills/`

Ensures agent has access to project-relevant tools only.

---

## 3. Task Resumption Across Sessions

### Auto-Session Resume Hook
- Automatically resumes operations after recovery/crash
- Picks up from last known state

### Todo Continuation Enforcer
- Prevents agent from finishing with pending TODOs
- Forces completion of all steps
- Verification required before session end

### Ralph Loop Continuation
- Persists state until "completion promise" detected
- Example: Word `DONE` signals completion
- Allows multi-session iterative development

### Resumption Flow

```
Session End (interrupted)
         │
         ▼
State persisted to disk:
├── Todo items
├── Ralph Loop state
└── Iteration counts
         │
         ▼
New Session Start
         │
         ▼
auto-session-resume hook fires
         │
         ▼
Load persisted state
         │
         ▼
Continue from last checkpoint
```

---

## 4. Learning from Past Sessions

### Functional Learning (Not ML)

OmO "learns" by documenting and preserving history:

| Mechanism | What's Learned |
|-----------|---------------|
| Failure Documentation | What was attempted, why it failed |
| Maturity Assessment | Codebase classification (Disciplined/Legacy/etc.) |
| Pattern Recognition | Existing code patterns in project |

### 3-Strikes Documentation
When triggered:
1. Records what was attempted
2. Documents specific failure points
3. Preserves for future reference

### Maturity Assessment Persistence
- Sisyphus assesses codebase maturity
- Classification influences approach:
  - **Disciplined** → Strict pattern adherence
  - **Legacy** → Propose cleanups
  - **Greenfield** → Establish new practices

---

## 5. Loading Previous Context

### SessionStart Hook
Fires when new session begins:
- Injects project-specific rules
- Loads AGENTS.md content
- Sets up initial context

### Runtime Environment Injection
Orchestrator receives:
- Current working directory
- Platform information
- Timezone
- Ensures context-aware decisions

### Loading Sequence

```
New Session
     │
     ▼
SessionStart Hook
     │
     ├── Load AGENTS.md
     ├── Load CLAUDE.md
     ├── Load project config
     └── Inject runtime environment
     │
     ▼
Context Ready
```

---

## 6. Session Handoff Patterns (Save/Load)

### Parent-Child Handoff

```
Parent Session
     │
     ├── Spawns background task
     │
     ▼
Child Session (Isolated)
     │
     ├── Works independently
     ├── Completes task
     │
     ▼
Results in "holding area"
     │
     ▼
Parent explicitly retrieves
via background_output tool
```

### Key Characteristics
- **Context Isolation:** Background tasks don't clutter main context
- **Explicit Retrieval:** Results don't auto-merge
- **Parent Control:** Parent decides what to load

---

## 7. Querying Information from Past Sessions

### Persistent Knowledge Files
- Query `AGENTS.md` for architectural decisions
- Contains codebase maps from previous work
- Long-term memory of project knowledge

### Librarian Agent
- Designed for multi-repository analysis
- Looks at existing documentation
- References patterns from previous work

### Query Mechanisms

| Source | Query Method |
|--------|--------------|
| AGENTS.md | Direct file read |
| Past decisions | Documented in knowledge files |
| External docs | Librarian agent research |
| Codebase patterns | Explore agent search |

---

## Mapping to Claude Code

### Continuity Mechanisms

| OmO Feature | Claude Code Equivalent |
|-------------|----------------------|
| AGENTS.md injection | CLAUDE.md content |
| SessionStart hook | Hooks system (limited) |
| Todo persistence | TodoWrite (session-scoped only) |
| Ralph Loop | Manual iteration tracking |
| Project config | Project CLAUDE.md |

### Key Gaps

1. **No cross-session todo persistence** - TodoWrite is session-scoped
2. **No Ralph Loop equivalent** - Must implement completion detection manually
3. **Limited hooks** - 8 vs 31+ in OmO
4. **No auto-session-resume** - Manual context restoration

### Adaptation Strategies

1. **Use CLAUDE.md heavily** for persistent project context
2. **Document decisions in project files** (not just conversation)
3. **Create explicit checkpoint files** for long tasks
4. **Use memory MCP servers** for cross-session persistence
5. **Implement manual session restoration** via skills/hooks

---

## Cross-Session Continuity Checklist

### What to Persist (Store in Files)
- [ ] Current task state
- [ ] Decisions made with rationale
- [ ] File paths being modified
- [ ] Errors encountered and resolutions
- [ ] Codebase maturity assessment

### What to Inject (Load at Session Start)
- [ ] CLAUDE.md rules
- [ ] Project-specific patterns
- [ ] Current working context
- [ ] Recent decisions

---

## Analogy

Think of OmO cross-session continuity like a **professional contractor** returning to a job site:

Even after going home (end session), they leave behind:
- **Detailed punch list** (Todos)
- **Site log** (AGENTS.md)
- **Project blueprints** (project-level JSON)

Next morning, they pick up exactly where they left off.

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
