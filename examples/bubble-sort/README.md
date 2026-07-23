# Bubble sort

`bubble_sort.eml` sorts the sample list `[64, 34, 25, 12, 22, 11, 90]` into
ascending order using a classic bubble sort — a manual double loop with an
index-based adjacent-element swap — instead of the `sorted()`/`.sort()`
builtins.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: nested `for` loops over expression-bound inclusive
ranges (`[0 : n - 2]`, `[0 : n - 2 - i]`), `len()`, and — notably — a plain
list mutated in place via subscript assignment (`numbers[j] => numbers[j]`
style swaps through a `temp` variable), which the interpreter models
directly for `list` targets (see `packages/interp/src/index.ts`'s
`subscriptSet`), unlike the dict-only subscript-assignment idiom used by
[`examples/word-frequency-counter/`](../word-frequency-counter/) and
[`examples/dice-roll-tally/`](../dice-roll-tally/).

Verify it yourself:

```bash
pnpm eml transpile examples/bubble-sort/bubble_sort.eml   # -> Python
pnpm eml run examples/bubble-sort/bubble_sort.eml         # -> sorted list
pnpm eml trace examples/bubble-sort/bubble_sort.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/bubble-sort/bubble_sort.eml   # -> OK (fixpoint)
```
