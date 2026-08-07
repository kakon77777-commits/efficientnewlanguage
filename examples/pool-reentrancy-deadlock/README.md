# Pool reentrancy deadlock — at capacity means deadlocked

`pool_reentrancy_deadlock.eml` sweeps concurrency against pool size for
requests holding one, two and three connections, and reports the first
concurrency at which progress becomes impossible.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a request holding one connection while acquiring a
second cannot be sized against the pool.

| connections held | first deadlocking concurrency | predicted | pool |
| --- | --- | --- | --- |
| 1 | none | none | 10 |
| 2 | **10** | 10 | 10 |
| 3 | **5** | 5 | 10 |

**A premise the measurement corrected**: the file was written asserting the
cliff for a two-connection request sits at five. It sits at **ten** — exactly
the pool size. Ten concurrent requests against ten connections is the
configuration everyone calls "at capacity", and for a request holding two
connections it is the configuration that cannot run at all. Three connections
moves it to half the pool.

At that point the pool reads 10/10 in use, 100% utilised, zero requests able to
run. A utilisation gauge cannot distinguish it from a busy, healthy pool.

Two derivations, neither taken on trust: a greedy-acquisition simulation and
the closed form `ceil(pool / (hold - 1))` agree on **3/3** cases.

One connection per request never deadlocks at any concurrency, so the defect is
not the pool being small — and enlarging the pool moves the cliff every time
without removing it.

Verify it yourself:

```bash
pnpm eml run examples/pool-reentrancy-deadlock/pool_reentrancy_deadlock.eml
```
