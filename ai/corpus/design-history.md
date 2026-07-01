<!--
project: Efficient New Language
project_alias: EML
canonical_layer: aicl-corpus
document: corpus/design-history
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-01
-->

# EML Design History

How EML evolved from an idea into a test-gated toolchain and a machine-callable interface. Each
stage shipped real behavior. See also [`concept-genealogy.md`](./concept-genealogy.md).

## Stage 0 — Conceptual language

A high-density semantic notation for programming intent. The decision that shaped everything after:
**ASCII canonical form is normative**; Unicode (`Σ`, `∈`, `⇒`, `²`) is an informative projection the
lexer normalizes away before tokenizing.

## Stage 1 — Symbolic syntax

A small, stable set of overlays: `^+` (init/add-assign), `^-` `^*` `^/`, `^0` (output), `=>` (bind),
`?:` (conditional), `Σ` (summation), `[a:b]` (inclusive range), `∈`/`in` (membership), `<M>`/`^T`
(matrix), `def`, `@cold`/`@hot`. The canonical table lives in `eml-symbols.json` (repo root) and is
frozen by v1.0.

## Stage 2 — Parser and AST

`normalize -> lex -> parse` into a normalized AST. A two-stage design separates syntax from meaning:
the parser emits `OverlayAssign` nodes; the semantic analyzer resolves each into a declare (`=`) or
augment (`+=`) using a per-program symbol table (the two-stage `^+` rule).

## Stage 3 — Transpilation

Deterministic EML -> Python, plus a deterministic reverse path (Python subset -> EML) with a
**round-trip fixpoint** validator (`python1 == python2`). The reverse path **fails loudly** on
inexpressible constructs rather than guessing.

## Stage 4 — Browser execution & observability

An execution-truth interpreter (`@eml/interp`) makes EML runnable with no Python runtime, computing
exactly what CPython would (gated by an `interp == python` test), and emits a **phosphor-jsonl-v1**
trace. Cold/hot temperature, crystallization, `@temporal_loop`, loop classification, and a 5-level
bug classifier were layered on; a C++20 prototype proved the *same resolved AST* can target a second
back end.

## Stage 5 — Frozen v1.0 surface

`EML-LANG-2026-v1.0` froze the normative surface: the symbol catalog, overlay semantics + Python
expansions, the two-stage `^+` rule, the phosphor-jsonl-v1 envelope + event vocabulary, the
diagnostic codes, and the round-trip guarantee. Additive changes are minor; changing an existing
meaning or breaking round-trip is a major bump.

## Stage 6 — AI-native surface (AICL + AIRS/AILP)

The current stage. The project now publishes an **AICL** (AI Ingestion & Capability Layer) inside
this repository — machine-readable corpus, specs, examples, and tool declarations — plus an
**AIRS/AILP** ([`rights-spectrum.json`](../rights-spectrum.json)) declaring, as a spectrum rather
than a binary switch, how AI systems may read, embed, train on, distill, quote, and commercialize
EML content. The hosted site (`efficientnewlanguage.org`) mirrors the same layer and adds live
bounded tools. Engineering completeness does not regress; semantic readability is re-released and
becomes an agent-callable, rights-declared interface.
