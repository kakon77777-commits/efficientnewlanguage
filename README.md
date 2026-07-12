# EML 2026 — Efficient New-Language

> A high-density **semantic-overlay** programming layer for humans *and* AI
> agents. EML is not a replacement language — it is a deterministic, testable
> overlay that compresses high-frequency program intent into symbols and
> transpiles back to standard languages.

**Phase 0 MVP** delivers the first hard closed loop:

```
EML / Py⁺ source → normalize → lex → parse → AST → semantic → emit → Python → run / test / CTS
```

The headline demo — symbolic in, real result out:

```eml
N^+100
Σ(i^2, i in [1:N]) => r
r^0
```

```console
$ pnpm eml run examples/phase0/sum.eml
338350
```

```python
# pnpm eml transpile examples/phase0/sum.eml
N = 100
r = sum(i**2 for i in range(1, N+1))
print(r)
```

## Quickstart

Requirements: Node ≥ 20, pnpm, Python 3.10+ (with `numpy` for matrix cases).

```bash
pnpm install
pnpm test                                   # 363 tests, incl. real python execution
pnpm typecheck
pnpm eml run examples/phase0/sum.eml        # -> 338350
```

The full language reference is **[docs/EML-LANG-2026-v1.0.md](docs/EML-LANG-2026-v1.0.md)**
(the normative spec). New contributors should read [docs/agent-handoff.md](docs/agent-handoff.md) first.

## Launch — EML Studio

One launchable entry point starts the visual **Cogni-Editor** workbench and opens
it in your browser (run-from-source, no build step): write EML on the left, see
the Python expansion on the right, switch tabs to **Trace** (run it + watch the
phosphor-jsonl-v1 events), **Functions** (cold/hot · importance · crystallization),
AST, Diagnostics, and Meta — plus the **Nova IME** symbol palette (`Ctrl+Space`).

```bash
pnpm start                  # or:  pnpm studio
```

- **Windows:** double-click **`eml-studio.cmd`**.
- **macOS / Linux:** run **`./eml-studio.sh`**.

The same launcher also forwards to the CLI and runs the demo:

```bash
node scripts/launch.mjs demo            # -> 338350
node scripts/launch.mjs run f.eml       # forward any args to the eml CLI
```

Env: `EML_STUDIO_PORT` (default 5179), `EML_NO_OPEN=1` (start without opening a browser).

## CLI

```bash
eml parse    <file> [--out f]   # normalized AST (JSON)
eml ast      <file> [--out f]   # alias of parse
eml transpile <file> [--out f]  # EML/Py⁺ -> Python
eml transpile <file> --target cpp  # EML/C⁺⁺⁺ -> C++ (Phase 4 prototype)
eml run      <file>             # transpile and execute via python
eml cts      <file> [--out f]   # PHOSPHOR-compatible CTS (JSON)
eml check    <file>             # diagnostics only
eml explain  <file>             # human-readable symbol + node breakdown
eml compress  <file.py>         # reverse: Python (subset) -> EML/Py⁺
eml suggest   <file.py>         # AI-assisted Python -> EML, round-trip validated
eml roundtrip <file> [-v]       # EML->Py->EML->Py (or Py->EML->Py) fixpoint check
eml crystallize <file> [--cache=p]  # crystallize @cold logic into a persistent cache
eml bugs     <file> [--run] [--trace=f] [--json]  # classify errors (5 levels), mapped to EML source
eml trace    <file> [--out f] [--run]  # phosphor-jsonl-v1 execution trace (interp; --run adds eml:equiv vs Python)
eml test     [--dir d]          # run golden fixtures
```

## Execution truth — run + trace (Phase 5)

