# Longest common prefix

`longest_common_prefix.eml` finds the longest starting string every word
in a list shares, e.g. `['flower', 'flow', 'flight'] -> 'fl'`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: progressive shrinking — take the first word as a
candidate prefix, cut it down against each remaining word, and stop early
the moment it becomes empty, since nothing can grow it back.

Worth contrasting with
[`examples/longest-common-subsequence/`](../longest-common-subsequence/),
because "common" is doing very different work in the two names:

| | Gaps allowed? | Machinery |
| --- | --- | --- |
| Longest common **prefix** | no — unbroken run from position 0 | one loop, no table |
| Longest common **subsequence** | yes — characters may be scattered | full 2D DP table |

The `['dog', 'racecar', 'car']` group returns `''` on the very first
comparison and exits without examining `'car'` at all; `['single']` never
enters the loop.

Verify it yourself:

```bash
pnpm eml transpile examples/longest-common-prefix/longest_common_prefix.eml   # -> Python
pnpm eml run examples/longest-common-prefix/longest_common_prefix.eml         # -> 5 "words -> 'prefix'" lines
pnpm eml trace examples/longest-common-prefix/longest_common_prefix.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/longest-common-prefix/longest_common_prefix.eml   # -> OK (fixpoint)
```
