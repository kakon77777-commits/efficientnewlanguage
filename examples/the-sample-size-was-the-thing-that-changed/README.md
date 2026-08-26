# The sample size was the thing that changed

`the_sample_size_was_the_thing_that_changed.eml` - Three quarters of latency review. Each quarter the team sampled transactions and reported the worst one they saw. The worst got worse every quarter. What else changed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Reporting the observed maximum is the right instinct and was chosen on purpose. A mean hides the customer who waited nine seconds, and that customer is the one who writes in. The worst case is what a support commitment is written against, it needs no distributional assumption, and it is the one number an engineer can go and reproduce. Everything about reporting it is defensible.

The sample grew each quarter, from 200 to 2000 to 20000, because the sampling job was made cheaper twice. Nobody reported that, because sampling more is not a change to the system - it is a change to how hard you looked.

A maximum is not a property of a population. It is a property of a population AND a sample size, and it only goes up. A rate is a property of the population alone. Below, the rate is identical in all three quarters, to the digit.

```
the sampling job was made cheaper twice; the system was not touched
```

```
quarter   sampled   worst seen   over 100ms   rate
  Q1       200        120         2          10 per mille
  Q2       2000        500         20          10 per mille
  Q3       20000        2000         200          10 per mille
```

```
the worst seen went 120 -> 500 -> 2000, a 16x rise across three quarters
the rate over 100ms was 10 per mille in every one of them
```

```
why the worst moved, class by class
class          appears once every   first sample size that can contain it
  120ms                      100                                     100
  500ms                     1000                                    1000
  2000ms                   10000                                   10000
```

```
  Q1 sampled 200    -> could not contain a 500ms event. None was reported.
  Q2 sampled 2000   -> could not contain a 2000ms event. None was reported.
  Q3 sampled 20000  -> contained two. Both were reported.
```

```
  a 2000ms transaction occurred in Q1 and in Q2 as well
  in Q1 the sample was 200 of every 10000, so it held 0.02 of one
```

```
statistic        behaviour as the sample grows, population fixed
  maximum        rises, without bound if the tail is unbounded
  minimum        falls, for the same reason
  distinct count rises, it can only ever add
  range          rises, it is a max minus a min
  mean           stable
  rate           stable
  median         stable
```

```
the quarterly report contained one maximum and no rates
```

```
control - a statistic that does not grow with the sample
  Q1 rate over 100ms: 10 per mille
  Q2 rate over 100ms: 10 per mille
  Q3 rate over 100ms: 10 per mille
  quarters measured: 3, quarters at 10 per mille: 3
```

```
  a real degradation moves a rate
  looking harder cannot move a rate, and cannot fail to move a maximum
```

```
null control - a quantity that rises under either explanation
  Q1 total ms in the over-100 tail: 240
  Q2 total ms in the over-100 tail: 3160
  Q3 total ms in the over-100 tail: 34600
  this rises 16x too, and would rise 16x if the system were perfect
  it cannot distinguish the two stories, so it is not evidence for either
```

Reporting the worst case is defensible: it is reproducible, it needs no distributional assumption, and it is what the support commitment is written against. It is also the one statistic that a cheaper sampling job is guaranteed to move. The rate held at 10 per mille across all three quarters, from a population that was never touched.

Verify it yourself:

```bash
pnpm eml run examples/the-sample-size-was-the-thing-that-changed/the_sample_size_was_the_thing_that_changed.eml
```
