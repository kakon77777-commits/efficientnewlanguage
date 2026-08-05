# Leader lease expiry — two leaders, no bug

`leader_lease_expiry.eml` runs a lease-based leader election under clock
skew and sweeps the guard band to find the value that eliminates both
overlap (two leaders) and gap (no leader).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a failure that no participant can detect. The old
leader believes it still holds the lease and the new leader believes the
lease expired; each is reading the only clock it has, and both are correct
about their own clock. There is no code path where either observes the
conflict.

The measured result corrected this file's own premise. The guard band was
written as a trade-off — more guard means less overlap and more gap — and
the sweep shows it is not:

| skew | smallest guard with no overlap | gap it creates |
| --- | --- | --- |
| 5 | 3 | 1 |
| 10 | 5 | 0 |

At `skew/2` both failures are zero simultaneously. The guard band has **one
correct value**, not a range to be generous within, and both directions of
error are failures. That makes the parameter everyone tunes by feel a
function of a number nobody measures.

The baseline check is the one that explains why this never shows up in
testing: **with no skew and no guard, overlap 0, gap 0, 29 clean ticks** —
which is the configuration every test runs under.

Verify it yourself:

```bash
pnpm eml run examples/leader-lease-expiry/leader_lease_expiry.eml
```

```bash
pnpm eml trace examples/leader-lease-expiry/leader_lease_expiry.eml --run
```
