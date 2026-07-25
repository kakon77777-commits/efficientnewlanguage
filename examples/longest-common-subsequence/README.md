# Longest common subsequence

`longest_common_subsequence.eml` finds the longest sequence of characters
appearing in both strings in order (not necessarily adjacent), for four
sample pairs — including the textbook `'AGGTAB' & 'GXTXAYB' -> 'GTAB'`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the same 2D DP table style as
[`examples/edit-distance/`](../edit-distance/), plus the step that case
does not take — **walking the finished table backwards** from the
bottom-right corner to reconstruct the actual subsequence rather than just
its length. That second pass is the part worth reading: the table alone
only answers "how long", and recovering "which characters" requires
retracing the decisions that built it.

Verify it yourself:

```bash
pnpm eml transpile examples/longest-common-subsequence/longest_common_subsequence.eml   # -> Python
pnpm eml run examples/longest-common-subsequence/longest_common_subsequence.eml         # -> 4 subsequence lines
pnpm eml trace examples/longest-common-subsequence/longest_common_subsequence.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/longest-common-subsequence/longest_common_subsequence.eml   # -> OK (fixpoint)
```
