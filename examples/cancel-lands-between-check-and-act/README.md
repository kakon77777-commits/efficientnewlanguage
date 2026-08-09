# Cancel lands between check and act — accepted, recorded, and too early to matter

`cancel_lands_between_check_and_act.eml` sweeps a cancellation's arrival across
every tick of a six-step operation, under three placements of the `if
cancelled` check, and counts how many arrival times produce the effect anyway.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `if cancelled: return` followed by the action is what
every cooperative cancellation looks like. It is correct for every cancel
arriving before the check and every cancel arriving after the action. The ticks
between them are a window where a cancel is accepted, acknowledged, recorded —
and does nothing.

```
early       check at tick 1, write at tick 6 -> arrivals in (1, 6] miss: 5
late        check at tick 5, write at tick 6 -> arrivals in (5, 6] miss: 1
atomic      check at tick 6, write at tick 6 -> arrivals in (6, 6] miss: 0
```

The window equals `write_tick - check_tick` at all three placements — computed
on both sides, which is what makes it a measurement. **Every line inserted after
the check widens it by exactly one.** A guard clause belongs at the top of a
function; that is what makes it a guard clause, and it is why the check ends up
as far from the action as the function is long.

Which number separates the three, and which one does not:

```
early    -> accepted: 7, honoured: 1, accepted-but-ineffective: 5
late     -> accepted: 7, honoured: 5, accepted-but-ineffective: 1
atomic   -> accepted: 7, honoured: 6, accepted-but-ineffective: 0
```

Every placement **accepts all 7**, so a counter of cancellation requests is
identical for all three. The number that separates them is `honoured`, and
computing it requires the operation to record both that it was cancelled *and*
that it did not write — two facts on two different code paths, where the early
return logs "cancelled" and the write path logs "completed", and both read as a
normal outcome.

**A wrong premise, kept in the file.** The window check first read `== 4`, the
number of *steps* between check and write. Measured: 5, the number of *arrival
ticks* that miss — because a cancel landing on the write tick itself is also
too late. Two quantities, one typed number.

Verify it yourself:

```bash
pnpm eml run examples/cancel-lands-between-check-and-act/cancel_lands_between_check_and_act.eml
```
