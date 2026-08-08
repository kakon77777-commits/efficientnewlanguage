# Flag outlives its evidence — the conclusion stayed and the link back was never stored

`flag_outlives_its_evidence.eml` starts from a stored flag set that is
consistent with the evidence by construction, retracts two signals and adds
one, then re-derives every flag and splits the disagreements by direction.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a risk flag computed once and stored, because the
downstream code needs a boolean and not a rule engine. The evidence it came
from is mutable — a chargeback reversed, a report retracted, a duplicate signal
deleted during a cleanup.

```
mismatches at t0: 0
```

The starting state is derived, not typed, so every later mismatch is caused by
the evidence changing rather than by a crafted fixture.

| account | stored | re-derived | disagreement |
| --- | --- | --- | --- |
| a-1 | 1 | 0 | flagged, no longer earns it |
| a-2 | 1 | 0 | flagged, no longer earns it |
| a-3 | 0 | 0 | — |
| a-4 | 1 | 1 | — |
| a-5 | 0 | **1** | clear, now earns a flag |

```
stale-true (flagged without current cause):  2
stale-false (unflagged despite new cause):   1
```

The drift goes both ways, so "recompute only when raising a flag" would not fix
it — and only one direction has anyone with a reason to report it. Two accounts
will complain; one will not.

The reason it is permanent:

```
stored flags carrying the ids they were derived from: 0 of 5
```

There is no provenance column, so "which flags depended on `s-1`" has no query.
The retraction of `s-1` could not have notified anything, because nothing
recorded that it mattered.

A full recompute resolves everything (**0** mismatches after). The rule is
fine; only its scheduling is missing — and the event that should schedule it, a
signal being retracted, is handled by code that knows about signals and not
about flags.

Verify it yourself:

```bash
pnpm eml run examples/flag-outlives-its-evidence/flag_outlives_its_evidence.eml
```
