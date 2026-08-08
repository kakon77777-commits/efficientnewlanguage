# Merge invents a match — one sweep wrote a value no record held, the next believed it

`merge_invents_a_match.eml` runs a dedup job one sweep at a time and, for every
merge, asks whether any original member of one side matched any original member
of the other under the same matcher. It compares against the identical job with
normalisation moved to compare time.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the merge normalises what it *writes*; the matcher
compares what it *reads*. Between them sits a record holding a value no source
ever supplied.

Starting condition — `a` has phone `555-1111`, `b` has `5551111`:

```
raw matcher:         0
normalising matcher: 1
```

| mode | sweep | groups | merges | manufactured edges |
| --- | --- | --- | --- | --- |
| raw | 1 | 3 | 1 | 0 |
| raw | 2 | 2 | 1 | **1** |
| raw | 3 | 2 | 0 | 0 |
| normalised | 1 | 3 | 1 | 0 |
| normalised | 2 | 2 | 1 | **0** |
| normalised | 3 | 2 | 0 | 0 |

A *manufactured* edge is a merge that no pair of original records justifies
under the job's own matcher. Sweep 1 can never produce one — every group is a
single original record, so any match it finds is between originals by
definition. Manufactured edges are necessarily something a **later** sweep
consumes from what an earlier one wrote, which is the precise sense in which
re-running is not safe.

Both jobs reach the same two groups. The defect is not a different answer; it
is that one of them reached the answer by writing its own evidence, and that is
only visible if you ask how it got there.

## Two premises this case disproved

Kept in the file, because both were wrong in instructive ways.

**1. The original hypothesis was a different mechanism, and it is impossible.**
The first draft argued: a merged record carries the *union* of its inputs'
attributes, so it matches more things, so merging is not idempotent. Measured,
that produces **zero** manufactured edges — and it has to. "Matches if they
share an attribute" plus "merged carries the union" is exactly transitive
closure, and any edge between two merged groups is an edge between two original
members. The case was rebuilt around normalisation, which really does
synthesise a value.

**2. "The raw job takes more sweeps to settle" — measured, both take 3.** That
was a guess about throughput. Merging three records into one group needs two
merges, and this sweep allows one merge per group per sweep, so the sweep count
is structural and identical for both. The claim worth making is about *when* a
manufactured edge can appear.

Verify it yourself:

```bash
pnpm eml run examples/merge-invents-a-match/merge_invents_a_match.eml
```
