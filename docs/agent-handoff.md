# Agent Handoff — EML 2026 MVP

You are taking over the EML MVP. Read this before touching code. It encodes the
non-obvious decisions so you don't drift.

## The 7 rules (do not violate)

1. **Do not build Ultimate features first.** No full runtime, no C+++, no
   AI-driven Logic Crystallization, no auto-repair, no 12-loop runtime. Those
   are later phases. The MVP is a deterministic EML/Py+ → Python transpiler.
2. **Run `pnpm test` before and after any change.** 538 tests must stay green
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
7. **Keep `docs/PROGRESS.md` in sync.** It's the living progress-spectrum
   dashboard (separate from `docs/roadmap.md`, which is the "what/why" plan).
   Update its spectrum table + append a work-log entry every time a milestone
   completes or its scope changes — don't let it go stale.

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

**Since Phase A (2026-07-16)**, the reverse path is no longer purely flat/statement-level —
`if`/`elif`/`else`, `while`, and `for...in` now round-trip too, via a real INDENT/DEDENT/`COLON`-
aware suite parser. See the dedicated "Phase 8 — reverse Python→EML, Phase A" section below for the
lexer/parser/emitter design and a real correctness bug it surfaced.

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

## Phase 6 — control flow: if/elif/else, while, for...in (complete)

Phase 6 closes the biggest gap to "EML can express a real, general-purpose
program": the statement grammar previously had no branching or looping at all
(only `Σ`/range-membership as algebraic loop forms). Dict/set literals,
`try/except`, `class`, user `import`, and `break`/`continue` remained
explicitly out of scope this round — all five landed in Phase 7 below.

