# The rerun seeds from the last run — and the measurement refused the premise

`the_rerun_seeds_from_the_last_run.eml` runs a warm-started and a cold-started
chain over the same daily data, with the same pass cap so the seed is the only
difference.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises — and what it does not.** This case was written expecting
the seeded chain to be worse. It is not:

```
total error against the converged value
  warm chain : 52, worst 39
  cold chain : 432, worst 64
```

That result is kept and the framing is the one the numbers support. Seeding an
iterative solver from the previous result is a real optimisation, and here it
is straightforwardly the better choice.

**What the seed actually costs is where the error sits:**

```
where the error sits
  days where the target moved : 2
  quiet days                  : 6
  warm chain : 40 on change days, 12 on quiet days
  cold chain : 88 on change days, 344 on quiet days
  the seeded chain is the better one on a quiet day
```

The cold chain is wrong by a similar amount every day. The warm chain is nearly
exact on quiet days and carries most of its error into the runs right after the
target moves:

```
the run after the target changed
  day 2 : target 100 -> 260
    warm reported 220, cold reported 195, converged 259
```

That is when anyone is actually reading the number, and a weekly average is the
one summary that cannot show it.

Nothing is declared: both chains run over the same daily data, a cold start with
a generous cap computes what the data actually says, and the split between quiet
and change days is derived from the targets rather than labelled.

**Why the failed premise is left in the file.** The rest of this round is about
decisions that become inputs to later decisions, and the honest finding here is
that sometimes that is correct. A case whose closing line its own output
contradicts is the exact defect class rounds 60-62 are about; the fix is to
publish the measurement, not the expectation.

Verify it yourself:

```bash
pnpm eml run examples/the-rerun-seeds-from-the-last-run/the_rerun_seeds_from_the_last_run.eml
```
