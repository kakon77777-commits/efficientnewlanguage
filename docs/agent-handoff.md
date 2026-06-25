# Agent Handoff — EML 2026 MVP

You are taking over the EML MVP. Read this before touching code. It encodes the
non-obvious decisions so you don't drift.

## The 6 rules (do not violate)

1. **Do not build Ultimate features first.** No full runtime, no C+++, no
   AI-driven Logic Crystallization, no auto-repair, no 12-loop runtime. Those
   are later phases. The MVP is a deterministic EML/Py+ → Python transpiler.
2. **Run `pnpm test` before and after any change.** 274 tests must stay green
   (the C++ compile+run test executes via a detected g++/clang++/MSVC toolchain,
   or auto-skips if none is installed — MSVC adds ~15s for vcvars; the
   interpreter≡Python gate auto-skips if no `python` is found).
3. **Do not break the `eml-symbols.json` format.** It is a public, stable asset
   at repo root. Add symbols; don't restructure existing ones.
4. **Python→EML is suggestion-only.** Never auto-overwrite source; any reverse
   compression must pass a round-trip validator (not yet built — Phase 1).
5. **Every change ships with a test.** New syntax → a statement-mapping case
   and/or a golden fixture. New rule → an AST/Python assertion.
6. **PHOSPHOR CTS is the execution-truth layer, not decoration.** Keep `eml cts`
   output conformant to whitepaper Appendix C.

## What works today (Phase 0, complete)

The full pipeline is implemented and verified:

```
EML/Py+ → normalize → lex → parse → AST → semantic analyze → emit Python → format
```

- CLI: `parse`, `ast`, `transpile`, `run`, `cts`, `check`, `explain`, `test`.
- `eml run examples/phase0/sum.eml` → `338350`.
- 14 golden fixtures + 14 documented statement mappings + runtime/AST/CTS tests.

## Architecture & package boundaries

Internal packages (pnpm workspace, run-from-source TypeScript, no build step):

| Package | Responsibility |
|---|---|
| `@eml/types` | Shared contracts: tokens, AST, symbol table, CTS, diagnostics, TranspileResult. **No logic.** |
| `@eml/parser` | `normalizer` → `lexer` → `parser`. Produces the syntactic AST. |
| `@eml/transpiler-python` | `semantic` (resolves overlays, imports, function scope), `emitter`, `formatter`, the `transpileEmlToPython` orchestrator, plus the Phase 2 analyses: `purity`, `crystallize` (AST-hash cache), `importance`. |
| `@eml/transpiler-eml` | Reverse: Python-subset `py-lexer`/`py-parser` → shared AST → `eml-emitter`. Plus `transpilePythonToEml` and the round-trip validators. |
| `@eml/transpiler-cpp` | Phase 4: EML/C⁺⁺⁺ → C++ prototype (`transpileEmlToCpp`). Reuses the shared pipeline; only the emitter differs. Proves "one AST, many backends". Fails loud (E_CPP_UNSUPPORTED) on the unsupported subset. |
| `@eml/ai-converter` | Phase 1 AI-assisted Python→EML. Deterministic-first; LLM (pluggable `LlmClient`, `ClaudeClient` adapter) only for non-subset Python; **every suggestion gated by the execution-based round-trip validator**; never writes source. |
| `@eml/symbols` | Loads the canonical `eml-symbols.json` from repo root. |
| `@eml/cts-generator` | AST + symbols → PHOSPHOR CTS. |
| `@eml/trace` | Phase 3: self-contained `phosphor-jsonl-v1` event emitter (PHOSPHOR-compatible trace). Browser-safe core; node file sink at `@eml/trace/node`. Zero deps. |
| `@eml/bug-classifier` | Phase 3: BUG 5-level classifier mapping compile + runtime errors back to EML source / CTS node / Python. Deps: types, trace. |
| `@eml/interp` | Phase 5: browser-safe **execution-truth interpreter** over the resolved AST. Python-faithful value model (bigint ints, true division, `@functools.cache` semantics for `@cold`); emits `phosphor-jsonl-v1` as it runs. Defers numpy/temporal as `unsupported` (no fabricated output). Deps: types, transpiler-python, trace. |
| `@eml/cli` | The `eml` command. |

