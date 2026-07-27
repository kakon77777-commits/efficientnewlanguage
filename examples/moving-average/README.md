# Moving average (sliding window)

`moving_average.eml` computes a moving average incrementally — the first
window is summed once, and every window after it adds the entering value
and subtracts the leaving one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a sliding window with an incremental update, and an
honest accounting of what that buys and what it costs.

**The gain.** Re-summing each window costs `O(n*k)`; sliding the running
total costs `O(n)` regardless of window width. The naive re-summing
version is written out too and the results compared, so the fast version
is checked rather than asserted.

**The price, which this case makes visible.** A running total carries its
rounding error forward:

```
Temperatures: [18.5, 19.2, 21.7, 20.1, 22.8, 24.3, 23.9]
Smoothed (window 3): [19.8, 20.333333333333332, 21.53333333333333,
                      22.399999999999995, 23.666666666666668]
```

That fourth value is `22.399999999999995` where summing `20.1 + 22.8 +
24.3` directly gives exactly `22.4`. The two methods are algebraically
identical and numerically are not — floating-point addition is not
associative, and the sliding version adds in a different order.

So the agreement check uses a tolerance rather than `==`, not out of
caution but because **exact equality is the wrong claim to make**. Over a
long series the drift is worth correcting with a periodic fresh sum;
naming that tradeoff is more useful than hiding it behind well-chosen
integers. (The integer series is checked exactly for that contrast — it
agrees on all four windows.)

A window wider than the series returns an empty list rather than failing.

Verify it yourself:

```bash
pnpm eml transpile examples/moving-average/moving_average.eml   # -> Python
pnpm eml run examples/moving-average/moving_average.eml         # -> averages, agreement check, float drift
pnpm eml trace examples/moving-average/moving_average.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/moving-average/moving_average.eml   # -> OK (fixpoint)
```
