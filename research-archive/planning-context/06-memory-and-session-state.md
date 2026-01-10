# OmO Memory and Session State

## Executive Summary

Oh My OpenCode (OmO) utilizes a sophisticated multi-layered state and memory system to manage long-running development tasks, parallel execution, and token efficiency.

---

## 1. Memory Systems

### Internal State Machine (Ralph Loop)
- Manages iterative development cycles
- States: inactive → active → checking completion → continuation
- Tracks iteration progress

### Task Queues (BackgroundManager)
- FIFO execution queue for parallel agents
- Task lifecycle states:
  - `pending`
  - `running`
  - `completed`
  - `failed`
  - `cancelled`

### Isolated Agent Contexts
- Each background task runs in **isolated child session**
- Prevents context clutter in parent
- Memory separated from orchestrator

### Dynamic Orchestration State
- Sisyphus uses 504-line dynamically constructed system prompt
- Maintains core identity and rules throughout session

---

## 2. Session State Tracking

### Multi-Phase Workflow Tracking

| Phase | State Tracked |
|-------|--------------|
| Intent Gate | Request classification |
| Codebase Assessment | Maturity level |
| Exploration | Research progress |
| Implementation | Task completion |
| Completion | Verification status |

### Todo System
- Multi-step work tracked via Todo items
- Ensures agents don't stop until tasks verified complete
- Persistent across iterations

### Iteration Monitoring (Ralph Loop)
- Tracks iteration counts explicitly
- Default maximum: 100 iterations
- Stops when "completion promise" detected (e.g., `DONE` string)

---

## 3. Context Window Management

### Dynamic Context Pruning (DCP)

```
Token Usage Level    Action
─────────────────────────────────────────
  0% - 70%          Normal operation
 70% - 85%          Warning notification
 85% - 100%         Preemptive compaction
```

### DCP Importance Scoring

| Factor | Weight |
|--------|--------|
| Recency | 30% |
| Tool output content | 25% |
| User requests | 20% |
| Code content | 15% |
| External references | 10% |

### Pruning Strategies

**Removed:**
- Duplicate tool calls
- Old outputs
- Verbose tool results (large grep outputs)

**Always Preserved:**
- System prompt
- AGENTS.md content
- Current TODO state
- Last 5 exchanges

---

## 4. Data Persistence

### Persistent Storage Locations

| Data Type | Path |
|-----------|------|
| Todo Items | `~/.claude/todos/{sessionId}` |
| Ralph Loop State | File system (session-specific) |
| User Config | `~/.config/opencode/oh-my-opencode.json` |
| Project Config | `.opencode/oh-my-opencode.json` |
| Project Context | `AGENTS.md`, `CLAUDE.md` |

### Persistence Diagram

```
┌─────────────────────────────────────────────┐
│                  DISK                        │
├─────────────────────────────────────────────┤
│  ~/.config/opencode/                        │
│  └── oh-my-opencode.json (user settings)    │
│                                             │
│  ~/.claude/todos/                           │
│  └── {sessionId}/ (todo items)              │
│                                             │
│  .opencode/                                 │
│  └── oh-my-opencode.json (project settings) │
│                                             │
│  Project Root/                              │
│  ├── AGENTS.md (knowledge base)             │
│  └── CLAUDE.md (project rules)              │
└─────────────────────────────────────────────┘
```

---

## 5. Memory Operations

### Writing Operations

| Tool | Purpose |
|------|---------|
| `TodoWrite` | Record task progress |
| `Write` | Create files (long-term memory) |
| `Edit` | Modify existing files |

### Reading Operations

| Tool | Purpose |
|------|---------|
| Standard file read | Read codebase files |
| `background_output` | Retrieve results from background tasks |
| Hook injectors | Pull data from disk locations |

### Automatic Injection

| Injector | Data Source |
|----------|-------------|
| `directory-agents-injector` | AGENTS.md files |
| `rules-injector` | Project rules |

---

## 6. Interruption Recovery

### 3-Strikes Recovery Protocol

```
Strike 1 → Retry
Strike 2 → Retry with adjustments
Strike 3 → Recovery Protocol:
           1. STOP all modifications
           2. git revert to last working state
           3. Document failure
           4. Consult Oracle agent
           5. Escalate to user
```

### Automated Recovery Hooks

| Hook | Function |
|------|----------|
| `auto-session-resume` | Restore after crashes |
| `session-recovery` | Handle unexpected idle states |

### State Persistence Enables Recovery
- Todo items saved to disk → pick up where left off
- Ralph Loop state persisted → iteration continuity
- Critical context preserved during compaction

---

## 7. Memory Scoping

### Three-Tier Memory Model

```
┌─────────────────────────────────────────────┐
│              GLOBAL SCOPE                    │
│  User-level configs: ~/.config/opencode/    │
│  Global skills and custom commands          │
├─────────────────────────────────────────────┤
│             PROJECT SCOPE                    │
│  Project configs: .opencode/                │
│  Todo lists (session-linked)                │
│  AGENTS.md, CLAUDE.md                       │
├─────────────────────────────────────────────┤
│             SESSION SCOPE                    │
│  Active context window                      │
│  Token usage tracking                       │
│  Isolated background task outputs           │
└─────────────────────────────────────────────┘
```

### Scope Details

| Scope | Persistence | Contents |
|-------|-------------|----------|
| **Per-Session** | Transient | Context window, token tracking, background outputs |
| **Per-Project** | Persistent | Todos, project config, AGENTS.md, CLAUDE.md |
| **Global** | Persistent | User config, global skills, custom commands |

---

## Mapping to Claude Code

### Memory Equivalents

| OmO Feature | Claude Code Equivalent |
|-------------|----------------------|
| Todo persistence | TodoWrite tool (session-scoped) |
| AGENTS.md injection | CLAUDE.md content |
| User config | `~/.claude/settings.json` |
| Project config | Project CLAUDE.md |
| DCP at 70%/85% | Auto-compact at ~95% |

### Key Differences

1. **Claude Code lacks DCP thresholds** - Only auto-compacts at ~95%
2. **No Ralph Loop equivalent** - Must implement iteration tracking manually
3. **No isolated child sessions** - Task tool results return directly
4. **No background_output retrieval** - Results automatic

### Adaptation Strategies

1. **Implement manual context monitoring** in CLAUDE.md rules
2. **Use TodoWrite aggressively** for state persistence
3. **Store critical context in CLAUDE.md** for cross-session continuity
4. **Use memory MCP servers** (like Graphiti) for advanced persistence

---

## Analogy

Think of OmO memory like a **busy construction site**:
- **Session memory** = Architect's immediate workspace (current blueprints)
- **Project memory** = Site office filing cabinets (full build history, master todo list)
- **DCP algorithm** = Site foreman clearing old scrap paper, keeping only vital "high-score" instructions visible

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
