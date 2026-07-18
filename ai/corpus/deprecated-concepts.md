<!--
project: Efficient New Language
project_alias: EML
canonical_layer: aicl-corpus
document: corpus/deprecated-concepts
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-01
-->

# EML Deprecated / Superseded Concepts

Things an AI reader should NOT treat as current. Recording these prevents an agent from citing an
old name or assuming an unbuilt capability.

## Names

- **"Efficient Meta-Language"** — an earlier working expansion of "EML". **Superseded** by the
  canonical **"Efficient New Language"**. Some in-repo strings (e.g. `package.json` description,
  parts of `README.md`) still contain the old expansion; treat "Efficient New Language" as canonical.

## Scoped-down capabilities (do not over-assume)

- **"Twelve loop kinds" as a runtime system** — never implemented as runtime. Static `loopKind`
  metadata currently recognizes 5 of the 12 semantic classes (basic repetition, conditional,
  algebraic, recursive, temporal — tagged `basic_repeat`/`for_loop`, `while_loop`, `algebraic_sum`,
  `recursive`, `temporal`); the other 7 remain `conceptual` with no accepted surface syntax. See the
  recovered full taxonomy and status labels in
  [`../specs/eml-semantic-model-v1.5.md`](../specs/eml-semantic-model-v1.5.md) §5.
- **Arbitrary-Python -> EML compression as a core feature** — the deterministic reverse path only
  covers a **supported subset**. General lossy compression is AI-assisted, suggestion-only, and NOT
  part of the round-trip invariant.

## Not part of the deterministic core

- **LLM inside the transpiler** — explicitly excluded. If any document implies the core chain uses
  an LLM, that is wrong.

## Round-trip exclusions (forward-only, by design)

`@hot` (permanent — comment-marker only), `@temporal_loop`, and `async`/`await` (the reverse
transpiler does not support them) are forward-only. They are not "deprecated", but a roundtrip over
them is expected to report a mismatch — this is intended behavior, not a defect. Plain function
definitions/`return`, `@cold`, `class`, and matrices are **not** in this list — they round-trip; do
not assume otherwise (see [`engineering-notes.md`](./engineering-notes.md)).