EML programs are observable as a **PHOSPHOR `phosphor-jsonl-v1` trace**. A browser-safe,
Python-faithful interpreter (`@eml/interp`) computes the *same* values the transpiled Python
computes — so you can run a program and watch its trace **without** a Python runtime (the
Cogni-Editor's **Trace tab** does exactly this). Equivalence is not asserted, it is *gated*:
the test suite runs every example through both the interpreter and a real `python` and fails on
any divergence, and `eml trace --run` bakes that proof into the artifact as an `eml:equiv` event:

```console
$ pnpm eml trace examples/phase0/sum.eml --run
{"stream":"eml","proto":"phosphor-jsonl-v1","type":"eml:run:start", ...}
{"stream":"eml","proto":"phosphor-jsonl-v1","type":"eml:sum","iterator":"i","count":100,"result":"338350"}
{"stream":"eml","proto":"phosphor-jsonl-v1","type":"eml:output","text":"338350"}
{"stream":"eml","proto":"phosphor-jsonl-v1","type":"eml:equiv","actual":"338350\n","expected":"338350\n","ok":true}
```

numpy (`<M>`/`^T`) and temporal (`async`/`await`/`@temporal_loop`) constructs run only under real
Python; the interpreter reports them as `unsupported` (never a fabricated value), and `eml trace
--run` splices in the real `eml:temporal:*` events from the Python process.

## AI-assisted compression (Phase 1)

`eml suggest` compresses Python to EML. The **deterministic inverse** runs first
for the supported subset (exact, no LLM). For Python outside the subset (e.g. an
accumulation loop that's really a `Σ`), it consults an LLM (`claude-opus-4-8`,
needs `ANTHROPIC_API_KEY`) — but **every suggestion is gated by an
execution-based round-trip validator**: the suggested EML is compiled back to
Python and run against the original on test inputs; if the result differs, the
suggestion is rejected. The LLM proposes, the validator disposes — and source is
never overwritten. The browser editor adds **Nova IME** (`Ctrl+Space`) for
low-friction symbol input.

## Bidirectional & round-trip validation

EML transpiles **both ways**, deterministically (no LLM in the core chain):

```
forward:  EML  → EML parser    → AST → Python emitter → Python
reverse:  Python → Python parser → AST → EML emitter    → EML   (the supported subset)
```

Both directions share one AST, which makes **round-trip a fixpoint check** — the
strongest proof that transpilation is faithful:

```console
$ pnpm eml compress build/sum.py        # Python → EML
N^+100
Σ(i^2, i in [1:N]) => r
r^0

$ pnpm eml roundtrip examples/phase0/sum.eml
roundtrip examples/phase0/sum.eml: OK ✓
  round-trip fixpoint reached (python1 == python2)
```

The reverse path is a deterministic inverse of the emitter for the supported
subset. Arbitrary-Python compression (lossy, semantics-sensitive) remains an
AI-assisted, suggestion-only layer for a later phase.

Invoke via `pnpm eml <cmd>` in this repo, e.g. `pnpm eml explain examples/phase0/sum.eml`.

## Supported syntax (Phase 0)

| EML / Py⁺ | Python | Note |
|---|---|---|
| `x^+100` | `x = 100` / `x += 100` | init if undeclared, else `+=` |
| `x^0` | `print(x)` | output |
| `x^-5` `x^*2` | `x -= 5` `x *= 2` | augmented assign |
| `Σ(i^2, i in [1:N])` | `sum(i**2 for i in range(1, N+1))` | summation |
| `i in [1:10]` | `i in range(1, 11)` | inclusive range |
| `x > 40 ? A : B` | `A if x > 40 else B` | conditional |
| `f(x) => y` / `f^+(x,y) => r` | `y = f(x)` / `r = f(x, y)` | call + bind |
| `<M>(data)` | `np.array(data)` | matrix |
| `m^T` | `np.transpose(m)` | transpose |
| `list^+[1,2,3]` | `lst = [1, 2, 3]` | list literal |
| `@cold` / `@hot` + `def f(x):` + `return` | `@functools.cache` / `# @hot` + `def f(x):` + `return` | functions w/ cold-hot separation (Phase 2) |
| `@temporal_loop(max_wait=…, check_interval=…)` + `async def` + `await temporal_wait(c)` | asyncio temporal runtime (no busy-wait, timeout, phosphor trace) | time loops (Phase 3) |
| `if <t>: … elif <t>: … else: …` | `if <t>: … elif <t>: … else: …` | conditional branching (Phase 6) |
| `while <t>: …` | `while <t>: …` | condition-controlled loop (Phase 6) |
| `for <x> in <iterable>: …` | `for <x> in <iterable>: …` | iteration over a range or list (Phase 6) |

EML accepts a Unicode display form (`Σ(i², i∈[1:N])`) normalized to the ASCII
canonical form before lexing.

## Project layout

```
packages/
  types/             shared contracts (tokens, AST, CTS, diagnostics)
  parser/            normalizer + lexer + parser
  transpiler-python/ semantic analysis + Python emitter + formatter
  transpiler-eml/    reverse: Python (subset) -> EML + round-trip validators
  transpiler-cpp/    EML/C⁺⁺⁺ -> C++ prototype (Phase 4; see docs/cpp-feasibility.md)
  ai-converter/      AI-assisted Python -> EML, validator-gated (Phase 1)
  symbols/           loads eml-symbols.json
  cts-generator/     PHOSPHOR CTS output
  trace/             phosphor-jsonl-v1 event emitter (PHOSPHOR-compatible trace)
  bug-classifier/    BUG 5-level classifier, mapped back to EML source (Phase 3)
  interp/            browser-safe execution-truth interpreter + trace producer (Phase 5)
  cli/               the `eml` command
  cogni-editor/      dual-state view (EML | Python | AST) + Trace panel (PHOSPHOR phosphor-jsonl-v1) + Functions panel (cold/hot · importance · crystallization)
scripts/launch.mjs   EML Studio launcher (pnpm start / eml-studio.cmd|sh)
ai/        AI-native layer (AICL + AIRS/AILP) — see below
llms.txt   LLM entry index
examples/  tests/  docs/  eml-symbols.json
```

See [docs/architecture.md](docs/architecture.md), the
[whitepaper](docs/whitepaper.md), the [grammar](docs/grammar.md), and
[docs/agent-handoff.md](docs/agent-handoff.md) (read this before contributing).

## Design principles

- **Optional enhancement** — symbolize high-value regions, not everything.
- **Machine-first, human-adaptive** — symbols for machines, projection (Cogni-Editor) for humans.
- **Round-trip first** — deterministic, rule-based, testable. No LLM in the core transpilation chain.

## AI-native layer — AICL + AIRS/AILP

EML publishes a machine-readable **AICL** (AI Ingestion & Capability Layer) so LLMs, agents, and
crawlers can read, cite, and invoke EML without parsing human UI — plus an **AIRS/AILP** rights
declaration for how AI may learn from it. Start at [`llms.txt`](llms.txt) or
[`ai/index.md`](ai/index.md); agents should read [`ai/manifest.json`](ai/manifest.json) first.

- **Manifest** — [`ai/manifest.json`](ai/manifest.json) · [`ai/version.json`](ai/version.json) · [`ai/sitemap.json`](ai/sitemap.json)
- **Corpus** — [`ai/corpus/`](ai/corpus/origin.md): origin, current, design-history, concept-genealogy, engineering-notes, accepted/deprecated concepts, `full-corpus.jsonl`
- **Capability** — [`ai/specs/`](ai/specs/eml-v1.md) (spec digest, EBNF, AST/trace/error schemas), [`ai/examples/`](ai/examples/001-summation.eml.md), [`ai/tools/`](ai/tools/tools.md) (CLI + hosted HTTP tools)
- **Governance / Rights** — [`ai/rights-spectrum.json`](ai/rights-spectrum.json) + [`ai/governance/`](ai/governance/ai-learning-policy.md)

**AI learning posture:** open (Apache-2.0) — AI systems are welcome to read, embed, train on,
fine-tune, distill, quote, and build products with EML; the only ask is **attribution**. Based on
the papers [`docs/AICL-v0.1.md`](docs/AICL-v0.1.md) and [`docs/AIRS-AILP-v0.1.md`](docs/AIRS-AILP-v0.1.md).
Live mirror + tools: **https://efficientnewlanguage.org**.

## License & patent

**EML is open source under the [Apache License 2.0](LICENSE).** Use it, study it,
modify it, and build on it — including commercially. The Apache license requires you
to keep the copyright/attribution notices; beyond that, the author's one request is
simple: **respect and credit Neo.K (許筌崴) / EveMissLab as the original author.**

- **Patent:** aspects of the original prototype are covered by **Taiwan Utility Model
  Patent M672933** (application 114201136, filed 2025-01-24, published 2025-07-21;
  creator 許筌崴). The patent is held in Taiwan only. Releasing under Apache-2.0
  includes the patent-license grant of its Section 3, so EML can be used and adapted
  freely without separate patent permission. Some concepts also extend beyond the
  patent's scope and are offered under the same open terms. See [NOTICE](NOTICE).
- **Contributions:** welcome under the same Apache-2.0 terms (inbound = outbound); no
  separate CLA required.

Copyright © 2026 EveMissLab（一言諾科技有限公司）/ Neo.K（許筌崴）.
