# The total was the sum of the rounded rows

`the_total_was_the_sum_of_the_rounded_rows.eml` - Every line on the invoice run is correct to the cent, and so is each rounding. What the total is a sum of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rounding is done properly per row. Each amount is rounded half-up to the nearest cent; the rule is the same for every row; no row is truncated; and the rounded figure on each line is exactly what the customer is billed for.

The reported total is the sum of the rounded lines.

```
rows                            : 90000
each row correct to             : the cent, half-up
```

```
reported total (sum of rounded) : 4500037 cents
correct total (sum then round)  : 4500012 cents
  difference                    : 25 cents
  as a share of the total       : 0 per ten thousand
worst case if errors aligned    : 45000 cents
```

```
the per-row rounding
  rule : round half-up to the nearest cent
  applied to : every row, identically
  truncation : none
  what the customer is billed per line : the rounded
    figure, exactly
  rows off by more than half a cent : 0
  verdict : EVERY LINE CORRECT
```

```
  billing each line at exactly its rounded figure is the
  part almost nobody disputes, and it is why the lines are
  not in question
```

```
the total
  how it was formed : the rounded lines, added
  what rounding does under addition : it does not
    distribute; the error of a sum is not the sum of
    rounded parts
  each row's leftover : at most half a cent, either way
  across 90000 rows : the leftovers do not cancel
  the gap they leave : 25 cents
```

```
the reconciliation against the source
  reported total : 4500037 cents
  total from the unrounded amounts : 
    4500012 cents
  which line is wrong : none
  where the 25 cents lives : between the lines,
    in the order of the two operations
  dollars reported : 45000
```

```
null control - sum first, round once
  sum of rounded rows : 4500037, unchanged
  sum then rounded : 4500012 cents
  rows whose own figure changed : 0
  no amount and no rounding rule changed; only the order
  of summing and rounding did, and the total moved
```

```
what correct-to-the-cent rows guarantee
  each line is within half a cent of its true amount :
    exactly, all 90000 of them, one rule, no truncation
  the total is correct to the cent : not addressed; each
    row was rounded before the sum, and rounding does not
    distribute over addition - summing first and rounding
    once gives a total 25 cents lower
```

```
rounding and addition do not commute; a column of individually correct figures
has a correct-looking total that is not the total of the figures, and the gap
is the leftover cents that had nowhere to cancel
```

Every line is rounded half-up and billed at exactly that figure - no line is wrong. The total is the sum of the rounded lines, and rounding does not distribute over a sum, so it reads 4500037 cents against a correct 4500012 - a 25-cent gap that lives between the rows, not in any of them.

Verify it yourself:

```bash
pnpm eml run examples/the-total-was-the-sum-of-the-rounded-rows/the_total_was_the_sum_of_the_rounded_rows.eml
```
