# The lock was held and the process was gone

`the_lock_was_held_and_the_process_was_gone.eml` - The lock is held and the store is right about that. How long the work waits for a holder that no longer exists is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The lock is implemented correctly. Acquisition is a single conditional write, so two holders is impossible; the key carries a time to live, so a crash cannot wedge it forever; and the holder refreshes while it works. Every claim in that sentence is true and the implementation has no race in it.

What the key records is that SOMETHING acquired it and the clock has not run out. Whether that something is still running is a different fact, held on a different machine, and the store has no way to observe it.

The holder is killed for memory thirty-four times a week. The key survives it every time, and every waiter behaves correctly for the remainder of the lease.

```
lease, seconds                  : 900
holder deaths per week          : 34
mean lease left when it died    : 451
stalled seconds per week        : 15334
stalled minutes per week        : 255
```

```
the lock's own guarantees
  acquisition        : one conditional write
  two holders at once: 0 ever observed
  wedged forever     : impossible, the lease expires
  refresh while working : implemented
  verdict            : CORRECT
```

```
  there is no race here and no amount of review will find
  one; the mutual exclusion is sound
```

```
the two facts
  a holder acquired this key      : in the store
  the holder is still running     : on another machine
  the store's evidence for the second : the first, plus
    a clock
```

```
  a lease is a bet that a live holder refreshes faster than
  the clock runs, and a dead one loses that bet slowly
```

```
share of a lease spent waiting on nobody : 5011 per ten thousand
```

```
the lease at sixty seconds instead
  mean stall per death, seconds : 30
  holder pauses exceeding it    : 11 per week
  each of those is two holders  : yes
```

```
  the lease length trades a stall against a violation and
  cannot remove either
```

```
null control - the same lease, plus a fencing token
  lease behaviour        : unchanged
  holder deaths per week : 34, unchanged
  writes from a second believer : 0
  the lock did not get better; the resource started
  refusing writes that carry a stale token
```

```
what a correct lock guarantees
  at most one holder acquired this key : exactly
  the holder is alive and working      : not addressed;
    liveness is a property of a process, and the store
    holds a key and a clock
```

```
a lease converts an unanswerable question into a timer; the
timer is always either too long to wait for or too short to
survive a pause, and the way out is at the resource
```

The lock is correct and there has never been a double holder: one conditional write, a lease that cannot wedge, refresh while working. Its holder dies 34 times a week with a mean of 451 seconds still on the clock - 5011 per ten thousand of a lease - so 255 minutes a week are spent waiting for a process that no longer exists, and halving the lease buys that back with 11 violations.

Verify it yourself:

```bash
pnpm eml run examples/the-lock-was-held-and-the-process-was-gone/the_lock_was_held_and_the_process_was_gone.eml
```
