# Oh My OpenCode Internals Deep Dive

## Executive Summary

This document provides implementation-level details of Oh My OpenCode's core internal systems, covering the Sisyphus System Prompt, BackgroundManager, Ralph Loop, Context Compaction (DCP), and SkillMcpManager.

---

## 1. Sisyphus System Prompt

The Sisyphus System Prompt is a **504-line dynamically constructed orchestration prompt** that establishes the primary orchestrator's behavior, available tools, agent hierarchy, and workflow patterns.

### 1.1 Prompt Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISYPHUS SYSTEM PROMPT                        │
│                      (~504 lines total)                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Core Identity & Behavior                                     │
│     ├── Expert software engineer identity                       │
│     ├── Tool-driven communication mandate                       │
│     └── Task completion requirements                            │
├─────────────────────────────────────────────────────────────────┤
│  2. Available Tools & Agent Definitions (DYNAMIC)               │
│     ├── Tool list injected from runtime                         │
│     ├── Agent definitions with delegation rules                 │
│     └── Cost tier annotations (EXPENSIVE/CHEAP)                 │
├─────────────────────────────────────────────────────────────────┤
│  3. Workflow Instructions                                        │
│     ├── Task lifecycle management                               │
│     ├── Tool output handling                                    │
│     └── Error recovery procedures                               │
├─────────────────────────────────────────────────────────────────┤
│  4. Multi-Phase Workflow                                         │
│     ├── Phase 1: Intent Gate                                    │
│     ├── Phase 2: Codebase Assessment                            │
│     ├── Phase 3: Exploration Phase                              │
│     └── Phase 4: Implementation Phase                           │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Identity Section

```markdown
You are Sisyphus, an expert software engineer with extensive codebase knowledge.

CRITICAL RULES:
1. ALWAYS use tools to communicate - never write plain text responses
2. MUST complete ALL tasks before stopping
3. Use TODO system to track multi-step work
4. Delegate to specialized agents when appropriate
```

### 1.3 Dynamic Tool Injection

Tools are injected at runtime based on configuration:

```typescript
function buildSisyphusPrompt(tools: Tool[], agents: Agent[], skills: Skill[]): string {
  let prompt = SISYPHUS_BASE_PROMPT

  // Inject available tools
  prompt += "\n\n## Available Tools\n"
  for (const tool of tools) {
    prompt += `\n### ${tool.name}\n${tool.description}\n`
    prompt += `Parameters: ${JSON.stringify(tool.schema)}\n`
  }

  // Inject agent definitions
  prompt += "\n\n## Available Agents for Delegation\n"
  for (const agent of agents) {
    prompt += formatAgentDefinition(agent)
  }

  // Inject skill definitions
  prompt += "\n\n## Available Skills\n"
  for (const skill of skills) {
    prompt += formatSkillDefinition(skill)
  }

  return prompt
}
```

### 1.4 Multi-Phase Workflow

**Phase 1: Intent Gate**
```
If intent is unclear:
  → Ask clarifying questions
  → Do NOT proceed until requirements are clear
```

**Phase 2: Codebase Assessment**
```
For ANY code change:
  1. Check existing patterns (grep for similar code)
  2. Verify dependencies (package.json, requirements.txt)
  3. Understand project structure (look for conventions)
```

**Phase 3: Exploration Phase**
```
Before implementation:
  1. Delegate to explore-agent for reconnaissance
  2. Read relevant files to understand context
  3. Identify potential conflicts or dependencies
```

**Phase 4: Implementation Phase**
```
During implementation:
  1. Create TODO items for multi-step work
  2. Implement changes incrementally
  3. Validate each step before proceeding
  4. Use librarian-agent for documentation
