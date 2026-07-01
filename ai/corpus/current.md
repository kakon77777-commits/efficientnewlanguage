<!--
project: Efficient New Language
project_alias: EML
canonical_domain: efficientnewlanguage.org
repository: https://github.com/kakon77777-commits/efficientnewlanguage
canonical_layer: aicl-corpus
document: corpus/current
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-01
-->

# EML Current Implementation

The current engineering state of EML. Normative language reference:
[`../specs/eml-v1.md`](../specs/eml-v1.md) (digest of `EML-LANG-2026-v1.0`, the single source of
truth). Origin: [`origin.md`](./origin.md).

## Current definition

> EML is a deterministic **semantic-overlay** layer. It does **not** replace general-purpose
> languages. It compresses repeated, high-density program intent into compact symbolic forms and
> maps them — rule-based and reversibly — into executable representations.

Canonical execution target: **Python 3.10+**. A C++20 back end exists as a prototype.

## This repository

A **pnpm TypeScript monorepo**. The reference implementation packages:

| Package | Role |
| --- | --- |
| `@eml/types` | AST, CTS, tokens, diagnostics, symbol-table types |
| `@eml/parser` | normalize -> lex -> parse -> AST |
| `@eml/transpiler-python` | semantic analysis + Python emitter (cold/hot, crystallization, importance, loopKind) |
| `@eml/transpiler-eml` | reverse Python->EML + round-trip fixpoint validators |
| `@eml/transpiler-cpp` | C++20 prototype back end (non-normative) |
| `@eml/interp` | execution-truth interpreter (faithful to CPython, test-gated) + trace producer |
| `@eml/trace` | phosphor-jsonl-v1 emitter/parser (browser-safe; node file sink isolated) |
| `@eml/bug-classifier` | 5-level classifier (CRITICAL / MAJOR / MINOR / TRIVIAL / COSMETIC) |
| `@eml/cts-generator`, `@eml/symbols`, `@eml/cli`, `@eml/cogni-editor` | CTS, symbol table, the `eml` command, editor |

By phase (each shipped with tests): Phase 0 Py+ transpiler; Phase 1 bidirectional + round-trip;
Phase 2 cold/hot + crystallization; Phase 3 temporal loops + BUG classifier; Phase 4 loopKind +
C++; Phase 5 execution-truth interpreter + PHOSPHOR trace. The suite (300+ cases) enforces an
`interp == python` stdout-equivalence gate.

## Interfaces

- **CLI** — `eml run|transpile|trace|compress|roundtrip|bugs` runs the full pipeline from source.
- **Cogni-Editor** — browser projection editor + Nova IME + Trace panel.
- **Hosted AICL** — the live site `https://efficientnewlanguage.org` exposes this same toolchain as
  bounded HTTP tools at `/ai/tools/*` (parse, transpile both ways, interpret, trace, roundtrip).
  See [`../tools/tools.md`](../tools/tools.md).

## Machine interface (this AICL layer)

This `ai/` directory is the machine-readable **AI Ingestion & Capability Layer** for the repository:
corpus, specs, examples, tool declarations, an [`AIRS/AILP rights spectrum`](../rights-spectrum.json),
and [governance](../governance/). It lets AI systems read, cite, and (via the hosted tools) invoke
EML without parsing human UI.
