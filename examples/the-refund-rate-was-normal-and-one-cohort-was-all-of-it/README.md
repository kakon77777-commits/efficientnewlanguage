# The refund rate was normal and one cohort was all of it

`the_refund_rate_was_normal_and_one_cohort_was_all_of_it.eml` - The refund rate has been at or below its historical level for nineteen months, and it is measured carefully. What it is an average over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is good. A refund counts against the month the order was placed rather than the month it was granted, so a slow refund cannot hide in the next period; partial refunds count in proportion rather than as a whole or not at all; goodwill credits are counted as refunds rather than filed elsewhere; and the historical level was computed over three years rather than from a convenient quarter.

It is one ratio over every order.

```
orders a month                  : 168000
refunds a month                 : 2100
  refund rate                   : 125 per ten thousand
historical rate                 : 130 per ten thousand
  better than history by        : 5 per ten thousand
months at or below it           : 19
```

```
orders through the new checkout : 9400
  share of orders               : 559 per ten thousand
  refunds from those orders     : 1580
  share of refunds              : 7523 per ten thousand
  their refund rate             : 1680 per ten thousand
```

```
orders through the old checkout : 158600
  refunds from those            : 520
  their refund rate             : 32 per ten thousand
```

```
months the new checkout is live : 5
dashboards split by flow        : 0
```

```
the refund rate
  a refund counts against : the month the order was
    placed, so a slow one cannot hide in the next period
  a partial refund : counts in proportion
  a goodwill credit : counts as a refund
  the historical level : three years, not a convenient
    quarter
  months at or below it : 19
  verdict : NORMAL
```

```
  attributing a refund to the order's own month is the
  part almost nobody does, and it is why 
  125 per ten thousand is comparable to history
```

```
orders are not all the same kind of order
  new checkout, share of orders : 
    559 per ten thousand
  new checkout, share of refunds : 
    7523 per ten thousand
  its own rate : 1680 per ten thousand
  the old flow's rate : 32 per ten thousand
  the figure everyone reads : 
    125 per ten thousand, better than history
```

```
  the aggregate improved while one cohort ran at many
  times the other, because the cohort is small and the
  denominator is not
```

```
how a figure improves while a part worsens
  the old flow is the bulk : 158600 orders
  its rate is below history : 
    32 per ten thousand
  the new flow adds : 1580 refunds on 
    9400 orders
  the sum lands at : 125 per ten thousand
  months this has been true : 
    5
  dashboards that would show it : 
    0
```

```
null control - one rate per flow
  rate for the shop : 125, unchanged
  new checkout : 1680 per ten thousand
  old checkout : 32 per ten thousand
  no order changed and no refund was reclassified; the
  question stopped being asked once for both flows
```

```
what a normal refund rate guarantees
  refunds across all orders are at or below the three-
    year level : exactly, attributed to the order's own
    month, partials in proportion, goodwill included,
    19 months
  no part of the shop is going wrong : not addressed;
    one flow with 559 per ten thousand of orders
    carries 7523 per ten thousand of refunds
```

```
an aggregate can improve while every part of it worsens,
and it can hold steady while one part is the whole story;
the shape inside the ratio is a second measurement, and
nothing here takes it
```

Refunds are attributed to the order's own month, partials count in proportion, goodwill counts, and history is three years - 125 per ten thousand against 130, 19 months. One flow with 559 per ten thousand of orders holds 7523 per ten thousand of the refunds, running at 1680 against 32 for the rest, across 0 dashboards that split them.

Verify it yourself:

```bash
pnpm eml run examples/the-refund-rate-was-normal-and-one-cohort-was-all-of-it/the_refund_rate_was_normal_and_one_cohort_was_all_of_it.eml
```