```

### 1.5 Agent Delegation Rules

| Agent | Cost Tier | Mode | Best For | Avoid For |
|-------|-----------|------|----------|-----------|
| `sisyphus-oracle` | EXPENSIVE | Blocking | Architecture, code review | Simple tasks |
| `librarian-agent` | CHEAP | Blocking | Documentation, research | Code implementation |
| `explore-agent` | CHEAP | Blocking | Codebase exploration | Code modification |
| `frontend-engineer` | EXPENSIVE | Blocking | UI/UX, frontend code | Backend logic |
| `document-writer` | CHEAP | Blocking | README, API docs | Code implementation |
| `multimodal-looker` | CHEAP | Blocking | PDF/image analysis | Text-only content |

### 1.6 7-Section Delegation Prompt Template

```
1. TASK: Atomic, specific goal (one action per delegation)
2. EXPECTED OUTCOME: Concrete deliverables with success criteria
3. REQUIRED SKILLS: Which skill to invoke
4. REQUIRED TOOLS: Explicit tool whitelist (prevents tool sprawl)
5. MUST DO: Exhaustive requirements - leave NOTHING implicit
6. MUST NOT DO: Forbidden actions - anticipate and block rogue behavior
7. CONTEXT: File paths, existing patterns, constraints
```

### 1.7 Configuration

**Default Model**: `anthropic/claude-opus-4-5` with extended thinking (32,000 token budget)

**Model-Dependent Configuration**:

| Model Type | Detection | Configuration |
|------------|-----------|---------------|
| GPT models | `isGptModel(model)` | `reasoningEffort: "medium"` |
| Claude models | All other models | `thinking: { type: "enabled", budgetTokens: 32000 }` |

---

## 2. BackgroundManager Internals

The BackgroundManager enables true parallel agent orchestration by managing asynchronous task execution with sophisticated concurrency control.

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Background Tools                            │
│  background_task | background_output | background_cancel         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BackgroundManager                            │
│           src/features/background-agent/manager.ts               │
├─────────────────────────────────────────────────────────────────┤
│  Task Lifecycle: pending -> running -> completed/failed          │
│  Task Queue: FIFO execution via Map<id, BackgroundTask>          │
│  Notification System: Parent session updates                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ConcurrencyManager                             │
│      src/features/background-agent/concurrency-manager.ts        │
├─────────────────────────────────────────────────────────────────┤
│  Concurrency Limits: defaultConcurrency: 5                       │
│  Per-Provider Limits: providerConcurrency                        │
│  Per-Model Limits: modelConcurrency                              │
│  Slot Management: acquire()/release()                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Task Lifecycle

#### State Transitions

```
                    ┌──────────────────────┐
                    │       pending        │
                    │  (awaiting slot)     │
                    └──────────┬───────────┘
                               │ concurrencyManager.acquire(model)
                               ▼
                    ┌──────────────────────┐
                    │       running        │
                    │  (executing task)    │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
     ┌────────────────┐ ┌────────────────┐ ┌────────────────┐
     │   completed    │ │     error      │ │   cancelled    │
     │  (success)     │ │   (failure)    │ │  (user/sys)    │
     └────────────────┘ └────────────────┘ └────────────────┘
```

#### Task Data Structure

```typescript
interface BackgroundTask {
  id: string              // Unique task identifier
  sessionID: string       // Background session ID
  status: BackgroundTaskStatus  // "running" | "completed" | "error" | "cancelled"
  startedAt: number       // Timestamp of task start
  completedAt?: number    // Timestamp of completion
  error?: string          // Error message if failed
  progress: {
    toolCalls: number     // Number of tool invocations
    lastTool?: string     // Name of last tool used
  }
}
```

### 2.3 Concurrency Management

#### Tiered Rate Limits

```typescript
interface ConcurrencyConfig {
  defaultConcurrency: 5              // Global default
  providerConcurrency: {
    anthropic: 3                     // Per-provider limits
    openai: 5
    google: 10
  }
  modelConcurrency: {
    "claude-opus-4-5": 1            // Per-model limits (most restrictive)
    "claude-sonnet-4-5": 3
  }
}
```

#### Slot Acquisition Algorithm

```
acquire(model):
  1. Extract provider from model string (e.g., "anthropic/claude-opus-4-5" -> "anthropic")
  2. Check model-specific limit (if exists, use that)
  3. Check provider-specific limit (if exists, use that)
  4. Fall back to defaultConcurrency
  5. If slot available: increment counter, return true
  6. If no slot: queue task, return promise that resolves when slot available

release(model):
  1. Decrement counter for model/provider
  2. If queued tasks exist for this model/provider: dequeue and start
```

### 2.4 Task Queue Implementation

```typescript
class BackgroundManager {
  private tasks: Map<string, BackgroundTask> = new Map()
  private concurrencyManager: ConcurrencyManager

