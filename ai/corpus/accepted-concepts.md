<!--
project: Efficient New Language
project_alias: EML
canonical_layer: aicl-corpus
document: corpus/accepted-concepts
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-01
-->

# EML Accepted Concepts

Concepts that reached the engineered, test-gated v1.0 surface and are safe to rely on. (Complement:
[`deprecated-concepts.md`](./deprecated-concepts.md).)

| Concept | Status | Where |
| --- | --- | --- |
| Semantic overlay (not a replacement language) | normative | spec §1 |
| ASCII canonical + Unicode projection | normative | spec §5 |
| Symbol catalog (`^0 ^+ ^- ^* ^/ ^T Σ ∈ [:] => ?: <M> list^+ def @cold @hot @temporal_loop await`) | frozen | spec §6, `eml-symbols.json` |
| Power operator `i^<n!=0>`, `async def` | normative | spec §6 |
| Two-stage `^+` disambiguation | normative | spec §7.1 |
| Deterministic EML -> Python (no LLM) | invariant | engineering-notes |
| Reverse Python(subset) -> EML + round-trip fixpoint | normative | spec §10 |
| Execution-truth interpreter (interp == CPython, gated) | normative | `@eml/interp` |
| `phosphor-jsonl-v1` trace (envelope + event vocabulary) | frozen | spec §9 |
| Diagnostic codes (7 errors, 8 warnings) | stable | spec Appendix A |
| Cold/hot temperature + crystallization + importance | implemented | spec §8 |
| Temporal loops (`@temporal_loop` + async) | implemented | spec §7 |
| `loopKind` metadata (4 kinds) | implemented | grammar §6.5 |
| C++20 prototype back end | prototype (non-normative) | spec §11 |
| 5-level BUG classifier | implemented | `@eml/bug-classifier` |
| AICL machine layer + AIRS/AILP rights spectrum | this layer, v0.1 | `ai/` |

"Frozen" means changing the meaning is a **major** version bump. "Prototype" means it may change
without a major bump.
