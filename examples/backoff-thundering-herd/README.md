# Backoff and the thundering herd — a policy that synchronises load

`backoff_thundering_herd.eml` retries 100 clients after a shared outage
under four policies — fixed, exponential, jittered, decorrelated — and
reports the **peak** concurrent retry count, not the average.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a measurement whose headline number hides the
failure. Exponential backoff lowers the mean retry rate and leaves the peak
at the full population, because every client computes the same delay from
the same attempt number:

| policy | peak concurrent retries |
| --- | --- |
| fixed | 100 |
| exponential | 100 |
| jittered | 17 |
| decorrelated | 17 |

The fix is not a longer wait — it is a delay that depends on *which* client
is waiting.

A base-delay sweep was added after the first version measured jitter at
`BASE = 1` and got a peak of 93, which is nearly no improvement at all.
The sweep found the benefit is **not monotonic** in the base delay: base 5
and base 10 both cut the peak sharply, and base 20 is worse than both,
because the jitter arithmetic aliases with the population size. That
finding is now a check — the best base must not be the widest one — so the
non-monotonicity cannot silently disappear.

Verify it yourself:

```bash
pnpm eml run examples/backoff-thundering-herd/backoff_thundering_herd.eml
```

```bash
pnpm eml trace examples/backoff-thundering-herd/backoff_thundering_herd.eml --run
```
