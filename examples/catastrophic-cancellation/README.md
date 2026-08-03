# Same algebra, and one arrangement keeps its digits

`catastrophic_cancellation.eml` computes variance, a quadratic root and a difference of squares two ways each, against an exact reference.

**What it exercises**: the oracle is not the other float formula. The
variance reference is computed in integers, where EML-P has arbitrary
precision and no rounding at all; the quadratic reference is the
**residual** — a root is a value where the polynomial vanishes, which
says which candidate is a root without reference to how it was produced.

Measured: at offset 0 both variance formulas are exact. At offset 10⁹
the naive `E[x²] - E[x]²` loses most of its digits. That is the point —
cancellation is a property of the **data**, not the formula, which is
why it survives testing on small fixtures and appears in production.

The quadratic section was rebuilt after the first construction failed to
cancel at all: `x² + bx + (b-1)` has roots that come out exactly, so the
naive formula scored perfectly. `x² + bx + 1` is the form where it
loses, and at b = 10⁸ it is off by a quarter.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
100000000      -1.4901161193847656e-08 -1.0000000000000002e-08 0.4901161193847654 2.220446049250313e-16

a*a - b*b versus (a+b)*(a-b), against the exact integer answer:
a              naive             factored          exact
3              5.0               5.0               5
100000         199999.0          199999.0          199999
10000000       19999999.0        19999999.0        19999999
100000000      200000000.0       199999999.0       199999999

checks passed: 5/5
Same algebra, same data, and one arrangement keeps its digits.

Cancellation is a property of the DATA, not of the formula - at offset zero
both variance formulas are exact. That is why it survives testing: the
fixtures are small numbers, the formula is correct on them, and the loss
appears only in production where the values have a large common part.
```
