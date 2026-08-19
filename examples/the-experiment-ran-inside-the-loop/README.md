# The experiment ran inside the loop

`the_experiment_ran_inside_the_loop.eml` - The A/B test was clean: random assignment, one change, a large sample, a clear result. How much of the measured lift is the treatment is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The experiment was run properly. Assignment was random, the groups were balanced, the metric was pre-registered and the difference was far outside the noise. Everything an experiment is supposed to control for was controlled for.

Randomisation makes the two groups alike. It does not make them independent: both draw on one cache, one pool and one database, so a treatment that uses more of a shared thing leaves less of it for the control. The comparison then contains the treatment's gain and the control's loss.

Both terms are computed from the same run.

```
baseline latency, before the experiment : 100
users : 1000, in treatment : 500
```

```
during the experiment
  treatment group : 88
  control group   : 109
  measured lift   : 21
```

```
what the lift is made of
  the treatment got faster by : 12
  the control got slower by   : 9
  and those two account for the whole of the 21
  the share of the lift that is the control moving : 42%
```

```
rolling the treatment out to everybody
  predicted from the lift : 79
  actual                  : 90
  short of the prediction by 11
  still an improvement of 10 on the baseline, which is real
  and is 47% of what the experiment reported
```

```
the control group against its own history
  before the experiment : 100
  during                : 109
  the control moved by 9, and a control that moves is not a baseline
  this comparison needs no extra instrumentation, only the question
```

```
the same experiment at ten times the sample
  measured lift : 21, unchanged
  the share that is control degradation : 42%, unchanged
  a larger sample narrows the interval around a number that is not the
  treatment effect
```

```
control - the same treatment with a per-group cache
  control group : 100, treatment : 88, lift : 12
  the lift equals the gain exactly, and the rollout gets what was measured
```

Randomisation balanced the groups and the difference between them is real. It is a difference between two groups drawing on one pool, and only one of the two survives the rollout.

Verify it yourself:

```bash
pnpm eml run examples/the-experiment-ran-inside-the-loop/the_experiment_ran_inside_the_loop.eml
```
