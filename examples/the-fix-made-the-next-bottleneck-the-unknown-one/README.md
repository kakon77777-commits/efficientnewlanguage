# The fix made the next bottleneck the unknown one

`the_fix_made_the_next_bottleneck_the_unknown_one.eml` - The slowest stage was made four times faster. What that did to the pipeline, which stage is the constraint now, and how well that one is understood are all computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Optimising the slowest stage is correct and is where the gain was. It was measured, it was the largest single cost, the speedup is real and it did not break anything. Anybody would have picked that stage.

A pipeline's throughput is set by its slowest stage, so a big speedup there moves the constraint somewhere else. Where it moves is decided by the remaining stages, and how well the new constraint is understood is decided by how long it has been ignored - which is exactly as long as it was not the bottleneck.

Both the timings and the operational knowledge are computed per stage.

```
stage      before   after   people who know it   runbook pages   months since touched
  parse   400ms    100ms    6                    4               1
  enrich   120ms    120ms    2                    0               19
  validate   90ms    90ms    5                    3               2
  persist   110ms    110ms    1                    0               31
  publish   60ms    60ms    4                    2               4
```

```
pipeline total : 780ms -> 480ms
  improvement : 38%
```

```
the slowest stage
  before : parse at 400ms
  after  : enrich at 120ms
  the constraint moved
```

```
the old constraint, parse
  people who have debugged it : 6
  runbook pages               : 4
  months since anyone touched it : 1
the new constraint, enrich
  people who have debugged it : 2
  runbook pages               : 0
  months since anyone touched it : 19
```

```
  the pipeline's constraint is now a stage 4 fewer people have opened
```

```
attention against being the bottleneck
  parse : was slow, 6 people, touched 1 months ago
  enrich : was slow, 2 people, touched 19 months ago
  validate : was fast, 5 people, touched 2 months ago
  persist : was fast, 1 people, touched 31 months ago
  publish : was fast, 4 people, touched 4 months ago
  a stage gets looked at when it is slow, so the stages nobody has looked
  at are exactly the ones that were never the constraint
```

```
optimising the new constraint
  the same 4x on enrich : 120ms -> 30ms
  pipeline : 480ms -> 390ms, 18%
  people available to do it : 2
  runbook to start from     : 0 pages
```

```
after the fix the stages span 60ms to 120ms, a spread of 60ms
  before, the spread was 340ms
  the pipeline is flatter, so the next single-stage win is smaller, and
  a flat pipeline is a success rather than a problem
```

```
control - a pipeline where one stage is 90% of the time
  slowest before : 900ms, after a 22% cut : 700ms
  the constraint stays where it was, so the team keeps working on the stage
  it already understands
```

Optimising the measured slowest stage is where the gain was and the speedup is real. Throughput is set by whichever stage is slowest now, and how well that one is understood is a record of how long it was not.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-made-the-next-bottleneck-the-unknown-one/the_fix_made_the_next_bottleneck_the_unknown_one.eml
```
