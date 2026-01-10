# Direct OmO to Claude Code Feature Mappings

## Executive Summary

This document maps OmO features to their Claude Code equivalents, identifying what can be converted with minimal effort versus what requires significant work.

---

## 1. Tool Mappings

### Direct Equivalents (Minimal Effort)

| OmO Tool | Claude Code Equivalent | Notes |
|----------|----------------------|-------|
| `grep` | Grep tool | Full regex support in both |
| `glob` | Glob tool | Pattern matching equivalent |
| `read` | Read tool | Direct equivalent |
| `write` | Write tool | Direct equivalent |
| `edit` | Edit tool | String replacement equivalent |
| `bash` | Bash tool | Direct equivalent |
| `task` | Task tool | Similar subagent spawning |
| `skill` | Skill tool | Similar invocation pattern |

### Partial Equivalents (Some Adaptation)

| OmO Tool | Claude Code Approach | Gap |
|----------|---------------------|-----|
| `call_omo_agent` | Task tool with subagent_type | Different agent types available |
| `background_task` | Task with run_in_background | Similar but simpler |
| `background_output` | Automatic in Claude Code | No explicit retrieval needed |
| `TodoWrite` (OmO) | TodoWrite tool | Same name, similar function |

### No Direct Equivalent (Requires MCP/CLI)

| OmO Tool | Alternative Approach |
|----------|---------------------|
| `lsp_*` (11 tools) | Bash + language CLI or MCP |
| `ast_grep_*` | Bash + ast-grep CLI |
| `background_cancel` | KillShell tool |

---

## 2. Agent Mappings

### OmO Agent → Claude Code subagent_type

| OmO Agent | Claude Code subagent_type | Model Suggestion |
|-----------|---------------------------|------------------|
| `sisyphus` | (Main process) | opus |
| `oracle` | `Plan` or `system-architect` | opus |
| `explore` | `Explore` | haiku |
| `librarian` | `general-purpose` | haiku |
| `frontend-ui-ux-engineer` | `frontend-architect` | sonnet |
| `document-writer` | `technical-writer` | sonnet |
| `multimodal-looker` | `general-purpose` | sonnet |

### Agent Permission Mapping

| OmO Permission | Claude Code Equivalent |
|----------------|----------------------|
| `allow` | Default (allowed) |
| `ask` | Configure in settings |
| `deny` | Not directly available |

---

## 3. Workflow Mappings

### Phase Mapping

| OmO Phase | Claude Code Implementation |
|-----------|---------------------------|
| Phase 0: Intent Gate | CLAUDE.md rules for classification |
| Phase 1: Codebase Assessment | Task(Explore) agent |
| Phase 2A: Exploration | Parallel Task tool calls |
| Phase 2B: Implementation | Direct implementation |
| Phase 2C: Recovery | 3-strikes in CLAUDE.md |
| Phase 3: Completion | Manual verification |

### Workflow Pattern Implementation

```markdown
## In CLAUDE.md:

### Phase 0: Intent Classification
Before any task, classify as:
- Trivial → Answer directly
- Explicit → Execute immediately
- Exploratory → Launch exploration agents
- Open-ended → Full assessment
- Ambiguous → AskUserQuestion

### Phase 2A: Exploration
For exploratory tasks, launch in parallel:
- Task(Explore) for internal codebase
- Task(general-purpose) for external research
```

---

## 4. Configuration Mappings

### Configuration File Mapping

| OmO Location | Claude Code Equivalent |
|--------------|----------------------|
| `~/.config/opencode/oh-my-opencode.json` | `~/.claude/settings.json` |
| `.opencode/oh-my-opencode.json` | Project `CLAUDE.md` |
| `AGENTS.md` | Project `CLAUDE.md` |
| `SKILL.md` files | `.claude/skills/*/SKILL.md` |

### Settings Mapping

| OmO Setting | Claude Code Setting |
|-------------|-------------------|
| Agent model | Task tool `model` parameter |
| Hook configuration | `.claude/settings.json` hooks |
| Disabled hooks | `disabled_hooks` array |
| Permissions | Permission prompts in settings |

---

## 5. Hook Mappings

### Direct Hook Equivalents

| OmO Hook Event | Claude Code Hook |
|----------------|-----------------|
| `PreToolUse` | PreToolUse ✓ |
| `PostToolUse` | PostToolUse ✓ |
| `UserPromptSubmit` | UserPromptSubmit ✓ |
| `Stop` | Stop ✓ |
| `SubagentStop` | SubagentStop ✓ |

### No Direct Equivalent

| OmO Hook Event | Status |
|----------------|--------|
| `SessionStart` | Limited support |
| `SessionEnd` | Limited support |
| `PreCompact` | Not available |
| 23+ other events | Not available |

---

## 6. Quick Win Implementations

### Immediately Convertible (No Modification)

| Feature | Implementation |
|---------|----------------|
| Basic file operations | Use native tools |
| Search (grep/glob) | Use native tools |
| Shell commands | Use Bash tool |
| User questions | Use AskUserQuestion |
| Todo tracking | Use TodoWrite |

### Quick Configuration (CLAUDE.md)

```markdown
## Quick Win Rules for CLAUDE.md

### Task Management
- Use TodoWrite for any task with 3+ steps
- Mark complete only when verified
- Never stop with incomplete todos

### Error Recovery (3-Strikes)
After 3 consecutive failures:
1. STOP all modifications
2. REVERT via git checkout
3. DOCUMENT failure
4. Use Task(Plan) for advice
5. AskUserQuestion if still stuck

### Agent Delegation
For complex analysis: Task(Explore, haiku)
For research: Task(general-purpose, haiku)
For architecture: Task(Plan, opus)
For frontend: Task(frontend-architect, sonnet)
```

### Quick Hooks (settings.json)

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write|Edit",
      "hooks": [{
        "type": "command",
        "command": "eslint --fix $FILE"
      }]
    }]
  }
}
```

---

## 7. Delegation Prompt Template

### OmO 7-Section Template → Claude Code Task Prompt

```markdown
## Claude Code Task Tool Prompt Template

Task(
  subagent_type="[appropriate type]",
  model="[haiku|sonnet|opus]",
  prompt="""
  1. TASK: [Atomic, specific goal]

  2. EXPECTED OUTCOME: [Concrete deliverables]

  3. CONTEXT:
     - Files: [relevant paths]
     - Patterns: [existing conventions]
     - Constraints: [limitations]

  4. MUST DO:
     - [Requirement 1]
     - [Requirement 2]

  5. MUST NOT DO:
     - [Forbidden action 1]
     - [Forbidden action 2]
  """
)
```

---

## 8. Feature Parity Summary

### High Parity (>80%)

| Category | Coverage |
|----------|----------|
| File operations | 100% |
| Search operations | 100% |
| Shell execution | 100% |
| Agent delegation | 80% |
| Todo management | 90% |

### Medium Parity (50-80%)

| Category | Coverage |
|----------|----------|
| Hooks system | 25% (8 of 31+ events) |
| Agent types | 70% (mapped to subagent_types) |
| Workflow phases | 60% (manual implementation) |

### Low Parity (<50%)

| Category | Coverage |
|----------|----------|
| LSP operations | 0% (requires MCP) |
| AST operations | 0% (requires CLI/MCP) |
| Context management | 20% (no DCP) |
| Multi-model routing | 30% (manual per-task) |

---

*Source: OmO Deep Wiki Documentation via NotebookLM*