  async launch(config: TaskConfig): Promise<string> {
    const taskId = generateTaskId()

    // Acquire concurrency slot (may block)
    await this.concurrencyManager.acquire(config.model)

    // Create task and add to map
    const task: BackgroundTask = {
      id: taskId,
      sessionID: config.sessionID,
      status: "running",
      startedAt: Date.now(),
      progress: { toolCalls: 0 }
    }
    this.tasks.set(taskId, task)

    // Start execution in background
    this.executeTask(task, config)

    return taskId
  }
}
```

### 2.5 Task TTL and Cleanup

```typescript
const TASK_TTL_MS = 30 * 60 * 1000  // 30 minutes

pruneStaleTasksAndNotifications():
  for each task in tasks:
    if (Date.now() - task.startedAt > TASK_TTL_MS):
      task.status = "error"
      task.error = "Task timed out after 30 minutes"
      notifyParentSession(task)
```

### 2.6 Event-Based Progress Tracking

```
message.part.updated event:
  ├── Increment task.progress.toolCalls
  ├── Update task.progress.lastTool
  └── Poll periodically for status updates

session.idle event:
  ├── Check if all TODOs completed
  ├── If yes: task.status = "completed"
  └── Notify parent session

session.deleted event:
  └── task.status = "cancelled"
```

### 2.7 Configuration Options

```json
{
  "background_task": {
    "defaultConcurrency": 5,
    "providerConcurrency": {
      "anthropic": 3,
      "openai": 5,
      "google": 10
    },
    "modelConcurrency": {
      "claude-opus-4-5": 1
    }
  }
}
```

---

## 3. Ralph Loop Implementation

The Ralph Loop enables iterative task execution with automatic continuation until a completion marker is detected or iteration limits are reached.

### 3.1 State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                     Ralph Loop States                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     [INACTIVE] ──startLoop()──> [ACTIVE]                        │
│                                    │                             │
│                              session.idle                        │
│                                    │                             │
│                          ┌────────┴────────┐                    │
│                          ▼                 ▼                     │
│                  [Check Completion]  [Check Iterations]          │
│                          │                 │                     │
│              ┌───────────┴──────┐    ┌────┴────┐                │
│              ▼                  ▼    ▼         ▼                │
│        [COMPLETE]         [CONTINUE]  [MAX REACHED]             │
│        (promise found)    (inject prompt)  (stop)               │
│                                    │                             │
│                              ┌─────┴─────┐                      │
│                              ▼           ▼                       │
│                         iteration++   [CANCELLED]               │
│                              │        (/cancel-ralph)           │
│                              └──> [ACTIVE]                      │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Completion Promise Detection

The completion promise is a configurable marker that signals task completion:

**Default**: `<promise>DONE</promise>`

#### Detection Algorithm

```typescript
async detectCompletionPromise(sessionID: string, promise: string): Promise<boolean> {
  // Step 1: Check transcript file
  const transcriptPath = getTranscriptPath(sessionID)
  if (existsSync(transcriptPath)) {
    const content = readFileSync(transcriptPath, 'utf-8')
    const regex = new RegExp(escapeRegex(promise), 'i')
    if (regex.test(content)) {
      return true
    }
  }

  // Step 2: Check session messages API
  const messages = await client.session.messages({ id: sessionID })
  const assistantMessages = messages.filter(m => m.info?.role === 'assistant')
  const lastAssistant = assistantMessages[assistantMessages.length - 1]

  if (lastAssistant) {
    const textParts = lastAssistant.parts.filter(p => p.type === 'text')
    const content = textParts.map(p => p.text).join('\n')
    if (content.includes(promise)) {
      return true
    }
  }

  return false
}
```

### 3.3 State Persistence

```typescript
interface RalphLoopState {
  active: boolean
  iteration: number
  max_iterations: number
  completion_promise: string
  started_at: number
  prompt: string
  session_id: string
}

// State directory: configurable via ralph_loop.state_dir
// Default: ~/.config/opencode/ralph-loop-state/
```

### 3.4 Event Handling

#### Monitored Events

| Event | Behavior |
|-------|----------|
| `session.idle` | Check completion, continue if needed |
| `session.deleted` | Clear loop state |
| `session.error` (MessageAbortedError) | Clear loop state immediately |
| `/cancel-ralph` command | Cancel loop, show notification |

#### Continuation Prompt Injection

```typescript
const continuationPrompt = `
[RALPH LOOP - Iteration ${state.iteration + 1}/${state.max_iterations}]

Continue working on the task. Remember to output:
${state.completion_promise}
when the task is fully complete.

Do not stop until the task is done or you encounter an unrecoverable error.
`

