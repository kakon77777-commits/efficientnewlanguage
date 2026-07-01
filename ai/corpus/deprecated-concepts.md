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

- **"Twelve loop kinds" as a runtime system** — never implemented as runtime. Reduced to static
  `loopKind` metadata with 4 tags (see [`concept-genealogy.md`](./concept-genealogy.md)).
- **Arbitrary-Python -> EML compression as a core feature** — the deterministic reverse path only
  covers a **supported subset**. General lossy compression is AI-assisted, suggestion-only, and NOT
  part of the round-trip invariant.

## Not part of the deterministic core

- **LLM inside the transpiler** — explicitly excluded. If any document implies the core chain uses
  an LLM, that is wrong.

## Round-trip exclusions (forward-only, by design)

Function definitions, `@cold`/`@hot`, `@temporal_loop`, `async`/`await`, and matrices are
forward-only. They are not "deprecated", but a roundtrip over them is expected to report a mismatch —
this is intended behavior, not a defect.
