# OmO Feature Interaction Map

## Overview

Oh My Opencode (OmO) is a sophisticated plugin system built around OpenCode that implements a multi-layered architecture where features interact through well-defined boundaries. The ecosystem centers on **Sisyphus** as the primary orchestrator, coordinating specialized agents, background tasks, hooks, and state management systems.

The feature interactions can be categorized into three tiers:
1. **Orchestration Layer**: Sisyphus → Agent delegation → Task completion
2. **Execution Layer**: Tools → Hooks → Permission enforcement
3. **State Layer**: Session → Context → Background task management

---

## Interaction Diagrams

### Multi-Agent Coordination Flow

```
User Request
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SISYPHUS                                  │
│                    (Primary Orchestrator)                        │
│                                                                 │
│  Phase 0: Intent Gate                                           │
│  ├─ Classify: Trivial|Explicit|Exploratory|Open-ended|Ambiguous │
│  ├─ Check skill triggers                                        │
│  └─ Fire background agents if needed                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   ┌─────────┐  ┌──────────┐  ┌──────────┐
   │ explore │  │ librarian│  │  oracle  │
   │(codebase│  │(external │  │(strategy │
   │ search) │  │ research)│  │ consult) │
   └────┬────┘  └────┬─────┘  └────┬─────┘
        │            │             │
        └────────────┴─────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Sisyphus Resolves via │
        │  • Stop when enough    │
        │    context gathered    │
        │  • Same info across    │
        │    sources = done      │
        │  • Max 2 iterations    │
        │    with no new data    │
        └────────────┬───────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │  Phase 2B: Implementation│
        │  • TodoWrite for >2 steps│
        │  • Delegate frontend to  │
        │    frontend-ui-ux-engineer│
        │  • Handle logic directly │
        └────────────────────────┘
```

### Agent Communication Patterns

```
┌─────────────────────────────────────────────────────────────┐
│                   COMMUNICATION MODES                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Orchestrated (via Sisyphus)                             │
│     User → Sisyphus → Subagent → Result → Sisyphus → User   │
│                                                             │
│  2. Direct Invocation (@ syntax)                            │
│     User → @oracle → Result → User                          │
│                                                             │
│  3. Background Task (parallel)                              │
│     Sisyphus ──┬── background_task(explore) ──┐             │
│                │                               │ notify     │
│                └── background_task(librarian)──┤ on         │
│                │                               │ complete   │
│                └── continues working ──────────┘            │
│                                                             │
│  4. Restricted Communication                                │
│     explore ──X── call_omo_agent  (blocked)                 │
│     librarian ──X── background_task  (blocked)              │
│     (Prevents recursive delegation)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Skill + Hook Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                 SKILL EXECUTION LIFECYCLE                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  User invokes /skill                                        │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           tool.execute.before                        │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  PreToolUse Hooks Fire:                     │    │    │
│  │  │  • Validate input                           │    │    │
│  │  │  • Modify arguments (output.args)           │    │    │
│  │  │  • Block execution (return "deny")          │    │    │
│  │  │  • Record tool use                          │    │    │
│  │  │  • Cache tool input                         │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │        SKILL TOOL EXECUTION                          │    │
│  │  • Retrieve skill body                              │    │
│  │  • Resolve base directory                           │    │
│  │  • Execute skill content                            │    │
│  └─────────────────────────────────────────────────────┘    │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │           tool.execute.after                         │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  PostToolUse Hooks Fire:                    │    │    │
│  │  │  • Add warnings/context (output.output)     │    │    │
│  │  │  • Signal block with reason                 │    │    │
│  │  │  • Run post-processors (eslint --fix)       │    │    │
│  │  │  • Record tool result                       │    │    │
│  │  │  • comment-checker processing               │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Todo + Ralph Loop State Machine

```
┌─────────────────────────────────────────────────────────────┐
│               RALPH LOOP STATE MACHINE                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  /ralph-loop "task description"                             │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │ Initialize Loop │                                        │
│  │ • Set max_iter  │                                        │
│  │ • Set promise   │                                        │
│  │ • Write state   │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐      ┌─────────────────────────────┐   │
│  │  Agent Working  │ ───► │ Sisyphus: TodoWrite for    │   │
│  │  (iteration N)  │      │ multi-step tasks           │   │
│  └────────┬────────┘      └─────────────────────────────┘   │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ session.idle    │                                        │
│  │ event fires     │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│     ┌─────┴─────┐                                           │
│     ▼           ▼                                           │
│  Check 1:    Check 2:                                       │
│  Transcript  Session Messages                               │
│  File Scan   API (last msg)                                 │
│     │           │                                           │
│     └─────┬─────┘                                           │
│           │                                                 │
│     ┌─────┴─────┐                                           │
│     ▼           ▼                                           │
│  <promise>   No promise                                     │
│  DONE        found                                          │
│  </promise>     │                                           │
│     │           ▼                                           │
│     │    ┌─────────────────┐                                │
│     │    │ Check iteration │                                │
│     │    │ < max_iter?     │                                │
│     │    └────────┬────────┘                                │
│     │        ┌────┴────┐                                    │
│     │        ▼         ▼                                    │
│     │      YES        NO                                    │
│     │        │         │                                    │
│     │        ▼         ▼                                    │
│     │   ┌─────────┐  ┌─────────┐                            │
│     │   │Increment│  │ Loop    │                            │
│     │   │Iteration│  │ Terminates│                          │
│     │   │Inject   │  │ Max Iter │                           │
│     │   │Continue │  │ Reached  │                           │
│     │   │Prompt   │  └─────────┘                            │
│     │   └────┬────┘                                         │
│     │        │                                              │
│     │        └──────► Agent Working (iteration N+1)         │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────┐                                        │
│  │ Loop Complete   │                                        │
│  │ Clear state     │                                        │
│  │ Show toast      │                                        │
│  └─────────────────┘                                        │
│                                                             │
│  TODO STATE PRESERVATION:                                   │
│  • Todos stored: ~/.claude/todos/{sessionId}                │
│  • Persists across loop iterations                          │
│  • saveTodoFile() / loadTodoFile() for I/O                  │
│  • Todo Continuation Enforcer prevents early quit           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Background Task + Context Interaction

