# Row 80 of Pascal’s triangle, exactly

`pascal_row_exact.eml` builds row 80 of Pascal's triangle by addition
and checks it against three global properties.

**What it exercises**: the middle entry, C(80, 40), is 24 digits — well
past the 16 a 64-bit float holds exactly. Building the row by addition
is what makes this a good test: every entry is the sum of two above it,
so an error introduced anywhere propagates down and sideways.

| property | why it catches what a spot check misses |
|---|---|
| symmetry | C(n,k) = C(n,n−k) — damage at one position breaks its mirror |
| row sum | the row sums to exactly 2⁸⁰, one specific 25-digit integer |
| hockey stick | ties row 80 to row 81, so a self-consistent but shifted triangle still fails |

The multiplicative formula `C(n,k) = C(n,k−1)·(n−k+1)/k` is deliberately
**not** used, because it needs exact division — which EML-P cannot do on
big integers. Addition needs none. See the `long-division-exact` case
for that gap in full.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 14 lines)

```
  k=0 -> sum 81 vs C(81,1) 81 : True
  k=1 -> sum 3240 vs C(81,2) 3240 : True
  k=2 -> sum 85320 vs C(81,3) 85320 : True
  k=5 -> sum 324540216 vs C(81,6) 324540216 : True
  k=13 -> sum 1823288518168200 vs C(81,14) 1823288518168200 : True
  k=40 -> sum 212392290424395860814420 vs C(81,41) 212392290424395860814420 : True

hockey stick: 6/6

Row 80 is exact: symmetric, sums to 2^80, and agrees with row 81.

The row sum is the sharpest of the three. 2^80 is one specific integer;
an implementation that rounds anywhere in eighty rows of addition lands
near it and not on it, and 'near' is not a value this check accepts.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`pascal_row_exact.trace.jsonl` beside this file is the recorded execution.
