# Second-largest finder

`second_largest_finder.eml` finds the largest and second-largest *distinct*
values in a sample list of exam scores (with repeats) via a manual
single-pass loop tracking two running maxima — one of a seven-case
self-authored batch of list/collection utilities for the EML case corpus
(see
[`examples/list-statistics/`](../list-statistics/),
[`examples/duplicate-remover/`](../duplicate-remover/),
[`examples/list-rotator/`](../list-rotator/),
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/),
[`examples/intersection-union-finder/`](../intersection-union-finder/), and
[`examples/shopping-cart-total/`](../shopping-cart-total/) for the other
six).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a single-pass loop maintaining two running maxima
(`largest`, `second`) with three-way branching (`if`/`elif`/nested `if`) —
promoting the old `largest` down to `second` when a new largest appears,
and separately promoting a value into `second` only when it's strictly
between the current `second` and `largest` — plus a `found_second` boolean
flag (`^0` output only under a bare-identifier guard) to correctly report
"no distinct second-largest" if the list turned out to have only one
distinct value. The sample list's repeated maximum (95 appears twice) is
the key correctness check: a duplicate of the largest value must not be
counted as its own second place.

Verify it yourself:

```bash
pnpm eml transpile examples/second-largest-finder/second_largest_finder.eml   # -> Python
pnpm eml run examples/second-largest-finder/second_largest_finder.eml         # -> largest + second-largest
pnpm eml trace examples/second-largest-finder/second_largest_finder.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/second-largest-finder/second_largest_finder.eml   # -> OK (fixpoint)
```
