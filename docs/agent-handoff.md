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
