# Phase 5: Difficult Feature Adaptations

**Priority**: P3 Extended / High Effort
**Estimated Effort**: 12-15 hours (3-5 days)
**Dependencies**: Phase 4 complete

## Overview

Phase 5 implements high-effort features that significantly enhance capability, pushing toward maximum achievable OmO parity (~75-80%).

**Exit Criteria**: LSP operations available, AST-grep integrated, advanced context preservation working, extended automation patterns documented.

---

## Task Groups

### Group 1: LSP MCP Integration (Tasks 5.1.1 - 5.1.4)

<!-- LOAD_CONTEXT: context/01-lsp-integration.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 5.1.1 | Research available LSP MCP servers | 2 hours |
| 5.1.2 | Configure LSP MCP (if available) | 1 hour |
| 5.1.3 | Document CLI-based LSP alternatives | 1 hour |
| 5.1.4 | Test LSP operations | 1 hour |

**Dependencies**: Phase 4 complete
**Deliverables**: Working LSP operations via MCP or CLI fallback

---

### Group 2: AST-grep CLI Integration (Tasks 5.2.1 - 5.2.5)

<!-- LOAD_CONTEXT: context/02-ast-grep-integration.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 5.2.1 | Verify ast-grep installation | 15 min |
| 5.2.2 | Document ast-grep search patterns | 30 min |
| 5.2.3 | Document ast-grep replace patterns | 30 min |
| 5.2.4 | Create ast-grep cheat sheet | 30 min |
| 5.2.5 | Test ast-grep operations | 30 min |

**Dependencies**: ast-grep CLI installed
**Deliverables**: Comprehensive ast-grep documentation and patterns

---

### Group 3: Advanced Context Preservation (Tasks 5.3.1 - 5.3.3)

<!-- LOAD_CONTEXT: context/03-context-preservation.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 5.3.1 | Create checkpoint system documentation | 30 min |
| 5.3.2 | Create checkpoint.md template | 20 min |
| 5.3.3 | Add checkpoint triggers to CLAUDE.md | 20 min |

**Dependencies**: Phase 4 context files
**Deliverables**: Checkpoint system for long-running tasks

---

### Group 4: Extended Automation Patterns (Tasks 5.4.1 - 5.4.4)

<!-- LOAD_CONTEXT: context/04-automation-patterns.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 5.4.1 | Document test-driven pattern | 20 min |
| 5.4.2 | Document parallel+sequential pattern | 20 min |
| 5.4.3 | Document incremental refactoring pattern | 20 min |
| 5.4.4 | Document documentation sync pattern | 15 min |

**Dependencies**: Phase 3 workflow phases
**Deliverables**: 4 advanced automation pattern documents

---

### Group 5: Integration Testing (Tasks 5.5.1 - 5.5.4)

<!-- LOAD_CONTEXT: context/05-validation.md -->

| Task ID | Task | Effort |
|---------|------|--------|
| 5.5.1 | Integration test: LSP operations | 45 min |
| 5.5.2 | Integration test: ast-grep workflow | 30 min |
| 5.5.3 | Integration test: checkpoint system | 30 min |
| 5.5.4 | Integration test: automation patterns | 45 min |

**Dependencies**: All previous tasks
**Deliverables**: Validation report, maximum parity achieved

---

## Dependencies Graph

```
Phase 4 Complete
       │
       ▼
┌──────────────────────────────────────────────────────┐
│                    PHASE 5                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌───────────┐   ┌───────────┐   ┌───────────────┐  │
│  │ Group 1   │   │ Group 2   │   │ Group 3       │  │
│  │ LSP       │   │ AST-grep  │   │ Checkpoints   │  │
│  │ 5.1.1-5.1.4│   │ 5.2.1-5.2.5│   │ 5.3.1-5.3.3   │  │
│  └─────┬─────┘   └─────┬─────┘   └───────┬───────┘  │
│        │               │                 │          │
│        │               │     ┌───────────┘          │
│        │               │     │                      │
│        │               ▼     ▼                      │
│        │         ┌───────────────┐                  │
│        │         │ Group 4       │                  │
│        │         │ Automation    │                  │
│        │         │ 5.4.1-5.4.4   │                  │
│        │         └───────┬───────┘                  │
│        │                 │                          │
│        └────────┬────────┘                          │
│                 │                                   │
│                 ▼                                   │
│         ┌───────────────┐                           │
│         │ Group 5       │                           │
│         │ Validation    │                           │
│         │ 5.5.1-5.5.4   │                           │
│         └───────────────┘                           │
└──────────────────────────────────────────────────────┘
       │
       ▼
 IMPLEMENTATION COMPLETE
 (~75-80% OmO Parity)
```

---

## Validation Checklist

- [ ] LSP operations work (MCP or CLI)
- [ ] AST-grep search patterns function
- [ ] AST-grep replace patterns function
- [ ] Checkpoint system documents state
- [ ] Advanced patterns documented and usable
- [ ] All integration tests pass

---

## Files to Create/Modify

### New Files
- `.claude/checkpoint.md` (template)
- AST-grep pattern documentation (in CLAUDE.md)
- LSP alternatives documentation (in CLAUDE.md)
- Automation patterns documentation (in CLAUDE.md)

### Modified Files
- `CLAUDE.md` (add all new sections)
- `.claude/settings.json` (add LSP MCP if available)

---

## OmO Parity Assessment

### Achieved by End of Phase 5

| Category | OmO Feature | Claude Code Equivalent | Parity |
|----------|-------------|------------------------|--------|
| Workflow | 4 phases | 4 phases | 100% |
| Delegation | 7-section template | 7-section template | 100% |
| Error Recovery | 3-strikes | 3-strikes | 100% |
| Hooks | 31 events | 8 events | ~25% |
| Permissions | Pattern matching | Pattern matching | 90% |
| LSP | 11 operations | CLI/MCP alternatives | ~50% |
| AST | ast-grep | ast-grep CLI | 100% |
| Context | DCP algorithm | Manual + hooks | ~40% |
| Parallelism | Multi-provider | Single provider | 30% |

**Overall Estimated Parity**: 75-80%

---

## Quick Reference

### LSP Alternatives by Language

| Language | CLI Tool | Key Commands |
|----------|----------|--------------|
| TypeScript | tsc | `tsc --noEmit`, grep for imports |
| Python | pyright/mypy | `mypy .`, `pyright .` |
| Go | gopls (CLI) | `go vet`, `go doc` |
| Rust | rust-analyzer | `cargo check` |
| Java | jdtls | Via MCP if available |

### AST-grep Quick Reference

| Operation | Pattern |
|-----------|---------|
| Find function | `function $NAME($$$ARGS) { $$$BODY }` |
| Find class | `class $NAME { $$$BODY }` |
| Find import | `import $$$` |
| Find call | `$FUNC($$$ARGS)` |
| Replace | `--rewrite 'replacement'` |

---

*Phase 5 Implementation Guide*
*Estimated completion: 12-15 hours*
*Target: 75-80% OmO Parity*
