# Binary search (recursive)

`binary_search_recursive.eml` searches for the exact same five targets
(`34, 100, 3, 91, 50`) in the exact same fixed pre-sorted list as
[`examples/binary-search/`](../binary-search/) — same algorithm, same
inputs, expressed via self-recursion instead of a `while` loop.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: genuine self-recursion with an explicit `low`/`high`
window narrowed on each call, `elif`, and `int((low + high) / 2)` standing
in for floor division (same idiom as `binary-search`/`digit-sum-calculator`
— EML has no `//` token). Directly comparable output to the corpus's
iterative binary-search, one recursive/iterative pair alongside
[`examples/euclidean-gcd-recursive/`](../euclidean-gcd-recursive/) vs.
[`examples/gcd-lcm-calculator/`](../gcd-lcm-calculator/).

Verify it yourself:

```bash
pnpm eml transpile examples/binary-search-recursive/binary_search_recursive.eml   # -> Python
pnpm eml run examples/binary-search-recursive/binary_search_recursive.eml         # -> found/not-found lines
pnpm eml trace examples/binary-search-recursive/binary_search_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/binary-search-recursive/binary_search_recursive.eml   # -> OK (fixpoint)
```
