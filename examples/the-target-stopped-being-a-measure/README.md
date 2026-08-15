# The target stopped being a measure - 100% concordance before, no decidable pairs after

`the_target_stopped_being_a_measure.eml` computes the proxy and the goal from the same ticket log in both periods, and measures how well the proxy can still rank tickets by the goal.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: choosing the proxy was not a mistake. Response time was measurable, cheap, available daily, and over the observed period it moved with the thing anyone cared about. A team asked to improve the goal directly has nothing to act on; a team asked to improve the proxy does. What the correlation was made of is the part nobody wrote down - it held because the fastest way to answer quickly WAS to answer well.

```
before the proxy became the target
  tickets            : 20
  mean hours to reply: 5.3
  resolved           : 13 of 20
  faster ticket also resolved, on decidable pairs : 100%
```

```
after
  tickets            : 20
  mean hours to reply: 1.0
  resolved           : 7 of 20
  faster ticket also resolved, on decidable pairs : n/a - no decidable pairs
```

```
the change
  proxy improved by : 4.3 hours
  goal moved by     : -6 resolutions
  the proxy got better and the goal got worse
```

```
the proxy's ability to rank tickets by the goal
  before : 100%
  after  : n/a - no decidable pairs
  after: no decidable pairs remain - every reply takes the same time,
  so the proxy can no longer order anything at all
```

```
control - the proxy reported weekly, nobody judged on it
  mean hours : 5.2
  resolved   : 5 of 8
  ranking ability : 100%
  unchanged from the before period
```

The proxy was chosen because it moved with the goal, and it did, because the cheapest way to move it was to move the goal. Making it the target made a cheaper way worth finding.

The **control** matters: the same proxy watched but not judged on stays at 100%. Watching a number does not break it.

Verify it yourself:

```bash
pnpm eml run examples/the-target-stopped-being-a-measure/the_target_stopped_being_a_measure.eml
```
