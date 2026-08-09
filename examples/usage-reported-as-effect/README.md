# Usage reported as effect — the metric was largest where the effect was zero

`usage_reported_as_effect.eml` carries a hidden per-user field saying what each
user would have done *without* the feature, computes the reported metric and
the true lift side by side, and sweeps the rollout to show which of the two
moves.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a feature can observe its own invocations and their
outcomes. It cannot observe the world in which it was not invoked.

| rollout | exposed | assisted conversions | total | share reported | true lift |
| --- | --- | --- | --- | --- | --- |
| 2 | 2 | 2 | 4 | **50.0%** | **0** |
| 4 | 4 | 4 | 4 | **100.0%** | **0** |
| 6 | 6 | 4 | 4 | 100.0% | 0 |
| 8 | 8 | 6 | 6 | 100.0% | 2 |
| 10 | 10 | 6 | 6 | 100.0% | 2 |

The sentence the metric is used to support:

```
at 40% rollout: 'the feature drove 100.0% of conversions'
               true conversions caused: 0 of 4
```

Why it starts high and cannot fall:

```
of the first 4 users reached: 4 would have converted anyway, 0 are changed by the feature
of the last 6 users reached:  0 would have converted anyway, 2 are changed by the feature
```

A gradual rollout reaches engaged users first, and engaged users are the ones
who would have converted regardless. So the metric is largest exactly where the
effect is smallest, and it rises whenever the feature is shown to more people —
whether or not it changes a single decision. A number that only goes up is a
number that cannot report a disappointment.

The counterfactual has to come from somewhere else: a holdout, a staged rollout
compared against itself, anything at all. Without one, what gets reported is
**usage**, and usage is maximised by showing the feature to people who did not
need it.

Verify it yourself:

```bash
pnpm eml run examples/usage-reported-as-effect/usage_reported_as_effect.eml
```
