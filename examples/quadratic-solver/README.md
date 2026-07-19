# Quadratic equation solver

`quadratic_solver.eml` solves `ax^2 + bx + c = 0` via the quadratic formula
for three sample coefficient triples that all have real roots — `(1, -3,
2)` -> roots 1 and 2, `(2, -7, 3)` -> roots 0.5 and 3, `(1, -5, 6)` -> roots
2 and 3. The discriminant-negative (complex-root) case is deliberately
skipped, as scoped for this case.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: EML's native fractional-exponent power operator
(`discriminant^0.5` -> `discriminant ** 0.5`, normative per `eml-v1.md`
section 6 — "float exponent permitted") for the square root instead of an
`import math` + `math.sqrt(...)` call, unary minus, and a list of tuple
literals iterated with subscript reads. One thing worth calling out
specifically, a real round-trip bug found and fixed while authoring this
case:

- **Real round-trip bug found and fixed**: the original source returned the
  two roots as a bare tuple literal (`(x1, x2) => roots`). The reverse
  transpiler reconstructed that first assignment as `roots^+(x1, x2)` — but
  EML's grammar reserves exactly that shape, `Identifier "^+" "(" args ")"`,
  for **call-bind** syntax (`f^+(a, b)` means "call `f(a, b)` and bind the
  result"), so re-parsing it forward turned the assignment into a call
  `roots(x1, x2)`, and the round-trip fixpoint never converged. Fixed by
  returning a list literal instead (`[x1, x2] => roots`), which has its own
  dedicated, unambiguous round-trip-safe grammar production (the same one
  `list^+[...]` initializations already use throughout this corpus).

Also note unary minus (`-b`) on an *identifier* is not supported by the
parser at all (only on numeric literals, per `parsePrimary`), so the formula
is written with `0 - b` instead of `-b`.

Verify it yourself:

```bash
pnpm eml transpile examples/quadratic-solver/quadratic_solver.eml   # -> Python
pnpm eml run examples/quadratic-solver/quadratic_solver.eml         # -> roots per triple
pnpm eml trace examples/quadratic-solver/quadratic_solver.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/quadratic-solver/quadratic_solver.eml   # -> OK (fixpoint)
```
