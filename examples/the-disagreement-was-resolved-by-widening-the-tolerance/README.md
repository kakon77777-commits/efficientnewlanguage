# The disagreement was resolved by widening the tolerance

`the_disagreement_was_resolved_by_widening_the_tolerance.eml` sweeps a
reconciliation tolerance and measures what it admits besides the difference it
was chosen for.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the reconciliation failed by three. The difference was
small, the release was due, and a check that fails on a rounding-sized amount
every few days is a check nobody reads. Every step of that reasoning is sound
and the conclusion is still wrong.

```
days that pass, by tolerance
  tolerance 0 : 0 of 6 pass
  tolerance 3 : 4 of 6 pass
  tolerance 5 : 6 of 6 pass
  tolerance 10 : 6 of 6 pass
```

**A tolerance admits everything smaller, including causes that are not
rounding:**

```
days whose gap has a cause OTHER than the missing fees
  tue : gap 1, fees explain 3 - hidden at tolerance 5
  wed : gap 5, fees explain 3 - hidden at tolerance 5
  thu : gap 1, fees explain 3 - hidden at tolerance 5
  sat : gap 5, fees explain 3 - hidden at tolerance 5
  days with a second cause : 4
  of those, hidden at tolerance 5 : 4
  of those, where the second cause made the gap SMALLER : 2
  a day with two defects can report the cleanest number on the board
```

Two of those days have a transaction posted *too high*, which pushes the second
ledger toward the first and shrinks the observed gap. Same size of mistake as
the ones posted too low; only one direction shows up as a bigger number. The
days with two defects report the cleanest figures on the board — which is
[round 60's compensating pair](../two-defects-cancel-in-the-round-trip/) turning
up inside a monitoring metric.

**And the difference that motivated the tolerance is systematic, so it scales:**

```
the same tolerance of 5, as volume grows
  volume x1 : 0 of 6 days exceed the tolerance, worst gap 5
  volume x2 : 4 of 6 days exceed the tolerance, worst gap 8
  volume x4 : 6 of 6 days exceed the tolerance, worst gap 14

smallest tolerance that would silence every day, by volume
  volume x1 : 5
  volume x2 : 8
  volume x4 : 14
```

One ledger drops fees, so the gap grows with volume. The same argument that
produced 5 will be made again with a bigger number, and each time it is made the
set of unrelated causes it covers gets larger.

Nothing is declared: the discrepancy is computed by running both ledgers, and
its decomposition by running the fee-only cause on its own.

A tolerance is a claim that differences below it do not matter. The difference
that prompted this one was not too small to matter — it was too small to
investigate, and those are different sentences.

Verify it yourself:

```bash
pnpm eml run examples/the-disagreement-was-resolved-by-widening-the-tolerance/the_disagreement_was_resolved_by_widening_the_tolerance.eml
```