```
┌─────────────────────────────────────────────────────────────┐
│           BACKGROUND TASK LIFECYCLE                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sisyphus                                                   │
│     │                                                       │
│     │ background_task(agent, prompt)                        │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              BackgroundManager                       │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │  Creates BackgroundTask:                    │    │    │
│  │  │  • sessionID (child)                        │    │    │
│  │  │  • parentSessionID                          │    │    │
│  │  │  • parentMessageID                          │    │    │
│  │  │  • prompt                                   │    │    │
│  │  │  • status: "running"                        │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  │                                                     │    │
│  │  Stores in: Map<taskId, BackgroundTask>             │    │
│  └─────────────────────────────────────────────────────┘    │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────┐     ┌─────────────────────────────┐    │
│  │ Child Session   │     │  Parent Session             │    │
│  │ Executes task   │     │  Continues working          │    │
│  │ independently   │     │  (not blocked)              │    │
│  └────────┬────────┘     └─────────────────────────────┘    │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                        │
│  │ session.idle &  │                                        │
│  │ no incomplete   │                                        │
│  │ todos           │                                        │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Task Completion:                                    │    │
│  │  • status = "completed"                             │    │
│  │  • completedAt = timestamp                          │    │
│  │  • notifyParentSession()                            │    │
│  │  • Release model via concurrencyManager             │    │
│  │  • Remove from tasks map                            │    │
│  │  • Show toast notification                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  RESULT RETRIEVAL (background_output):                      │
│  • block=false: Immediate status check                      │
│  • block=true: Poll every 1000ms until complete/timeout     │
│  • formatTaskResult: Get last assistant message             │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           CONTEXT WINDOW MANAGEMENT                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Context Usage Monitoring                                   │
│     │                                                       │
│     ├── < 85%: Normal operation                             │
│     │                                                       │
│     └── >= 85%: Preemptive Compaction Triggered             │
│              │                                              │
│              ▼                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │          COMPACTION PIPELINE                         │    │
│  │                                                     │    │
│  │  Phase 1: Dynamic Context Pruning (DCP)             │    │
│  │  • Prune duplicate tool calls                       │    │
│  │  • Remove old tool outputs                          │    │
│  │           │                                         │    │
│  │           ▼ (if still over limit)                   │    │
│  │                                                     │    │
│  │  Phase 2: Aggressive Truncation                     │    │
│  │  • Truncate verbose tool outputs                    │    │
│  │  • Target specific token ratio                      │    │
│  │           │                                         │    │
│  │           ▼ (if still over limit)                   │    │
│  │                                                     │    │
│  │  Phase 3: Session Summarization                     │    │
│  │  • client.session.summarize()                       │    │
│  │  • Preserve critical context via injectors          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  STATE CLEARED DURING COMPACTION:                           │
│  • AutoCompactState (pendingCompact, errorData, etc.)       │
│  • AgentUsageState (usage reminders reset)                  │
│  • Injector caches (readme, rules, agents.md)               │
│                                                             │
│  STATE PRESERVED DURING COMPACTION:                         │
│  • AGENTS.md content (via compaction-context-injector)      │
│  • Current directory information                            │
│  • Critical context markers                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Detailed Interactions

### 1. Multi-Agent Conflict Resolution

Sisyphus uses a **convergent search strategy** rather than explicit conflict resolution:

**Decision Mechanism:**
- Sisyphus fires `explore` and `librarian` in parallel as background tasks
- Results are evaluated independently, not compared
- Search stops when:
  1. **Sufficient context**: Enough information gathered
  2. **Convergence**: Same information appears across multiple sources
  3. **Iteration limit**: Two search iterations with no new useful data

**Priority Rules:**
- No explicit priority hierarchy between agent results
- Sisyphus synthesizes findings based on relevance to task
- Oracle consulted only for architecture decisions or complex debugging
- User escalation if Oracle cannot resolve

**Agent Specialization:**
| Agent | Role | When Invoked |
|-------|------|--------------|
| explore | "Contextual grep" - codebase search | External libraries, multiple modules mentioned |
| librarian | "Reference grep" - external research | Documentation, implementation patterns needed |
| oracle | Strategic consultant | Architecture decisions, 2+ failed attempts |
| frontend-ui-ux-engineer | Visual work delegation | Frontend/UI tasks |

### 2. Skill-Hook Integration

Skills are treated as tool invocations, inheriting the full hook lifecycle:

**Hook Events for Skills:**

| Event | Phase | Capabilities |
|-------|-------|--------------|
| `tool.execute.before` | Pre-execution | Validate, modify args, block |
| `tool.execute.after` | Post-execution | Add warnings, modify output |

**Hook Configuration Sources:**
```
~/.claude/settings.json          (user-level)
./.claude/settings.json          (project-level)
./.claude/settings.local.json    (local-level)
```

**Skill-Hook Interaction Points:**
1. PreToolUse can modify skill arguments via `output.args`
2. PreToolUse can deny skill execution (throws error)
3. PostToolUse can append warnings to skill output
4. PostToolUse can trigger follow-up actions (e.g., `eslint --fix`)

**Example: Comment-Checker Hook**
```
Skill writes file → tool.execute.after fires → comment-checker processes →
warning injected if suspicious comments found
```

### 3. Todo-Ralph Loop Coordination

**State Synchronization:**

| State Type | Storage Location | Persistence |
|------------|-----------------|-------------|
| Todo items | `~/.claude/todos/{sessionId}` | Across iterations |
| Ralph Loop state | File system | Across iterations |
| Iteration count | In-memory + file | Incremented each cycle |

**Coordination Flow:**
1. Ralph Loop initializes with max_iterations and promise tag
2. Sisyphus creates TodoWrite items for multi-step work
3. Each `session.idle` event triggers completion check
4. Todo Continuation Enforcer prevents early termination
5. Loop continues until `<promise>DONE</promise>` or max iterations

**Completion Detection Priority:**
1. Check transcript file for promise tag
2. Check session messages API (last assistant message only)
3. Timeout handling if API slow

**Incomplete Todo Handling:**
- Todo Continuation Enforcer injects continuation prompt
- Agent cannot quit with incomplete todos
- Todos persist in filesystem even if loop terminates

### 4. Background-Context Interaction

**Context Injection Points:**
- Directory AGENTS.md/README.md content → session context
- Conditional rules from `.claude/rules/` → dynamic injection
- Compaction preserves critical context via injectors

**Background Task Impact on Context:**
- Background tasks run in isolated child sessions
- Results do NOT automatically inject into parent context
- Parent must explicitly use `background_output` to retrieve
- Notification mechanism alerts parent of completion

**Compaction During Pending Tasks:**
- Background tasks unaffected (isolated sessions)
- Parent session compaction clears its state
- Child task continues independently
- Results remain retrievable via `background_output`

### 5. Error Propagation & Recovery

**3 Strikes Rule:**
After three consecutive failures, Sisyphus executes:

```
1. STOP     → Halt all further edits immediately
2. REVERT   → git checkout or undo to last working state
3. DOCUMENT → Record what was attempted and what failed
4. CONSULT  → Call Oracle with full failure context
5. ESCALATE → Ask user if Oracle cannot resolve
```

**Oracle Consultation Triggers:**
- 2+ failed fix attempts
- Complex architectural decisions
- Intricate debugging scenarios

**Recovery Hooks:**
| Hook | Purpose |
|------|---------|
| SessionRecoveryHook | Handle tool_result_missing, thinking_block_order |
| anthropic-context-window-limit-recovery | Retry logic for summarization errors |
| editErrorRecovery | Recover from edit failures |

**Never Allowed:**
- Leave code in broken state
- Continue hoping it will work
- Delete failing tests to pass

### 6. Permission Inheritance

**Configuration Hierarchy (highest to lowest precedence):**
```
1. Project-level: .opencode/oh-my-opencode.json
2. User-level: ~/.config/opencode/oh-my-opencode.json
3. Base agent definitions: allBuiltinAgents
```

**Permission Levels:**
| Level | Meaning |
|-------|---------|
| `allow` | Tool available without prompt |
| `ask` | Prompt user before execution |
| `deny` | Tool blocked entirely |

**Built-in Restrictions:**
| Agent | Disabled Tools | Reason |
|-------|---------------|--------|
| explore | call_omo_agent | Prevent recursion |
| librarian | call_omo_agent, edit, write | Read-only access |
| multimodal-looker | task, call_omo_agent, look_at | Media analysis only |

**Runtime Enforcement:**
- `tool.execute.before` hook applies restrictions
- Tasks invoked via `task()` cannot use `background_task`
- Prevents nested background execution
- Prevents recursive agent calls

---

## Edge Cases & Failure Modes

### Agent Delegation Failures

| Scenario | Behavior |
|----------|----------|
| Subagent crashes | Error propagates to parent, logged |
| Infinite recursion attempt | Blocked by call_omo_agent restriction |
| Background task timeout | Returns timeout message with current status |
| All agents fail | Escalate to user after Oracle consultation |

### Context Window Pressure

| Scenario | Behavior |
|----------|----------|
| 85%+ usage | Preemptive compaction triggered |
| DCP insufficient | Falls through to truncation |
| Truncation insufficient | Falls through to summarization |
| Background tasks pending | Continue independently (isolated sessions) |
| Critical context at risk | Injectors preserve AGENTS.md, directory info |

### Ralph Loop Edge Cases

| Scenario | Behavior |
|----------|----------|
| Promise tag never appears | Loop terminates at max_iterations |
| False positive promise detection | Loop stops prematurely |
| Todos incomplete at termination | Persist in filesystem for future |
| Session interrupted | State persists, can resume |

### Permission Conflicts

| Scenario | Resolution |
|----------|------------|
| Project denies, user allows | Project-level wins (higher precedence) |
| Skill needs blocked tool | Skill fails, error returned |
| Agent tries recursive call | Blocked at runtime by hook |

---

## Implications for Claude Code Adaptation

### Hard to Replicate

1. **Multi-Agent Background Tasks**
   - Claude Code lacks native parallel agent execution
   - No built-in BackgroundManager equivalent
   - Would require Task tool workarounds

2. **Permission Inheritance System**
   - Claude Code has simpler permission model
   - No hierarchical configuration merging
   - Runtime restriction hooks not available

3. **Ralph Loop with Promise Detection**
   - No native transcript file scanning
   - Session message inspection possible but limited
   - Custom state management needed

4. **Preemptive Context Compaction**
   - Claude Code handles compaction internally
   - Limited control over when/how compaction occurs
   - DCP pruning not available

### Achievable with Workarounds

1. **Todo Persistence**
   - Use external file storage (implemented in SuperClaude)
   - TodoWrite tool exists natively

2. **Hook-like Behavior**
   - CLAUDE.md instructions can approximate PreToolUse
   - Post-execution actions via explicit prompting

3. **Agent Specialization**
   - Prompts can define agent personas
   - Task tool provides delegation capability
   - No native multi-model support

4. **Error Recovery Protocol**
   - Git-based recovery achievable
   - "3 strikes" rule can be prompt-encoded
   - User escalation natural in Claude Code

### Recommended Adaptation Strategy

| OmO Feature | Claude Code Approach |
|-------------|---------------------|
| Multi-agent coordination | Single-agent with persona switching via prompts |
| Background tasks | Sequential execution or Task tool for isolation |
| Permission system | CLAUDE.md rules + prompt constraints |
| Ralph Loop | Custom prompt + TodoWrite state checking |
| Context compaction | Native (limited control) |
| Hook system | CLAUDE.md instructions + explicit post-action prompts |
| Session state | File-based persistence in project directory |

---

## Summary

OmO's feature interaction model is sophisticated, with tight coupling between:
- **Orchestration** (Sisyphus phases, agent delegation)
- **Execution** (Hook lifecycle, permission enforcement)
- **State** (Todo persistence, background task management, context handling)

The system prevents common failure modes through:
- Recursive call blocking
- 3-strikes recovery protocol
- Preemptive context management
- Todo continuation enforcement

For Claude Code adaptation, the core challenge is replicating the **parallel execution model** and **hierarchical permission system**, both of which rely on infrastructure not present in Claude Code's architecture. However, the **orchestration patterns** and **error recovery protocols** can be approximated through careful prompt engineering and file-based state management.
