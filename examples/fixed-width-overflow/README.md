# Correct in Python, wrong everywhere it will be ported

`fixed_width_overflow.eml` implements 32-bit signed arithmetic explicitly and runs the same computations both ways.

**What it exercises**: Python integers do not overflow, which makes this
class of bug undetectable in the language the algorithm was prototyped
in. The 32-bit model is built from modulo — two's complement *is*
arithmetic mod 2³² with the top half read as negative — since EML-P has
no bitwise operators.

Measured: of 25 positive-times-positive products, all 25 wrap and **16
land negative**. Eight of them pass an `if x > 0` guard and **zero** of
those eight are correct. A wrapped value is not merely large; it can be
negative when every input was positive, which is what defeats the guard.

Also here: the binary-search midpoint. `(lo + hi) / 2` goes negative;
`lo + (hi - lo) / 2` costs one subtraction and is right everywhere. The
reason to write it that way in Python is that the next reader will not
be using Python.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  wrapped to a NEGATIVE value:16
  46341 * 46341 = 2147488281 -> -2147479015
  46341 * 50000 = 2317050000 -> -1977917296
  46341 * 65536 = 3037003776 -> -1257963520

products that pass an `if x > 0` guard: 8/25
...of which actually correct:           0

checks passed: 5/5
Positive inputs, negative product, and a guard that says it is fine.

Python's unbounded integers make this class of bug undetectable in the
language the algorithm was prototyped in, which is exactly when it would be
cheapest to find. `lo + (hi - lo) / 2` costs one extra subtraction and is
correct everywhere - the reason to write it that way in Python is not that
Python needs it, but that the next reader will not be using Python.
```
