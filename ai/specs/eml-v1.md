<!--
canonical_domain: efficientnewlanguage.org
canonical_layer: ai-native-interface
project: Efficient New Language
project_alias: EML
document: specs/eml-v1
spec: EML-LANG-2026-v1.0
maintainer: Neo.K / EveMissLab
status: v1.0 (Phase 0-4 frozen surface)
ai_layer_version: 0.1.0
updated: 2026-06-30
-->

# EML v1 Specification (digest)

This is a self-contained, machine-readable digest of **`EML-LANG-2026-v1.0`**, the normative
language specification (the single source of truth). Normative wording uses MUST / MUST NOT /
SHOULD per RFC 2119. The full grammar is [`eml-grammar.ebnf`](./eml-grammar.ebnf); schemas are
[`eml-ast-schema.json`](./eml-ast-schema.json), [`eml-trace-schema.json`](./eml-trace-schema.json),
and [`eml-error-schema.json`](./eml-error-schema.json).

## 1. Purpose

EML is a deterministic **semantic-overlay** language layer for compactly expressing common
program intent. It compresses high-frequency intent into symbols and transpiles, rule-based and
reversibly, back to a standard language. The symbolic form is the machine-canonical artifact; the
editor projection and Unicode display are for humans. Canonical runtime: **Python 3.10+**.

## 2. Non-goals

- EML does **not** aim to replace Python or be a general-purpose language.
- EML does **not** allow arbitrary hidden execution.
- EML preserves deterministic parse, transpile, and trace behavior — these are invariants.

## 3. Core requirements (normative)

1. Every valid EML expression MUST be parseable into a normalized AST.
2. Transpilation MUST be deterministic.
3. Interpretation MUST produce structured output whose stdout equals CPython's for the supported
   subset (test-gated).
4. Trace generation MUST be serializable as `phosphor-jsonl-v1`.
5. Round-trip validation MUST reach a byte-identical fixpoint for the supported subset, or report a
   mismatch loudly.
6. Diagnostic codes MUST NOT change meaning across v1.x (additive only).

## 4. Core pipeline

```
EML source
  → normalize (Unicode display → ASCII canonical)
  → lex
  → parse → AST  (syntactic; OverlayAssign unresolved)
  → semantic     (resolve declare vs. augment; cold/hot; imports; loopKind)
  → emit → Python
  → interpret / run   → stdout
  → trace             → phosphor-jsonl-v1
  → round-trip        → fixpoint or mismatch
```

## 5. Lexical structure

- **ASCII canonical form is normative.** Unicode display forms (`Σ`, `∈`, `⇒`, `²`, `⟨M⟩`) are an
  informative projection; the lexer normalizes them to ASCII before tokenizing. Every program has
  an ASCII equivalent.
- Significant indentation applies inside function blocks (Phase 2+): increased indent = INDENT
  (enter block), decreased = DEDENT (leave block); blank/comment lines do not affect levels;
  inconsistent dedent is `E_LEX`.
- Comments begin with `#`.

## 6. Symbol catalog (normative)

The authoritative machine-readable table is `eml-symbols.json`; its meanings are frozen by v1.0
(changing one is a breaking change). `{t}` = target, `{v}`/`{expr}` = value/expression.

| Symbol | name | category | Python expansion | Notes |
| --- | --- | --- | --- | --- |
| `^0` | output | control | `print({value})` | operand is a bare identifier |
| `^+` | init_or_add_assign | assignment | `{t} = {v}` *or* `{t} += {v}` | two-stage rule, §7.1 |
| `^+=` | add_assign | assignment | `{t} += {v}` | **internal tag only**, not writable surface syntax |
| `^-` | sub_assign | assignment | `{t} -= {v}` | |
| `^*` | mul_assign | assignment | `{t} *= {v}` | |
| `^/` | div_assign | assignment | `{t} /= {v}` | true (float) division |
| `^T` | transpose | linear | `np.transpose({x})` | auto-imports numpy |
| `Σ` | summation | algebraic | `sum({e} for {i} in {range})` | |
| `∈` | in_range | range | `range({a}, {b}+1)` | display form of `in` |
| `[:]` | inclusive_range | range | `range({a}, {b}+1)` | upper bound inclusive |
| `=>` | bind | assignment | `{t} = {expr}` | |
| `?:` | conditional | conditional | `{c} if {t} else {a}` | |
| `<M>` | matrix | matrix | `np.array({data})` | auto-imports numpy |
| `list^+` | list_literal | list | `lst = [{elems}]` | `list`→`lst` alias |
| `def` | function_def | function | `def {n}({p}): …` | Phase 2 |
| `@cold` | cold_logic | temperature | `@functools.cache` | Phase 2 |
| `@hot` | hot_state | temperature | `# @hot` marker | Phase 2 |
| `@temporal_loop` | temporal_loop | temporal | `@temporal_loop(...)` runtime | Phase 3 |
| `await` | await | temporal | `await {expr}` | Phase 3 |

