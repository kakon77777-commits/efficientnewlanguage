# EML-P: strengths and weaknesses

Measured 2026-08-01. Nothing here is a claim about the future.

---

## Strengths

### 1. Behaviour is gated against a reference implementation, not asserted

Most hobby languages verify themselves against their own expectations. EML-P's
central discipline is that **every claim about semantics is a diff against real
CPython**, run in the same test suite:

| gate | what it compares | size |
|---|---|---|
| `tests/interp.test.ts` | every corpus program, interpreter vs `python` | 194 programs |
| `tests/operator-matrix.test.ts` | 11 operators + `in` × 9 operand types² | 972 cells |
| `tests/builtin-shapes.test.ts` | every builtin argument shape | 51 shapes |
| `tests/statement-interaction.test.ts` | control-flow orderings | 33 nestings |
| `tests/value-boundaries.test.ts` | 2⁵³, big ints, float repr, signed zero | 55 values |
| `tests/reverse-pairs.test.ts` | Python → EML → Python, by construct pair | 100 pairs |

The Python side of each is produced **by the transpiler**, never hand-written,
so a gate cannot degenerate into comparing Python with itself. That mistake was
made once, on a different axis, and the lesson is now structural.

### 2. Round-trip is real, and checked on every program

`EML → Python → EML → Python` reaches a byte-identical fixpoint for all 194
corpus programs, checked by `eml roundtrip` per case and in the suite. Reverse
transpilation is not a demo; it is a gate.

### 3. The value model is genuinely Python-faithful, including at the edges

The 55-value boundary sweep found **zero** divergences on first run:
arbitrary-precision integers (2⁵³+1, 30-digit values, exact big arithmetic),
shortest-round-trip float repr (`0.1 + 0.2` → `0.30000000000000004`), signed
zero, `int()` truncating toward zero, `bool` as a number. This is unusual and
was not free — it is the accumulated result of eight prior divergences being
fixed at the root rather than patched.

### 4. The interpreter refuses rather than guesses

Where faithful reproduction is impossible, execution stops and says so instead
of producing a plausible answer:

- printing a multi-element **set** defers (CPython uses hash order; this
  interpreter uses insertion order, and pretending otherwise would be a lie)
- `sum()` over a set of floats defers (addition is not associative)
- constructs outside the profile emit `eml:unsupported` and the CLI hands the
  program to real Python

This is why the class-attribute *write* gap surfaced at all: the trace said
`interp deferred: write .target` rather than inventing a result.

### 5. Every corpus program checks a property, not an output

The 194 programs are not demos. Each computes something and then verifies an
invariant that would still hold if the implementation were rewritten — a wrap
preserves word order at every width; a factorial has exactly the trailing zeros
Legendre predicts; a roster is re-audited by a second pass that cannot see the
builder's bookkeeping.

### 6. Determinism is enforced

Every case carries a byte-exact `.trace.jsonl` golden with a frozen clock. A
change in execution order fails the suite, not review.

---

## Weaknesses

### 1. The language is a small subset, and some absences bite

Measured, not assumed:

| missing | consequence |
|---|---|
| `//` floor division | exact integer division of large values is **not reachable by any single operator**; `int(a / b)` routes through a float and is silently wrong past 2⁵³ (see `examples/long-division-exact`) |
| scientific-notation literals (`1e18`) | must be written out in full |
| `type()` | the ordinary way to name an exception class is unavailable; transpiled Python works, the interpreter raises `NameError` |
| `sorted`, `list`, `enumerate`, `zip`, `range` as a value | only ten builtins exist: `abs float int len max min repr set str sum` |
| `.append`, `.keys`, most methods | list growth is `xs + [item] => xs`, which is O(n) per append |
| reference parameters | mutable state is threaded through one-element lists |
| exception hierarchy | `except ArithmeticError:` will not catch `ZeroDivisionError` in the interpreter, though it does in the transpiled Python |

### 2. The same author writes the implementation and its tests

This is the structural weakness the whole method exists to counter, and it is
not fixable by trying harder. Every gate is written by whoever wrote the code,
so a gate can only ask questions its author thought to ask. Six times a new
measurement immediately found defects that every existing gate had passed —
each of those is a direct measurement of this blind spot. See
[05 — Designer capability](05-designer-capability.md).

### 3. Corpus coverage is bounded by the corpus

`tests/interp.test.ts` is the strongest gate in the project and its power is
exactly the set of programs fed to it. Zero of the 179 corpus programs written
before 2026-08-01 used `pass` — which is precisely why nine phases went by with
`pass` broken in the interpreter and nobody noticed.

### 4. The C++ prototype is a stub

`packages/transpiler-cpp` (447 lines) rejects `if`, `while`, `for`, `try`,
`class`, `with`, `break`, `continue`, `pass` and `import`. It handles
straight-line arithmetic. Calling it a second host is not currently honest.

### 5. Performance is not modelled and not measured

There is no benchmark suite. The interpreter has a 5,000,000-step cap for
browser safety, and one corpus program had to be rewritten today because an
O(n³) formulation produced a **229 MB** execution trace. That was caught by a
test timeout, not by any performance gate.

### 6. Windows is the only host actually exercised by a human

CI runs on Linux. The development machine is Windows with a cp950 console.
Encoding defects that CI cannot see have shipped before — enough times that
"green CI proves nothing about the cp950 host" is a standing note.

### 7. The `@cold` / `@hot` temperature model has thin coverage

`@cold` memoisation is keyed by `repr(args)`. Which argument types produce
colliding or non-colliding keys has **never been swept** — it is the one
candidate axis from the backlog that has not yet been measured.

---

## Things that are neither

- **Only one runtime is real.** Python is the execution target; the interpreter
  exists so a trace can be produced in a browser. Two implementations of the
  same semantics is a cost, and it is paid deliberately: the diff between them
  is what catches divergence.
- **The symbol syntax is a preference, not a result.** `=>` for assignment,
  `^0` for print, `Σ` for summation. No measurement in this repository shows
  they help anyone. They are a design position, and this document is not the
  place to argue it.
