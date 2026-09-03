# The average was weighted and the weights were stale

`the_average_was_weighted_and_the_weights_were_stale.eml` - The fleet latency is a weighted average, which is the right shape, and the arithmetic is exact. What it reports is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Weighting is the correct choice and someone argued for it. An unweighted mean over five regions treats a region serving two percent of traffic as equal to one serving a third, which is how a small region's noise moves a headline number. The weighted form fixes that, the weights sum to one, and the computation has no rounding error worth naming.

The weights are a config file. They were correct when written; traffic moved, and nothing recomputes them, because a weight is an input and inputs do not have freshness checks.

The region carrying a third of the traffic is weighted at nine percent.

```
regions                        : 5
weight of the heavy region     : 900 per ten thousand
its actual share of traffic    : 3400 per ten thousand
days since the weights changed : 96
```

```
latency there, ms              : 890
latency elsewhere, ms          : 120
reported average, ms           : 189
experienced average, ms        : 381
understated by, ms             : 192
```

```
why the average is weighted
  unweighted mean over 5 regions : treats a two
    percent region as equal to a third
  weights sum to one   : yes
  rounding error       : none worth naming
  argued for by        : someone who had watched a small
    region's noise move the headline
  verdict              : CORRECTLY WEIGHTED
```

```
  the shape is right and switching back would be worse
```

```
the two kinds of input
  latency per region : measured, continuously
  weight per region  : written, once, in a file
  freshness check on the first  : yes, it alerts on gaps
  freshness check on the second : none, because a config
    value is not a measurement and nothing watches it age
```

```
the heavy region's share is its weight times : 3
```

```
reading the dashboard
  the number is stable            : yes
  it moves when latency moves     : yes
  it is within the range of the per-region numbers : yes
  it equals what any user experiences : no, and nothing
    on the page is the number that would
```

```
null control - the weights recomputed from measured traffic
  weights sum to one : yes, unchanged
  weight of the heavy region : 3400 per ten thousand
  reported average, ms : 381
  the average did not become better shaped; its second
  input started being measured like its first
```

```
what a weighted average guarantees
  each part counts in proportion to its weight : exactly
  each part counts in proportion to its size   : not
    addressed; the weight is an assertion about the size,
    made once, and the size is free to move
```

```
a formula's correctness is a claim about its arithmetic; every
input it names is a separate claim, and the ones written by
hand are the ones with no clock on them
```

The average is correctly weighted and the arithmetic is exact: the weights sum to one, the shape was chosen over an unweighted mean for a real reason. The weights were written 96 days ago and the heavy region now carries 3 times its weight, so the dashboard reports 189 ms where the traffic experiences 381 - understated by 192 ms - and every number on the page is individually correct.

Verify it yourself:

```bash
pnpm eml run examples/the-average-was-weighted-and-the-weights-were-stale/the_average_was_weighted_and_the_weights_were_stale.eml
```
