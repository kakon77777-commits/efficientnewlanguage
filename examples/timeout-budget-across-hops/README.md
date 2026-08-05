# Timeout budget across hops — four 5-second timeouts are not a 5-second bound

`timeout_budget_across_hops.eml` sends a request across four services under
fixed per-hop timeouts and under a propagated deadline, and reports the
user's wait, whether it succeeded, and how much work ran after the caller
had already given up.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: per-hop timeouts **compose by addition**. Each hop is
configured with a bound that sounds like a bound on the whole request and
is not.

| condition | strategy | user wait | ok | wasted ms | hops started |
| --- | --- | --- | --- | --- | --- |
| normal | fixed | 2800 | yes | 0 | 4 |
| normal | budget | 2800 | yes | 0 | 4 |
| slow-D | fixed | 5000 | no | **6400** | 4 |
| slow-D | budget | 6000 | no | 0 | 4 |
| slow-B | fixed | 5000 | no | 2500 | 4 |
| slow-B | budget | 6000 | no | 0 | **2** |

On the happy path the two are indistinguishable — a budget must not cost
anything when nothing is slow — and the normal wait equals the **sum** of
the hop latencies, not any single configured timeout.

Under `slow-D` the fixed scheme performs 6400 ms of work nobody is waiting
for, because a hop that timed out cannot tell the hops below it to stop.
That is the system doing its most expensive work precisely when it is
overloaded.

**Why there are two slow conditions**: `slow-D` cannot demonstrate the
skip. D is the last hop, so when the budget runs out there is nothing left
to skip and both strategies show 4/4 hops started. `slow-B` puts the
slowness in the middle, and the budget starts only 2 of 4 — the property
the file *claimed* in prose but did not measure until this condition
existed.

Verify it yourself:

```bash
pnpm eml run examples/timeout-budget-across-hops/timeout_budget_across_hops.eml
```

```bash
pnpm eml trace examples/timeout-budget-across-hops/timeout_budget_across_hops.eml --run
```