await client.session.prompt({
  id: sessionID,
  prompt: continuationPrompt
})
```

### 3.5 Configuration

```json
{
  "ralph_loop": {
    "enabled": true,
    "default_max_iterations": 10,
    "state_dir": "~/.config/opencode/ralph-loop-state/"
  }
}
```

### 3.6 Starting a Ralph Loop

```
/ralph <max_iterations> <completion_promise>

Example:
/ralph 5 <promise>IMPLEMENTATION_COMPLETE</promise>
```

---

## 4. Context Compaction Algorithm

OmO implements a multi-stage context management system to handle long-running sessions that approach token limits.

### 4.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  Context Management Hooks                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  context-window-monitor.ts                                       │
│  ├── 70% warning                                                 │
│  └── 85% trigger -> preemptive-compaction                       │
│                                                                  │
│  preemptive-compaction/                                          │
│  ├── Auto-summarize at 85% threshold                            │
│  └── DCP (Dynamic Context Pruning) algorithm                    │
│                                                                  │
│  anthropic-context-window-limit-recovery/                        │
│  ├── Multi-stage recovery at hard limit                         │
│  └── executor.ts: 564 lines                                     │
│                                                                  │
│  tool-output-truncator.ts                                        │
│  ├── 50k token cap per tool output                              │
│  └── 50% headroom maintenance                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Context Window Thresholds

```
0% ─────────────────────────────────────────────── 100%
│                                                    │
│  0-70%: Normal operation                           │
│         └─ All features available                  │
│                                                    │
│  70-85%: Warning zone                              │
│         ├─ Show warning to agent                   │
│         └─ Start preparing for compaction          │
│                                                    │
│  85-100%: Preemptive compaction zone               │
│          ├─ Auto-summarize older messages          │
│          └─ Apply DCP algorithm                    │
│                                                    │
│  100%: Hard limit recovery                         │
│        ├─ Emergency summarization                  │
│        └─ AGENTS.md context preservation           │
│                                                    │
```

### 4.3 Preemptive Compaction (85% Threshold)

#### Trigger Conditions

```typescript
// experimental.chat.messages.transform handler
if (contextUsagePercent >= 85 && experimental.preemptive_compaction) {
  await triggerPreemptiveCompaction(messages)
}
```

#### Compaction Algorithm

```
1. Calculate current context usage percentage
2. If >= 85%:
   a. Identify summarizable message ranges
   b. Group consecutive assistant/user exchanges
   c. Generate summaries via summarization model
   d. Replace original messages with summaries
   e. Preserve:
      - System prompts
      - AGENTS.md content
      - Recent messages (last N exchanges)
      - Messages with important tool outputs
3. Validate new context fits within limit
4. Continue with compacted context
```

### 4.4 DCP (Dynamic Context Pruning)

When enabled via `experimental.dcp_for_compaction`, the system uses a more sophisticated pruning algorithm:

```typescript
interface DynamicContextPruningConfig {
  enabled: boolean
  preserve_recent_messages: number  // Number of recent messages to always keep
  preserve_tool_outputs: boolean    // Keep important tool outputs
  summarization_ratio: number       // Target compression ratio (0.3 = 30% of original)
  importance_scoring: boolean       // Use importance scores for pruning
}
```

#### Importance Scoring

```
Message Importance = (
  recency_score * 0.3 +           // How recent is the message
  tool_output_score * 0.25 +      // Does it contain tool outputs
  user_request_score * 0.2 +      // Is it a user request
  code_content_score * 0.15 +     // Does it contain code
  reference_score * 0.1           // Is it referenced by other messages
)
```

### 4.5 Tool Output Truncation

```typescript
const TRUNCATABLE_TOOLS = [
  "grep", "glob", "read", "bash", "interactive_bash",
  "lsp_find_references", "session_read", ...
]

const MAX_TOOL_OUTPUT_TOKENS = 50000  // 50k token cap
const HEADROOM_PERCENT = 50           // Leave 50% headroom

function truncateToolOutput(output: string, remainingContext: number): string {
  const maxAllowed = Math.min(
    MAX_TOOL_OUTPUT_TOKENS,
    remainingContext * HEADROOM_PERCENT / 100
  )

  if (tokenCount(output) <= maxAllowed) {
    return output
  }

  // Truncate with indicator
  return truncateToTokens(output, maxAllowed) +
    `\n\n[OUTPUT TRUNCATED: ${tokenCount(output)} tokens reduced to ${maxAllowed}]`
}
```

### 4.6 Emergency Recovery (Hard Limit)

The `anthropic-context-window-limit-recovery` hook implements multi-stage recovery:

```
Stage 1: Detect context limit error
         └─ Parse error message for token count

