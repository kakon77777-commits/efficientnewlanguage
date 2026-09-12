# The eta was linear and the work was not

`the_eta_was_linear_and_the_work_was_not.eml` - The job is 90 per hundred done and the ETA says ten minutes, and the arithmetic is right. What the ETA assumes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The progress bar is honest about what it counts. It counts real completed work units, not a fabricated percentage; it updates from the actual count each tick; the rate is the true average so far; and the ETA is remaining over that rate.

The ETA assumes the remaining work runs at the average rate.

```
total units                     : 1000
done units                      : 900
  remaining                     : 100
elapsed                         : 90 minutes
average rate so far             : 10 units per minute
reported ETA                    : 10 minutes
```

```
rate on the remaining units     : 1 per minute
true remaining time             : 100 minutes
  underestimate                 : 90 minutes
```

```
the progress bar
  counts : real completed units
  updates : from the actual count each tick
  rate : the true average so far
  ETA : remaining over that rate
  units genuinely done : 900
  verdict : 90 PERCENT DONE, ETA TEN MINUTES
```

```
  counting real units rather than a fabricated percentage
  is the part done right here, and it is why 90 percent
  is true
```

```
the extrapolation
  what it projects : the average rate onto the remainder
  what inflated that average : the first 900 units were
    the easy ones
  what the remainder is : the 100 hard ones, at 
    1 per minute
  so remaining time is : 100 minutes, not 10
  the average is a fact about the past : projected as a
    fact about the future
```

```
the caller watching the bar
  what the ETA promised : 10 minutes
  what the tail actually takes : 100 minutes
  the underestimate : 90 minutes
  is the percentage wrong : no; 900 of 1000 are done
  is the ETA wrong : the arithmetic is right and the
    assumption behind it is not
```

```
null control - ETA from the recent rate, not the lifetime average
  ETA from the lifetime average : 
    10 minutes, unchanged
  ETA from the recent rate : 
    100 minutes
  estimates that change : 1
  no unit and no count changed; the rate used stopped
  being the one the easy units inflated
```

```
what a 90-percent bar with a ten-minute ETA guarantees
  900 of 1000 units are done : exactly, real units,
    updated each tick, true average rate
  the job finishes in the ETA : not addressed; the ETA
    extrapolates the average rate, and the remaining 100
    are the slow ones the average was inflated by the fast
    ones - they take 100 minutes
```

```
an average rate is a summary of the work already done, and the work left is
exactly the work not in that summary; projecting the past rate onto a remainder
of a different kind is the assumption, not the measurement
```

It counts real units and divides remaining by the true average - 90 percent, ETA 10 minutes. The average was inflated by the easy first 900, and the remaining 100 run at 1 per minute, so the tail takes 100 minutes, 90 past the ETA.

Verify it yourself:

```bash
pnpm eml run examples/the-eta-was-linear-and-the-work-was-not/the_eta_was_linear_and_the_work_was_not.eml
```
