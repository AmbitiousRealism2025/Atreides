# OmO Features Requiring Adaptation for Claude Code

## Executive Summary

This document identifies OmO features that need significant modification to work in Claude Code, explaining what changes are needed, alternative approaches, and associated risks.

---

## 1. Multi-Model Routing

### What It Does in OmO
- Routes tasks to different AI models based on cost/capability
- Per-provider concurrency limits (3 for Anthropic, 10 for Google)
- Cost-tier annotations (EXPENSIVE, MODERATE, CHEAP)
- Automatic model demotion on failure

### Why Modification Needed
- Claude Code uses single model per session
- Task tool inherits parent model by default
- No native cost-tier routing

### Alternative Approach
- Use Task tool `model` parameter explicitly
- Create CLAUDE.md rules for model selection
- Manual cost-tier decision making

### Implementation

```markdown
## Model Selection Rules (CLAUDE.md)

For exploration/simple tasks: model="haiku"
For implementation: model="sonnet"
For architecture/complex analysis: model="opus"
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| Medium | ⭐⭐⭐ | Medium | Low |

---

## 2. Dynamic Context Pruning (DCP)

### What It Does in OmO
- Monitors context at 70%/85% thresholds
- Scores message importance for pruning
- Preserves critical data (system prompt, TODOs, recent exchanges)
- Progressive compaction strategy

### Why Modification Needed
- Claude Code only auto-compacts at ~95%
- No importance scoring system
- No configurable thresholds

### Alternative Approach
- Manual context awareness in CLAUDE.md
- Aggressive summarization habits
- Use TodoWrite for state persistence
- Store critical context in project files

### Implementation

```markdown
## Context Management Rules (CLAUDE.md)

- Summarize findings before context grows large
- Store decisions in project files, not just conversation
- Use TodoWrite to persist task state
- Reference file paths instead of copying content
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| High | ⭐⭐⭐⭐ | Large | Medium |

---

## 3. Ralph Loop (Iterative Development)

### What It Does in OmO
- Detects completion markers (e.g., "DONE")
- Automatically continues until task complete
- Tracks iteration counts
- Prevents premature session end

### Why Modification Needed
- No native marker detection in Claude Code
- No automatic continuation mechanism
- Prompt-based detection less reliable

### Alternative Approach
- Explicit completion checks in CLAUDE.md
- TodoWrite for progress tracking
- Manual iteration management

### Implementation

```markdown
## Completion Rules (CLAUDE.md)

Before ending any multi-step task:
1. Check all TodoWrite items are complete
2. Verify build/test passes
3. Review deliverables against requirements
4. Only stop when ALL criteria met
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| Medium | ⭐⭐⭐ | Medium | Low |

---

## 4. Background Task Management

### What It Does in OmO
- Full BackgroundManager with FIFO queues
- Per-provider/model concurrency limits
- Task lifecycle tracking (pending→running→completed)
- Explicit result retrieval via background_output

### Why Modification Needed
- Claude Code has simpler background execution
- Flat 10-concurrent limit
- Results return automatically (no explicit retrieval)

### Alternative Approach
- Use Task tool with run_in_background
- Accept simpler concurrency model
- Rely on automatic result return

### Implementation

```markdown
## Parallel Execution (CLAUDE.md)

For independent operations:
- Launch multiple Task tools in single message
- Use run_in_background for long operations
- Results returned automatically
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| Low | ⭐⭐ | Small | Low |

---

## 5. Extended Hook System (31+ Events)

### What It Does in OmO
- 31+ lifecycle hook events
- Context management hooks (PreCompact)
- Session recovery hooks
- Custom hook creation via TypeScript

### Why Modification Needed
- Claude Code only has 8 hook events
- Missing critical events (PreCompact, SessionStart details)
- Limited hook customization

### Alternative Approach
- Use available 8 hooks strategically
- Implement missing behavior in CLAUDE.md rules
- Accept reduced automation capability

### Implementation

