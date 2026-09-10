# The audit sampled by row and the money was in a few

`the_audit_sampled_by_row_and_the_money_was_in_a_few.eml` - The expense audit draws a genuine random sample every quarter, and the sampling is the part it gets right. What the sample is a sample of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The sampling is honest. The draw is from a seeded generator whose seed is published afterwards, so nobody can choose the rows; it is a simple random sample rather than whoever the auditor happens to know; the sample size was derived from a stated confidence rather than picked round; and every drawn row is examined, with no substitutions when one is inconvenient.

It samples rows. The money is not distributed the way the rows are.

```
expense rows a quarter          : 184000
  drawn                         : 1200
  not drawn                     : 182800
  rows sampled                  : 65 per ten thousand
  rows substituted              : 0
rows with a finding             : 94
  finding rate                  : 783 per ten thousand
quarters the method has run     : 14
```

```
total value a quarter           : 41000000
  in the largest 200 rows          : 34200000
  in everything else            : 6800000
  concentrated in the largest   : 8341 per ten thousand
```

```
value covered by the sample     : 760000
  value sampled                 : 185 per ten thousand
largest rows the sample drew    : 3
  that it missed                : 197
```

```
the expense audit's sample
  the draw : a seeded generator whose seed is published
    afterwards, so nobody chooses the rows
  the method : simple random, not whoever the auditor
    knows
  the size : derived from a stated confidence, not
    picked round
  substitutions when a row is inconvenient : 
    0
  quarters run this way : 14
  verdict : SAMPLED
```

```
  publishing the seed afterwards is the part almost
  nobody does, and it is why the 1200 are not a
  selection
```

```
rows and money are not the same population
  rows sampled : 65 per ten thousand
  value sampled : 185 per ten thousand
  value sitting in 200 rows : 
    8341 per ten thousand of the quarter
  chance a uniform draw of 1200 catches a given
    one of them : the same as for any other row
  of those 200, drawn : 3
  missed : 197
```

```
  a sample that is uniform over rows is by construction
  not uniform over value, and the value is what the audit
  is for
```

```
the number the report leads with
  rows with a finding : 94 of 1200
  so the finding rate : 783 per ten thousand
  what it estimates : the share of ROWS with a problem
  what the reader takes it for : the share of MONEY at
    risk
  what would estimate that : a draw weighted by value,
    which is not this one
```

```
null control - draw proportional to value, take the top outright
  rows drawn : 1200, unchanged
  largest rows examined outright : 
    200
  value sampled : 9100 per ten thousand
  the draw did not become less random; it stopped being
  uniform over the wrong thing
```

```
what a clean random sample guarantees
  an unbiased estimate of the share of rows with a
    problem : exactly, seeded, published, 
    0 substitutions, 14 quarters
  an estimate of the money at risk : not addressed; the
    draw is uniform over rows and 
    8341 per ten thousand of the value is in 
    200 of them
```

```
a sample is unbiased with respect to the thing it was
drawn over; a quantity distributed differently from that
thing is estimated by the sample only by coincidence
```

The seed is published afterwards, the draw is simple random, the size comes from a stated confidence and 0 rows were substituted in 14 quarters. It is uniform over rows - 65 per ten thousand of them - which is 185 per ten thousand of the value, because 8341 per ten thousand of it sits in 200 rows of which the sample drew 3.

Verify it yourself:

```bash
pnpm eml run examples/the-audit-sampled-by-row-and-the-money-was-in-a-few/the_audit_sampled_by_row_and_the_money_was_in_a_few.eml
```
