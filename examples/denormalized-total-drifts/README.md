# Denormalized total drifts — the reconciliation compared a number with itself

`denormalized_total_drifts.eml` applies one ordinary edit to each of four
orders, compares the stored total against a total recomputed from the line
items, and then runs both the reconciliation the system has and one that
re-derives.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a total kept as a column because computing it per read
is expensive, maintained by every write path separately.

| order | stored | recomputed | drift | path |
| --- | --- | --- | --- | --- |
| o-1 | 250 | 250 | 0 | qty |
| o-2 | 170 | 80 | **90** | remove, add |
| o-3 | 110 | 90 | **20** | reprice |
| o-4 | 200 | 200 | 0 | — |

Which write paths keep the invariant, probed one at a time:

```
add       keeps the total correct
remove    leaves the total stale
reprice   leaves the total stale
qty       keeps the total correct
```

The two reconciliations, on the same data at the same instant:

```
sum of order.total: 730     ledger total: 730           -> PASS
sum of order.total: 730     recomputed from items: 620  -> FAIL
```

The check the system has is green throughout, because the ledger is posted
from the same column it is being compared against. Re-deriving is exactly the
cost the column existed to avoid, so the check that gets built is the cheap
one, and the cheap one reads the column on both sides.

**A wrong premise, kept in the file.** The last check first asserted that drift
would go both ways, so no operator could learn a rule of thumb. Measured, every
drift is **positive**. The reason is better than the guess: `add` was written
first, when the feature was "put things in a cart", and it recomputes. The
paths that make an order *smaller* — remove a line, drop a price — arrive later
with refunds, returns and support tooling. So the stale paths are exactly the
shrinking ones, and revenue is systematically overstated, in the direction
nobody files a ticket about.

Verify it yourself:

```bash
pnpm eml run examples/denormalized-total-drifts/denormalized_total_drifts.eml
```
