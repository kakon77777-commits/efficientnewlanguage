# The clock was monotonic and the process restarted

`the_clock_was_monotonic_and_the_process_restarted.eml` - Durations use a monotonic clock, which is the correct choice and immune to every wall-clock hazard. How long a thirty-second lease lasts is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The choice is right and it was made deliberately. A wall clock can step backwards when time is corrected, jump an hour at a transition, and produce negative durations; the code was moved off it after exactly that bug. The monotonic clock never goes backwards and is not affected by any of it.

A monotonic clock has no fixed origin. Its zero is whenever the counter it reads started, and comparing two readings is only meaningful if they came from the same one. Persisting a reading writes a number whose origin is not stored beside it.

The lease deadline is written to shared storage so other instances can honour it, and the process that wrote it has since restarted.

```
lease, seconds                : 30
uptime when the deadline was written : 804000
stored deadline value         : 804030
```

```
after a restart the reader's clock starts near : 0
so the lease appears to last, seconds : 804030
which is longer than intended by : 26801 times
```

```
the clock
  goes backwards      : never
  affected by time correction : no
  affected by a daylight transition : no
  negative durations observed : 0
  verdict             : MONOTONIC
```

```
  the move to it fixed a real bug and none of the wall
  clock's hazards can recur
```

```
comparing two readings
  same process, same boot : meaningful
  different process       : the origins differ
  origin stored beside the value : no
  a way to detect the mismatch   : none, both are just
    numbers of seconds
```

```
  the reading is not wrong and the comparison is not
  detectable as invalid; it is arithmetic on two scales
```

```
the exposure
  leases persisted        : 2400000
  leases per day          : 6593
  restarts per week       : 62
  restarts per year       : 3224
  every lease written before a restart and read after it
    is held for 804030 seconds instead of 30
```

```
what the investigation finds
  release path        : correct
  deadline arithmetic within one process : correct
  negative durations  : 0
  clock hazards       : none, it is monotonic
  the reading that is wrong : neither of them
```

```
null control - persist a wall-clock instant, measure with monotonic
  negative durations   : 0, unchanged
  effective lease, seconds : 30
  leases outliving their deadline : 0
  the monotonic clock is still used for every duration;
  the value that crosses a process boundary stopped being
  one of its readings
```

```
what a monotonic clock guarantees
  the difference of two readings is a true elapsed time : exactly,
    within one origin
  a reading means anything elsewhere                    : not
    addressed; the origin is not part of the value and
    cannot be recovered from it
```

```
monotonic readings are for measuring and wall-clock instants
are for communicating; a value that outlives its process has
crossed from the first use to the second
```

The clock is monotonic, 0 negative durations have been seen, and moving to it fixed a real wall-clock bug. Its readings have no stored origin, so a 30 second lease written at uptime 804000 and read after a restart lasts 804030 seconds - 26801 times its length - across 3224 restarts a year, and no reading is wrong.

Verify it yourself:

```bash
pnpm eml run examples/the-clock-was-monotonic-and-the-process-restarted/the_clock_was_monotonic_and_the_process_restarted.eml
```