Stage 2: Emergency summarization
         ├─ Summarize all but last 5 exchanges
         └─ Preserve AGENTS.md context

Stage 3: Context rebuild
         ├─ System prompt
         ├─ AGENTS.md content
         ├─ Summary of previous work
         └─ Recent messages

Stage 4: Resume session
         └─ Inject "continue" prompt
```

### 4.7 Context Preservation Priority

| Priority | Content Type | Always Preserved |
|----------|-------------|------------------|
| 1 | System prompt | Yes |
| 2 | AGENTS.md content | Yes |
| 3 | Current TODO state | Yes |
| 4 | Last 5 user/assistant exchanges | Yes |
| 5 | Important tool outputs (code changes) | Conditional |
| 6 | Older conversation history | Summarized |
| 7 | Verbose tool outputs (grep results) | Truncated |

### 4.8 Configuration

```json
{
  "experimental": {
    "aggressive_truncation": false,
    "preemptive_compaction": true,
    "truncate_all_tool_outputs": false,
    "dcp_for_compaction": {
      "enabled": true,
      "preserve_recent_messages": 5,
      "summarization_ratio": 0.3
    }
  }
}
```

---

## 5. SkillMcpManager Lifecycle

The SkillMcpManager handles the lifecycle of embedded MCP servers associated with skills, implementing lazy loading, connection pooling, and cleanup.

### 5.1 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       Skill System                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Skill Discovery (4 sources):                                    │
│  ├── opencode-project: .opencode/skills/                        │
│  ├── project: .claude/skills/                                    │
│  ├── opencode: ~/.config/opencode/skills/                       │
│  └── user: ~/.claude/skills/                                     │
│                                                                  │
│  SKILL.md Format:                                                │
│  ├── YAML frontmatter (metadata)                                │
│  ├── Markdown body (instructions)                               │
│  └── Optional MCP configuration                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SkillMcpManager                               │
│              src/tools/skill-mcp/manager.ts                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Connection Pool: Map<skillName, McpConnection>                  │
│  Lazy Loading: Connect on first tool use                         │
│  Cleanup: Disconnect on skill completion                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Skill Structure

```
.claude/skills/
└── my-skill/
    ├── SKILL.md          # Skill definition
    ├── mcp.json          # Optional MCP config
    └── tools/            # Optional local tools
```

#### SKILL.md Format

```markdown
---
name: my-skill
description: My custom skill
model: anthropic/claude-sonnet-4-5
temperature: 0.3
tools:
  - read
  - write
  - bash
mcp:
  servers:
    - name: custom-server
      command: node
      args: ["./server.js"]
---

# My Skill Instructions

Instructions for the skill go here...
```

### 5.3 Connection Pool Implementation

```typescript
class SkillMcpManager {
  private connections: Map<string, McpConnection> = new Map()
  private pendingConnections: Map<string, Promise<McpConnection>> = new Map()

  async getConnection(skill: Skill): Promise<McpConnection> {
    const skillName = skill.name

    // Check existing connection
    if (this.connections.has(skillName)) {
      return this.connections.get(skillName)!
    }

    // Check pending connection (avoid duplicate connects)
    if (this.pendingConnections.has(skillName)) {
      return this.pendingConnections.get(skillName)!
    }

    // Create new connection
    const connectionPromise = this.createConnection(skill)
    this.pendingConnections.set(skillName, connectionPromise)

    try {
      const connection = await connectionPromise
      this.connections.set(skillName, connection)
      return connection
    } finally {
      this.pendingConnections.delete(skillName)
    }
  }
}
```

### 5.4 Lazy Loading

MCP connections are established only when needed:

```
Skill Invocation Flow:

User: /my-skill
         │
         ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Load Skill     │───>│  Check MCP      │───>│  Lazy Connect   │
│  Definition     │    │  Requirements   │    │  if needed      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                              ┌─────────────────────────────────────┐
                              │  MCP Server Process Started         │
                              │  ├── stdio transport                │
                              │  └── JSON-RPC 2.0 protocol          │
                              └─────────────────────────────────────┘
