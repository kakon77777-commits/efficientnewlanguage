# Zero rows, three explanations — 1 of 3 worlds separable, and two probes fix it

`zero_rows_three_explanations.eml` runs three worlds through the same query and
counts how many of them each set of observations can still tell apart.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the query is right. It asks the question it was asked to
ask and returns zero, and zero is a true count of the rows matching it. Nothing
in the program is broken. What happens next is that a reader decides something
about the world — and three worlds produce this answer.

```
the query: rows of type refund in this window
  A refunds never happened -> 0
  B refunds happened, nothing was written -> 0
  C refunds happened, written as reversals -> 0

what is actually true
  A refunds never happened -> 0 refunds occurred
  B refunds happened, nothing was written -> 2 refunds occurred
  C refunds happened, written as reversals -> 2 refunds occurred
```

**Separability is counted by comparing signatures, not argued:**

```
worlds still separable
  query alone                          : 1 of 3
  query + row count                    : 2 of 3
  query + row count + negative amounts : 3 of 3

each probe, and the worlds it splits off
  row count      : 1 more separated
  negative amounts : 1 more separated
```

A and C are given the **same number of rows on purpose**. If they differ, the
row count separates them for a reason that has nothing to do with refunds, and
the second probe appears to buy nothing. That is not a fact about the probes —
it is a fact about the data, and it was measured before it was designed out.

```
the observations, side by side
  A refunds never happened
    refund rows : 0
    rows at all : 3
    negative amounts : 0
  B refunds happened, nothing was written
    refund rows : 0
    rows at all : 0
    negative amounts : 0
  C refunds happened, written as reversals
    refund rows : 0
    rows at all : 3
    negative amounts : 2
```

**The control matters here more than usual.** Without it the case only shows
that the query is weak, and the query is not weak everywhere:

```
control - a fourth world with a refund actually written as one
  refund rows : 1
  the query can return non-zero, so its zero is an observation
```

Three worlds, one number. The query answered its own question correctly and the
reader asked a different one.

Verify it yourself:

```bash
pnpm eml run examples/zero-rows-three-explanations/zero_rows_three_explanations.eml
```