Dependency direction (no cycles): `types ← parser ← transpiler-python ← {cts-generator, cli}`, `symbols ← {cts-generator, cli}`.

## AI converter (Phase 1) — LLM proposes, validator disposes

`@eml/ai-converter` honors rule 4 strictly:
- **Deterministic-first.** If `transpilePythonToEml` succeeds, that exact inverse
  is the suggestion — no LLM call.
- **LLM only for non-subset Python** (e.g. an accumulation loop → `Σ`), behind a
  `LlmClient` interface. `ClaudeClient` uses `@anthropic-ai/sdk`,
  `claude-opus-4-8`, adaptive thinking, structured output. Needs
  `ANTHROPIC_API_KEY`; absent it, the CLI falls back to deterministic-only.
- **Every AI suggestion is execution-validated** (`validateEquivalence`): compile
  the suggested EML → Python, run original vs compiled and compare the target.
  CRITICAL hardening (from the Phase 1 review): the validator does **NOT** trust
  the LLM's own test inputs (conflict of interest). For numeric free variables it
  generates its OWN diverse, non-degenerate inputs (≥2, non-empty ranges) and
  requires them to discriminate (≥2 distinct outputs) before certifying — so a
  wrong suggestion can't hide behind `n=1` or an empty range `n=0`. Execution is
  sandboxed-ish: timeout, output cap, pinned `PYTHONHASHSEED`, isolated sentinel
  probe. Note: LLM-supplied binding/Python code is still executed locally — run
  `eml suggest` only with a trusted key.
- **Never writes source.** `eml suggest --out f` writes EML to a NEW file and
  refuses if `--out` resolves to the source path.

Tests use a mock `LlmClient` (`tests/ai-converter.test.ts`) — no live key needed.

## Reverse direction & round-trip (the validator)

`@eml/transpiler-eml` is the deterministic inverse of the emitter for the
supported subset — NOT an LLM, NOT arbitrary-Python compression (that stays a
later AI-assisted, suggestion-only layer). Both directions share `@eml/types`,
so round-trip is a **fixpoint check**: `roundTripFromEml` asserts
EML→Py→EML→Py gives `python1 === python2`. Keep it green.

Reverse-direction rules (tests in `tests/bidirectional.test.ts` and
`tests/reverse-regression.test.ts`). **The reverse path fails loudly** —
`transpilePythonToEml` returns `ok:false` rather than emit EML the forward
parser would reject. Inexpressible-in-EML constructs that are rejected:
- **Power with a non-numeric or zero exponent** (`a**b`, `x**0`) — EML power is
  `^<non-zero number>` only.
- **`print(<compound>)`** — `^0` attaches to a bare identifier; `print(a+b)` has
  no EML form.
- **Augmented assign with a compound RHS** (`x += a + b`) — the overlay value is
  a single primary.
- **Standalone `+=` on an undeclared name** — `x^+` resolves to a declaration,
  so a leading `+=` cannot be encoded (real programs with a prior binding are
  fine). `-=`/`*=`/`/=` have no such ambiguity and reverse freely.

