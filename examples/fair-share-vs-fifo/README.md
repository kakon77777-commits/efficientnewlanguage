# Fair share vs FIFO — a queue discipline picks who it is fair to

`fair_share_vs_fifo.eml` runs one arrival pattern — 20 jobs from one tenant, 1
each from five others — through FIFO and fair queuing, and reports the wait per
**tenant** alongside the mean per **job**.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: FIFO is fair to requests, and nobody was ever
complaining on behalf of a request.

```
worst completion time among the LIGHT tenants:
  FIFO: 25
  fair: 6
```

The light tenants' worst case improves by 19 slots. The heavy tenant finishes
later — a real cost, paid by someone identifiable, which is why this is a
choice rather than a fix. Neither discipline adds capacity; fair queuing only
reorders.

**The number a dashboard shows moves almost not at all:**

```
mean completion time per JOB:
  FIFO: 20.6
  fair: 20.8
```

The heavy tenant owns most of the jobs, so it owns most of the mean, and the
mean therefore reports mostly on the tenant that is not suffering. It is
computed over the same population FIFO is fair to, so it **agrees with FIFO by
construction** and cannot report the problem.

The control: with one job per tenant, the two disciplines are identical for
every tenant — which is every load test with an even workload.

Verify it yourself:

```bash
pnpm eml run examples/fair-share-vs-fifo/fair_share_vs_fifo.eml
```
