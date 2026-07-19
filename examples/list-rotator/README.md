# List rotator

`list_rotator.eml` rotates two sample lists — a song playlist and a
job queue — left and right by a given amount, using slice concatenation —
one of a seven-case self-authored batch of list/collection utilities for
the EML case corpus (see
[`examples/list-statistics/`](../list-statistics/),
[`examples/duplicate-remover/`](../duplicate-remover/),
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/),
[`examples/intersection-union-finder/`](../intersection-union-finder/),
[`examples/second-largest-finder/`](../second-largest-finder/), and
[`examples/shopping-cart-total/`](../shopping-cart-total/) for the other
six).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Python slice syntax (`lst[a:b]`) combined with list
concatenation (`+`) to build both a left rotation (`lst[shift:n] +
lst[0:shift]`) and a right rotation (`lst[n-shift:n] + lst[0:n-shift]`)
without any dedicated rotate builtin, run twice over two different sample
lists and rotation amounts (a 6-item playlist rotated by 2, and a 5-item
queue rotated by 3) to show the same slicing pattern generalizes.

Verify it yourself:

```bash
pnpm eml transpile examples/list-rotator/list_rotator.eml   # -> Python
pnpm eml run examples/list-rotator/list_rotator.eml         # -> rotated lists
pnpm eml trace examples/list-rotator/list_rotator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/list-rotator/list_rotator.eml   # -> OK (fixpoint)
```