Things that now DO round-trip cleanly (don't regress):
- **Negative number literals** (`x = -5`, `a * -1`) — both parsers fold a
  leading `-NUMBER` into a negative `NumberLiteral`. General unary minus
  (`-x`, `-(a+b)`) is still rejected.
- **`range(1, n)`** — the forward `emitRangeEnd` folds an inclusive `X-1` end
  back to `range(start, X)`, so non-`X+1` ends are string-stable too.
- **String escapes** (`"a\nb"`) — both lexers decode `\n \t \r \\ \" \' \0`, so
  the round-trip validator can no longer be fooled by symmetric escape loss.

One-way by design: **`list`→`lst`** (reverse of `lst = [...]` is `lst^+[...]`,
not `list^+[...]`; Python fixpoint still holds).

## Phase 2 — functions, cold/hot, crystallization, importance (complete)

EML gained **function definitions** (the prerequisite for `@cold`/`@hot`, which
attach to functions per whitepaper §7.1). Syntax is Python-style: optional
`@decorator` lines, `def name(params):`, an **indented block**, and `return`.

- **Significant indentation.** The lexer now emits `INDENT`/`DEDENT` (Python
  algorithm: indent stack starting at 0, blank/comment lines don't count,
  trailing dedents flushed at EOF). Top-level statements are at indent 0, so the
  whole pre-Phase-2 corpus is unaffected. Inconsistent dedent → `E_LEX`.
- **Block statements need no trailing NEWLINE.** A `def` block consumes its own
  DEDENT, so `expectStatementEnd()` also accepts DEDENT / a just-consumed DEDENT.
- **Temperature is resolved by the parser** into `FunctionDef.temperature`
  (`cold` wins if both decorators present). The emitter maps `@cold` →
  `@functools.cache` (+ auto `import functools`) and `@hot` → a `# @hot` marker
  comment (no caching). Unknown decorators → `# @name` comment.
- **Function scope.** `analyzeSemantics` analyzes each body in a fresh scope
  seeded with the parameters; locals/params do **not** leak to module
  `declaredNames`. The function name is declared in the enclosing scope.
- **Purity checker** (`purity.ts`): a `@cold` body containing I/O (`print`,
  `open`, `input`, `requests`, `eval`, `exec`, or a `^0` output) → warning
  `W_COLD_SIDE_EFFECT` (does not block transpile; `@hot` is exempt by design).
- **Crystallization** (`crystallize.ts`): `hashFunction` = FNV-1a over a
  span-stripped, key-sorted canonical of `{params, body}` — **name-independent**,
  so identical logic shares a hash. `CrystalCache` records seen cold-logic
  hashes; a repeat is `cached: true`. **Output Python is never altered by cache
  state** (the cache only annotates metadata). Pass `crystalCache` in options to
  share a cache across calls (editor); default is a fresh per-call cache, so
  golden/runtime tests stay deterministic.
- **Importance** (`importance.ts`): `score = 0.4·squash(callFrequency) +
  0.4·riskLevel + 0.2·squash(depth-1)` where `squash(x)=1-1/(1+x)`. riskLevel:
  hot 0.8, cold-pure 0.2, cold-impure 0.6, neutral 0.5. Reported (raw components
  + score) in `metadata.functions` and `cts.functions`.
- **Reverse is forward-only here.** `transpile-eml` throws `EmlEmitError` on
  `FunctionDef`/`Return`; the bidirectional fixpoint tests skip fixtures
  containing `def` (see `roundTrippable` in `tests/bidirectional.test.ts`).
- **Success criteria met:** `@cold` is cacheable (cache hit demonstrated), cold
  side effects warn, importance is emitted to CTS. Demo:
  `eml explain examples/phase2-cold-hot/square_sum.eml` shows the function panel;
  `eml run …` prints `338350`.

### Phase 2 polish + adversarial review (don't regress these)

A 25-agent adversarial review found 15 confirmed defects — all fixed:
- **Purity is interprocedural** (`semantic.ts` taint post-pass). A `@cold` function
  is tainted (→ `W_COLD_SIDE_EFFECT`, `pure:false`) if it is intrinsically impure
  OR transitively calls a `@hot` or impure function. The denylist now includes
  non-determinism (`time`/`random`/…). `checkPurity(fn, userFns)` skips
  user-defined names (a user fn shadows a same-named builtin) — purity is computed
  in the post-pass once all names are known. **Do not revert to per-function-only
  purity** — that silently cached impure logic.
- **A function named after a builtin alias (`list`) is rejected** with
  `E_ALIAS_COLLISION` (the emitter would rename the `def` but leave calls binding
  to the builtin). Duplicate function names warn (`W_FN_REDECLARED`).
- **Importance depth is order-independent** (`importance.ts`): per-root DFS, NO
  shared memo (the old memo leaked cycle cuts → results depended on def order).
  Call counting is scope-aware (a call shadowed by a param isn't attributed to a
  module function). `computeImportance` returns results aligned to the `fns`
  array (index-keyed), so same-named functions don't collide.
- **Crystal cache persistence (CLI):** `--cache[=path]` is opt-in; path must end
  `.json` (Iron rule 4 — never clobber source); `save()` is best-effort. Only
  `eml crystallize` commits; `transpile/run/cts/explain` preview read-only (they
  load the cache for `cached` flags but never write it). `--cache` is a boolean
  flag in `parseArgs` (won't swallow the file positional); `--key=value` is parsed.
- **Editor** persists via localStorage and treats the cache as read-only during
  editing (the `結晶化` button is the only committer) — keep that invariant.
- Known limitation (documented, not a bug): importance for *nested same-named*
  functions uses name-union semantics (approximate); module-level names are exact.

## Phase 4b — C⁺⁺⁺ prototype (done; Phase 4 complete)

`@eml/transpiler-cpp` (`transpileEmlToCpp`) emits standalone C++ from the SAME
resolved AST that targets Python — only the emitter differs (the whitepaper's
"semantic overlay → many backends" premise, validated). It is a PROTOTYPE
(whitepaper §3.18 "不做完整 C⁺⁺⁺", §571), not a backend. CLI:
`eml transpile <f> --target cpp`. Notes / feasibility: `docs/cpp-feasibility.md`.

- Mappings: `Σ`→an IIFE `[&]{…for…}()` real loop (+`eml_pow`), `def`→`auto f(auto x)`
  (C++20), `x^+n`→`auto`/`+=`, `x^0`→`std::cout`, ternary, `i in [a:b]`→a
  **single-eval IIFE** `[&]{ auto __m=…; return (__m>=a && __m<=b); }()`,
  `list^+[…]`→`std::vector<long long>{…}` (integer literals only).
- **Fail-loud contract** (E_CPP_UNSUPPORTED, never emit non-compiling C++): numpy
  (`<M>`/`^T`), async (`await`/`@temporal_loop`), **recursion** (auto-return can't
  recurse), **non-integer / output of lists**, **duplicate `def` names** (C++ has
  no rebinding). `@cold`/`@hot` become comments. If you add a C++ construct, keep
  the fail-loud net complete — the review found 8 gaps where it emitted broken C++.
- No C++ compiler is required to build/test EML; `tests/transpiler-cpp.test.ts`
  golden-matches the emitted C++ and has a compile+run test that auto-detects a
  toolchain — g++/clang++ on PATH, or **MSVC `cl` via vswhere/vcvars64.bat** — and
  compiles+runs the 3 demos (verified: 338350 / 338350 / "1\n1"), skipping only if
  none is installed. All demos compile clean under MSVC `cl /std:c++20 /EHsc`.
- Reviewed (11-agent pass, 8 findings → all fixed).

## Phase 4a — loopKind metadata (done)

`loop-classifier.ts` (`classifyLoops`) statically tags loop-like constructs
(whitepaper §8.4, MVP de-scaling — analysis, not a runtime): `Σ`→`algebraic_sum`,
`i in [a:b]`→`basic_repeat`, `@temporal_loop` fn→`temporal`, self/cyclic-recursive
fn→`recursive`, each with coarse `deterministic`/`terminating` flags. Threaded
into `SemanticResult.loops` → `metadata.loops` (source filled from spans in the
orchestrator) → `cts.loops` → `eml explain`/`eml cts`.
- **Recursion is judged per-record, NOT by name.** Same-named functions
  (W_FN_REDECLARED) must not collide: the search is seeded from each record's own
  callees over a union name-adjacency (see the Phase-2 precedent that importance
  is index-aligned). Keying recursion by bare name caused false pos/neg — don't
  reintroduce it.
- **Loop `source` skips decorator lines** (a FunctionDef span starts at its first
  `@`), so it shows the `def`/`async def` header, not `@temporal_loop`/`@cold`.
- Completion criterion met (≥3 loopKinds; 4 implemented). Reviewed (7-agent pass,
  3 findings → 2 distinct bugs, both fixed).

## Phase 3b — @temporal_loop runtime (complete; Phase 3 done)

`@temporal_loop` adds three language constructs + a self-contained Python runtime
(whitepaper §8.2: a MINIMAL asyncio wrapper, not a state machine):
- **Decorator keyword args** (`@temporal_loop(max_wait=N, check_interval=M,
  timeout_action="raise"|"return")`) — parser supports `@name(args)` with keyword
  or positional args; **a positional arg after a keyword arg is a parse error**
  (mirrors Python). `Decorator.args?: DecoratorArg[]`.
- **`async def`** (`FunctionDef.isAsync`) and an **`Await` expression**. `await`
  binds at primary level: the emitter parenthesizes a non-atomic argument
  (`await (a + b)`), via `child(expr.argument, 6)`. Any new Expression walker MUST
  handle `Await` — purity (`scanExpression` + `collectCallsExpr`), importance
  (`walkExpr`), CTS (`collectIdents`), semantic (`collectExpr`) all recurse it.
- **Runtime preamble** (`temporal-runtime.ts`, injected only when `usesTemporal`):
  `DelayedDecisionQueue`, `temporal_loop`, `temporal_wait`, `run_temporal`,
  `_eml_trace`. `temporal_wait` polls at `check_interval` via `asyncio.sleep`
  (no busy-wait); the sleep is `min(interval, remaining)` so **max_wait is a hard
  upper bound**, and a non-positive `check_interval` is floored (no spin). Emits
  `eml:temporal:start/wait/resolved/timeout/done` phosphor-jsonl-v1 to stderr.
  `run_temporal(fn, args…)` (= asyncio.run) drives an async fn at top level so
  `eml run` stays demonstrable.
- **Cold + async is rejected for caching**: `@functools.cache` over an `async def`
  memoizes the coroutine (crashes on reuse), so the emitter skips the cache for
  async and the analyzer warns `W_COLD_ASYNC`. Decorator validation:
  `W_TEMPORAL_NOT_ASYNC` (temporal without async), `W_TEMPORAL_ARG` (unknown arg).
- Forward-only: reverse Python→EML throws on `Await`/async (round-trip tests skip
  `def` fixtures, which also matches `async def`).
- Demo: `eml run examples/phase3-temporal/wait.eml` → `99` (resolve) / `None`
  (timeout); stderr shows the temporal trace. Reviewed by a 17-agent adversarial
  pass; 11 confirmed findings all fixed (await precedence, Await missing from 3
  walkers, cold+async coroutine cache, max_wait overshoot, check_interval=0 spin,
  positional-after-keyword arg, runtime-timeout node mapping).

This closes Phase 3 (all four deliverables: temporal-loop-runtime,
DelayedDecisionQueue, bug-classifier-v1, PHOSPHOR trace integration).

## Phase 3a — PHOSPHOR trace + BUG classifier (complete)

The Phase 3 integration point with PHOSPHOR is the **trace**, not the VM: EML
emits Python, while PHOSPHOR's `eml-vm16/64` run bytecode, so running EML on the
PHOSPHOR VM is a Phase 4+ codegen concern. Instead EML produces PHOSPHOR's
portable `phosphor-jsonl-v1` event format — decoupled (no runtime dependency on
PHOSPHOR; it/NOEMA can consume an EML trace, but nothing is wired).

- **`@eml/trace`** is an independent minimal re-implementation of PHOSPHOR's
  `stream/phosphor-stream.ts` standard (NOT a copy; PHOSPHOR is Apache-2.0 but we
  keep EML self-contained). `createEmitter({stream, writer?, sink?, now?})` →
  `emit(type, fields)` + `check(type, actual, expected)` (the intent-vs-actual
  bug-signal primitive). `emit()` never throws. Core is browser-safe; the node
  `fileSink` is at `@eml/trace/node`. `deepEqual` (backing `check`) must never
  declare unequal values equal — it handles Date/Map/Set/RegExp/NaN/array-vs-object
  and rejects class instances (a false "equal" would silently drop a bug signal).
- **`@eml/bug-classifier`** classifies into CRITICAL/MAJOR/MINOR/TRIVIAL/COSMETIC
  (whitepaper §8.3), RECORDS only (never auto-fixes). `classifyBugs` maps each
  compile diagnostic to its level + EML location (span) + CTS node + Python
  expansion + fix direction. `classifyPythonError` maps a runtime traceback:
  requires a real traceback (header or `File` frame — a bare stderr line is not a
  crash); reads the exception line as the first flush-left line after the last
  frame (any identifier, not just `*Error`); picks the failing line from the
  deepest frame **whose file is the emitted `pyFile`** (not a stdlib frame); maps
  that line to a node by **line ownership** (last node starting at/before the
  line — robust to duplicate emitted lines), not by ambiguous text. `emitBugReport`
  emits `eml:bug` (CRITICAL/MAJOR carry `ok:false`) + `eml:bug:summary`.
- **CLI:** `eml bugs <file> [--run] [--trace=f.jsonl] [--json]`. `--run` executes
  the Python and classifies a crash (warns if no interpreter); `--trace` writes a
  `phosphor-jsonl-v1` file (notice goes to **stderr** so `--json` stdout stays
  pure JSON). Exit code 1 when worst ∈ {CRITICAL, MAJOR}.
- **Diagnostic spans:** the parser only spans *statements*. A diagnostic raised on
  an expression node (e.g. `E_RANGE_NONINT` on a `NumberLiteral`) has no span, so
  `analyzeSemantics` falls back to the current statement span (`currentSpan`) —
  keep that fallback or the classifier can't locate expression-level errors.
- Satisfies Phase 3's "錯誤可分類並映射回 EML source" (compile + runtime).
  Reviewed by a 17-agent adversarial pass; 12 confirmed findings all fixed
  (deepEqual soundness, E_RANGE_NONINT mapping, runtime traceback parsing,
  stdlib-frame/duplicate-line mapping, `--json`/`--trace` stdout purity).

## Phase 5 — unified entry + open-source release (complete)

Phase 5 turns the toolchain into a releasable workbench and adds the **execution-truth**
layer the whitepaper's §13.1 vision needs ("open → type EML → see Python → **execute** →
**trace** → explain"), all browser-safe.

- **`@eml/interp` — the execution-truth interpreter.** The Cogni-Editor cannot launch Python,
  so to *run* a program in-browser we interpret the resolved AST with a Python-faithful value
  model (`values.ts`: bigint ints for arbitrary precision, `/` is true division → float,
  `int ** nonNegInt` stays int, `str()` vs `repr()` formatting). It emits `phosphor-jsonl-v1`
  events as it executes. **This is gated, not asserted:** `tests/interp.test.ts` runs every
  runnable example + 17 cases through BOTH the interpreter and a real `python` and fails on any
  stdout divergence. numpy (`<M>`/`^T`) and temporal (`async`/`await`/`@temporal_loop`) are
  reported as `unsupported` — the interpreter MUST NOT fabricate output for them.
  **`@cold` caching is emulated** (memoized by repr(args)) so prints inside a cold body don't
  repeat on a cache hit — matching `@functools.cache` exactly.
- **Lexical closures (nested defs).** Functions are first-class `{k:'func', def, closure}` values
  bound in their DEFINING scope (not a global map); a call frame's parent is the captured closure,
  so a nested `def` closes over its enclosing locals and does not leak to module scope. Mutual /
  self recursion works (names are bound before the first call). UnboundLocalError is enforced via a
  static-local pre-scan (`localNames`, which also counts nested `def` names). An unbound callee is a
  `NameError` (CPython), except the temporal intrinsics `run_temporal`/`temporal_wait`, which stay
  `unsupported` so the temporal demo defers. A non-function callee raises `TypeError`.
- **`eml trace <file> [--out f] [--run] [--deterministic]`.** Produces a phosphor-jsonl-v1 trace
  via the interpreter. With `--run` and a Python present: bakes an `eml:equiv` check (interpreter
  stdout vs real Python stdout) into the artifact — a **self-validating trace**; for temporal/
  numpy programs it instead splices the real `eml:temporal:*` events from Python's stderr.
  `--deterministic` uses a fixed clock for byte-reproducible artifacts.
- **Per-example trace artifacts.** Each `examples/**/<name>.eml` ships a committed
  `<name>.trace.jsonl` (deterministic, interp-only, portable). `tests/examples.test.ts` (a) loads
  every demo FILE and asserts it transpiles clean (closing the old "demo files were only tested as
  inline strings" gap) and (b) regenerates the trace and byte-compares it (golden).
- **Cogni-Editor Trace tab** (default tab): runs `interpretProgram(result.ast)` and shows the real
  stdout + the phosphor-jsonl-v1 timeline (anomalies highlighted, `copy JSONL`). This IS the
  "PHOSPHOR minimal integration" deliverable. Py→EML direction shows a neutral note (forward-only).
- **`EML-LANG-2026-v1.0.md`** is the single normative language spec (consolidates grammar.md /
  transpiler-spec.md / whitepaper §4; both v0.1 docs now carry a "superseded by v1.0" banner). It
  freezes the symbol catalog, overlay semantics, the phosphor-jsonl-v1 envelope+vocabulary, the
  diagnostic codes, and the round-trip invariant (§11 versioning policy).
- **Launcher** (`scripts/launch.mjs`, `eml-studio.cmd`/`.sh`): `bugs` and `trace` added to the
  forwarded `CLI_COMMANDS`. Still run-from-source (no .exe); a true SEA binary is an optional future.
- **NOT git-committed.** Per the maintainer's standing rule the repo stays uncommitted until a
  coordinated website launch; the patented prototype means premature public history is undesirable.
  Keep everything verified + commit-ready, but do not commit. The LICENSE remains a deliberate
  placeholder until the OSS-license/patent/commercial terms are decided.

## Non-obvious design decisions (the gotchas)

### 1. Two-stage AST: `OverlayAssign` is resolved by semantics
The parser cannot know whether `x^+100` is `x = 100` or `x += 100` — it depends
on whether `x` was declared earlier. So the parser emits a neutral
`OverlayAssign` node; `analyzeSemantics()` rewrites it into `Assignment`
(first occurrence) or `AugmentedAssign` (already declared). **The emitter never
sees `OverlayAssign`** — it throws if it does. Run semantics before emitting.

### 2. `^` is overloaded — disambiguated by what follows
- `^0` → output (`print`)
- `^T` → transpose (`np.transpose`)
- `^{+,-,*,/}` → augmented assign / call / list (statement-level)
- `^{number ≥ 1}` → power (`i^2` → `i**2`), an expression
- `^+(` → function call (`f^+(x,y)`); `^+[` → list assign (`list^+[...]`)

`classifyOverlay()` in `parser.ts` does this with up to 3 tokens of lookahead.
If you add `^`-forms, update it there.

### 3. `list` → `lst` identifier alias
`list^+[1,2,3]` → `lst = [1, 2, 3]` per spec. The emitter applies
`IDENTIFIER_ALIASES = { list: 'lst' }` to avoid shadowing the Python builtin.
This alias is **global** in the emitter (any identifier named `list` becomes
`lst`). If you extend it, do so deliberately and add a test.

### 4. Canonical Python formatting (string-exact)
Golden tests compare exact strings. The canon is:
- Power: **no spaces** → `i**2` (not `i ** 2`).
- Range inclusive end: **no space** around the `+1` → `range(1, N+1)`; literal
  ends are folded → `[1:10]` becomes `range(1, 11)`.
- Binary/comparison: single spaces → `x > 40`, `a + b`.
If you change the emitter's spacing, regenerate the affected `.expected.py`.

### 5. numpy imports are auto-collected
`<M>(...)` and `^T` add `import numpy as np`. Full-program emit
(`eml transpile`/`run`) prepends imports; the body-only `transpileLine`
(used by the statement-mapping tests) does not. That's why
`m^T` → `np.transpose(m)` in the unit test but a full program adds the import.

## Known edge behaviors (post-review hardening)

These were tightened after an adversarial review; tests live in
`tests/regression.test.ts`. Don't regress them:

- **Emitter parenthesizes by precedence.** Right operand of `-`/`/`, the base of
  `**` (right-assoc), nested conditionals (test/consequent), and low-precedence
  range ends all get parens. `a - (b - c)` stays `a - (b - c)`, not `a - b - c`.
- **`^0` is reserved for output**, exactly the literal `0`. `x^0` → `print(x)`;
  `x^00`/`x^0.0` are parse errors (not output). Power-to-zero (`2^0`) is **not**
  supported as an expression — `^<n≥1>` only. Use a different form if you need it.
- **Non-integer range bounds error** (`E_RANGE_NONINT`) — Python `range()` is int-only.
- **`list`→`lst` alias** applies to bindings/reads but **not** call callees
  (`list(1)` stays `list(1)`). Declaring both `list` and `lst` is an
  `E_ALIAS_COLLISION` error. CTS dependencies/crossRef and `declaredNames` report
  the emitted (aliased) name.
- **`eml run` resolves the interpreter** via `$EML_PYTHON`, else `python`/`py`/`python3`.

## The two test layers (keep both)

1. **`tests/statement-mapping.test.ts`** — the 14 documented `input → output`
   rows, body-only, exact strings. This is the authoritative "14 cases."
   Cases 07–09 pass `{ declared: ['x'] }` so `x^+n` resolves to `+=`.
2. **`tests/fixtures/*` + `tests/golden.test.ts` + `eml test`** — full runnable
   programs with `.expected.py`. Plus `tests/runtime.test.ts` actually executes
   the generated Python (needs `python` + `numpy` on PATH).

## Toolchain notes

- pnpm workspace; `@eml/*` resolve via node_modules symlinks → each package's
  `exports` points at `./src/index.ts` (run-from-source via tsx/vitest; tsc for
  typecheck). **No compile step.**
- Root-level tests import `@eml/*`, so the **root `package.json` lists them as
  `devDependencies` (`workspace:*`)** — otherwise vitest can't resolve them.
- `eml-symbols.json` is read via `fs` + `import.meta.url` (browser-unsafe). Keep
  parser + transpiler-python free of node-only imports so they run in the
  browser (the Cogni-Editor depends on this).

## Where to go next (later phases)

- Phase 1 (done): Cogni-Editor minimal dual-state view, AI Python→EML
  suggestions + round-trip validator, Nova IME.
- Phase 2 (done): function defs, `@cold`/`@hot` annotations, pure-function
  checker, rule-based crystallization (AST-hash cache), importance analyzer →
  CTS. Next within Phase 2 if desired: surface cold/hot + importance in the
  Cogni-Editor; persist the crystal cache across runs.
- Phase 3 (COMPLETE): BUG 5-level classifier + PHOSPHOR `phosphor-jsonl-v1` trace
  (`@eml/trace`, `@eml/bug-classifier`, `eml bugs`) + `@temporal_loop` runtime
  (decorator args, async/await, asyncio temporal runtime, DelayedDecisionQueue).
- Phase 4 (COMPLETE): loopKind metadata (`loop-classifier.ts`) + C⁺⁺⁺ prototype
  (`@eml/transpiler-cpp`, 3 demos, `docs/cpp-feasibility.md`).
- Phase 5 (COMPLETE): execution-truth interpreter (`@eml/interp`) + `eml trace` +
  per-example trace artifacts + Cogni-Editor Trace tab (the "PHOSPHOR minimal
  integration") + `EML-LANG-2026-v1.0.md` normative spec + release-doc polish.
  Unified entry via `eml-studio` (run-from-source; a true .exe/SEA stays optional).
- Beyond v1.0 (open, not started): finalize the OSS license + first git commit
  timed with the website launch; a true double-clickable binary (Node SEA); deeper
  PHOSPHOR integration (EML→bytecode codegen for the `eml-vm16/64` VM); full
  Cogni-Editor IDE; broadening the C⁺⁺⁺ subset.