```json
// .claude/settings.json
{
  "hooks": {
    "PreToolUse": [/* validation hooks */],
    "PostToolUse": [/* formatting/linting hooks */],
    "Stop": [/* cleanup hooks */]
  }
}
```

```markdown
## Missing Hook Behavior (CLAUDE.md)

Since PreCompact unavailable:
- Proactively summarize long conversations
- Store state in files, not just memory

Since SessionStart limited:
- Always read CLAUDE.md first
- Check for prior state/todos
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| High | ⭐⭐⭐⭐ | Large | Medium |

---

## 6. Agent Permission Matrix

### What It Does in OmO
- Per-agent tool permissions (allow/ask/deny)
- Fine-grained capability control
- Prevents unauthorized tool usage

### Why Modification Needed
- Claude Code lacks per-agent permissions
- All agents inherit parent permissions
- No deny capability

### Alternative Approach
- Specify allowed tools in delegation prompts
- Use MUST NOT DO section in prompts
- Trust prompt-based constraints

### Implementation

```markdown
## Delegation with Constraints

Task(
  subagent_type="Explore",
  prompt="""
  ...
  MUST NOT DO:
  - Do NOT use Edit tool
  - Do NOT use Write tool
  - Do NOT modify any files
  """
)
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| Medium | ⭐⭐⭐ | Medium | Medium |

---

## 7. Skill-Embedded MCP Servers

### What It Does in OmO
- Skills can spawn MCP servers on-demand
- Lazy loading via SkillMcpManager
- Per-skill server configuration

### Why Modification Needed
- Claude Code requires pre-configured MCP servers
- Cannot dynamically spawn mid-session
- All servers must be in settings at startup

### Alternative Approach
- Pre-configure all needed MCP servers
- Group related servers together
- Accept startup overhead for flexibility

### Implementation

```json
// .claude/settings.json
{
  "mcpServers": {
    "all-skills-server-1": { /* config */ },
    "all-skills-server-2": { /* config */ }
  }
}
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| Medium | ⭐⭐⭐ | Medium | Low |

---

## 8. Codebase Maturity Assessment

### What It Does in OmO
- Classifies codebase as Disciplined/Transitional/Legacy/Greenfield
- Adjusts approach based on maturity
- Influences whether to follow patterns or propose cleanups

### Why Modification Needed
- No automatic maturity detection in Claude Code
- Must be done manually per-project

### Alternative Approach
- Document maturity in project CLAUDE.md
- Create assessment checklist
- Manual classification

### Implementation

```markdown
## Project Maturity (CLAUDE.md)

This codebase is: [DISCIPLINED / TRANSITIONAL / LEGACY / GREENFIELD]

Based on maturity:
- DISCIPLINED: Follow existing patterns exactly
- TRANSITIONAL: Gradual migration allowed
- LEGACY: Propose cleanups when relevant
- GREENFIELD: Establish new patterns
```

| Complexity | Rating | Effort | Risk |
|------------|--------|--------|------|
| Low | ⭐⭐ | Small | Low |

---

## Summary Table

| Feature | Complexity | Effort | Risk | Priority |
|---------|------------|--------|------|----------|
| Multi-model routing | Medium | Medium | Low | P1 |
| Dynamic Context Pruning | High | Large | Medium | P2 |
| Ralph Loop | Medium | Medium | Low | P1 |
| Background task mgmt | Low | Small | Low | P0 |
| Extended hooks (31+) | High | Large | Medium | P3 |
| Agent permissions | Medium | Medium | Medium | P2 |
| Skill-embedded MCP | Medium | Medium | Low | P2 |
| Maturity assessment | Low | Small | Low | P1 |

---

## Dependencies

```
Background task mgmt (P0)
         │
         ▼
Multi-model routing (P1) ──► Agent permissions (P2)
         │
         ▼
Ralph Loop (P1) ──────────► Dynamic Context Pruning (P2)
         │
         ▼
Maturity assessment (P1)
```

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
