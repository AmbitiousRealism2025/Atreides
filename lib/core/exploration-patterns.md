# Muad'Dib Exploration Patterns

## Overview

Muad'Dib uses parallel exploration agents for efficient context gathering.

---

## Parallel Agent Pattern

Launch multiple agents in a **SINGLE message** for efficiency:

```
┌─────────────────────────────────────────┐
│     SINGLE MESSAGE WITH MULTIPLE TASKS   │
│                                         │
│  Task(Explore, sonnet, "internal query") │
│  Task(general-purpose, sonnet, "research")│
│                                         │
│  → Both execute in parallel              │
│  → Results returned together             │
└─────────────────────────────────────────┘
```

---

## Common Patterns

### Internal + External Search
Use when: Need both codebase context and external documentation.

### Multi-Location Search
Use when: Need to search multiple areas of codebase.

### Code + Tests Search
Use when: Understanding both implementation and expected behavior.

---

## Convergent Search Strategy

### Termination Conditions

| Condition | Description | Action |
|-----------|-------------|--------|
| **Convergence** | Same info from multiple sources | Stop exploring |
| **Sufficiency** | Enough context to proceed | Stop exploring |
| **Iteration Limit** | 2 searches with no new useful info | Stop exploring |
| **Explicit Answer** | Direct answer found | Stop exploring |

### Sufficiency Check

1. Do I know WHERE to make changes?
2. Do I know WHAT changes to make?
3. Do I understand the PATTERNS to follow?

### Exploration Scope Guide

| Scope | When to Use | Max Iterations |
|-------|-------------|----------------|
| **Narrow** | Known file/function | 1 |
| **Medium** | Known directory | 2 |
| **Wide** | Unknown location | 3 |
| **Research** | External docs needed | 2 |

---

## Anti-Patterns

- DON'T launch agents sequentially when parallel would work
- DON'T use heavy models (opus) for simple exploration
- DO use sonnet for exploration tasks
- DO launch multiple tasks in single message

---

*Muad'Dib Exploration Patterns v1.0.0*