```

### 5.5 MCP Connection Lifecycle

```typescript
interface McpConnection {
  transport: StdioTransport
  client: Client
  skillName: string
  status: "connecting" | "connected" | "disconnected" | "error"
  startedAt: number
  lastUsedAt: number
}

// Lifecycle events
onConnect:
  - Log connection established
  - Update status to "connected"
  - Register available tools

onToolCall:
  - Update lastUsedAt
  - Route call through JSON-RPC

onDisconnect:
  - Kill server process
  - Remove from connection pool
  - Update status to "disconnected"

onError:
  - Log error details
  - Attempt reconnection (max 3 retries)
  - Fall back to error status
```

### 5.6 Cleanup on Skill Completion

```typescript
async function cleanupSkillMcps(sessionID: string): void {
  const activeSkills = getActiveSkillsForSession(sessionID)

  for (const skill of activeSkills) {
    if (skill.mcpConnection) {
      await skill.mcpConnection.disconnect()
      skillMcpManager.removeConnection(skill.name)
    }
  }
}

// Triggered by:
// - session.deleted event
// - Skill completion
// - Session idle timeout
```

### 5.7 MCP Server Configuration

```json
{
  "mcp": {
    "servers": [
      {
        "name": "custom-server",
        "command": "node",
        "args": ["./server.js"],
        "env": {
          "API_KEY": "${API_KEY}"
        },
        "timeout": 30000,
        "retries": 3
      }
    ]
  }
}
```

#### Environment Variable Expansion

```typescript
function expandEnvVars(config: McpConfig): McpConfig {
  const env = config.env || {}
  const expandedEnv: Record<string, string> = {}

  for (const [key, value] of Object.entries(env)) {
    if (value.startsWith("${") && value.endsWith("}")) {
      const envKey = value.slice(2, -1)
      expandedEnv[key] = process.env[envKey] || ""
    } else {
      expandedEnv[key] = value
    }
  }

  return { ...config, env: expandedEnv }
}
```

### 5.8 Tool Registration from MCP

When an MCP server connects, its tools are dynamically registered:

```typescript
async function registerMcpTools(connection: McpConnection): Promise<void> {
  const toolList = await connection.client.listTools()

  for (const tool of toolList.tools) {
    registerTool({
      name: `${connection.skillName}:${tool.name}`,
      description: tool.description,
      schema: tool.inputSchema,
      handler: async (args) => {
        return connection.client.callTool({
          name: tool.name,
          arguments: args
        })
      }
    })
  }
}
```

### 5.9 Session Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                     Session Events                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  session.created:                                                │
│  └─ Initialize empty MCP connection pool                        │
│                                                                  │
│  skill.invoked:                                                  │
│  ├─ Lazy load MCP connections                                   │
│  └─ Register MCP tools                                          │
│                                                                  │
│  skill.completed:                                                │
│  └─ Optionally keep connections warm                            │
│                                                                  │
│  session.deleted:                                                │
│  ├─ Disconnect all MCP connections                              │
│  ├─ Kill server processes                                       │
│  └─ Clear connection pool                                       │
│                                                                  │
│  session.error:                                                  │
│  └─ Attempt graceful MCP cleanup                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 5.10 Configuration

```json
{
  "skills": {
    "mcp_connection_timeout": 30000,
    "mcp_max_retries": 3,
    "mcp_keep_warm": false,
    "disabled_skills": ["problematic-skill"]
  }
}
```

---

## Summary

This document has covered the five core internal systems of Oh My OpenCode:

1. **Sisyphus System Prompt**: A 504-line dynamically constructed orchestration prompt that adapts to available agents, tools, and skills through a multi-phase workflow.

2. **BackgroundManager**: A sophisticated task queue system with tiered concurrency control (default, per-provider, per-model limits) and a complete task lifecycle (pending -> running -> completed/failed/cancelled).

3. **Ralph Loop**: An iterative execution system with state persistence, completion promise detection, and automatic continuation until task completion or iteration limits.

4. **Context Compaction**: A multi-stage context management system with 70% warning, 85% preemptive compaction using DCP, and emergency recovery at hard limits, all while preserving critical context.

5. **SkillMcpManager**: A lazy-loading connection pool for skill-embedded MCP servers with automatic cleanup on session completion.

These systems work together to enable OmO's powerful multi-agent orchestration capabilities while managing resources efficiently and maintaining session continuity.

---

*Document generated from DeepWiki analysis of the code-yeongyu/oh-my-opencode repository.*
