# List statistics

`list_statistics.eml` computes the minimum, maximum, sum, and average of a
sample list of hourly temperature readings — one of a seven-case
self-authored batch of list/collection utilities for the EML case corpus
(see [`examples/duplicate-remover/`](../duplicate-remover/),
[`examples/list-rotator/`](../list-rotator/),
[`examples/matrix-transpose-manual/`](../matrix-transpose-manual/),
[`examples/intersection-union-finder/`](../intersection-union-finder/),
[`examples/second-largest-finder/`](../second-largest-finder/), and
[`examples/shopping-cart-total/`](../shopping-cart-total/) for the other
six).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a manual single-pass accumulator loop (`total`,
`count`, running `minimum`/`maximum`) using the declare-or-augment sigils
(`total^+reading`, `count^+1`) rather than the `min()`/`max()`/`sum()`
builtins — `sum()` was tried first and empirically confirmed to break EML's
reverse transpiler (`PyParseError: Expected 'for' but found RPAREN`, since
the reverse transpiler expects a generator-expression argument like
`sum(x for x in ...)`), so all three statistics are computed by hand
instead, which is also round-trip-safe. The average is then rounded to 2
decimal places manually (`int(x * 100 + 0.5)` then divide by 100) since
`%.2f`-style precision specs are not modeled by the interpreter's own `%`
formatter (confirmed via `eml trace --run`, which threw `ValueError:
unsupported format character '.'` when tried directly).

Verify it yourself:

```bash
pnpm eml transpile examples/list-statistics/list_statistics.eml   # -> Python
pnpm eml run examples/list-statistics/list_statistics.eml         # -> min/max/sum/average report
pnpm eml trace examples/list-statistics/list_statistics.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/list-statistics/list_statistics.eml   # -> OK (fixpoint)
```
