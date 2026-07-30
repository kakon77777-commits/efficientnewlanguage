# A polynomial as (coefficient, exponent) pairs

`polynomial_evaluator.eml` evaluates `2x^3 - 4x^2 + 7x + 5` at four points
by summing its terms explicitly.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuples as two-part records inside a list, integer
exponentiation by loop, and `sum` over a built list.

```
p(x) = 2x^3 + -4x^2 + 7x + 5
x    term values                    p(x)
---  -----------------------------  ------
0    [0, 0, 0, 5]                   5
1    [2, -4, 7, 5]                  10
2    [16, -16, 14, 5]               19
-1   [-2, -4, -7, 5]                -8

p(0) = 5, and the constant term is 5 -> True
```

Printing the individual term values next to the total makes the arithmetic
**auditable** rather than asserted: you can see where each contribution
came from, and the `p(0)` check confirms the constant term independently.

This is the shape where a tuple clearly beats a two-element list. A term
has exactly two parts forever, and swapping them would be a bug rather
than a resize.

Verify it yourself:

```bash
pnpm eml run examples/polynomial-evaluator/polynomial_evaluator.eml
pnpm eml trace examples/polynomial-evaluator/polynomial_evaluator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/polynomial-evaluator/polynomial_evaluator.eml   # -> OK (fixpoint)
```
