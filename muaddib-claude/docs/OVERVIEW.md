# Atreides Overview

> **Transform Claude Code into a disciplined, self-orchestrating development partner.**

---

## What is Atreides?

**Atreides** is an orchestration framework for [Claude Code](https://claude.ai/code) that transforms ad-hoc AI-assisted coding into structured, methodical development. At its core is **Muad'Dib**—an orchestration agent distributed as the `muaddib-claude` NPM package.

Instead of prompting Claude and hoping for the best, Muad'Dib provides a systematic methodology that knows when to explore, when to implement, and when to stop and recover from errors—automatically.

---

## The Problem

AI-assisted development often falls short in predictable ways:

| Pain Point | What Happens |
|------------|--------------|
| **Ad-hoc prompting** | No consistent approach across tasks; quality varies wildly |
| **Context waste** | AI reads the same files repeatedly, burning expensive context |
| **Runaway failures** | Agent keeps trying failed operations, making things worse |
| **Premature completion** | "Done" gets declared while tests fail and todos remain incomplete |
| **No recovery protocol** | When things break, you're on your own to figure out why |

---

## How Atreides Solves This

Muad'Dib introduces **orchestrated workflows** that guide every interaction:

### 1. Intent Classification
Not every request deserves the same treatment. Asking "what does this do?" shouldn't trigger the same workflow as "refactor the auth system."

| Request Type | Example | Action |
|--------------|---------|--------|
| Trivial | "What does this function do?" | Direct answer |
| Explicit | "Add a login button" | Execute immediately |
| Exploratory | "Find where auth is handled" | Explore first |
| Open-ended | "Refactor the auth system" | Full assessment + planning |
| Ambiguous | "Make it better" | Clarify before proceeding |

### 2. Codebase Maturity Assessment
A battle-tested codebase deserves different treatment than a scrappy prototype:

| Level | Description | Approach |
|-------|-------------|----------|
| **DISCIPLINED** | High test coverage, consistent patterns | Follow patterns exactly |
| **TRANSITIONAL** | Mixed patterns, evolving | Respect existing, introduce carefully |
| **LEGACY** | Technical debt, inconsistent | Be conservative |
| **GREENFIELD** | New project | Establish best practices |

### 3. Orchestration Phases
Every task flows through intelligent phases:

```
Phase 0: Intent Gate    → Classify the request
Phase 1: Assessment     → Evaluate codebase maturity
Phase 2A: Exploration   → Gather context (parallel agents)
Phase 2B: Implementation → Execute with tracking
Phase 2C: Recovery      → Handle failures (3-strikes)
Phase 3: Completion     → Verify deliverables
```

### 4. 3-Strikes Error Recovery
After 3 consecutive failures on the same operation:

```
STOP     → Halt modifications immediately
REVERT   → git checkout to last working state
DOCUMENT → Record what was attempted and failed
CONSULT  → Delegate to more capable agent
ESCALATE → Ask user for guidance if still stuck
```

### 5. Intelligent Agent Delegation
The right agent and model for each task:

| Agent | Model | Use For |
|-------|-------|---------|
| Explore | sonnet | File searches, code patterns |
| general-purpose | sonnet | Research, documentation |
| Plan | opus | Architecture, critical decisions |
| security-engineer | opus | Vulnerability analysis |
| backend-architect | opus | API design, data modeling |

### 6. Forked Context Exploration
Skills marked with **forked** use Claude Code 2.1's isolated context:
- Explore 50+ files without bloating main session
- Only summarized results return
- Perfect for research and parallel investigations

---

## Key Capabilities

- **11 Muad'Dib Skills** — Specialized workflows for orchestration, exploration, validation, LSP operations, refactoring, TDD, and more
- **5 Hook Types** — PreToolUse, PostToolUse, SessionStart, Stop, PreCompact
- **Wildcard Permissions** — Fine-grained control with patterns like `Bash(npm *)`
- **Context Preservation** — Session state persists across conversations and compaction
- **Quality Gates** — Never declare "done" with failing tests or incomplete todos
- **Security Guardrails** — Block destructive commands while enabling productive workflows

---

## Before & After

### Without Muad'Dib
```
User: "Refactor the auth module"
Claude: *immediately starts editing files*
Claude: *breaks something, keeps trying same fix*
Claude: *burns context re-reading files*
Claude: "Done!" *tests failing, 3 todos incomplete*
```

### With Muad'Dib
```
User: "Refactor the auth module"
Muad'Dib: [Phase 0] Open-ended task → full workflow
Muad'Dib: [Phase 1] DISCIPLINED codebase → follow patterns exactly
Muad'Dib: [Phase 2A] Launching parallel exploration agents...
Muad'Dib: [Phase 2B] TodoWrite: 5 tasks tracked
Muad'Dib: [Strike 2] Edit failed, trying alternative approach
Muad'Dib: [Phase 3] All tests passing, todos complete
Muad'Dib: "Refactoring complete. Summary: ..."
```

---

## Getting Started

```bash
# Install globally
npm install -g muaddib-claude

# Set up global components
muaddib install

# Initialize in your project
cd your-project
muaddib init
```

See the [README](../README.md) for detailed installation and configuration options.

---

## Learn More

| Resource | Description |
|----------|-------------|
| [README](../README.md) | Full documentation, features, and usage |
| [CONTRIBUTING](./CONTRIBUTING.md) | Technical guide for contributors |
| [CHANGELOG](../CHANGELOG.md) | Version history and updates |
| [API Reference](./API-FILE-MANAGER.md) | File manager API documentation |
| [Dual Environment Setup](./DUAL-ENVIRONMENT-SETUP.md) | Run alongside vanilla Claude Code |

---

## Project Info

| | |
|--|--|
| **Package** | `muaddib-claude` |
| **Version** | 1.0.3 |
| **License** | MIT |
| **Node.js** | 18+ |
| **Repository** | [github.com/AmbitiousRealism2025/Atreides](https://github.com/AmbitiousRealism2025/Atreides) |

---

*"The spice must flow" — Atreides orchestrates the flow of development*
