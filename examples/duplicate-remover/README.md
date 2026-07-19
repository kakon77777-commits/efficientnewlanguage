# Duplicate remover

`duplicate_remover.eml` removes duplicates from a sample grocery-basket list
while preserving first-seen order — one of a seven-case self-authored batch
of list/collection utilities for the EML case corpus (see
[`examples/list-statistics/`](../list-statistics/),
[`examples/list-rotator/`](../list-rotator/),
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/),
[`examples/intersection-union-finder/`](../intersection-union-finder/),
[`examples/second-largest-finder/`](../second-largest-finder/), and
[`examples/shopping-cart-total/`](../shopping-cart-total/) for the other
six).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a loop with a dict used as a hash-based "seen"
tracker (`True => seen[item]` on first sight, `not item in seen` membership
check thereafter) plus list growth via `+` (no `.append()`). A real Python
`set` was tried first for "seen" tracking, since that's the obvious idiom —
but every way to grow one empirically failed under `eml trace --run`:
`set(existing_list)` conversion is `eml:unsupported` ("converting an
iterable to a set is not modeled yet") and the `.add()` method is also
`eml:unsupported` ("attribute/method calls run only under a real Python
runtime"). Both defer the interpreter entirely rather than just flagging an
anomaly, which means no `eml:equiv` equivalence check happens at all for
that run. A dict-as-set (a real, common pre-`set()`-era Python idiom) gives
the same O(1) membership behavior while staying fully interpreter-modeled,
so that's what the final program uses. Also note: `item not in seen`
(Python's combined `not in` operator) is not parseable in EML — `not` is
only a prefix unary operator (`'not' not_test`), so it must appear before
the whole comparison as `not item in seen`, not spliced between the operands.

Verify it yourself:

```bash
pnpm eml transpile examples/duplicate-remover/duplicate_remover.eml   # -> Python
pnpm eml run examples/duplicate-remover/duplicate_remover.eml         # -> de-duplicated list
pnpm eml trace examples/duplicate-remover/duplicate_remover.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/duplicate-remover/duplicate_remover.eml   # -> OK (fixpoint)
```
