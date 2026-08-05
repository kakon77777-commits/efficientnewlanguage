# Deadlock by lock order — the defect that exists only in the pair

`deadlock_by_lock_order.eml` enumerates every interleaving of two
transactions that take the same two locks in opposite orders, then repeats
the enumeration with a consistent global lock order.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a real wait model — per-transaction program counters
and a drain loop — rather than the usual shortcut where a blocked
transaction skips its remaining steps. That shortcut is what the first
version of this file did, and it over-counted deadlock by letting blocked
transactions skip their own lock releases.

Two counts, both measured over all 70 interleavings:

| | deadlocks | ends with every lock free |
| --- | --- | --- |
| opposite order | most schedules | — |
| consistent order | 0 | 70/70 |

The second correction is the one worth reading. The file originally claimed
deadlock is a *rare* schedule; the enumeration disproved it — deadlock is
the **majority** of interleavings. What is rare is reaching them:

```
schedules that are SERIAL (one finishes first): 2/70
  of which deadlock: 0
```

A test that does not force concurrency samples only the serial ones. So
"this has run in production for a year" measures load, not correctness.

Each function is correct alone and takes locks in the order its own logic
suggests, so review of either one finds nothing. The defect exists only in
the pair.

Verify it yourself:

```bash
pnpm eml run examples/deadlock-by-lock-order/deadlock_by_lock_order.eml
```

```bash
pnpm eml trace examples/deadlock-by-lock-order/deadlock_by_lock_order.eml --run
```
