<!--
project: Efficient New Language
project_alias: EML
canonical_layer: aicl-corpus
document: corpus/concept-genealogy
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-19
-->

# EML Concept Genealogy

Which concepts are core, which are branches, which were merged, reduced, or deprecated, and which
are metaphors vs. engineered features. This exists to **reduce AI over-inference**: an agent should
not assume EML supports a capability just because early prose gestured at it.

## Core (frozen in v1.0)

- **Semantic overlay** — symbolize high-density regions; everything else stays ordinary Python.
- **ASCII-canonical form** with a Unicode display projection (normalized before lexing).
- **Two-stage `^+`** (declare vs. augment via a per-program symbol table).
- **Deterministic transpilation** with **no LLM** in the core chain.
- **Round-trip fixpoint** for the supported statement subset (reverse fails loudly).
- **Execution truth** — interpreter stdout gated to equal CPython; **phosphor-jsonl-v1** trace.

## Engineered (concept -> implemented)

- **Cold/hot temperature** (`@cold` -> `@functools.cache`, `@hot` marker; interprocedural purity).
- **Crystallization** — structural AST-hash caching of cold logic (name-independent).
- **Importance scoring** — `w1*callFrequency + w2*riskLevel + w3*dependencyDepth`, surfaced in CTS.
- **Temporal loops** — `@temporal_loop` + `async def` + `await temporal_wait(...)`, self-contained
  asyncio runtime injected at transpile time.
- **Second back end** — C++20 prototype from the same resolved AST (non-normative).
- **BUG classifier** — 5 severities (CRITICAL / MAJOR / MINOR / TRIVIAL / COSMETIC).

## Reduced (降階 — scoped down from an ambitious concept)

- **"Twelve loop kinds"** -> **`loopKind` metadata**. The MVP does not implement twelve runtime loop
  types; it statically tags each loop-like construct as `algebraic_sum`, `basic_repeat`, `for_loop`,
  `while_loop`, `temporal`, or `recursive` (5 of the 12 recovered semantic classes), with
  `deterministic` / `terminating` heuristic flags. See
  [`../specs/eml-semantic-model-v1.5.md`](../specs/eml-semantic-model-v1.5.md) §5 for the full
  taxonomy and status labels. Do not assume more.

## Suggestion-only (deliberately outside the deterministic core)

- **AI-assisted compression of arbitrary Python** — lossy, validator-gated, suggestion-only. It is
  NOT part of the rule-based EML -> Python chain and must never be treated as deterministic.

## Metaphor vs. feature

- **"Execution is the interface"** — a real, serializable EML trace format (`phosphor-jsonl-v1`),
  not merely decorative UI. `phosphor-jsonl-v1` is a frozen compatibility wire-format id; EML has no
  runtime or theoretical dependency on any external project.
- **"Base space / manager", "AI rights spectrum"** — these appear in the author's papers (see
  `docs/AIRS-AILP-v0.1.md`) as conceptual framing; within EML the concrete artifact is
  [`../rights-spectrum.json`](../rights-spectrum.json), a declaration layer (not enforcement).

## Deprecated

See [`deprecated-concepts.md`](./deprecated-concepts.md) — notably the earlier name "Efficient
Meta-Language" (superseded by "Efficient New Language").
