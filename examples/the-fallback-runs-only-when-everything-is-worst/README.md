# The fallback runs only when everything is worst

`the_fallback_runs_only_when_everything_is_worst.eml` - The fallback path has run four times in three years. What conditions it ran under is computed below, and it is not a coincidence.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Having a fallback is right and this one is well designed: it degrades rather than fails, it needs no operator, and the four times it ran it did what it was written to do. Nobody regrets having it.

It runs when the primary is unavailable, which is when the system is already degraded. So the fallback's inputs are never the ordinary ones - they are the inputs present during an incident, and those are the inputs it has been exercised on least, because incidents are rare.

The conditions are recorded per activation.

```
fallback activations in 36 months : 4
```

```
run   primary   cache   load   degraded deps   outcome
  a1    down      1       3x     1              worked
  a2    down      0       2x     0              worked
  a3    down      1       6x     1              FAILED
  a4    down      1       4x     2              FAILED
```

```
activations that worked : 2 of 4
```

```
conditions during the 4 activations
  primary unavailable : 4 of 4, by definition of the trigger
  cache cold          : 3 of 4
  average load        : 37 tenths of normal
  worst load          : 6x normal
  none of those is the condition anybody tests the fallback under, because
  the fallback is tested when things are fine
```

```
activations split by how bad the conditions were
  milder conditions : 1 runs, 0 failed
  worse conditions  : 3 runs, 2 failed
  every failure is in the worse group, and the worse group is what the
  trigger selects for
```

```
exercise, by kind
  production activations : 4 in 36 months
  test-suite runs        : every build, with the primary mocked as down
  what the suite holds constant : warm cache, normal load, healthy deps
  so the suite covers the trigger and none of the conditions that come
  with it
```

```
activations with a cold cache AND raised load : 3 of 4
  a drill that reproduces that combination exercises what 3 of the 4
  real activations actually met, and the suite has never held it
```

```
control - a read replica used for 30% of reads at all times
  activations : continuous
  conditions  : the ordinary ones, because it is on the ordinary path
  a defect in it is found on a Tuesday rather than during an incident
```

The fallback is well designed and it has done its job. What triggers it also selects the conditions it runs under, so the runs it gets are drawn from the part of the input space it has been exercised on least.

Verify it yourself:

```bash
pnpm eml run examples/the-fallback-runs-only-when-everything-is-worst/the_fallback_runs_only_when_everything_is_worst.eml
```