Two non-catalog constructs are normative: the **power operator** `i^<number≠0>` → `i ** <number>`
(float exponent permitted, e.g. `i^2.5` → `i**2.5`) and **`async def`** → `async def`.

## 7. Overlay semantics (normative)

### 7.1 `^+` — the two-stage rule

`x^+100` is disambiguated by the per-program symbol table: first binding of `x` → `x = 100`
(declare); a later `x^+10` → `x += 10` (augment).

### 7.2 `^-` `^*` `^/` — augmented assign

`x^-5` → `x -= 5`; `x^*2` → `x *= 2`; `x^/2` → `x /= 2`. On an undeclared target → warning
`W_AUG_UNDECLARED`.

### 7.3 `^0`, `^T`, `<M>`, `=>`, `f^+(...)`, ranges

`x^0` → `print(x)`. `m^T` → `np.transpose(m)`. `<M>(data)` → `np.array(data)`. `expr => y` →
`y = expr`. `f^+(x,y) => r` → `r = f(x, y)` (call-bind is an expression). `[a:b]` is inclusive →
`range(a, b+1)`; `i in [1:10]` → `i in range(1, 11)`.

## 8. Functions, cold/hot, temporal (Phase 2-3)

`def` with significant indentation; decorators `@cold` (→ `@functools.cache`, auto-imports
`functools`) / `@hot` (→ `# @hot` marker). Purity is checked interprocedurally
(`W_COLD_SIDE_EFFECT`). `@temporal_loop(max_wait=…, check_interval=…, timeout_action=…)` + `async
def` + `await temporal_wait(...)` injects a self-contained asyncio runtime. Loop classification
(`loopKind`): `algebraic_sum`, `basic_repeat`, `temporal`, `recursive`, with `deterministic` /
`terminating` flags.

## 9. Observability — `phosphor-jsonl-v1` (normative wire format)

EML emits compile/run/temporal/bug events under the frozen compatibility wire-format id
`phosphor-jsonl-v1` (one JSON object per line); EML has no runtime or theoretical dependency on any
external project. Envelope: `stream`, `proto`
(`"phosphor-jsonl-v1"`), `type` (`"domain:action"`), optional `seq`/`ts`/`mono`/`writer`, plus
arbitrary payload. Consumers MUST treat `seq`/`ts`/`mono`/`writer` as optional. Execution
vocabulary: `eml:compile:error`, `eml:run:start`, `eml:def`, `eml:assign`, `eml:augment`,
`eml:sum`, `eml:call`, `eml:return`, `eml:cache:hit`, `eml:cache:miss`, `eml:output`,
`eml:unsupported`, `eml:run:incomplete`, `eml:run:error`, `eml:run:done`, and (with `--run`)
`eml:equiv` / `eml:python:stdout` / `eml:python:exit`. Temporal: `eml:temporal:start|wait|
resolved|timeout|done`. Bug: `eml:bug`, `eml:bug:summary`. An anomaly is any event with
`ok === false`, a `:error`/`:fail` type, or a non-zero `code`.

## 10. Reverse transpilation & round-trip (normative)

The supported statement subset round-trips: `Python(subset) → EML → Python` is a fixpoint — this now
covers plain function definitions/`return`, `@cold`, `class`, and matrices (`<M>`/`np.array`), not
only the original Phase 0-1 subset. The reverse path is a deterministic inverse of the emitter and
**fails loudly** on inexpressible constructs. **Forward-only** (NOT part of the round-trip
invariant): `@hot` (permanent — the forward emitter renders it as a bare comment marker, not a
reconstructable decorator), `@temporal_loop`, `async`/`await` (the reverse transpiler does not
support them).

## 11. Back ends

- **Python (canonical, normative).** Execution target; CTS is the execution-truth layer.
- **C++20 (`--target cpp`, prototype, non-normative).** Proof that the same resolved AST can target
  a second back end. Fails loud (`E_CPP_UNSUPPORTED`) outside its subset.

## 12. Versioning & conformance

v1.0 freezes: the symbol catalog meanings, overlay semantics + Python expansions, the two-stage
`^+` rule, the `phosphor-jsonl-v1` envelope + event vocabulary, the diagnostic codes, and the
round-trip guarantee. Additive changes (new symbols/events/diagnostics) are **minor**; changing an
existing meaning or breaking round-trip is **major** (`EML-LANG-2027` / `v2.0`). A conforming
producer MUST transpile the grammar deterministically, apply §7 semantics, and emit §9 envelopes.

## 13. Diagnostics

See [`eml-error-schema.json`](./eml-error-schema.json) for the full enumerated codes. Errors block
transpilation (`ok=false`): `E_LEX`, `E_PARSE`, `E_INTERNAL`, `E_RANGE_NONINT`,
`E_ALIAS_COLLISION`, `E_RETURN_OUTSIDE_FN`, `E_CPP_UNSUPPORTED`. The bug classifier records five
severities: CRITICAL · MAJOR · MINOR · TRIVIAL · COSMETIC (CRITICAL/MAJOR map to `ok:false`).