- **`IfStatement`/`WhileStatement`/`ForInStatement`** added to the AST
  (`packages/types/src/ast.ts`). `elif` is modeled as a single-element `orelse`
  holding another `IfStatement` (mirrors Python's own `ast.If` chaining) rather
  than a separate `elifs` array — every traversal site gets one uniform
  "recurse into body, recurse into orelse" rule.
- **Parser**: `parseIf`/`parseWhile`/`parseForIn` reuse the existing
  `parseBlock()`/`expectStatementEnd()` machinery (INDENT/DEDENT were already
  general-purpose, just previously wired up only for `def`). No `while`/`for`-
  `else`, no tuple-unpacking `for` targets.
- **Semantic pass — the one genuinely subtle piece:** `if`/`elif`/`else`
  branches are mutually exclusive, so each branch resolves `x^+n`-style
  declarations against its OWN scope clone, then unions newly-declared names
  back into the parent scope afterward. Resolving branches against one shared
  live scope would make a name declared in the first-processed branch look
  "already declared" to its sibling — wrongly turning that sibling's `x^+n`
  into `x += n`, which raises a real `NameError` at runtime if the sibling
  branch is the one that actually executes. `while`/`for` do NOT get this
  treatment (0+ executions, not mutually-exclusive alternatives — they resolve
  against the same live scope, same as straight-line code).
- **Cold/hot soundness**: `purity.ts`/`importance.ts`/`loop-classifier.ts` all
  needed new recursion into `if`/`while`/`for` bodies — these are `void`-
  returning traversals with **no compiler-enforced exhaustiveness**, so a side
  effect hidden inside a branch or loop body would otherwise be invisible to
  the `@cold` purity checker and silently mis-cached via `@functools.cache`.
- **`@eml/interp`**: real branching/looping execution, reusing the parent
  `Scope` directly (no new child scope) for `if`/`while`/`for` bodies — this is
  also why `return` unwinds correctly out of arbitrarily nested control flow
  with zero new plumbing (`ReturnSignal` is a thrown JS exception caught at the
  function-call boundary). `while`/`for` iterations call `tick()` to stay
  bounded by `maxSteps`, same role as `rangeInts`/`evalSum`. `localNames()`
  became recursive (a name assigned inside a nested `if`/`while`/`for` is still
  a function-wide local in Python, including a `for`-loop's own target, which
  stays bound at its last value after the loop ends).
- **C++ and reverse (Python→EML)**: fail-loud only this round — `emitCppStatement`
  and `emitEmlStatement` throw for `If`/`While`/`ForIn`, matching the existing
  precedent for other forward-only constructs. `py-parser.ts` (the reverse
  Python-subset parser) needed zero changes — it already fails loudly on
  `if`/`while`/`for` by omission.
- Tests: `tests/phase6-control-flow.test.ts` (parser/semantic/emitter/purity/
  loop-classifier/CTS/interpreter sections) + golden fixtures `16`–`20` +
  7 new interpreter execution-truth cases + 3 new examples under
  `examples/phase6-control-flow/`.

## Phase 7 — grammar completion: break/continue, dict/set/subscript, attribute/import, try/except/raise, class (complete)

The user's own framing: keep expanding the grammar "until EML can truly write
general-purpose programs." Five sub-phases (7a–7e), each a complete vertical
slice (AST/tokens/lexer/parser → Python emission/semantic/purity/importance/
loop-classifier/CTS → interpreter → tests), gated by `pnpm typecheck` +
`pnpm test` green before the next sub-phase started. C++ and reverse
Python→EML get fail-loud-only treatment throughout (matches Phase 6
precedent — no real support attempted there this round).

**The central architectural decision (applies across 7b/7c):** EML has no
native `target = value` syntax — bare `=` (`EQ`) is already claimed as
equality, consumed inside `parseComparison()`. Rather than a new grammar,
the existing `=>` arrow idiom (`f(x) => y`) widens its *target* side from "one
bare `IDENT`" to a chain `IDENT ('[' Expression ']' | '.' IDENT)*`, so
`v => d[k]` / `v => self.x` compose naturally. For *target-first* compound
assignment (`d[k] += v`), new tokens `PLUSEQ`/`MINUSEQ`/`STAREQ`/`SLASHEQ`
were added (zero collision — unclaimed 2-char sequences). `AssignTarget =
Identifier | SubscriptExpression | AttributeExpression` widened incrementally
(Subscript in 7b, Attribute in 7c), forcing a small, independently-testable
diff at each compiler-enforced switch (`emitter.ts`, `semantic.ts`'s
`resolve()`, `eml-emitter.ts`, `transpiler-cpp/emitter.ts`) rather than one
big-bang union. `OverlayAssign.target` and `ForInStatement.target` stay
`Identifier`-only by design (no declare/augment ambiguity to resolve for a
subscript/attribute target, and no tuple/subscript for-targets requested).

### 7a — `break` / `continue`

- Two leaf statements, no fields beyond `NodeBase`. Enforcement mirrors the
  existing `return`-outside-function pattern: the parser accepts both
  unconditionally, and `semantic.ts` threads a new `inLoop: boolean` alongside
  `inFunction`, producing `E_BREAK_OUTSIDE_LOOP`/`E_CONTINUE_OUTSIDE_LOOP`
  when false. `while`/`for` set `inLoop = true` for their own body; `if`
  passes it through unchanged; a `def` boundary resets it to false (a nested
  function's own `break` must not escape to an outer loop, matching Python).
- Interpreter: two signal classes (`BreakSignal`/`ContinueSignal`, same style
  as `ReturnSignal`/`Unsupported`/`StepLimit`). `while`/`for`'s body-execution
  loop wraps in try/catch; an `if` inside a loop needs **zero** new plumbing —
  a `break` inside an `if` inside a `while` propagates through the `if`'s
  call frame for free, the same mechanism `ReturnSignal` already exploits.

### 7b — dict/set literals + subscript

- `{k: v, ...}` dict / `{v, ...}` set (empty `{}` is a dict, matching
  Python's own default); `parseBraceLiteral()` mirrors `parseBracket()`'s
  existing range-vs-list disambiguation (peek for `COLON` after the first
  element). An empty **set** has no literal form (`{}` is a dict) — `set()`
  is the only spelling, added as a zero-arg-only `callBuiltin` case.
- **Canonical dict/set keys (the one genuinely subtle piece):** Python treats
  `1`/`1.0`/`True` as the *same* key (`hash(1)==hash(1.0)==hash(True)`), but
  `pyRepr` gives them different strings (`"1"` vs `"1.0"`). `canonicalKey()`
  normalizes int/float/bool to one shared numeric form before falling back to
  a type-tagged string for everything else — verified with a live test
  proving the int/float/bool collision matches real Python.
- `isHashable()` excludes `dict`/`set` too (themselves unhashable in Python).
  Subscript read/write covers list/str (negative indices, IndexError) and
  dict (KeyError on read, insert-or-update on write); string item assignment
  correctly raises `TypeError` (Python strings are immutable).

### 7c — attribute access + user `import`

- `AttributeExpression` (`obj.attr`); `parsePostfix()`'s call condition widens
  from `Identifier` to also allow `Attribute`, so `math.sqrt(x)` composes
  (Attribute suffix fires, then Call on the next loop iteration). `import
  module` is a single bare name only — no `from x import y`, no `as`, no
  dotted paths (`import os.path`); the single unlock that matters is "call
  *something*.func(...)", and top-level stdlib names already cover most
  general-purpose usage.
- **Scope cut, not a gap:** the interpreter defers ANY attribute-based
  call/read at this sub-phase (`Unsupported`, same mechanism as
  numpy/temporal) — module calls and built-in container methods
  (`lst.append(x)`) are real, correct Python once emitted; the interpreter
  just doesn't model attribute dispatch *yet*. Real instance dispatch lands
  in 7e once `{k:'instance'}` exists to dispatch onto.
- `purity.ts` treats **every** Attribute-callee call as an unconditional
  potential side effect (no per-module allowlist attempt — matches the
  file's own "reports observed effects, not proof of purity" stance).
  `importance.ts` keys an Attribute call by its full dotted name
  (`"math.sqrt"`) so it can never collide with an unrelated bare function
  sharing just the tail name.

### 7d — `try` / `except` / `finally` + `raise`

- `ExceptHandler` is a sub-node (like `Decorator`), not a `Statement`/
  `Expression` itself. **Scoping (the subtle piece, generalizing if/else's
  clone-per-branch technique):** a `try` body can partially execute before
  failing mid-way, so — MORE than if/else, not less — resolve the try body
  against its own scope clone, and resolve **each handler** against its own
  clone of the *original* pre-try scope (not the try body's clone — a
  handler must not assume the try body's declarations are safely bound while
  it runs). Union every branch's newly-declared names back into the parent
  afterward; `finally` resolves against that already-unioned, live scope.
  `except ... as name` is visible only inside that handler (Python's
  implicit `del` on exit) — added to the handler's scope clone transiently,
  deleted before unioning back.
- **Interpreter leans entirely on native JS `try/finally`** rather than a
  manual pending-exception flag — it already runs `finally` exactly once
  regardless of success/matched-throw/unmatched-throw/break/continue/return,
  and before a rethrown exception continues propagating, a direct match for
  Python's own guarantee with zero manual bookkeeping.
- **Exception matching is a documented fidelity gap, not silent
  unsoundness:** bare `except:`/`except Exception:` are catch-all; anything
  else matches via exact `pyType` string equality — **no** hierarchical
  matching (`except ArithmeticError:` will not catch a `ZeroDivisionError` in
  the interpreter, though it would in real transpiled Python).
- **`raise` is a deliberate scope-limiting shortcut** — no new "exception
  object" PyVal. A bare `raise` re-raises a small `currentException` ref (set
  only while running a handler body, save/restored around nested try/except
  so an outer one isn't clobbered); `raise ExceptionClass("msg")`
  special-cases the call's Identifier callee as an exception class name.
  `except ... as e` binds `e` to a `STR` of the message (a faithful
  approximation of the dominant real usage `print(e)`/`str(e)`, not full
  object introspection) — anything else (a bound variable, an
  attribute-qualified class) defers as `Unsupported`.
- Zero new diagnostic codes this sub-phase — both the scoping and the
  raise/except semantics above are deliberately runtime concerns, not static
  ones (documented explicitly so it doesn't read as an oversight).

### 7e — `class` (minimal viable OOP; the biggest single item)

Explicit exclusions: no inheritance/base classes, no method decorators
(`@staticmethod`/`@classmethod`/`@property`), no dunders beyond `__init__`.
Methods are ordinary nested `FunctionDef` nodes — `self` is just an ordinary
first parameter, nothing special at the AST level. `AssignTarget` needed no
further widening (Attribute already landed in 7c). Instantiation needs
**zero** forward-emission special-casing: `Foo(args)` is syntactically an
ordinary `Call`; Python resolves class-vs-function at runtime either way —
the distinction matters only to the interpreter.

- **The real correctness risk, found and designed around:** `fnRecords`
  (feeding purity/importance/crystallization) is keyed by bare function name,
  program-wide — two unrelated classes each defining `__init__` would
  otherwise collide. **Fix: a new `resolveMethod()` helper** (parallel to
  `resolveFunction()` — decorator validation, `E_RETURN_OUTSIDE_FN` checking,
  body resolution) that deliberately does **not** push into `fnRecords`.
  Consequence, applied as one clean scope cut: class method bodies are
  opaque to the whole Phase 2/4 analysis stack this round — no `@cold`/`@hot`
  caching, no interprocedural purity taint, no importance scoring, no
  loop-classifier metadata for a loop nested in a method. Still fully parsed,
  name-resolved, correctly emitted, and correctly executed. Verified via a
  reversion test: temporarily making `resolveMethod` also push into
  `fnRecords` makes two classes' same-named methods visibly collide in
  `metadata.functions`; reverting restores the empty (non-colliding) result.
- A `@cold`/`@hot`/`@temporal_loop` decorator on a method fires
  `W_METHOD_DECORATOR_UNSUPPORTED` and is then **stripped** from emission
  (no `@functools.cache`, no hot-comment, no `@temporal_loop(...)`) — warned,
  not silently pretended-effective. A class body may otherwise only contain
  method defs or a plain `Assignment`/`OverlayAssign` (a class-level
  variable, accepted for correct Python emission); anything else is
  `E_CLASS_BODY_UNSUPPORTED`. `W_CLASS_REDECLARED` mirrors `W_FN_REDECLARED`.
  The same builtin-shadow-alias collision risk `resolveFunction` already
  guards against is checked for both class names and method names too (a
  method literally named `list` would otherwise have its `def` line renamed
  while call sites — never aliased — silently resolved to the wrong thing).
- **Interpreter — the first genuinely new PyVal variants this round:**
  `{k:'class', name, def}` / `{k:'instance', className, classDef, attrs:
  Map<string, PyVal>}`. `evalCall` gains a `callee.k === 'class'`
  instantiation branch (look up `__init__`, bind a fresh instance as `self`,
  run its body — no `__init__` at all is a valid zero-arg construction;
  extra args with no `__init__` to absorb them is `TypeError`, mirroring
  `object.__init__`). The Attribute-callee/Attribute-read/Attribute-write
  paths stubbed as unconditional `Unsupported` in 7c now check whether the
  object evaluates to `{k:'instance'}` first and dispatch for real
  (methods/attrs) — falling through to the same `Unsupported` defer
  otherwise, so `math.sqrt(x)`/`lst.append(x)` behavior is unchanged. A
  bare Identifier object still resolves via `readVar` (never throws) rather
  than `evalExpr`, so an unbound module name keeps deferring instead of
  crashing with a spurious `NameError`.
- Methods close over the **module** scope, not a captured lexical closure —
  `{k:'class', ...}` carries no `closure` field (unlike `{k:'func', ...}`), a
  deliberate "minimal viable OOP" simplification: a class nested inside a
  function whose methods reference that function's locals is not modeled
  faithfully this round. `class`/`instance` values are marked **unhashable**
  (a conservative divergence from real Python's identity-based default —
  there is no meaningful structural key to assign them, and this avoids ever
  needing one for `@cold` cache-key purposes). `pyEquals` falls back to JS
  reference equality for both (no `__eq__` override is modeled) — without
  this, `c == c` would incorrectly report `False`. Printing a bare instance
  uses a stable `<ClassName object>` placeholder (Python's own default repr
  embeds a non-reproducible memory address, so exact matching was never
  truly possible — never asserted in the interpreter≡Python equivalence
  gate for that reason).

### Verification (all of Phase 7)

512 tests total (up from 363 pre-Phase-7): one dedicated test file per
sub-phase (`tests/phase7a-break-continue.test.ts` … `tests/phase7e-class.test.ts`,
each with parser/semantic/emitter/purity/loop-classifier/CTS/interpreter
sections), golden fixtures `21`–`29`, `tests/interp.test.ts` CASES/
ERROR_CASES additions per feature, and `tests/bidirectional.test.ts`'s
forward-only exclusion regex extended through `class`. A hand-written CLI
smoke test combining every sub-phase (a class with a method containing a
`for`/`continue`/`try`/`except KeyError` over a dict-backed instance
attribute) passed `eml trace --run`'s `eml:equiv` gate — interpreter and real
Python produced byte-identical output.

## Phase 8 — LSP server + minimal VS Code extension (MVP complete)

The first `docs/roadmap.md` commercialization item (A-1): a real Language
Server Protocol server for EML, plus a minimal (not marketplace-polished) VS
Code extension client so it's actually usable in a real editor. Scope:
diagnostics + hover + completion — the three capabilities directly reachable
from EXISTING exports with zero new core-package logic (go-to-definition,
inline trace, and Unicode-display-form position accuracy are explicit,
documented scope cuts, not gaps — see below).

- **`packages/lsp` (`@eml/lsp`)**: standard, editor-agnostic
  `vscode-languageserver`/`vscode-languageserver-textdocument` (NOT VS-Code-
  only despite the package name history). Follows the codebase's existing
  "pure computation, thin I/O adapter" split (mirrors `emitter.ts`/
  `semantic.ts` vs `cli/index.ts`): `logic.ts` has zero `vscode-
  languageserver/node` imports and no process I/O — every function is a
  plain value in, plain value out, directly vitest-testable; `server.ts` is
  the thin `Connection`-wiring adapter; `index.ts` re-exports both and
  auto-launches over real stdio ONLY when it's the actual process entry
  point (guarded via `import.meta.url` vs the resolved entry-script path —
  otherwise importing `@eml/lsp` from a test would open a real stdio
  connection as a side effect).
- **Diagnostics**: a direct pass-through of `transpileEmlToPython`'s
  existing `diagnostics: Diagnostic[]`.
- **Hover**: shows the Python expansion (via the existing `emitStatement()`)
  of the innermost statement whose span contains the cursor — a fresh
  recursive lookup (`findEnclosingStatement`) over the resolved AST, since no
  existing code needed this shape of query. Also surfaces any diagnostic
  whose span overlaps the hovered statement in the same popup.
- **A real, non-obvious bug found and fixed during this round**: a compound
  statement (`If`/`While`/`ForIn`/`FunctionDef`/`ClassDef`) that owns its own
  nested block consumes the DEDENT token closing that block as part of its
  OWN span (`parseStatementWithSpan()` wraps the entire `parseFunctionDef()`/
  etc. call, which itself calls `parseBlock()` and consumes that DEDENT
  before returning). A DEDENT token is zero-width at the position of the
  very FIRST character of the next sibling — so in e.g. `def __init__(...):
  ...\n    def get(...): ...`, `__init__`'s span ends EXACTLY at `get`'s
  starting offset. An initial single-pass "half-open OR inclusive-end"
  boundary check made the FIRST sibling (`__init__`) incorrectly win at that
  exact tie, even though `get`'s own half-open range genuinely contains it.
  Fixed with a two-pass design: check half-open containment (`[start, end)`)
  across ALL siblings first (unambiguous, must win outright); only fall back
  to inclusive-end (`offset === span.end`) in a second pass, for the
  legitimate case of hovering right after a statement's last character with
  no following sibling. Locked in by a dedicated regression test
  (`tests/lsp-logic.test.ts`).
- **Completion**: keyword completions (a small hand-maintained 20-entry list
  mirroring the lexer's keyword branches — the lexer is an if/else-if chain
  over a `TokenType` switch, not an exported `Set`, so a small duplication
  here was cheaper than a lexer refactor) + symbol completions sourced
  directly from `EML_SYMBOLS` (`eml-symbols.json` — zero new data authored).
  `^+=` is deliberately excluded — the spec (§4) marks it an *internal*
  symbol-table tag, not writable surface syntax; suggesting it would be
  actively misleading. `def`/`await` (present in both sources) are not
  duplicated.
- **Position/offset conversion — two real subtleties beyond "just use
  character offsets"**: (1) `transpileEmlToPython`'s catch-block diagnostic
  for `E_LEX`/`E_PARSE` hardcodes `span: {start: 0, end: 0, line, column}` —
  `line`/`column` are real, `start`/`end` are always 0; a naive conversion
  trusting `start` uniformly would silently place every lex/parse-error
  squiggle at document position (0,0). (2) `normalizeSource()` collapses
  `\r\n`/`\r` → `\n` unconditionally, BEFORE any Unicode substitution — so
  `normalized.length !== rawText.length` for a CRLF-saved file even with
  zero Unicode symbols in it. Fixed by using `span.line`/`span.column`
  (1-based, survive EOL normalization) for a Range's START position, and a
  scratch `TextDocument` built over the semantic pass's own `normalized`
  string (never exposed to the client) purely for `positionAt`/`offsetAt`
  math on the END position and reverse hover lookups. Net effect: position
  accuracy for ASCII-canonical EML source is correct regardless of the
  file's line-ending style — only Unicode display-form source remains
  out of scope this round, matching the language's own normative stance
  ("ASCII canonical form is normative … Unicode is an informative
  projection", `docs/EML-LANG-2026-v1.0.md` §2.1).
- **`packages/vscode-extension`**: deliberately plain CommonJS JS (not TS)
  for `extension.js` — VS Code's extension host `require()`-loads `main`
  synchronously with no bundler/tsx registration active in that process, and
  introducing the repo's first build step just for a prototype extension
  would contradict the "no build step" convention everywhere else. Spawns
  the server via `node <tsx's own dist/cli.mjs> <packages/lsp/src/index.ts>`
  (resolved relative to the workspace root) — deliberately NOT `node_modules/
  .bin/tsx`, sidestepping Windows shell-shim (`tsx.CMD`) quoting issues in
  `child_process.spawn`. Only works when launched via VS Code's Extension
  Development Host (F5) with this exact monorepo checkout open as the
  workspace root — a `packages/vscode-extension/.vscode/launch.json` is
  provided for that. Minimal TextMate grammar (keywords/comments/strings/
  numbers only) + `language-configuration.json` — no marketplace polish, no
  icon, no bundling for public distribution (mirrors the C++ back end's
  existing "PROTOTYPE not backend" framing, `docs/cpp-feasibility.md`).
- **Explicit scope cuts** (documented, not silently missing): go-to-
  definition/references (`semantic.ts`'s `declaredNames` only carries
  aggregate name lists, not per-identifier declaration spans — a real,
  separate, non-trivial addition); inline trace visualization (a webview
  feature, not a standard LSP capability — belongs to the separate "編輯器
  外掛" roadmap item polishing this prototype extension, not the server).
- Tests: `tests/lsp-logic.test.ts` (pure functions — diagnostics conversion,
  the hover statement-lookup algorithm including the DEDENT-boundary
  regression, completion-list de-duplication, span/range boundary
  arithmetic including a CRLF case) + ONE real `tests/lsp-protocol.test.ts`
  integration test proving the actual `vscode-languageserver` connection
  wiring end-to-end (initialize handshake, `didOpen` → `publishDiagnostics`,
  `hover`, `completion`) over in-memory duplex streams (`node:stream`'s
  `PassThrough`, via `vscode-jsonrpc`'s direct-Node-stream
  `createMessageConnection` overload) — no child-process spawn, no
  filesystem, no network. 535 tests total (up from 512 pre-Phase-8).
  `examples/phase8-lsp/demo.eml` (+ its committed `.trace.jsonl` golden)
  exercises class + try/except + a deliberate `W_METHOD_DECORATOR_UNSUPPORTED`
  warning (a WARNING, not an error — every committed example must transpile
  with zero ERROR diagnostics, per `tests/examples.test.ts`) for the manual
  VS Code F5 walkthrough.

## Phase 8 — MCP server (MVP complete)

The second `docs/roadmap.md` commercialization item (C-8): a Model Context
Protocol server so AI agents (Claude Code/Desktop, any other MCP client) can
read/write EML and consume its trace directly as tools, instead of needing a
human to run the CLI.

- **Not new logic — a protocol adapter over an existing design.** The site
  repo (`D:\Ai\網站群\高效新語言\新版`, separate git repo) already runs a fully
  designed, tested, deployed "Agent Tool Layer" REST API at `/ai/tools/*`
  (`worker/index.ts`) — 7 tools (parse, transpile-python, transpile-eml,
  interpret, trace, roundtrip, health) on top of the same
  `@eml/{transpiler-python,transpiler-eml,interp,trace}` packages, with a
  consistent envelope, resource-limit guards, and structured errors. `@eml/mcp`
  mirrors that design's semantics EXACTLY (same 7 tool names, same envelope
  shape, same limit values) so the two agent surfaces — REST for arbitrary
  HTTP/web clients, MCP for AI agents — never diverge into two different
  designs for the same capability. It can't literally import that repo's code
  (separate git repo), so `guards.ts`'s pre-flight checks (source-length cap,
  raw nesting-depth scan, AST complexity walk) are reimplemented fresh here,
  using the identical threshold constants for consistency.
- **`packages/mcp` (`@eml/mcp`)**: same "pure logic / thin adapter" split as
  `@eml/lsp` — `guards.ts` (pure: `MAX_SOURCE_LENGTH`/`MAX_NESTING`/
  `MAX_EXPONENT`/`MAX_GROWTH_LOG2`/`MAX_RANGE_SPAN`/`MAX_STEPS` constants,
  `rawNestingDepth`, `complexityError`, `sanitizeError`) + `tools.ts` (pure:
  one `(source: string) => Envelope` function per tool, zero
  `@modelcontextprotocol/sdk` imports — fully vitest-testable without a
  protocol connection) + `server.ts` (thin adapter: the only file that touches
  `McpServer`/`registerTool`) + `index.ts` (re-exports all three; auto-launches
  over real stdio ONLY when it's the actual process entry point, via the same
  `import.meta.url` vs `pathToFileURL(process.argv[1]).href` guard
  `@eml/lsp/src/index.ts` already established).
- **The envelope**: `{ ok, tool, version, input_hash, result, warnings, errors,
  trace_id }` — `input_hash` is `sha256:<hex>` via `node:crypto`'s
  `createHash` (this runs in plain Node via `tsx`, not a Cloudflare Worker, so
  no Web Crypto `subtle.digest`); `trace_id` is `eml-trace-<uuid>` via
  `node:crypto`'s `randomUUID()`. `roundtrip` is the one tool whose
  `errors`/`warnings` stay `[]` even on failure — failure is communicated
  purely via `result.ok`/`result.message` (matches the REST tool's own
  behavior; locked in by a dedicated test).
- **Tool-domain errors are a normal result, not a protocol error.** A compile
  diagnostic or a failed round-trip returns MCP's `isError: false` with the
  envelope's `ok: false` and `errors[]` populated — `isError: true` is
  reserved for genuinely unexpected internal failures (`E_INTERNAL`). This
  mirrors the REST worker's own choice to return HTTP 200 for `ok:false`, and
  matches MCP's own documented philosophy (`CallToolResultSchema`'s doc
  comment): tool-domain errors belong in the result object so the agent can
  see them and self-correct, not as a protocol-level error it can't introspect.
- **Guards**: `MAX_SOURCE_LENGTH = 20_000` (checked first) → `E_PAYLOAD_TOO_LARGE`;
  `MAX_NESTING = 256` raw bracket/paren scan (bounds parser-recursion stack
  overflow) → `E_RESOURCE_LIMIT`; for `interpret`/`trace` only, a post-parse
  AST-walk complexity check (`MAX_EXPONENT = 4096` largest literal `Power`
  exponent, `MAX_GROWTH_LOG2 = 20` cumulative magnitude-growth budget,
  `MAX_RANGE_SPAN = 5_000_000` largest literal range span) → `E_RESOURCE_LIMIT`,
  run ONLY when the program compiles (a program that fails to compile can't
  run away — its diagnostics are a normal `ok:false` result, not a resource
  rejection); `MAX_STEPS = 2_000_000` passed through to `interpret()`'s own
  step budget. No wall-clock timeout — the toolchain is fully deterministic,
  so cost is bounded structurally, not by a clock.
- **Verified against the real installed SDK before writing code, not assumed
  from research.** `@modelcontextprotocol/sdk` stable is `1.29.0` (NOT the
  `@modelcontextprotocol/server` v2-beta line, which targets a later stable
  release and wasn't out yet). Confirmed directly from the installed
  `.d.ts` files: `new Client(clientInfo: Implementation, options?)`,
  `callTool(params: CallToolRequest['params'])` where `params` is
  `{ name: string, arguments?: Record<string, unknown> }`, `registerTool(name,
  { inputSchema: <Zod raw shape> }, cb)`, and content blocks are
  `{ type: 'text', text: string }`.
- **Tests**: `tests/mcp-logic.test.ts` (pure functions — each of the 7
  `tools.ts` functions in a clean-source and an error-source case, plus
  `guards.ts`'s `rawNestingDepth`/`complexityError`/`sanitizeError` directly,
  plus the source-length/nesting/exponent guard thresholds exercised through
  the tool functions themselves) + ONE real `tests/mcp-protocol.test.ts`
  integration test using the SDK's own first-class in-process transport
  (`InMemoryTransport.createLinkedPair()`) with a real `Client`: tool listing,
  a clean `transpile_python` call, and a compile-error call asserting
  `isError` stays `false` while `structuredContent.ok` is `false`. 559 tests
  total (up from 538 pre-Phase-8-MCP). Additionally smoke-tested the ACTUAL
  stdio entry point (not just the in-memory transport) by piping a raw
  JSON-RPC `initialize` + `tools/list` handshake into `node
  node_modules/tsx/dist/cli.mjs packages/mcp/src/index.ts` directly — confirms
  the auto-launch guard and real `StdioServerTransport` wiring both work, not
  just the test-only in-process path.
- A repo-root `.mcp.json` wires the server in for Claude Code: `{"mcpServers":
  {"eml": {"command": "node", "args": ["node_modules/tsx/dist/cli.mjs",
  "packages/mcp/src/index.ts"]}}}` — same "resolve tsx's own `dist/cli.mjs`,
  not `.bin/tsx`" choice as the VS Code extension's `serverOptions`
  (sidesteps Windows shell-shim quoting), just in a config file instead of a
  runtime `child_process.spawn` call.

## Phase 8 — public conformance suite (MVP complete)

The third roadmap item this phase (B-5): not new logic, but packaging two *already-existing* gates
(`tests/fixtures/`'s exact-text mapping check, `examples/`'s `eml:equiv` execution-truth check) into
`docs/conformance.md` — a doc explaining, for an external reader with no context on this repo's
internal `vitest` layout, what "EML-LANG-2026-v1.0 conformant" concretely means and how to check it
via `pnpm eml test` / `eml trace <file> --run` alone.

- **A real design mistake, caught by actually running it, not assumed correct.** The first draft
  added an `--run` flag to `eml test` that spawned real Python on every matched fixture, assuming all
  29 `tests/fixtures/*.eml` were complete, runnable programs. Running it immediately surfaced 6
  failures (`04_transpose`, `05_condition`, `06_bind`, `10_range`, `12_matrix`, `13_call`) — these
  fixtures are Appendix B's "14 documented statement mappings" (matching `tests/statement-mapping.
  test.ts`'s own case list), deliberately isolated single-construct snippets that reference names
  never bound in that fixture (`m`, `x`, `f`, `data`) because they exist to pin down one construct's
  *expansion*, not to execute standalone. The `--run` flag and its CLI help-text line were reverted
  entirely rather than special-cased (no reliable signal distinguishes "snippet" from "complete
  program" fixtures without new metadata, and the two-layer split documented below already covers
  execution-truth correctly via `examples/`).
- **`tests/cli-conformance.test.ts`**: spawns the REAL `eml test` CLI process (not the internal
  `transpileEmlToPython` comparison `tests/golden.test.ts` already does directly) — proves argv
  parsing, `--dir`, exit codes (0 all-pass / 1 any-fail), and the missing-companion-file SKIP
  behavior all work as `docs/conformance.md` documents them, the same "verify the actual entry
  point, not just internal logic" discipline used for the LSP/MCP protocol tests.

## Phase 8 — reverse Python→EML, Phase A + B1 + B2 + C + D + E1 + E2 (if/while/for, break/continue, dict/set/subscript, attribute/import, try/except/raise, function definitions, class; COMPLETE)

Triggered by a real B-6 measurement: running `eml compress` on 5 unmodified real Python files was
5/5 failures, every one within the first few lines. Root cause: `packages/transpiler-eml/src/
py-lexer.ts` had **zero** support for compound statements — no `COLON`, `INDENT`, or `DEDENT` token
existed at all, so virtually any real, non-trivial Python program (almost none avoid `if`/`def`/
`for`) failed immediately. This was already a documented scope cut (§11's Phase 6/7 addenda say
reverse "fails loudly" on these), but the real-world severity had never been concretely measured.
Given the scope — this is, in effect, redoing forward Phase 6 (`if`/`elif`/`else`, `while`,
`for...in`) and Phase 7a–e in reverse — Neo chose to do it in phased slices, same cadence as the
forward direction's own Phase 6 → 7a → 7b → 7c → 7d → 7e rollout. **This round is Phase A only**:
the shared block-parsing infrastructure plus `if`/`elif`/`else`, `while`, `for...in`. `break`/
`continue`, dict/set/subscript, attribute/import, try/except/raise, and `def`/`class` are explicitly
deferred to their own future rounds.

- **The AST needed zero changes.** `packages/types/src/ast.ts` already fully modeled
  `IfStatement`/`WhileStatement`/`ForInStatement` (and every later-phase node) for both directions
  from the start. The entire gap was three files: `py-lexer.ts` (no tokens), `py-parser.ts` (no
  grammar), `eml-emitter.ts` (12 explicit `throw new EmlEmitError(...)` stubs, one per unsupported
  node, deliberately placed there — "fail loud, not silently wrong" — ready to fill in). Also
  confirmed: EML's own block syntax is byte-identical to Python's (`if x > 20:`, same colons, same
  4-space indentation) — only the simple statements/expressions *inside* a block use EML's overlay
  forms, so the reverse emitter's job for these three constructs was almost entirely "reproduce the
  header verbatim + recursively emit the body," not invention.
- **`py-lexer.ts`**: added a `COLON` single-char token and ported the forward EML lexer's
  indent-stack algorithm (`packages/parser/src/lexer.ts` lines 59–92 + 280–284) nearly verbatim: an
  `indentStack` starting at `[0]`, measured only on lines with real code (blank/comment-only lines
  are skipped from the indent check), `width > top` → push + emit `INDENT`, `width < top` → pop in a
  loop emitting one `DEDENT` per pop until the stack top is `<= width` (throwing on a mismatched
  dedent), and a trailing DEDENT flush at EOF. **No new keyword token types** — this reverse lexer's
  existing convention (every identifier, including `if`/`else`/`in`/`sum`/`range`/`np`, lexes as a
  plain `NAME`, disambiguated by the parser via `checkName(value)`) was kept rather than introducing
  a parallel dedicated-keyword scheme like the forward lexer's; smaller, more consistent diff.
- **`py-parser.ts`**: restructured from "one statement per line, must be followed by `NEWLINE`/`EOF`"
  to suite-aware — a new `parseBlock()` (`COLON`-then-`NEWLINE INDENT stmt+ DEDENT`) and an
  `expectStatementEnd()` mirroring the forward parser's exact trick: a compound statement's `DEDENT`
  is consumed internally by its own `parseBlock()` call, so the *following* statement may start
  immediately — detected by checking whether the token just consumed was a `DEDENT`. `parseIf()`/
  `parseElseOrElif()`/`parseWhile()`/`parseForIn()` mirror the forward parser's shapes closely,
  including the `elif`-as-nested-`If` trick.
- **A real correctness gap the regression test caught: `break`/`continue` were silently
  mistranslated, not rejected.** Every other still-unsupported keyword (`def`, `class`, `try`,
  `import`, ...) happens to be followed by something that already breaks parsing when misread as a
  bare identifier (a name, a colon, etc.), so they failed loudly by accident even before being
  explicitly handled. `break`/`continue` are uniquely dangerous: a bare keyword immediately followed
  by end-of-line is *exactly* the shape of a valid (if bogus) bare-identifier expression statement —
  so without explicit handling, `break` alone on a line silently parsed as a meaningless reference to
  a variable named "break" and the reverse transpiler reported success. Fixed by recognizing
  `checkName('break')`/`checkName('continue')` explicitly in `parseStatement()`, routing them to
  `eml-emitter.ts`'s pre-existing `Break`/`Continue` throw-stubs instead.
- **A second real correctness bug, also caught by the round-trip test, not assumed correct:
  reassigning an already-bound variable inside a loop.** `eml-emitter.ts`'s `Assignment` case always
  emitted the `^+` sigil form for atom values (`x^+value`) regardless of whether `x` was already
  bound — safe for a fresh declaration, but wrong for a Python `a = b` REASSIGNING an already-declared
  loop-carried variable (e.g. Fibonacci's `a, b = b, a + b`-style per-iteration update): the forward
  parser's own two-stage `^+` disambiguation would misread the re-emitted `a^+b` as an *augmented
  add*, not a fresh value. No prior fixture ever exercised this (all 14 pre-Phase-A fixtures assigned
  each variable exactly once), so it was a latent bug, not something Phase A introduced — only loops
  make reassignment-of-a-bound-name a common pattern. Fixed: the `Assignment` case now checks
  `bound.has(target.name)` first and always uses the unconditional reversed-arrow form (`value =>
  target`) for a reassignment, regardless of value shape.
- **Branch-aware `bound` scope for `if`/`elif`/`else` (the flagged risk from planning, confirmed
  necessary).** `emitEmlStatement` threads a `bound: Set<string>` tracking which names have already
  appeared via `^+`, used to decide whether an `AugmentedAssign` can safely use `^+` — a name
  declared in only ONE branch of an `if` must NOT be treated as bound afterward. A new `emitIfChain()`
  helper (separate from the generic `emitEmlStatement` dispatcher, so exhaustiveness metadata survives
  the recursive `elif` case) clones `bound` per branch, and merges a name back into the outer scope
  ONLY if it was declared in EVERY branch of an exhaustive chain (ending in a plain `else`) — mirrors
  the forward semantic analyzer's own branch-scope-clone-then-merge rule for Phase 6. `while`/`for`
  deliberately do NOT clone: they share one live `bound` set with their enclosing scope throughout,
  matching the forward analyzer's own "no branch cloning for loops" choice (0+ iterations aren't
  mutually exclusive branches, so a loop-body declaration is simply always considered bound after —
  the same simplification the forward side already made).
- **Tests**: `tests/bidirectional.test.ts`'s `roundTrippable` exclusion regex narrowed (`if`/`elif`/
  `else`/`while`/`for` removed from the blacklist; `break`/`continue`/`import`/`try`/`except`/
  `finally`/`raise`/`class`/`def` stay excluded) — fixtures 16–20 became round-trippable automatically.
  New `tests/reverse-blocks.test.ts`: if/elif/else, while, for, nested if-in-while, the exhaustive-vs-
  non-exhaustive branch-merge cases (including an elif-chain-with-no-final-else negative case), and a
  regression guard confirming break/continue/dict/class/def/try still fail (not silently widened).
  589 tests total (up from 565).
- **Verification beyond unit tests**: a fresh, hand-written Python snippet using only `if`/`while`/
  `for` + assignment/print was run through the REAL CLI end to end — `eml compress` → `eml roundtrip`
  (fixpoint OK) → `eml run` (output matched a real `python3` run byte-for-byte). Also re-ran the
  original 5 real corpus files from the B-6 measurement: still 5/5 not fully successful (each also
  uses a still-out-of-scope construct — `%`, dict literals, or `try`), but 2 of 5 now fail measurably
  later in the file (`Calculate_age`: line 6 → 48; `Duplicate_files_remover`: line 7 → 22) — concrete,
  honest evidence of progress. The other 3 show no visible change only because their specific
  still-excluded construct (`%`/`try`/`{`) happens to appear before any `if`/`while`/`for` in that
  particular file — not a regression, just where each file's content happens to put its blocker.
  Worth remembering: lexing is a separate, complete upfront pass before parsing starts, so a file's
  reported failure is whichever comes first — the lexer's or the parser's — not necessarily evidence
  the parser itself progressed past a construct it still doesn't understand.

**Phase B1 (same day, 2026-07-16): `break`/`continue`.** A small, low-risk follow-on rather than its
own large slice — the reverse parser already needed to recognize `break`/`continue` explicitly as
part of Phase A's regression-guard fix (see above: they're the one pair of bare keywords that would
otherwise silently mistranslate into a meaningless identifier reference), so the AST nodes were
already being built correctly; only `eml-emitter.ts`'s two throw-stubs needed to become real
emission (`return 'break'` / `return 'continue'`). Two of `tests/reverse-blocks.test.ts`'s regression-
guard cases ("break/continue still fails") were themselves updated into positive round-trip tests,
since what they guarded against became a real capability — the test file's own comment now reflects
Phase A + B1 together. Fixtures 21 (`while` + `break`) and 22 (`for` + `continue`) became
round-trippable via `tests/bidirectional.test.ts`'s narrowed exclusion regex. 594 tests total (up
from 589).

**Phase B2 (same day, 2026-07-16): dict/set literals + subscript.** Mirrors forward Phase 7b. The
AST needed zero changes (`DictLiteral`/`SetLiteral`/`SubscriptExpression`/the `AssignTarget` union
were already fully modeled for both directions) — same story as every prior sub-phase.

- **`py-lexer.ts`**: added `LBRACE`/`RBRACE` — the entire lexer change.
- **`py-parser.ts`**: added `parseBraceLiteral()` (mirrors the forward parser's exact dict-vs-set
  disambiguation: parse the first element as an expression, then peek for `COLON`); widened
  `parsePostfix()` from a `while (LPAREN && Identifier)` single-iteration loop to a `for (;;)` loop
  also handling `LBRACKET` (subscript), so `d[k]`, chained `d[k][j]`, and `f(x)[0]` all parse for free.
- **The one genuinely delicate change: `AssignTarget` widening.** `parseStatement()`'s assignment
  detection used to be a 2-token lookahead BEFORE parsing anything (`NAME` immediately followed by
  `ASSIGN`) — structurally incapable of recognizing `d[k] = v` (a multi-token LHS). Restructured to
  parse the LHS as a general expression FIRST via the existing `parseExpr()` chain (which already
  naturally stops right after an `Identifier`/`Subscript`, since `=`/`+=` etc. aren't valid
  expression-continuation tokens), THEN check the current token for `ASSIGN`/an aug-op, validating
  the parsed expression collapses into a legal target via a new `toAssignTarget(expr)` helper
  (`Identifier | Subscript` this phase — `Attribute` still throws, Phase C). This changes the code
  PATH for plain `x = value` too (parse `x` as an expression first, then see `ASSIGN`) but produces
  byte-identical results for that case, mirroring the forward parser's own split between
  `parseAssignTargetChain()` (build-from-scratch) and `toAssignTarget()` (validate-already-parsed).
- **A real syntax distinction to get right, not obvious from the AST alone**: EML's bare-identifier
  `^+`/`^-`/`^*`/`^/` sigil is ambiguous by design (§5.1's two-stage declare-vs-augment
  disambiguation) — that ambiguity doesn't exist for a container element, so a subscript's compound
  assign uses the REAL `+=`/`-=`/`*=`/`/=` operator text directly (`scores["alice"] += 5`, confirmed
  from `tests/fixtures/23_dict_literal.eml` line 3), never the `^` sigil. A subscript target for a
  FRESH (non-compound) assignment always uses the reversed-arrow form (`99 => list[1]`, fixture 25
  line 6) since `^+` cannot spell a subscript target at all. `eml-emitter.ts`'s `Assignment`/
  `AugmentedAssign` cases each gained a `Subscript`-target branch handling this before falling through
  to the existing, unchanged `Identifier`-target logic.
- **A small, safe cleanup noticed while re-reading this code, not a new bug**: the `Assignment`
  case's `v.type === 'List'` special-case produced byte-identical output to just calling
  `emitEmlExpression(v)` generically (both already went through the same `case 'List':` logic) —
  replaced with one `isInlineLiteral` helper (`isAtom(e) || List | Dict | Set`) covering all three
  literal kinds uniformly, so `scores^+{"alice": 10, "bob": 20}`-style inline dict/set literals now
  emit the same way `lst^+[1, 2, 3]` already did. `isAtom` itself is untouched — still used unmodified
  by `AugmentedAssign`'s RHS-compound check.
- **Tests**: `tests/bidirectional.test.ts`'s exclusion regex narrowed further (the subscript-pattern
  and brace-literal alternatives removed, attribute-dot detection kept) — fixtures 23 (`dict_literal`),
  24 (`set_literal`), 25 (`subscript_assign`) became round-trippable. `tests/reverse-blocks.test.ts`
  gained a new describe block: dict literal + subscript read, set + membership, fresh subscript
  assign, compound subscript assign (asserting the real operator appears, not the `^` sigil), and a
  word-tally loop combining dict subscript targets with `if`/`else` (proving Phase A's `bound`
  branch-merge and Phase B2's target widening compose correctly, not just work in isolation). The old
  "dict literal still fails" regression guard was replaced with an "attribute access still fails" one,
  since dict literals are no longer a gap. 605 tests total (up from 594).
- **A real, honest finding from re-running the original B-6 corpus files, not a regression**:
  `text_to_morse_code`'s dict literal (`symbols = {...}`) is written across MULTIPLE lines in the real
  file. Neither this lexer NOR the forward EML lexer (`packages/parser/src/lexer.ts`) suppresses
  `NEWLINE` inside bracket nesting the way a real Python tokenizer does (implicit line-joining) — both
  emit an unconditional `NEWLINE` per `\n` regardless of depth. Confirmed this is a genuine,
  pre-existing WHOLE-LANGUAGE boundary since Phase 0, not something Phase B2 broke: every list/dict/
  matrix literal in this repo's own examples (checked the longest one, `tic_tac_toe.eml`'s 8-element
  list-of-lists) is written on one line. Extending either lexer to support multi-line bracketed
  literals would be its own separate, cross-cutting round (affects both directions, every bracket
  type) — explicitly not attempted here. `Duplicate_files_remover` (the other file blocked by `{` last
  round) shows genuine progress instead: it now fails at `def hashFile` (line 7, a parser error)
  instead of at the dict literal (line 22, a lexer error) — proof the dict literal itself now lexes
  and parses correctly all the way through; the file's remaining blocker is `def` (Phase E scope).

**Phase C (same day, 2026-07-16): attribute access + bare `import`.** Mirrors forward Phase 7c.
Zero lexer changes — `DOT` already existed (Phase 0, for the hardcoded `np.array`/`np.transpose`
special case in `parsePrimary()`, checked first and untouched, so it keeps taking priority over
generic attribute parsing for anything `np`-prefixed).

- **`py-parser.ts`**: `parsePostfix()`'s `for (;;)` loop gained a `DOT` branch building `Attribute`
  nodes; its `LPAREN` (call) branch widened from `expr.type === 'Identifier'` to also accept
  `'Attribute'`, so `math.sqrt(x)` parses as `Call` over `Attribute` — matching the shared
  `FunctionCall.callee: Identifier | AttributeExpression` type the forward direction already used.
  `toAssignTarget()` widened one final step to `Identifier | Subscript | Attribute`, now an exact
  match for the forward parser's own `AssignTarget` union — **matching forward's own phase
  attribution, not an arbitrary choice**: the forward parser's type comments show `Attribute` was
  added to `AssignTarget` in forward Phase 7c itself (not deferred to 7e/class), so this round
  included attribute-as-assignment-target rather than artificially narrowing scope to attribute-read
  only.
- **Bare `import module`, deliberately two-layered.** EML's `ImportStatement` can express exactly one
  shape: a single bare module name. `parseStatement()` gained a case recognizing `import <NAME>`
  unconditionally, wherever it's called from (top level AND nested inside a block, unlike prior
  keywords which only got program-top-level treatment before) — a real, if rare, nested aliased
  import now fails loudly (the trailing `as`/`.` token trips `expectStatementEnd()`), the same
  "protection for free" every keyword added this session already relies on. `parseProgram()`'s
  pre-existing top-level-only silent-skip fallback (for `from X import Y`, always skipped — never
  representable — and for a non-bare `import`, e.g. `as`-aliased or dotted) stays exactly as before,
  now gated by a new `isBareImport()` lookahead so it only fires when the bare-import case in
  `parseStatement()` WOULDN'T otherwise handle it. This preserves the pre-existing, already-passing
  "ignores import lines" test (`import numpy as np` keeps silently dropping — 'np' is a permanently
  magic prefix for the matrix system regardless of any import statement) while making genuinely bare
  `import math` a real, round-trippable node.
- **`eml-emitter.ts`**: `Attribute` emission mirrors `Subscript`/`Transpose`'s existing postfix-
  precedence pattern (`child(expr.object, 6)` + `.` + attr name). `Call`'s callee-guard widened
  symmetrically with the parser change, and now recursively calls `emitEmlExpression(expr.callee)`
  instead of assuming `.name` directly, so it renders both an `Identifier` and an `Attribute` callee
  uniformly. `Import` emission is a one-liner (`import ${stmt.module}`). The `Assignment`/
  `AugmentedAssign` `Subscript`-target branches (from Phase B2) widened to also cover `Attribute` —
  identical logic, since both share the same "not bare-identifier, no declare/augment ambiguity"
  reasoning already documented from Phase B2; removing the now-redundant `Identifier`-only guards
  compiled clean, confirming TypeScript's own narrowing correctly proved `Identifier` is the only
  remaining case in the `AssignTarget` union after handling `Subscript`/`Attribute`.
- **Tests**: `tests/bidirectional.test.ts`'s exclusion regex narrowed to just `def|try|except|
  finally|raise|class` (both the subscript/brace pattern AND the attribute-dot pattern are now gone)
  — fixture 26 (`import_math`) became round-trippable. `tests/reverse-blocks.test.ts` gained a new
  describe block: attribute-callee call round-trip (mirrors fixture 26), bare import round-trip,
  fresh + compound attribute-assignment round-trip (asserting the real operator, not `^`), and an
  explicit non-regression check that aliased imports still silently drop. The old "attribute access
  still fails" regression guard was replaced (attribute access is no longer a gap). One test-writing
  mistake caught immediately by running it, not shipped: `print(obj.value)` — `^0` output requires a
  bare identifier per EML's own grammar (pre-existing, documented constraint, unrelated to this
  round) — fixed by binding the attribute read to a variable first, the same idiom already used for
  the Phase B2 dict/subscript tests. 611 tests total (up from 605).
- **Re-ran the same 5 real B-6 corpus files**: no change for any of them — expected and confirmed,
  since none of the 5 has attribute-read or import as its FIRST blocking construct (their blockers
  remain `%`, `try:`, `def`, and the still out-of-scope multi-line dict literal, per the Phase B2
  entry above). A real, fresh `import math` + `math.sqrt(x)` snippet was used for the actual
  end-to-end CLI proof instead (`eml compress` → `eml roundtrip` → `eml run`, matched real Python).

**Phase D (same day, 2026-07-16): `try`/`except`/`finally` + `raise`.** Mirrors forward Phase 7d.
Zero lexer changes — `try`/`except`/`finally`/`raise`/`as` are all just `NAME` tokens (the
established convention every phase after A has followed), and `COLON`/`INDENT`/`DEDENT` already
exist.

- **A real bug found by testing BEFORE writing any implementation code, not assumed**: Python's
  `pass` — needed for an otherwise-empty `except`/`try` body, since `parseBlock()` already requires
  non-empty bodies — has the EXACT SAME silent-mistranslation vulnerability `break`/`continue` had
  before Phase A's fix. Verified directly: `transpilePythonToEml('x = 1\npass\n')` used to succeed
  and emit `x^+1\npass`, treating the bare keyword as a variable reference. EML has no `Pass`/no-op
  AST node at all (confirmed absent from the `Statement` union), so the fix mirrors break/continue's
  shape exactly: recognize `pass` explicitly in `parseStatement()` and throw a clear, fail-loud error
  — NOT add a new no-op emission capability, which would be a separate, out-of-scope feature.
- **`py-parser.ts`**: `parseTry()`/`parseExceptHandler()`/`parseRaise()` mirror the forward parser's
  shapes closely — `try:` body, zero-or-more `except [Type] [as name]:` handlers, optional
  `finally:`, requiring at least one of `except`/`finally` (Python's own rule, enforced identically
  to the forward parser). `raise` with no trailing expression (checked via `NEWLINE`/`DEDENT`/`EOF`)
  is a bare re-raise; otherwise the exception expression reuses the existing `Call`/`Identifier`
  emission machinery (`ValueError("msg")` is already a supported `Call`).
- **The one design decision requiring real care, matching forward's own documented conservatism**:
  per this doc's own "Phase 7" section above, the forward semantic analyzer treats `try`/`except`
  MORE conservatively than `if`/`elif`/`else`'s branch-merge — each `except` handler
  clones the scope from BEFORE the `try` (not from the try body's own clone), since the try body
  might fail partway through. Mirrored exactly for the reverse emitter's `bound` set: the `try` body
  and each `except` handler each get an ISOLATED clone that never merges back (which part, if any,
  actually completed is conditional); `finally` shares the SAME live `bound` (no cloning) since it
  always runs unconditionally — the identical reasoning already applied to `while`/`for` bodies in
  Phase A. Locked in with a dedicated test pair: a name assigned only inside `try` is NOT usable
  afterward (an `AugmentedAssign` on it fails loudly), while a name assigned in `finally` IS.
- **Tests**: `tests/bidirectional.test.ts`'s exclusion regex narrowed to just `def|class` — the ONLY
  remaining forward-only constructs. Fixture 27 (`try_except_finally`) became round-trippable;
  fixture 28 (`raise_custom`) stays excluded since it also uses `def` (Phase E scope, confirmed from
  its content, not a Phase D gap). `tests/reverse-blocks.test.ts` gained a new describe block: basic
  try/except/finally round-trip, `except ... as e` round-trip, try+finally-only round-trip, bare
  `raise` round-trip, `raise <expr>` round-trip, both conservative-scope cases above, and a `pass`
  regression-guard test. 620 tests total (up from 611).
- **Re-ran the same 5 real B-6 corpus files — genuine, concrete progress this time**:
  `Decimal_to_binary_convertor` (previously blocked at line 1 on `try:` itself) now progresses all
  the way to line 3's `if menu < 1 or menu > 2:` — blocked by the `or` boolean operator, which no
  reverse-parser phase has ever supported (a separate, pre-existing gap, not something Phase D was
  meant to address). The other 4 files show no change, exactly as expected (their blockers — `%`,
  `def`, the multi-line dict literal — are all still out of this round's scope). A real, fresh
  try/except/finally-inside-a-loop snippet was used for the end-to-end CLI proof
  (`eml compress` → `eml roundtrip` → `eml run`, matched real Python).

**Phase E1 (same day, 2026-07-16): function definitions + `return`.** Mirrors forward Phase 2 —
the `@cold`/neutral subset only; `class` (forward Phase 7e) is deliberately its own separate future
round (E2), not attempted here. Zero AST changes — `FunctionDef`/`ReturnStatement`/`Decorator`/
`Temperature` (`packages/types/src/ast.ts`) were already fully modeled for both directions since
forward Phase 2.

- **Two real, non-obvious findings, verified directly against the forward source BEFORE writing any
  implementation code — the most consequential research this whole reverse-transpiler effort has
  surfaced.**
  1. **`@cold` and `@hot` are NOT symmetric in the emitted Python.** Read
     `packages/transpiler-python/src/emitter.ts`'s `FunctionDef` case directly: `@cold` (non-async)
     emits a real `@functools.cache` decorator; `@hot` emits only a **comment**
     (`# @hot: dynamic state — not cached`); no decorator emits nothing. Since this reverse lexer
     discards comments entirely (never tokenizes them), `@hot` is **structurally unrecoverable from
     emitted Python — a permanent information-loss boundary, not "not yet implemented,"** the same
     category as `async`/`await` being permanently forward-only. A function that was originally
     `@hot` will not reach a round-trip fixpoint; documented as such in §9/§11 rather than glossed
     over as a deferred gap like `class`.
  2. **`import functools` is auto-synthesized boilerplate, not user-authored EML.** Confirmed via
     `packages/transpiler-python/src/semantic.ts` (~line 596): the forward semantic analyzer adds
     `'import functools'` to an auto-collected `importsNeeded` set whenever a non-async `@cold`
     function exists, independent of any user-written `import` statement, hoisted to the file top.
     `tests/fixtures/15_cold_function.eml`'s source has no `import` line at all; its `.expected.py`
     has `import functools` purely from this auto-synthesis. Treating this bare import as a real,
     preservable `ImportStatement` (as Phase C's bare-import logic would by default) would duplicate
     it on the next forward pass. Fixed with a `functools`-specific skip in `parseProgram()`'s
     pre-filter, mirroring how `import numpy as np` is already specially dropped.
- **`py-lexer.ts`**: added `AT` (`@`) — the first genuinely new token since Phase B2's
  `LBRACE`/`RBRACE`, and the entire lexer change.
- **`py-parser.ts`**: `parseFunctionDef()` recognizes ONLY the exact decorator shape the forward
  emitter ever produces — `@functools.cache` (via `expectName`/`expect(DOT)` chained checks) — setting
  `temperature: 'cold'`; anything else after `@` (`@staticmethod`, `@property`, a custom decorator,
  `functools.lru_cache(...)`, a parenthesized `@functools.cache()`) throws rather than
  partial-matching, since none of those shapes are ever reachable from this emitter's own output.
  `async` gets an explicit, dedicated rejection message in `parseStatement()` (temporal loops are
  permanent forward-only) rather than falling through to a generic "unexpected token" failure —
  intentionally a better error than every other still-unsupported keyword gets for free. Params are
  bare comma-separated `NAME`s only (no defaults/`*args`/`**kwargs`/annotations), matching the
  `Identifier[]`-only `FunctionDef.params` type. `parseReturn()` mirrors `parseRaise()`'s bare-vs-
  expression shape exactly.
- **`eml-emitter.ts`**: `Return` is a one-line ternary. `FunctionDef` introduced the round's one
  genuinely new scoping rule: a **fresh, function-local `bound` set — not cloned from the enclosing
  scope** — pre-seeded only with the function's own parameter names. Every prior block construct
  (if/while/for/try) is only isolated GOING OUT (nothing declared inside reliably survives after, but
  the enclosing scope's names remain visible/mutable inside); a function body is the first construct
  isolated in BOTH directions, since it's the first one that's also a real call boundary — nothing
  from the caller's scope leaks in, and nothing declared inside leaks back out. `@hot` is never
  emitted (nothing to emit it as, and it can never arise from re-parsing already-emitted Python
  anyway — only from a freshly-forward-transpiled AST).
- **Tests**: `tests/bidirectional.test.ts`'s exclusion regex narrowed to just `class` — the ONLY
  remaining forward-only construct. Fixture 15 (`cold_function`) and fixture 28 (`raise_custom`, a
  nice bonus — uses `def`+`if`+`raise`+`try`+`except` but no `class`) both became round-trippable.
  `tests/reverse-blocks.test.ts` gained a new describe block: `@cold` function round-trip (incl.
  confirming the auto `import functools` is correctly dropped, not duplicated, on re-forward-
  transpile), neutral function round-trip, bare `return` round-trip, the fixture-28-mirroring
  combined def+if+raise+try case, function-scope isolation going OUT (a name assigned inside a
  function does not leak to the caller) and going IN (a module-level bound name doesn't
  false-positive "already bound" for a same-named fresh local inside a function), `async def`
  rejection, and an unsupported-decorator (`@staticmethod`) rejection. No positive test exists for
  `@hot` — it's permanently unrecoverable, not merely untested. 632 tests total (up from 620).
- **Verification**: a real, fresh recursive `@cold` function (`factorial`, calling itself) was run
  through the actual CLI end to end — `eml compress` → `eml roundtrip` (fixpoint OK) → `eml run`
  (153 == 153, matched a real `python` run byte-for-byte) — and the reconstructed EML was confirmed
  to NOT contain a spurious `import functools` line. Re-ran the same 5 real B-6 corpus files:
  `Duplicate_files_remover` (previously blocked at `def hashFile`, line 7) now progresses to
  `with open(filename, 'rb') as file:` on line 11 — `with`/context managers are a new, separate,
  out-of-this-round gap, and this is concrete proof `def` itself now fully lexes/parses. The other 4
  files show no change, exactly as expected (`%`, `or`, and the multi-line dict literal remain
  earlier in those files than any function definition).

**Phase E2 (same day, 2026-07-17) — final phase: `class`.** Mirrors forward Phase 7e's minimal
viable OOP. This closes out the entire reverse-transpiler effort: every Phase 0–7 statement/
expression kind that can round-trip now does. Verified directly against the AST and forward parser
before writing any code — this turned out to be the smallest phase of the whole series, smaller even
than Phase B1.

- **The AST needed zero changes and so did the lexer.** `ClassDef` (`packages/types/src/ast.ts`) is
  just `{ name: string, body: Statement[] }` — no base classes, no metaclass, no decorators. Its own
  doc comment: "Methods are ordinary nested `FunctionDef` nodes — `self` is just an ordinary first
  parameter, nothing special at the AST level." `class` is just another `NAME` token, same convention
  every keyword in this reverse lexer follows.
- **`py-parser.ts`**: `parseClassDef()` mirrors the forward parser's own `parseClassDef()` almost
  line-for-line: `class Name:` then the exact same generic `parseBlock()` every other compound
  statement already uses. Deliberately NO body-shape restriction here (methods/assignments only) —
  confirmed the forward parser doesn't enforce this at the grammar level either; it's a
  `semantic.ts`-only rule (`E_CLASS_BODY_UNSUPPORTED`). Matches this whole effort's established
  practice of letting downstream forward validation catch subset violations rather than duplicating
  restrictions in the reverse parser.
- **`eml-emitter.ts`**: the `ClassDef` case is a `class ${name}:` header + a fresh, class-local
  `bound` scope for the body — the same isolation reasoning as `FunctionDef` (Phase E1), since a
  class-level variable must not be confused with a same-named module-level binding. Nested method
  bodies needed NO special handling: `FunctionDef`'s own case already builds its own fresh `fnBound`
  from its params regardless of what `bound` is passed to it, so method-body isolation fell out for
  free from Phase E1's existing logic. Because `self.attr = value` (Phase C's `Attribute` assignment
  target), `obj.method()` (Phase C's attribute-callee `Call`), and `return` (Phase E1) were already
  fully supported, the ONLY new code this entire phase needed was the parser dispatch line + method +
  the emitter case above.
- **A genuine correction, found by re-deriving a Phase E1 test rather than assumed still true**:
  Phase E1's docs said a `@hot` function "will not reach a round-trip fixpoint" — true, but this
  round discovered the PRECISE mechanism isn't a thrown reverse-parse error. The reverse lexer
  silently discards the `# @hot: ...` comment and happily parses the decorator-stripped Python as an
  ordinary neutral function — `transpilePythonToEml` succeeds. The information loss only surfaces
  later as a silent round-trip **mismatch** (`python1` still carries the comment; the reconstructed
  `python2` does not). Caught while updating `tests/mcp-logic.test.ts`'s envelope-shape test (which
  used `class` as its "guaranteed to fail" example before this phase) — swapping in a fresh `@hot`
  example and asserting the wrong error string surfaced the actual message
  (`'round-trip MISMATCH (python1 != python2)'`), not `'reverse Python->EML failed'`. §9/§11 tightened
  accordingly.
- **Tests**: `tests/bidirectional.test.ts`'s `roundTrippable` filter removed entirely — `class` was
  the last exclusion, so it's now just `fixtures` with no filtering; all 29 fixtures round-trip.
  `tests/reverse-blocks.test.ts`'s now-obsolete "still out of scope this round" describe block
  (its one remaining case, "a class definition still fails") was replaced with a new Phase E2 describe
  block: a `Counter`-mirrors-fixture-29 round-trip, a class-level-variable-alongside-methods
  round-trip, and the class-scope "isolated going in" test (mirroring Phase E1's function-scope test).
  `tests/mcp-logic.test.ts` needed one real fix: its envelope-shape regression test used `class` as a
  convenient "always fails at reverse" example; swapped to a fresh `@hot` example (see the correction
  above) plus a new positive test confirming `COUNTER_SRC` now round-trips. 637 tests total (up from 632).
- **Verification**: a real, fresh `BankAccount` class (`deposit`/`withdraw`/`get_balance`, a running
  balance) was run through the actual CLI end to end — `eml compress` → `eml roundtrip` (fixpoint OK)
  → `eml run` (120 == 120, matched a real `python` run byte-for-byte). Re-ran the same 5 real B-6
  corpus files: no change for any of them, exactly as expected — none of the 5 has `class` as its
  first blocker (their blockers remain `%`, `or`, `with`, and the multi-line dict literal). **The
  reverse Python→EML transpiler effort is now complete**: only `@temporal_loop`, `async`/`await`, and
  the permanent `@hot` exception remain outside the round-trip invariant.

## Phase 9 — real-corpus language extension (item 1: `and`/`or`, item 2: `%`, item 8: `not`, item 3a: tuple + `%`-format, item 4: triple-quoted strings, item 5: `print(x, end=...)`, item 6: `with`, item 7: multi-line brackets)

Re-measuring the same 5 real B-6 corpus files after Phase 8's completion exposed that
`Decimal_to_binary_convertor` and `Leap_Year_Checker` are blocked by a genuine LANGUAGE-level gap,
not a reverse-transpiler gap: EML has never had boolean-logic combinators — only a single
`Comparison` (`x > 5`), no way to combine two (`x > 5 and y < 3`). This is a NEW roadmap category
(`docs/roadmap.md`'s Phase 9): extending the language itself, both directions, not another
reverse-transpiler sub-phase. Neo chose to tackle it item-by-item, smallest first; `and`/`or` is
item 1 of ~7 discovered gaps (numeric `%`, string formatting via two distinct mechanisms,
triple-quoted strings, `print(x, end=...)` kwargs, `with`/context managers, multi-line bracketed
literals — each its own future round).

- **This is a genuinely new `Expression` node type, so it touches far more files than a typical
  single-direction reverse-transpiler phase** — confirmed by a dedicated research pass (an Explore
  agent mapping every place in the codebase that pattern-matches over `Expression['type']`, plus
  direct verification of every precedence table and parser entry point) before writing any code.
  `LogicalExpression { op: 'and'|'or', left, right }` (`packages/types/src/ast.ts`) mirrors
  `ComparisonExpression`'s exact shape.
- **Forward**: `packages/types/src/tokens.ts` gained `AND`/`OR` tokens; `packages/parser/src/lexer.ts`
  recognizes them via the existing keyword-branch chain (this lexer uses dedicated tokens, unlike the
  reverse lexer). `packages/parser/src/parser.ts` inserted `parseOr()`/`parseAnd()` between
  `parseConditional()` and `parseComparison()` — the conditional's `test` now calls `parseOr()`
  instead of `parseComparison()` directly; `consequent`/`alternate` already recurse through the full
  chain via `parseExpression()`, so they pick up `and`/`or` for free without any change.
  `packages/parser/src/normalizer.ts` gained `∧`→`' and '`/`∨`→`' or '` Unicode display-form
  substitutions, mirroring the existing `∈`→`' in '` entry exactly — a natural, low-cost extension of
  this file's own stated design ("a high-value Unicode display form").
- **Precedence renumbering — the single most error-prone part of this round, because it lives in
  THREE independent, non-shared copies**: `transpiler-python/src/emitter.ts`,
  `transpiler-eml/src/eml-emitter.ts`, and `transpiler-cpp/src/emitter.ts` each maintain their own
  `precedence()`/`child()` pair. Renumbered tightest→loosest: conditional=1, or=2, and=3,
  comparison/membership=4 (was 2), binary +/-=5 (was 3), binary \*/÷=6 (was 4), power=7 (was 5),
  atoms/default=8 (was 6). Every hardcoded old-precedence literal scattered through each file
  (`Power`'s base-wrap check, `Await`/`Subscript`/`Attribute`'s postfix-wrap checks, and
  `transpiler-python/src/emitter.ts`'s `emitRangeEnd()` — a separate function with its own hardcoded
  `< 3` meaning "looser than additive," now `< 5`) had to be updated consistently across all three
  files, not just the table itself — verified by grepping for every `child(..., <number>)` call site
  in each file after the edit, not assumed complete from memory.
- **Six semantic walkers needed a new case** (`recurse into expr.left/expr.right` — no special
  logic, `and`/`or` don't affect purity/importance/loop-classification differently than any other
  binary combinator): `transpiler-python/src/semantic.ts`'s `collectExpr`, `purity.ts`'s
  `scanExpression` and `collectCallsExpr`, `importance.ts`'s `walkExpr`, `loop-classifier.ts`'s
  inline `walk`, and `cts-generator/src/index.ts`'s `collectIdents` (this last one was found only by
  direct verification, not in the original research ask — a good reminder that "search for every
  place a pattern like this exists" beats trusting a fixed list from memory). Three of these six
  (`collectCallsExpr`, `walkExpr`, `loop-classifier`'s `walk`) have a **non-exhaustive `default:`
  fallback** — the exact bug class Phase 3b already hit once with a missed `Await` case (see this
  doc's own "Non-obvious design decisions" section) — so each was verified with a dedicated real test
  (a call/loop hidden inside `and`/`or` must still be found), not just added and trusted.
- **Reverse (`transpiler-eml/src/py-parser.ts`)**: no lexer change needed — this lexer has no keyword
  tokens at all (every identifier is a generic `NAME`, disambiguated via `checkName()`), so `and`/`or`
  recognition is just two more `checkName()` checks, the same pattern `in`/`if`/`else` already use.
  `parseOr()`/`parseAnd()` inserted between `parseTernary()` and `parseComparison()`; BOTH of
  `parseTernary()`'s `parseComparison()` calls (for `consequent` and `test`) needed to become
  `parseOr()` — Python's ternary treats both its condition and its "if true" branch as full
  boolean-expression level.
- **Interpreter (`packages/interp/src/index.ts`) — the one place that must NOT mirror
  `Comparison`/`Binary`'s eager-evaluate-both-sides shape.** Python's `and`/`or` return an OPERAND,
  not always a `bool`, and short-circuit — verified directly against real Python execution before
  writing the case, not assumed from general knowledge (`0 and 5` is `0`; `(a and b) or c` and
  `a and (b or c)` were both hand-checked against real `python -c` output for several truthy/falsy
  combinations to confirm the exact returned VALUE, not just truthiness). Modeled on the existing
  `Conditional` case (test-then-branch) rather than `Comparison`'s eager both-sides evaluation:
  evaluate `left` once, branch on `truthy(left)`, only evaluate `right` when short-circuiting doesn't
  apply. A dedicated test proves the short-circuit is REAL, not just value-correct: `a and
  undefined_name()` with `a` falsy must NOT raise `NameError`, since `undefined_name()` must never be
  evaluated.
- **C⁺⁺⁺ prototype backend**: emits `&&`/`||` — a real, documented divergence (C++'s operators always
  yield `bool`; Python's yield an operand) added to `docs/cpp-feasibility.md`'s "Known divergences."
  **The one genuinely dangerous spot found in this whole round**: `expressionCallsName()` (the
  self-recursion detector gating "never emit broken C++, since an `auto`-return function can't
  recurse") has its own non-exhaustive `default: return false` fallback, structurally identical to the
  three semantic-walker risks above but with a worse consequence — missing this case would let
  `f() and f()`-shaped self-recursion slip past the guard and emit genuinely broken C++ (an
  `auto`-returning function referencing its own undeduced return type), defeating this backend's core
  safety guarantee specifically for the one construct this round adds. Fixed and locked in with a
  dedicated test.
- **Tests**: new `tests/phase9-logical.test.ts` (25 tests) covering forward parse/precedence/Unicode
  normalization, real-Python execution parity (exact returned VALUES for several truthy/falsy
  combinations, not just pass/fail), interpreter short-circuit proof, all three at-risk semantic
  walkers via real transpile/purity/importance/loop-classify calls, the C++ recursion-guard fix, and
  reverse round-trip (a `Decimal_to_binary`-shaped `or` condition, a `Leap_Year_Checker`-shaped mixed
  `and`/`or` combo). **Caught a real bug in the test file itself while writing it**: an early draft of
  the "real Python execution parity" test table had a self-referential assertion
  (`expect(pythonStdout(...)).toBe(cond ? pythonStdout(...) : '')`) that was trivially always true —
  rewritten with explicit hand-computed expected values per case. `tests/mcp-logic.test.ts` was
  untouched (that file's own envelope-shape tests don't happen to exercise boolean expressions).
  662 tests total (up from 637).
- **Verification**: a real, fresh loop-with-boolean-condition snippet (`(i > 5 and i < 15) or i ==
  20`, counting matches over `[1:20]`) matched real Python exactly (10 == 10) via both `eml run` and
  a direct `python`-executed transpile. Re-ran the same 5 real B-6 corpus files: **genuine, honest
  progress** — `Decimal_to_binary_convertor` moved from failing at `or` (line 3) all the way to line
  7's `bin(dec)[2:]`, a Python **sequence slice** expression — a distinct, new gap from EML's own
  `[a:b]` range literal (which means something semantically different: an inclusive range, not
  subsequence extraction), proving `and`/`or` itself is now fully functional. `Leap_Year_Checker`
  shows no change, exactly as expected: its `%` appears lexically BEFORE `and`/`or` on the same line,
  so the lexer still stops there first — not a regression, just where that file's blocker happens to
  sit.

### Item 2 — numeric modulo `%` (2026-07-17, same day)

A much smaller round than `and`/`or`, verified before planning: `%` reuses the EXISTING `Binary`
node (just widening `BinaryOperator` to include `'%'`), not a new `Expression` type. Read every
relevant file first — `Binary`'s case in all 6 semantic walkers, and `OverlayAssign`'s resolution in
`semantic.ts` (everything except `op === '+'` is already one generic "else — always augmented"
branch) — confirmed **zero changes needed** to any of those 7 places, since they're already written
generically over `BinaryOperator`, not enumerating specific operators.

- **Forward/reverse lexer+parser**: two new tokens (`PERCENT`/`PERCENTEQ`) on the forward side (this
  lexer uses dedicated keyword/operator tokens); the reverse lexer needed the same two tokens too
  (unlike `and`/`or`, which needed zero reverse-lexer tokens since those are keyword-shaped and this
  lexer has no keywords — `%` is punctuation, so it needs an explicit token either way).
  `parseMultiplicative()` widened in both directions to recognize `PERCENT` alongside `STAR`/`SLASH`
  — `%` shares Python's real precedence tier with `*`/`/` (not its own tier), confirmed directly, so
  no precedence-table renumbering was needed at all this round (contrast with `and`/`or`, which
  needed a full 3-file renumbering).
- **The one real emitter fix, in all three `precedence()`/`child()` copies**: `nonAssoc` (which
  forces parens on an equal-precedence right operand) needed `%` added alongside `-`/`/` — `%` is
  non-associative (`a % (b % c)` must keep its parens on re-emission, or the grouping silently
  changes meaning). Verified with a dedicated test using explicit right-side parens, not assumed
  from the `/` precedent.
- **The interpreter needed REAL Python floor-mod semantics, not JS's native `%`** — this is where
  almost all of this round's actual thinking went. Python's `%` takes the sign of the DIVISOR
  (`-7 % 3 == 2`); JS's and C++'s native `%` take the sign of the DIVIDEND (`-7 % 3 == -1` in both).
  Verified directly against the real, installed Python (3.14.5) via `python -c` for several sign
  combinations (`-7 % 3`, `7 % -3`, `-7 % -3`, `-7.5 % 3`) before writing any code — the classic
  `((a % b) + b) % b` floor-mod conversion, applied to both the bigint and float arithmetic paths in
  `values.ts`'s `arith()`. Also verified directly (not assumed from `/`'s existing type-conditional
  message): `%`-by-zero raises `ZeroDivisionError('division by zero')` — the SAME literal message
  for int and float alike in this Python version, simpler than `/`'s own message logic.
- **String-formatting `%` (`"%s" % (a, b)`) is a distinct, separate semantic, deliberately deferred**:
  `index.ts`'s `Binary` case checks for a string operand BEFORE calling `arith()` and throws
  `Unsupported('% string formatting', ...)` — mirroring this file's existing deferral pattern
  (Matrix/Transpose/Await) rather than letting `arith()`'s generic isNumeric check throw a
  misleading `TypeError`, or worse, silently doing the wrong thing. `values.ts` itself stays
  defer-agnostic (no `Unsupported` import there), preserving the existing layering where only
  `index.ts` knows about deferral.
- **C++ prototype backend**: C++'s `%` is integer-ONLY — applying it to a `double` is a compile
  error, a real correctness risk unique to `%` among the four arithmetic operators (unlike `/`,
  which compiles fine for both int and float, just with different semantics — the existing
  documented divergence). Added a literal-level guard mirroring this backend's existing `List`
  integer-literal check: a `%` with either operand a non-integer `NumberLiteral` is rejected with
  `E_CPP_UNSUPPORTED` rather than emitting broken C++. Can't catch a non-literal (variable) float
  operand — the same accepted type-blindness `/` already has, documented as such.
- **Tests**: new `tests/phase9-modulo.test.ts` (15 tests) — forward parse/precedence/`nonAssoc`,
  real-Python execution parity for the exact negative-operand cases verified above (checked against
  BOTH the forward-emitted-then-executed Python AND the interpreter, not just one), `x %= 5` /
  `x^%5` round-tripping through the already-generic augmented-assign machinery, `ZeroDivisionError`
  message-text verification, the string-`%` deferral, the C++ integer guard, and reverse round-trip
  (a `Leap_Year_Checker`-shaped `%`+`and`+`or` combo). 677 tests total (up from 662).
- **Verification**: a real, fresh leap-year-counting snippet (`((y % 4 == 0) and (y % 100 != 0)) or
  (y % 400 == 0)` over `[1896:2100]`) matched real Python exactly (50 == 50) via `eml run`. Re-ran
  the same 5 real B-6 corpus files — **both `%`-blocked files show genuine, concrete progress**:
  `Leap_Year_Checker` moved from `%` (line 3) to a triple-quoted docstring `"""..."""` (line 4),
  landing exactly on the already-known item 4 gap. `Calculate_age` moved from `%` (line 48) all the
  way to line 21's `(not leap_year)` — a **newly-discovered gap this round**: Python's `not` unary
  boolean negation, previously masked by `%` blocking earlier in the same file, never reached by any
  prior measurement. Small in scope (same mechanism family as `and`/`or`, just unary), logged as a
  new roadmap candidate (`docs/roadmap.md`'s Phase 9 item 8) rather than silently folded into this
  round's "done" claim.

### Item 8 — unary boolean `not` (2026-07-17, same day)

Smallest remaining candidate after `%`'s corpus re-measurement surfaced it. Same mechanism family as
`and`/`or` (a genuinely new `Expression` node needing a case in every analysis pass), but differs in
two ways: Python's `not` always returns a real `bool` (unlike `and`/`or`'s operand-return, simpler
here), and it needed its own brand-new precedence tier — the **4th renumbering pass** across the same
3 independent emitter files this Phase 9 track keeps touching.

- **AST**: `NotExpression { type: 'Not', operand: Expression }` (`packages/types/src/ast.ts`) mirrors
  the pre-existing `TransposeExpression`'s exact single-operand shape, not `LogicalExpression`'s
  two-operand one.
- **Forward**: `tokens.ts` gained `NOT`; `lexer.ts`'s keyword chain recognizes it alongside `and`/`or`.
  `parser.ts` inserted a right-recursive `parseNot()` between `parseAnd()` and `parseComparison()`
  (`not_test: 'not' not_test | comparison`, mirroring Python's own grammar so `not not x` parses
  correctly without extra machinery). `normalizer.ts` gained `¬` → `not ` — **NOT the same
  both-side-spacing `∧`/`∨` use**: a real bug caught by a direct test in `tests/phase9-not.test.ts`,
  not assumed safe from that precedent. `∧`/`∨` are always infix and never appear at line-start in
  valid grammar; `¬` is a PREFIX operator and legitimately CAN start a line (e.g. `¬x => r`), where a
  leading space corrupts the indentation-sensitive lexer's whitespace measurement, producing a bogus
  `Unexpected token INDENT`. Fixed by using a trailing-space-only replacement (`'not '`) for `¬`.
- **Precedence renumbering (4th pass, same 3 files)**: inserted a new tier 4 for `Not`, shifting
  everything at the old tier 4+ up by one — final table: Conditional=1, Or=2, And=3, **Not=4 (new)**,
  Comparison/Membership=5, Binary+/-=6, Binary\*/÷/%=7, Power=8, atoms/default=9. Every hardcoded old
  literal (`emitRangeEnd`'s threshold, Power/Await/Subscript/Attribute's wrap checks) shifted
  accordingly in all three files, re-verified by grepping every `child(..., <number>)` call site per
  file after editing — the same discipline as every prior renumbering round.
- **The one genuinely critical finding this round, verified by reasoning through concrete cases
  BEFORE writing any code**: Python's `not` binds LOOSER than comparison (`not x > 5` means
  `not (x > 5)`), but C++'s `!` binds MUCH TIGHTER than comparison (`!x > 5` parses as `(!x) > 5` in
  real C++). The shared `precedence()`/`child()` machinery is correct for the Python and EML emitters
  (both genuinely follow Python's own precedence), but reusing it naively for the C++ backend would
  silently emit textually-plausible, semantically WRONG C++. Fix: the C++ backend's `Not` case
  bypasses `child()`/`precedence()` entirely and always parenthesizes its operand —
  `` `!(${emitCppExpression(expr.operand)})` `` — correctness over minimal parens. Locked in with a
  dedicated test asserting the critical case emits `!(x > 5)`, and explicitly asserting it does NOT
  contain the wrong `!x > 5`. Documented in `docs/cpp-feasibility.md`'s "Known divergences" as
  stricter than `%`'s guard: a precedence mismatch here would silently compute the WRONG boolean, not
  just fail to compile.
- **Seven semantic walkers** (one more than `and`/`or`'s six, since `cts-generator`'s `collectIdents`
  was already known from that round) all got a single-operand recursion case mirroring
  `Transpose`'s existing one — `transpiler-python/src/semantic.ts`'s `collectExpr` (plus
  `symbols.add('not')`), `purity.ts`'s `scanExpression`/`collectCallsExpr`, `importance.ts`'s
  `walkExpr`, `loop-classifier.ts`'s `walk`, `cts-generator/src/index.ts`'s `collectIdents`, and
  `transpiler-cpp/src/emitter.ts`'s `expressionCallsName` — each verified with a dedicated real test
  (a call/loop/recursion hidden inside `not` must still be found), since several of these have a
  non-exhaustive `default:` fallback, the same bug class flagged in every prior Phase 9 round.
- **Reverse (`py-parser.ts`)**: no lexer change — `not` is keyword-shaped and this lexer has no
  keyword tokens (every identifier is generic `NAME`, disambiguated via `checkName()`), identical
  treatment to `and`/`or`. `parseNot()` inserted between `parseAnd()` and `parseComparison()` using
  `this.checkName('not')`, same right-recursive shape as the forward parser.
- **Interpreter**: simpler than `and`/`or` — `` case 'Not': return BOOL(!truthy(evalExpr(expr.operand,
  scope))); `` — Python's `not` always returns a real bool, verified against real Python for a falsy
  non-bool case (`not 0` → `True`, not just a bool flip of a bool).
- **Tests**: new `tests/phase9-not.test.ts` (19 tests, all passing) — forward parse; precedence
  (`not x > 5` stays bare, `not (a or b)` keeps its parens, `not not x` no extra parens); `¬`
  normalization (the test that caught the leading-space bug above); real Python execution parity
  including the falsy-non-bool case; the 4 non-compile-enforced-walker tests; the C++ always-`!(...)`
  emission plus the critical `!(x > 5)`-not-`!x > 5` test plus the self-recursion-hidden-behind-`not`
  guard test; reverse round-trip (bare `not`, a `Calculate_age`-shaped `and (not leap_year)` combo,
  and verbatim `not` emission with no Unicode substitution reverse-side). **696 tests total** (up
  from 677).
- **Verification**: a fresh leap-year-count-with-negation CLI snippet matched real Python exactly (50
  == 50) via `eml run`. Re-ran the same 5 real B-6 corpus files: `Calculate_age` — the file this item
  targeted — progressed from `not` (line 21) all the way to line 48's `(name, year)`, a **tuple
  literal** inside a `%`-format string. This is a sub-detail of the already-known item 3 (string
  formatting), not a new gap: real `%`-format usage almost always pairs with a tuple literal on the
  right, so item 3's scope now explicitly includes tuple literals — logged in `docs/roadmap.md`
  rather than silently expanding item 3's "done" claim later without a record of why.

### Item 3a — tuple literals + `%` string-formatting (2026-07-18)

Re-reading `Calculate_age` line 48 (`"%s's age is %d years or " % (name, year), end=""`) more
closely revealed it actually needs THREE independent gaps at once: the `%` string-format operator, a
**tuple literal** `(name, year)` (EML had no tuple type at all), and `print(..., end=...)` keyword
arguments (already-catalogued item 5). Checking the other two `.format()`-using corpus lines
(`Decimal_to_binary_convertor` line 7, `Leap_Year_Checker` line 7/12) confirmed `.format()` itself is
**not yet reachable by any of the 5 real corpus files** — both are blocked earlier by unrelated gaps
(a Python slice `bin(dec)[2:]`, and item 4's triple-quoted docstring). So this round scoped to the
concrete, corpus-reachable half — tuple literals + `%` string-formatting (item 3a) — leaving
`.format()` as item 3b for later. **Update (2026-07-18, while re-testing item 4): item 3b turned out
to need no implementation at all** — see that round's write-up below, since it was discovered as a
byproduct of item 4's corpus re-test, not this one's.

- **AST**: `TupleLiteral { type: 'Tuple', elements: Expression[] }` mirrors `ListLiteral`'s exact
  shape. **No new lexer tokens on either side** (`LPAREN`/`RPAREN`/`COMMA` already exist, used today
  for call args) and **no precedence-table renumbering** (Tuple is an atom-tier literal exactly like
  `List`, which already falls to every `precedence()`'s `default: return 9`) — the smallest-footprint
  Phase 9 round yet in those two respects.
- **The one genuinely new piece of parsing logic, in both `parser.ts` (forward) and `py-parser.ts`
  (reverse)**: `parsePrimary()`'s `LPAREN` case (previously pure grouping — parse one expr, expect
  `RPAREN`) becomes the tuple-vs-grouping disambiguation point, mirroring `parseBracket()`'s existing
  empty/single/multi structure. Traced by hand against real Python syntax before writing: `(x)`
  **without** a comma stays plain grouping (returns `x`, not a 1-tuple — matches Python exactly);
  `(x,)` produces a genuine 1-element tuple (the trailing-comma case, `break`ing out of the element
  loop before the next `parseExpression()` call is what makes this work); `(x, y)`/`(x, y,)` both
  produce a 2-tuple; `()` produces an empty tuple. No conflict with existing call-arg parsing: a call
  is only entered via `parsePostfix()`'s separate `LPAREN` branch when it immediately follows an
  `Identifier`/`Attribute` — a standalone `(...)` reaching `parsePrimary` never hits that branch.
- **Emitters**: `case 'Tuple'` in both the forward Python emitter and the reverse EML emitter, each
  handling the same three shapes (`()`, `(x,)` with the required trailing comma, `(x, y, ...)`
  without one) — verified the single-element trailing comma is mandatory for a real Python tuple, not
  optional. `eml-emitter.ts`'s `isInlineLiteral` whitelist gained `'Tuple'`, mirroring `List`/`Dict`/
  `Set`. The C⁺⁺⁺ prototype's `Tuple` case throws `E_CPP_UNSUPPORTED` unconditionally (mirroring the
  existing `Matrix`/`await` rejections) — this numeric-only prototype has no tuple or string-
  formatting model at all, so unlike `List` (which gets a partial integer-literal-only allowance)
  there's no partial-support case to reason about. `expressionCallsName`'s non-exhaustive `Tuple` case
  still needed the real recursive body (self-recursion hidden inside a tuple must still be caught by
  the same pre-pass every other construct uses) — verified with a test that asserts the SPECIFIC
  "Recursive function" message fires, not just the generic tuple-rejection message, since both
  present as the same `E_CPP_UNSUPPORTED` diagnostic code and would otherwise be indistinguishable.
- **Seven semantic walkers** got a `case 'Tuple':` mirroring their existing `case 'List':` body
  verbatim (same 7 files as the `not` round: `semantic.ts`'s `collectExpr`, `purity.ts`'s
  `scanExpression`/`collectCallsExpr`, `importance.ts`'s `walkExpr`, `loop-classifier.ts`'s `walk`,
  `cts-generator`'s `collectIdents` — plus its second, unrelated symbol-id-labeling switch gained
  `'tuple.literal'` for consistency with `List`/`Dict`/`Set`/etc., though that switch isn't compile-
  enforced).
- **The interpreter is where the real work went, in two respects**:
  1. **A genuinely new `PyVal` kind (`{ k: 'tuple'; v: PyVal[] }`), deliberately narrower than
     `list`** — truthy/equality/`in`/`for`-iteration/subscript-read/`str()`/`repr()` all needed a real
     case (equality in particular is NOT optional: without a same-kind `pyEquals` case, a tuple would
     silently fall through to the generic `return false`, making `(1,2) == (1,2)` wrongly `False` —
     a correctness trap, not a fail-loud gap). Deliberately excluded: arithmetic (`+` concat, `*`
     repeat), ordering comparison (`<`/`>`), and hashability (as a dict/set key) — none used by the
     real corpus, and each already fails loud via an existing generic default (a real `TypeError`)
     rather than needing a new, possibly-wrong partial implementation. `str()`/`repr()` reproduce
     Python's single-element trailing-comma quirk exactly (`(1,)`, not `(1)`).
  2. **A new `percentFormat()` function implementing Python's printf-style `%` mini-language subset**:
     `%s` (via `pyStr`), `%d` (int conversion — **truncates a float toward zero**, verified `3.9`→`'3'`,
     `-3.9`→`'-3'` against real Python before writing this, not assumed), `%f` (6-decimal default
     precision, verified `3.14159265`→`'3.141593'`), `%%` (literal percent). Every error message —
     argument-count mismatches, the cross-type `int % str` TypeError, `%d` on a non-numeric value —
     was verified directly against the real, installed Python first (`not enough arguments for format
     string`, `not all arguments converted during string formatting`, `unsupported operand type(s)
     for %: '<type>' and 'str'`, `%d format: a real number is required, not <type>`). A tuple
     right-hand side supplies the substitution values in order; anything else is treated as the
     single value (`"%s" % 5` and `"%s" % (5,)` are identical, matching real Python). Explicitly out
     of scope: `.format()` (item 3b), `%(name)s` mapping keys, and any flag/width/precision modifier
     — `percentFormat` throws clearly on these rather than mis-formatting silently.
  3. This SUPERSEDED the old blanket `Binary` case guard that deferred ANY string-`%` as
     `Unsupported('% string formatting', ...)` from the modulo round — `tests/phase9-modulo.test.ts`'s
     old test for that deferral was updated (not deleted) to assert the new, more precise real-Python
     behavior for its specific case (`"hi" % 5`, a format string with no directives, now correctly
     raises `not all arguments converted during string formatting` instead of deferring) — the same
     "stale test assumption, fix rather than delete" discipline used for the `@hot`/`COLDHOT` fixes
     earlier in this project.
- **Tests**: new `tests/phase9-tuple-format.test.ts` (28 tests) — forward parse (empty/single-with-
  required-trailing-comma/multi tuple, confirming `(x)` without a comma still parses as plain
  grouping); forward-emit round-trip of all shapes; real-Python execution parity for the
  `Calculate_age`-shaped 2-directive/2-element case and for `%s`/`%d`/`%f`/`%%` individually (checked
  against BOTH forward-emitted-then-executed Python and the interpreter); the four verified real-
  Python error messages; the C++ `expressionCallsName` guard test (asserting the specific "Recursive
  function" message) plus the Tuple-itself-rejected test; interpreter tests for tuple truthy/equality
  (including tuple ≠ list with equal elements)/iteration/membership/subscript-read/str+repr; reverse
  round-trip of a clean `"%s and %d" % (a, b)`-shaped snippet (deliberately not the full messy
  `Calculate_age` line, since `end=""` is a separate, not-yet-done gap). **724 tests total** (up from
  696).
- **Verification**: a fresh `Calculate_age`-shaped CLI snippet (`name`/`year` with `%s`/`%d`) matched
  real Python exactly via `eml run`. Re-ran the same 5 real B-6 corpus files — **honest result**:
  `Calculate_age` advanced from the tuple/`%`-format expression on line 48 to the **same line's**
  `end=""` keyword argument (item 5, not yet done) — this round narrows but does not fully clear that
  file, stated plainly rather than glossed over. The other 4 files show no change, exactly as
  expected (none were blocked on tuple/`%`-format). Also surfaced, while re-checking
  `Decimal_to_binary_convertor`'s blocker: the Python sequence-slice gap (`bin(dec)[2:]`, found back
  in the `and`/`or` round) still has never been given its own numbered Phase 9 roadmap item — worth
  flagging to Neo as a possible oversight when scoping future rounds.

### Item 4 — triple-quoted strings (2026-07-18, next day)

Compared against item 5 (`print(x, end="")` keyword arguments, `Calculate_age`'s current blocker)
before choosing which to do next: item 5 needs a shared `parseArgs()` change (every call site in the
grammar goes through it), a real architectural change to the interpreter's output-buffering model
(`write()` currently defers the newline to a single blanket step in `finalize()`, not per-call), and
touches 3 emitters with 3 different behaviors. Item 4 was confirmed, by direct code reading before
planning, to be **lexer-only — zero AST/parser/emitter/semantic-walker impact**: `StringLiteral` has
no quote-style flag (every consumer already treats it as an opaque JS string), and a bare string used
as a whole statement (the Python docstring convention) is already valid grammar today in both
directions (nothing needed there either). The smallest round in this whole Phase 9 track.

- **Both lexers** (`packages/parser/src/lexer.ts` forward, `packages/transpiler-eml/src/py-lexer.ts`
  reverse): the existing single/double-quote string branch gained a check for the SAME quote char
  repeated 3× at the current position (`at(quote.repeat(3))`) before falling into the regular-quote
  path — if matched, consume the 3-char delimiter and scan until it reappears, reusing the IDENTICAL
  escape-handling logic (factored into a small shared `readEscape()` closure in each file, so the two
  quote-forms' escape maps can't drift apart from each other). This naturally supports both `'''` and
  `"""` (whichever quote char opened it), matching real Python.
- **The one thing verified directly before writing any code, not assumed safe**: can a multi-line
  string's embedded newlines spuriously trigger this indentation-sensitive lexer's INDENT/DEDENT
  logic? No — the string-reading loop consumes every character (including `\n`) via its own
  `advance()` calls, and `atLineStart` is only ever set by the OUTER dispatch loop's own `c === '\n'`
  branch, which the string loop never returns control to until the closing delimiter is found. This
  already held today for an ordinary quoted string containing a stray literal newline (a rare,
  pre-existing case); it holds identically for a triple-quoted one. Confirmed with a dedicated
  lexer-level test in both lexers (counting `INDENT`/`DEDENT` tokens directly, not just an
  integration-level round-trip check).
- **Zero downstream changes** — confirmed, not assumed: every parser/emitter/semantic-walker/
  interpreter consumer of `StringLiteral` already treats it as an opaque string value. Both the
  Python and EML emitters already re-serialize via `JSON.stringify(expr.value)`, which automatically
  escapes an embedded real newline back into a literal `\n` two-character sequence — a docstring's
  real newlines round-trip safely into a single re-emitted regular-string line with no new logic. The
  C++ backend's `StringLiteral` case (`JSON.stringify(expr.value)` too) needed no change either,
  confirmed by direct reading rather than assumed from the "no change needed" pattern.
- **Tests**: new `tests/phase9-triple-quoted-strings.test.ts` (10 tests) — both quote styles lex to a
  plain `StringLiteral`; an embedded literal newline is preserved as real content; a single stray
  occurrence of the delimiter's own quote character doesn't prematurely close the string; an empty
  triple-quoted string `""""""`; the two lexer-level "no spurious INDENT/DEDENT" tests described
  above (forward and reverse); a forward-emit test that executes the re-emitted Python and confirms
  the RUNTIME string value still contains a real newline (not just checking the source text shape);
  reverse round-trip of a `Leap_Year_Checker`-shaped bare docstring inside an `if`/`else` body (and a
  `'''...'''`-style variant). **734 tests total** (up from 724).
- **Verification**: a fresh docstring-as-first-statement CLI snippet matched real Python exactly via
  `eml run`. Re-ran the same 5 real B-6 corpus files: `Leap_Year_Checker` advanced past all 3 of its
  docstring blocks entirely — genuine, clean progress. The other 4 files show no change, as expected.
- **A significant bonus finding, surfaced only because the corpus re-test moved `Leap_Year_Checker`'s
  blocker forward far enough to reach it**: its NEW blocker is `print("{0} is a leap year!!"
  .format(year))` — but investigating this revealed **item 3b (`.format()`) needs NO implementation
  work at all**, contradicting this doc's own earlier claim (written during the item 3a round) that
  it was "not yet reachable by any corpus file." `.format()` is representationally just an ordinary
  attribute-call (`Attribute` + `Call`, generic since Phase 7c) — verified directly: `year = 2000; msg
  = "{0} is a leap year!!".format(year); print(msg)` compresses and round-trips cleanly with zero
  `.format()`-specific code, today. It's in the exact same category as numpy's `<M>`/`^T`: the
  pure-JS interpreter doesn't model its internals (`interpret()` reports `unsupported: ["call
  value.format()"]`, confirmed directly), so `eml run` defers execution to a real Python subprocess —
  an existing, already-accepted pattern for this class of construct, not a gap. `Leap_Year_Checker`'s
  REAL remaining blocker is unrelated to `.format()` itself: it prints the `.format()` call's result
  directly, unbound, hitting EML's pre-existing, deliberately-designed `^0`-requires-a-bare-identifier
  restriction (§5.3) — not a new language gap. Whether that restriction is worth loosening is Neo's
  call, not assumed or acted on here. `docs/roadmap.md`'s item 3b entry was corrected accordingly
  (from "待做" to "already works, no action needed") rather than left stale.

### Item 5 — `print(x, end=...)`, reverse-only (2026-07-18, same day)

The first Phase 9 item that genuinely needed a NEW EML surface-syntax decision, unlike every prior
item (`and`/`or`/`%`/`not`/tuples/triple-quotes all extend syntax Python already had). EML's only
print mechanism is the `^0` sigil, bare-identifier-only **by deliberate design** (§5.3) — there is no
existing token/shape to extend for a custom terminator. **Asked the user directly via
AskUserQuestion rather than deciding unilaterally**: reverse-only — recognize `print(x, end=...)`
when parsing real Python, but do NOT invent new forward EML syntax to express it. Chosen, approved
direction (of three offered: reverse-only / invent new forward sigil / skip item 5 entirely).

- **Consequence, confirmed by tracing the pipeline before planning**: `eml compress` still ultimately
  FAILS for `Calculate_age`'s real line — but the failure moves from an opaque parser assertion
  (`Expected RPAREN but found ASSIGN`) to an explicit "EML cannot express print's 'end' keyword
  argument" message, the same fail-loud treatment `await`/`async`/Matrix-in-C++ already get. Real,
  useful progress (a precise diagnostic of where EML's expressible subset ends) even though it
  doesn't make this specific corpus line pass — stated plainly in the corpus re-test result below,
  not glossed over.
- **Scope confirmed much narrower than the initial "medium" estimate**, by directly tracing which AST
  ever carries the new field: only `py-parser.ts` (produces `OutputStatement.end`) and
  `eml-emitter.ts` (the only consumer — it's what throws) ever see it. `roundTripFromPython`'s
  pipeline is pyParse → eml-emitter → (only if that succeeds) fresh forward `parse()` → semantic →
  forward Python emitter — since eml-emitter throws whenever `end` is set, the pipeline never reaches
  the forward side with it. So the forward parser/emitter, `@eml/interp`, all 7 semantic walkers/
  cts-generator, and the C++ backend need **zero changes** — verified by directly reading every single
  `case 'Output':` site (12 total) to confirm each only ever touches `stmt.value`, never `stmt.end`,
  rather than trusting the trace alone.
- **A second scope simplification found during research**: rather than teaching the ONE shared
  `parseArgs()` (used by every call in the grammar) to tolerate `NAME '=' expr` kwarg syntax
  generally — which would ripple through the `FunctionCall` AST type referenced by 12 files — `print`
  gets a **dedicated statement-level parse function** (`parsePrintStatement()`), mirroring how
  `py-parser.ts` already special-cases `sum(...)`/`range(...)`/`np....` before generic identifier/
  call parsing. Dispatched from `parseStatement()`'s existing keyword chain (alongside if/while/for/
  try/raise/async/def/return/class/pass/break/continue/import), replacing the old post-hoc check
  (parse a generic expr, then check post-hoc if it happens to be a 1-arg call to `print`) — now dead
  code once the new dispatch fires first, removed rather than left stale.
- Deliberately strict, matching the real corpus need exactly and nothing more: exactly one positional
  argument, optionally followed by exactly `, end = <expr>`. `print(a, b)` (multiple positional args)
  and `print(x, sep=...)` (any other keyword) both fail loud with a clear `PyParseError` — confirmed
  no existing test relied on either shape before making this stricter.
- **Tests**: new `tests/phase9-print-end.test.ts` (10 tests) — `print(x)` (no kwarg) still parses
  identically to before (a regression check for the parser restructure); `print(x, end="")` and
  `print(x, end=some_var)` parse into an `Output` with `end` set; `print(a, b)`/`print(x, sep=",")`
  fail loud at parse time; reverse-emit of ANY `end` value (including the semantically-redundant
  `end="\n"`, deliberately not special-cased) fails with the specific new message, not a generic one;
  the roundtrip pipeline reports the same failure, not a different one further down; a
  `Calculate_age`-shaped snippet confirms the failure point moved from the old opaque parser assertion
  to the new clear message. **744 tests total** (up from 734).
- **Verification**: a fresh `print(x, end="")`-shaped CLI snippet through `eml compress` now fails
  with the new, clear message instead of the old assertion — this item deliberately does not produce
  a newly-successful `eml run`/`eml roundtrip` case the way prior items did, since the point is a
  correctly-diagnosed permanent gap, not a new round-trip win. Re-ran the same 5 real B-6 corpus
  files: `Calculate_age` still does not fully pass `eml compress` (expected, given the reverse-only
  design) — its parse now succeeds all the way through the tuple/`%`-format/kwarg-syntax, failing
  only at the deliberate, by-design emit-time restriction. The other 4 files show no change, as
  expected (none use `print(..., end=...)`).

### Item 6 — `with` / context managers (2026-07-19)

The last unstarted Phase 9 item, previously flagged in the roadmap as "the biggest, most complex one
— involves `__enter__`/`__exit__` execution semantics, not just syntax." The real corpus file is
`Duplicate_files_remover_duplicatefileremover.py`, blocked at line 11: `with open(filename, 'rb') as
file:`.

- **Honest scoping finding from tracing the whole file before planning**: `with` support alone does
  NOT get this file to a full `eml compress` pass. Lines 12-17 (buffer read/hash-update/hexdigest,
  `while(len(buf) > 0):`) all parse fine with existing machinery — but line 26,
  `filelist = [f for f in os.listdir() if os.path.isfile(f)]`, is a **list comprehension**, a
  genuinely new, previously-uncatalogued gap (grepped `docs/` for "comprehension" — zero hits; this
  was never reached by any earlier measurement, since line 11 always blocked first). This round
  implements `with` only, matching its own designated scope; the list-comprehension gap is logged as
  a new, unnumbered candidate in `docs/roadmap.md`, not silently folded in.
- Also confirmed: even with BOTH `with` and comprehensions, this file's `eml run` (actual execution)
  would still defer — `hasher = hashlib.md5()` (line 10, before the `with`) hits the interpreter's
  generic `Unsupported` defer for unbound-module attribute calls (the same category as `.format()`/
  numpy), while `open(...)` itself hits a hard `NameError` — a real, if minor, asymmetry versus the
  softer `Unsupported` treatment attribute-calls get, noted but not fixed this round.
- **Design precedent, confirmed by reading Phase D (`try`/`except`/`finally`) in full before writing
  any code**: EML's own concrete syntax for Python control-flow keywords is just Python's keyword
  syntax verbatim (no sigil translation) — `with` follows the identical pattern. Phase D also
  established the right depth of realism to aim for: full syntactic round-trip + real interpreter
  control-flow, with the "real" object-protocol edge (exception typing) deliberately shallow/
  simplified rather than fabricated. `with`'s interpreter semantics follow the same principle.
- **AST**: `WithStatement { contextExpr, target?, body }` — single context-manager, single optional
  target only (Python's multi-context `with a() as x, b() as y:` form is out of scope; confirmed no
  corpus or test evidence needs it).
- **Forward lexer/parser + reverse parser**: a new `WITH` token (forward; the reverse lexer has no
  keyword tokens at all, matching every other keyword) and a `parseWith()` in both directions,
  mirroring `parseTry()`'s exact shape. `AS` already existed (added for `except ... as e`), reused
  as-is.
- **Emitters**: forward Python + reverse EML both emit plain `with EXPR as NAME:` text, mirroring
  `Try`'s shape. The reverse EML emitter's `bound`-scope handling matches `ForIn`'s treatment, NOT
  `Try`'s cautious per-branch clone — a `with`-body always executes in full before any exception
  matters (unlike `try`, which can fail partway through), so the target uses the SAME live `bound`
  set and stays reliably bound afterward. The C++ backend rejects `With` outright
  (`E_CPP_UNSUPPORTED`), joining the EXISTING `If`/`While`/`ForIn`/`Try`/`Raise`/`ClassDef` rejection
  group in `emitCppStatement` — a discovery worth noting: this prototype's C++ backend doesn't
  support ANY Python-level control-flow statement (only expression-level Σ loops), a narrower scope
  than might be assumed from the demo examples. `statementCallsName`'s non-exhaustive `With` case
  still needed the real recursive body (self-recursion hidden inside a `with` body must still be
  caught), verified with a dedicated test.
- **Six semantic walkers** each got a `With` case mirroring their file's own `ForIn`/`Try` handling —
  `semantic.ts` matches `ForIn`'s "no new scope, live" reasoning (not `Try`'s cautious clone), `as`
  reliably bound afterward; `purity.ts` (both functions) and `importance.ts` recurse into
  `contextExpr` + body; `loop-classifier.ts` needed changes in BOTH of its statement-walking
  functions (confirmed by reading each): `scanStatementExpr`'s local dispatch gets
  `walk(stmt.contextExpr)`, and the separate `visitStmt` (which recurses into nested bodies to find
  loops) gets its own `With` case, mirroring `Try`'s block minus handlers/finally; `cts-generator`
  gets `'control.with'` in the semantic-type classifier, and — a small, deliberate deviation from the
  original plan, found to be more consistent during implementation — `stmt.contextExpr` (not `null`)
  in `statementValue()`, since `with` has one clear "primary subject" expression the same way `If`/
  `While` return `test` and `ForIn` returns `iterable`, unlike `Try` (genuinely no single expression,
  several disjoint branches).
- **The interpreter is where the real work went**: real `__enter__`/`__exit__` protocol dispatch,
  reusing the EXISTING `findMethod`/`runMethodBody` closures (Phase 7e) rather than building new
  dispatch machinery. Checks `__exit__` presence BEFORE `__enter__`, matching real Python's own check
  order exactly — verified directly (not assumed) against the installed Python: a value missing both
  methods reports `'<type>' object does not support the context manager protocol (missed __exit__
  method)` first, only reporting "missed __enter__ method" once `__exit__` is confirmed present.
  `__exit__(exc_type, exc_val, exc_tb)` is called unconditionally: `(NONE, NONE, NONE)` on normal
  completion OR on any non-exception exit (`break`/`continue`/`return`/`Unsupported`/`StepLimit`
  propagating through the body — `with` is an implicit `finally`, verified this matches real
  Python's own guarantee); on a `PyError`, `exc_type`/`exc_val` are passed as plain strings
  (`STR(e.pyType)`/`STR(e.message)`) — the SAME deliberate simplification `except`'s own exception
  binding already uses, not a new shortcut; `exc_tb` is always `NONE` (no traceback model exists
  anywhere in this interpreter). `__exit__` returning truthy suppresses the propagating exception —
  verified directly against real Python (`with Suppress(): raise ...` completes with no exception
  when `__exit__` returns `True`). Class-body validation was checked before assuming this would work:
  confirmed a method may be given ANY name including a dunder (nothing rejects `__enter__`/`__exit__`
  specifically) — the class system just doesn't auto-dispatch any dunder besides `__init__` anywhere
  else, so `with` is genuinely the first place `__enter__`/`__exit__` get real, automatic dispatch.
- **Tests**: new `tests/phase9-with.test.ts` (15 tests) — forward parse (with/without `as`);
  forward/reverse emit round-trip (plain-text shape); real-Python execution parity for normal
  completion (target bound to `__enter__`'s return value), an unsuppressed exception (passed to
  `__exit__`, still propagates), and the suppression case; the two verified real-Python `TypeError`
  messages (missing `__exit__` alone, missing `__enter__` alone, and — via the normal-completion
  test's context — a plain non-instance value hitting "missed `__exit__`" first); the C++ rejection
  test plus the `statementCallsName` self-recursion-hidden-inside-`with` guard test; reverse
  round-trip of a `Duplicate_files_remover`-shaped `with open(...) as file:` snippet (isolated from
  the file's OTHER separate gaps — hashlib, the list comprehension), a bare `with` with no `as`
  target, and confirmation the `as` target stays bound after the block (matching a for-loop target).
  **759 tests total** (up from 744).
- **Verification**: a fresh CLI snippet using a real user-defined `__enter__`/`__exit__` class,
  including the exception-suppression branch, matched real Python exactly via `eml run` (the one
  behavior a naive implementation could easily get backwards, verified explicitly rather than
  assumed correct). Re-ran the same 5 real B-6 corpus files: `Duplicate_files_remover` advanced
  cleanly from the `with` statement (line 11) all the way to the list comprehension at line 26 — a
  genuinely new, previously-uncatalogued gap, logged in `docs/roadmap.md` rather than silently
  folded into this round's "done" claim. The other 4 files show no change, exactly as expected.

### Item 7 — multi-line bracketed literals + trailing commas (2026-07-19, same day)

The last originally-numbered Phase 9 item. Real corpus need: `text_to_morse_code_text_to_morse_code.py`
opens a dict literal `symbols = {` on line 2 and closes it on line 29, one `"key": "value",` entry per
physical line.

- **Compared against the other 2 remaining candidates before choosing** (Python slice syntax
  `bin(dec)[2:]`, blocking `Decimal_to_binary_convertor`; general list comprehensions, blocking
  `Duplicate_files_remover`) via direct research: both need a genuinely new `Expression` AST node
  threaded through the full "vertical slice" this project always pays for a new expression type — 7
  semantic walkers + the interpreter + 3 emitters (the same class of work as `Tuple`/`Not`). Item 7,
  by contrast, was confirmed by directly reading both lexers in full to be **purely lexer-level, zero
  AST/parser/semantic-walker/interpreter/emitter impact** — the same shape as item 4, and the smallest
  of the three.
- **Root cause, confirmed by reading both lexers' full dispatch loop, not assumed**: neither lexer had
  ANY bracket-depth tracking. Every `\n` unconditionally became a `NEWLINE` token and flipped
  `atLineStart = true`; the next non-blank line then ran the indentation-detection block regardless of
  whether it was still inside an unclosed bracket. Both lexers gained a `bracketDepth` counter
  (incremented on `LPAREN`/`LBRACKET`/`LBRACE`, decremented — floored at 0, defensively — on the
  matching close), gating the newline handler: a newline is only a real `NEWLINE` token (and only
  flips `atLineStart`) when `bracketDepth === 0`. Since `atLineStart` is never set true while a bracket
  is open, the indentation-detection block simply never fires mid-literal — no separate guard needed.
  Reasoned through (not assumed) why this is safe for the cases that matter: a string's own content is
  consumed entirely inside its own lexing branch before ever reaching the single-char dispatch, so
  bracket-looking characters inside a string never affect `bracketDepth`; a `#`-comment is consumed to
  end-of-line the same way; a blank line inside an open bracket is handled correctly for free (the
  newline handler swallows it, no indentation check ever runs).
- **Zero downstream changes** — confirmed, not assumed: `DictLiteral`/`ListLiteral`/`SetLiteral`/call-
  argument lists already carry no "how many source lines did this span" information; once the lexer
  stops emitting spurious tokens mid-literal, the EXISTING `parseBraceLiteral()`/`parseBracket()`/
  `parseArgs()` parse identically.
- **A small, closely-related gap discovered mid-round, folded in rather than deferred**: testing this
  exact feature against the real corpus file revealed `text_to_morse_code`'s dict literal ends its
  last entry with a trailing comma before the closing `}` (ordinary real-world Python style) — the
  bracket-depth fix alone still didn't fully unblock it (`Unexpected token RBRACE`, since
  `parseBracket()`/`parseBraceLiteral()`/`parseArgs()` never checked for an immediate close after
  consuming a comma). Added trailing-comma support to all 4 comma-list parsing routines in BOTH
  directions (`parseArgs`/`parseBracket`/`parseBraceLiteral`'s dict-entries loop/`parseBraceLiteral`'s
  set-elements loop), verified on single-line literals too, not just multi-line ones. Unlike the
  larger, independent gaps this session keeps discovering (Python slice syntax, list comprehensions,
  and — found via THIS round's own corpus re-test, see below — `range(n)`'s single-argument form),
  this one was small enough and tightly enough coupled to the round's own stated purpose (multi-line
  literals are of limited real-world use without trailing-comma support, since virtually all
  real-world multi-line Python literals end with one) to include rather than log separately — a
  judgment call, not a silent scope-creep: called out explicitly here and in every other doc, not
  buried.
- **Tests**: new `tests/phase9-multiline-brackets.test.ts` (11 tests) — forward parse of multi-line
  dict/list/call-args literals; a blank line AND a `#`-comment line interspersed inside a multi-line
  dict (directly testing the "swallowed newline" reasoning, not just the happy path); nested multi-
  line brackets (a dict whose value is itself a multi-line list, confirming the depth COUNTER, not a
  boolean flag, is genuinely necessary); lexer-level tests confirming NO spurious `INDENT`/`DEDENT`/
  `NEWLINE` tokens appear between the opening and closing bracket, in both lexers; a dedicated
  trailing-comma test on single-line literals; forward-emit and reverse round-trip of a
  `text_to_morse_code`-shaped multi-line dict. **770 tests total** (up from 759).
- **Verification**: a fresh multi-line dict literal through `eml run` matched real Python exactly.
  Re-ran the same 5 real B-6 corpus files — **genuine, honest progress**: `text_to_morse_code`
  advanced from line 2 (the multi-line dict's opening brace) all the way to line 38 —
  `for i in range(length):` — revealing a **third newly-discovered, previously-uncatalogued gap**:
  the reverse parser's `parseRangeCall()` requires EXACTLY two arguments (`range(a, b)`) and has no
  support for Python's common single-argument shorthand `range(n)` (implicit start `0`). Logged in
  `docs/roadmap.md` alongside the other two open candidates rather than fixed here — this round's
  scope was multi-line brackets (+ the tightly-coupled trailing-comma fix above), not `range()`. The
  other 4 files show no change, exactly as expected. **This closes out every originally-numbered
  Phase 9 item (1 through 8)** — three independent, unnumbered candidates remain open:
  Python slice syntax, list comprehensions, and `range(n)`'s single-argument form.

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
- Phase 6 (COMPLETE): `if`/`elif`/`else`, `while`, `for...in`.
- Phase 7 (COMPLETE): `break`/`continue`, dict/set literals + subscript,
  attribute access + user `import`, `try`/`except`/`finally`/`raise`, `class`
  (minimal viable OOP). EML can now express general-purpose programs.
- Phase 8 (A-1 LSP MVP COMPLETE, C-8 MCP server MVP COMPLETE; roadmap's own
  top-3 priority list now 2/3 done — only E-11 open-core pricing remains):
  `@eml/lsp` + a minimal VS Code extension client (diagnostics/hover/
  completion), and `@eml/mcp` (7 agent-callable tools + repo-root
  `.mcp.json`). Next within Phase 8 (Neo's call, `docs/roadmap.md`): E-11
  open-core pricing tiers (roadmap's 3rd priority), editor extension polish
  (item 2 — icon, marketplace prep, inline trace webview), npm publishing
  (item 3), or go-to-definition (needs a `semantic.ts` addition: per-identifier
  declaration spans, not just aggregate name lists).
- Phase 6 (COMPLETE): `if`/`elif`/`else`, `while`, `for...in` control-flow
  statements — forward (EML→Python) + interpreter execution; reverse (Python→EML)
  and the C⁺⁺⁺ backend fail loud by design this round.
- Beyond v1.0 (open, not started): broaden the statement grammar further
  (`try`/`except`, dict/set literals, `class`, user `import`, `break`/`continue`)
  toward general-purpose-program coverage; then LSP server + editor extension +
  npm packaging (the commercialization/tooling track in `docs/roadmap.md`); a
  true double-clickable binary (Node SEA); deeper PHOSPHOR integration
  (EML→bytecode codegen for the `eml-vm16/64` VM); full Cogni-Editor IDE;
  broadening the C⁺⁺⁺ subset and reverse Python→EML to cover Phase 6 control flow.
