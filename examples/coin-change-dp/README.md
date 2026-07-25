# Coin change (dynamic programming)

`coin_change_dp.eml` finds the fewest coins that make a given amount,
using a 1D DP table filled from 1 up to the target.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: **1D** dynamic programming — a different table
shape from the 2D grids in
[`examples/edit-distance/`](../edit-distance/) and
[`examples/longest-common-subsequence/`](../longest-common-subsequence/).

Two of the samples are chosen to make the algorithm's value visible rather
than assumed:

- **Coins `[1, 3, 4]`, amount 6 -> 2 coins.** A greedy "always take the
  biggest coin that fits" strategy answers 3 here (`4 + 1 + 1`); DP finds
  `3 + 3`. Ordinary currency is designed so greedy happens to be optimal,
  which is exactly why a case that breaks it is worth keeping.
- **Coins `[5, 10]`, amount 3 -> -1.** A sentinel "unreachable" value
  stands in for infinity, so amounts no combination can make are reported
  rather than silently returning a wrong count.

Verify it yourself:

```bash
pnpm eml transpile examples/coin-change-dp/coin_change_dp.eml   # -> Python
pnpm eml run examples/coin-change-dp/coin_change_dp.eml         # -> 6 coin-count lines
pnpm eml trace examples/coin-change-dp/coin_change_dp.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/coin-change-dp/coin_change_dp.eml   # -> OK (fixpoint)
```
