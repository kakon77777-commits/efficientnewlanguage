# EML-P capability, and what to use it for

**What can you actually build in EML-P today, and what should you not try?**

Measured 2026-08-01 against the corpus and the test suite — not from the
specification, and not from what the language is intended to become. See
[Keeping this current](#keeping-this-current) at the end: this page is meant to
be regenerated, not rewritten from memory.

---

## The one-line answer

EML-P today runs **single-file, terminal-shaped, deterministic programs** —
algorithms, simulations, parsers, checkers, small state machines — with
Python-faithful semantics, exact arbitrary-precision integers, and a recorded
execution trace. It has no I/O, no imports that resolve, no standard library,
and ten builtins.

If a program's job is *to compute something and print it*, EML-P is a real
option. If its job is *to talk to anything*, it is not.

---

## What is proven, and by how much

Not claims — counts, from the 194-program corpus on 2026-08-01.

| capability | programs using it | strongest evidence |
|---|---|---|
| functions, recursion | 161 | `tower-of-hanoi`, `n-queens`, `merge-sort` |
| `while` loops | 74 | `collatz-recursive`, `binary-search` |
| `try` / `except` / `finally` | 32 | `transaction-rollback-finally` |
| classes + methods | 24 | `binary-search-tree`, `connection-pool-release` |
| Σ summation | 13 | `variance-with-sigma`, `dot-product-sigma` |
| `@cold` memoisation | 8 | `fibonacci-memoized` |
| `with` / context managers | 6 | `connection-pool-release` |
| numpy matrices `<M>` | 2 | forward-only; the interpreter defers |
| `@temporal_loop` | 1 | forward-only; needs real Python to run |

**203 of 204 corpus programs execute completely in the browser interpreter.**
The single exception is the temporal-loop demo, which needs real asyncio.

Program sizes: **median 51 lines, p90 105, max 197.** Nothing in the corpus is
larger than one file, and nothing needs to be.

Every one of those 194 programs is verified three ways on every commit:
`eml check` → `eml trace --run` (interpreter output **equals** real CPython
output) → `eml roundtrip` (EML → Python → EML → Python reaches a byte-identical
fixpoint).

---

## Recommended: use EML-P for these

### 1. Algorithms and data structures

The corpus is already 194 of them. Sorting, searching, graphs, dynamic
programming, backtracking, number theory. This is the best-evidenced use by a
wide margin.

### 2. Exact integer work

Integers are arbitrary-precision and were swept against CPython at the
boundaries with **zero divergences**: 2⁵³+1, 30-digit values, big-int equality
and comparison, `int()`/`float()` conversions. `factorial-exact-digits`
computes 50! (65 digits) and verifies it four independent ways;
`fibonacci-cassini-exact` uses an identity that fails for *every* n under
floats and holds for all 200 here.

**One caveat that costs real work:** there is no `//`, and `int(a / b)` routes
through a 64-bit float, so exact integer division of large values needs long
division by hand — see `long-division-exact`. Budget for it.

### 3. Deterministic simulations and state machines

Elevators, turnstiles, vending machines, traffic lights, washing-machine
cycles, shift rosters. Fixed inputs, checkable invariants, no clock, no
randomness. The trace makes the run auditable afterwards.

### 4. Teaching, and code that has to be *shown*

This is where EML-P is genuinely differentiated rather than merely adequate:

- every run produces a structured `eml-trace-v1` event stream
- the browser Workbench executes it with **no Python installed**
- the program, its Python projection, and its execution sit side by side
- semantics are gated against real CPython, so what is shown is not an
  approximation

### 5. Specification-shaped programs

Parsers, validators, format checkers, reference implementations of a rule.
`recursive-descent-calculator` and `bracket-tree-outline` are both this shape,
and both check themselves against a property rather than an expected output.

---

## Not recommended: do not reach for EML-P here

### Anything that touches the outside world

There is **no I/O**. No file access, no network, no `input()`, no clock, no
randomness. `import` parses but resolves nothing in the interpreter. **Zero of
194 corpus programs import anything.** This is not a gap to be filled soon — it
is what the profile currently is.

### Anything needing the Python standard library

Ten builtins exist: `abs float int len max min repr set str sum`. No `sorted`,
no `list`, no `enumerate`, no `zip`, no `range` as a value, no `type`. No
methods on built-in types — no `.append`, no `.keys`, no `.split`. Porting
ordinary Python means rewriting around all of that.

### Large or long-running programs

- list growth is `xs + [item] => xs`, which **copies** — O(n) per append, so a
  naive loop is O(n²)
- the interpreter caps at 5,000,000 steps for browser safety
- there is no benchmark suite, and nothing measures speed or memory

The concrete warning: one corpus program in this very round was written
O(n³) by accident and produced a **229 MB** execution trace for 25 lines of
output. It was caught by a test timeout, not by any performance gate. Rewriting
it to build its data once brought the trace to 3 MB.

### Anything needing inheritance or a rich object model

Classes have `__init__`, methods, class attributes and instance attributes.
**No inheritance, no `super()`, no method decorators, no dunders beyond
`__init__`/`__enter__`/`__exit__`.** These are deliberate simplifications, not
scheduled work.

### C++ output

`packages/transpiler-cpp` rejects `if`, `while`, `for`, `try`, `class`, `with`,
`break`, `continue`, `pass` and `import`. It compiles straight-line arithmetic.
Treat it as a feasibility sketch.

---

## Where each surface is actually usable

| surface | state | use it for |
|---|---|---|
| CLI (`eml check/run/trace/roundtrip/bugs`) | the most exercised path | everything above |
| Browser Workbench | runs 203/204 corpus programs, no Python needed | demonstration, teaching, review |
| LSP + VS Code extension | diagnostics, hover, completion; F5 prototype, unpublished | editing, if you build it yourself |
| MCP server (7 tools) | mirrors the CLI, guarded schemas | agent-driven use |
| REST `/ai/tools/*` | live on efficientnewlanguage.org | remote checking and interpretation |
| C⁺⁺⁺ emitter | straight-line arithmetic only | nothing yet |
| npm package | built and packable, **not published** | not yet |

---

## How to decide, quickly

Answer these in order. The first "yes" that is a **no** for EML-P stops you.

1. Does it read or write anything outside the program? → **no**
2. Does it need a library? → **no**
3. Does it need inheritance, or methods on built-in types? → **no**
4. Does it process more than a few thousand items? → **probably no**
5. Does it need exact integers, a recorded trace, or must it be *shown*
   running without a Python install? → **strong yes**
6. Otherwise, is it an algorithm, a simulation, or a checker? → **yes**

---

## What would most widen this

In order of how much capability each unlocks per session of work, drawn from
[03 — Improvement backlog](03-improvement-backlog.md):

1. **`//` floor division** — removes the only arithmetic operation currently
   unreachable by any single operator
2. **A few more builtins** (`sorted`, `enumerate`, `zip`) — each is roughly
   half a session with a shape sweep, and each removes a whole class of
   rewriting when porting real Python
3. **`.append`** — would change list growth from O(n) to O(1) and remove the
   easiest way to accidentally write O(n²). Bigger than it looks: it changes
   the value model from copy-on-write to mutation.
4. **An exception hierarchy in the interpreter** — closes a real divergence
   between the interpreter and the Python it emits

None of these is I/O, and none of them makes EML-P a general-purpose
application language. That is a different decision, not a backlog item.

---

## Keeping this current

Every number on this page came from a command, so it can be re-derived rather
than remembered. Run these in the language repo:

```bash
pnpm test && pnpm monitor
```

```bash
for f in examples/*/[a-z]*.eml; do wc -l < "$f"; done | sort -n | awk '{a[NR]=$1} END {print "median", a[int(NR/2)], "p90", a[int(NR*0.9)], "max", a[NR], "n", NR}'
```

```bash
grep -l '"eml:unsupported"' examples/*/*.trace.jsonl | wc -l
```

Update this page whenever any of the following change: the builtin set, the
operator set, the corpus size, which surfaces work, or the "not recommended"
list. **A capability page that is out of date is worse than none**, because the
whole point of it is that someone can trust it instead of reading the source.
