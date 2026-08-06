# Mean, median, skew — the average nobody experienced

`mean_median_skew.eml` computes three "averages" over a skewed latency sample
and a symmetric control, and measures two things a report never shows: what
fraction of observations are worse than the mean, and how far one extreme value
moves each statistic.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "average" names three statistics and a report almost
never says which. On a symmetric distribution they agree and the ambiguity is
free. Latency is never symmetric.

| sample | n | mean | median | mode | worse than mean |
| --- | --- | --- | --- | --- | --- |
| skewed | 25 | 49.6 | 25.0 | 20 | 4/25 (16%) |
| symmetric | 25 | 32.0 | 32.0 | 20 | 12/25 (48%) |

On the symmetric control about half the observations are worse than the mean —
which is exactly what makes the mean *sound* like a typical value. On the
skewed sample it is 16%.

One added observation of 10000 ms:

```
  mean:   49.6 -> 432.3  (moved 382.7)
  median: 25.0 -> 25.5  (moved 0.5)
```

The mean is a function of every point, so one point can move it anywhere; the
median is a function of the ordering, so one point moves it by at most one
position. That ratio is a check, not a remark.

And the closing measurement: **no observation is equal to the mean**. The
number reported as typical is not one that any request took.

Verify it yourself:

```bash
pnpm eml run examples/mean-median-skew/mean_median_skew.eml
```

```bash
pnpm eml trace examples/mean-median-skew/mean_median_skew.eml --run
```
