# Intersection / union finder

`intersection_union_finder.eml` computes the intersection and union of two
sample lists of team-roster names — one of a seven-case self-authored batch
of list/collection utilities for the EML case corpus (see
[`examples/list-statistics/`](../list-statistics/),
[`examples/duplicate-remover/`](../duplicate-remover/),
[`examples/list-rotator/`](../list-rotator/),
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/),
[`examples/second-largest-finder/`](../second-largest-finder/), and
[`examples/shopping-cart-total/`](../shopping-cart-total/) for the other
six).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: manual loops with `in` membership checks to build
both the intersection and the union, deliberately avoiding real Python
`set` operators/methods after empirically confirming three separate ways
they break: (1) the `&`/`|` set operators aren't even lexable in EML
(`E_LEX: Unexpected character: "&"`); (2) the `.intersection()`/`.union()`
methods run fine under real Python but are `eml:unsupported` under the
interpreter (builtin-type method calls aren't modeled, so the run never
reaches an `eml:equiv` check); and (3) iterating a raw set directly (`for x
in a_set:`) throws `TypeError: 'set' object is not iterable` *inside the
interpreter itself* even though real Python iterates a set fine — and real
Python's own set iteration order is hash-based and not guaranteed stable
across runs/hash seeds. Plain lists with manual `in`-membership-check loops
sidestep all three problems at once and keep iteration order deterministic,
matching the task's own suggested fallback.

Verify it yourself:

```bash
pnpm eml transpile examples/intersection-union-finder/intersection_union_finder.eml   # -> Python
pnpm eml run examples/intersection-union-finder/intersection_union_finder.eml         # -> intersection + union
pnpm eml trace examples/intersection-union-finder/intersection_union_finder.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/intersection-union-finder/intersection_union_finder.eml   # -> OK (fixpoint)
```
