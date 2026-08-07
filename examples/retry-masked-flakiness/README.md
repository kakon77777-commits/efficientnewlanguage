# Retry-masked flakiness — one failure in five reports as 99.2%

`retry_masked_flakiness.eml` sweeps true failure rates against attempt counts
and computes the observed pass rate exactly, in integer per-mille arithmetic.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: retrying a failed test in CI is a reasonable operational
choice and a catastrophic measurement choice. The observed pass rate after *r*
attempts is `1 - failure_rate^r`.

| true failure rate | 1 attempt | 2 attempts | 3 attempts | 5 attempts |
| --- | --- | --- | --- | --- |
| 50.0% | 50.0% | 75.0% | 87.5% | 96.8% |
| 20.0% | 80.0% | 96.0% | **99.2%** | 99.9% |
| 1.0% | 99.0% | 99.9% | 100.0% | 100.0% |

At one attempt all five true rates are distinguishable. At three, most land
above 99% — the same narrow band the healthy tests are in.

What is lost is not precision but **order**: a test failing half the time and
one failing once in twenty report numbers a reader would call the same.

The dashboard is not lying. That *is* how often the pipeline goes green. The
number is simply a function of the retry policy, and the underlying rate is not
recoverable from it — unless the retries are counted too, which the file
measures as the quantity that stays monotone in the true rate.

More retries always look better and never worse, at every true rate. That is
what makes the policy hard to stop.

Verify it yourself:

```bash
pnpm eml run examples/retry-masked-flakiness/retry_masked_flakiness.eml
```
