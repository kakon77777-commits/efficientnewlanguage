<!--
project: Efficient New Language
project_alias: EML
canonical_layer: aicl-corpus
document: corpus/engineering-notes
maintainer: Neo.K / EveMissLab
status: active
version: 0.1.0
audience: ai-agent
last_updated: 2026-07-01
-->

# EML Engineering Notes

Behavioral facts an agent should rely on when reasoning about or generating EML, aligned with
`EML-LANG-2026-v1.0`.

## Invariants (do not violate)

1. **No LLM in the core transpilation chain.** `EML -> Python` is rule-based and reproducible.
   AI-assisted compression of arbitrary Python is a separate, lossy, validator-gated,
   suggestion-only layer — never part of the deterministic core.
2. **Determinism.** Same input -> same tokens, AST, Python, and trace (modulo trace timestamps).
3. **Round-trip fixpoint** for the supported statement subset: `Python -> EML -> Python` is
   byte-identical. The reverse path fails loudly; it does not guess.
4. **Execution truth.** The interpreter's stdout is *gated* to equal CPython's
   (`tests/interp.test.ts`); `eml trace --run` bakes the equivalence in as an `eml:equiv` event.

## Canonical vs. display form

ASCII canonical is normative; the lexer normalizes Unicode (`Σ`, `∈`, `⇒`, `²`, `⟨M⟩`) to ASCII
before tokenizing. Generate ASCII canonical when in doubt. Display form is a UI projection
(Cogni-Editor / Nova IME), never required for correctness.

## The two-stage `^+` rule

`x^+100` is ambiguous by design and resolved by the per-program symbol table: first occurrence of
`x` -> **declare** (`x = 100`); later -> **augment** (`x += 100`). `^+=` is an *internal*
symbol-table tag, not writable surface syntax. Augmented assign (`-=`/`*=`/`/=`) on an undeclared
variable warns `W_AUG_UNDECLARED`.

## Forward-only constructs (NOT round-trippable)

`def`, `@cold`/`@hot`, `@temporal_loop`, `async`/`await`, and matrices transpile EML -> Python but
are **not** part of the round-trip invariant. A roundtrip on such a program reports a mismatch with
a clear reason — expected, not a bug.

## Cold/hot, temporal, diagnostics

`@cold` -> `@functools.cache` (auto-imports functools); purity is interprocedural
(`W_COLD_SIDE_EFFECT`). `@temporal_loop(...)` + `async def` + `await temporal_wait(...)` injects a
self-contained asyncio runtime. Error codes (block, `ok=false`): `E_LEX`, `E_PARSE`, `E_INTERNAL`,
`E_RANGE_NONINT`, `E_ALIAS_COLLISION`, `E_RETURN_OUTSIDE_FN`, `E_CPP_UNSUPPORTED`. Codes are stable;
messages may improve. See [`../specs/eml-error-schema.json`](../specs/eml-error-schema.json).

## Observability

All events conform to `phosphor-jsonl-v1` (one JSON object per line). EML only produces the wire
format; it has no runtime dependency on PHOSPHOR. See
[`../specs/eml-trace-schema.json`](../specs/eml-trace-schema.json).

## Reproducing tool results

The hosted bounded tools at `https://efficientnewlanguage.org/ai/tools/*` and the local `eml` CLI
run the same deterministic packages. Integer arithmetic is arbitrary-precision, so the hosted tools
apply static resource limits (`max_exponent`, `max_nesting_depth`, `max_eval_steps`) — a program
whose computed magnitude would blow up is rejected with `E_RESOURCE_LIMIT`, not executed.
