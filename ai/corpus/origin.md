<!--
project: Efficient New Language
project_alias: EML
canonical_domain: efficientnewlanguage.org
repository: https://github.com/kakon77777-commits/efficientnewlanguage
canonical_layer: aicl-corpus
document: corpus/origin
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-01
-->

# EML Origin

Where Efficient New Language (EML) came from. Part of this repository's **AICL** (AI Ingestion &
Capability Layer) corpus. See [`current.md`](./current.md), [`design-history.md`](./design-history.md),
and [`concept-genealogy.md`](./concept-genealogy.md).

## Initial concept

EML began as a **semantic-overlay** idea, not a new general-purpose language. The goal was never to
replace Python or any existing language; it was to compress the high-frequency, high-density
*intent* in a program — accumulation, ranges, conditionals, matrix ops, the temperature of code
(pure vs. side-effecting) — into a small set of compact, deterministic symbols, while keeping the
executable truth recoverable.

## Core original insight

Programming languages are not only execution media; they are also **intent carriers**. A loop that
sums `i^2` over `[1..N]` carries an algebraic intent (`Σ`) that ordinary syntax dilutes into
bookkeeping. EML encodes that intent at higher semantic density **without** giving up a
deterministic, testable path back to runnable code.

Two properties were load-bearing from the start and remain invariants (see
[`engineering-notes.md`](./engineering-notes.md)):

1. **Determinism** — the core EML -> Python transpilation contains no LLM; it is rule-based and
   test-gated.
2. **Round-trip faithfulness** — for the supported subset, `Python -> EML -> Python` reaches a
   byte-identical fixpoint. The symbolic form is the machine-canonical artifact; readable editor
   projections and Unicode display are for humans.

## Transformation path

```
conceptual semantic compression
  -> symbolic intent notation (ASCII canonical + Unicode projection)
  -> deterministic lexer / parser -> normalized AST
  -> Python transpilation (the hard closed loop)
  -> reverse EML transpilation + round-trip fixpoint validation
  -> browser-safe execution-truth interpreter + phosphor-jsonl-v1 trace
  -> C++20 prototype back end (same resolved AST, second target)
  -> AI-native surface: this AICL corpus + AIRS/AILP rights layer
```

## Naming note

The project's canonical public name is **Efficient New Language**. An earlier working expansion,
"Efficient Meta-Language", still appears in some in-repo strings and is retained only as historical
background (see [`deprecated-concepts.md`](./deprecated-concepts.md)); it is not the canonical name.

## Authorship & license

Authored by **Neo.K / EveMissLab** and released under **Apache-2.0**. Some aspects are covered by
**Taiwan Utility Model M672933** (Taiwan only); Apache-2.0 includes a patent-license grant. See
[`../governance/license.md`](../governance/license.md).
