# The rollout was gradual and the write was not

`the_rollout_was_gradual_and_the_write_was_not.eml` - The feature is on for five percent of users behind a kill switch that has been exercised. How many users are exposed to it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rollout is done properly. Five percent, bucketed by a stable hash of the user so the same people stay in the cohort rather than flickering; a kill switch tested in a game day and shown to take effect in eleven seconds; a dashboard split by cohort so a regression shows up as a difference rather than as noise. This is the careful version.

A percentage rollout gates who RUNS the new code. The new code's first act is a write, and a write is read by everybody.

The five percent are writing a new row shape into a shared table.

```
users                        : 4200000
rollout                      : 500 per ten thousand
running the new code         : 210000
not running it               : 3990000
reading the table it writes  : 4200000
```

```
new-shape rows written per day : 84000
kill switch, seconds         : 11
cohort flicker incidents     : 0
```

```
the rollout mechanism
  bucketing         : a stable hash of the user
  cohort flicker    : 0
  kill switch tested in a game day : yes
  time to take effect, seconds : 11
  dashboard split by cohort : yes, so a regression is a
    difference rather than noise
  verdict           : GRADUAL
```

```
  every one of those is a deliberate choice and each one
  prevents a real failure mode
```

```
the two populations
  who executes the new branch : 210000
  who reads what it produced  : 4200000
  the flag is consulted on the write path : yes
  on the read path                        : no, and it
    could not be - a reader does not know which cohort
    wrote the row it is reading
```

```
share of users exposed to the change : 10000 per ten thousand
```

```
turning it off
  new-shape writes after 11 seconds : 0
  rows already written    : still there
  readers still meeting them : 4200000
  what the switch bounds  : the accumulation
  what it does not bound  : the exposure
```

```
null control - the reader ships first, to everyone
  rollout of the writer : 500 per ten thousand, unchanged
  readers that understand the shape : 4200000
  readers meeting an unknown shape  : 0
  the rollout did not get more gradual; the half that is
  not gated stopped being the half that changed
```

```
what a percentage rollout guarantees
  a fraction of users runs the new code : exactly
  a fraction of users is affected by it : not addressed;
    the flag is a property of the caller, and a write
    outlives the caller and belongs to everyone
```

```
gradual is a property of execution, not of effect; a change
whose output is shared has an exposure equal to the readership
from the first user in the cohort
```

The rollout is careful: stable bucketing with 0 flicker incidents, a kill switch exercised in a game day and effective in 11 seconds, a dashboard split by cohort. It gates the write path, which 210000 users take, and the rows land in a table all 4200000 read - 10000 per ten thousand exposed at 500 per ten thousand rolled out - and the switch stops 84000 new rows a day without removing the ones there.

Verify it yourself:

```bash
pnpm eml run examples/the-rollout-was-gradual-and-the-write-was-not/the_rollout_was_gradual_and_the_write_was_not.eml
```
