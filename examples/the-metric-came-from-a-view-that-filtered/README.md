# The metric came from a view that filtered

`the_metric_came_from_a_view_that_filtered.eml` - Three metrics are computed from one view. The view excludes cancelled orders. What each metric becomes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The view is right and the exclusion is deliberate. `orders_v` was created for revenue reporting, where a cancelled order is not revenue and counting it would overstate every figure on the page. The definition is in the view's comment, it has been there for two years, and the revenue numbers it produces have reconciled to the ledger every month since.

Two more metrics were later added to the same dashboard and pointed at the same view, which is exactly what a view is for: one definition, many readers, no chance of two teams filtering differently.

A filter that is correct for one metric is a modification of the population for every other. The three metrics do not share a question, so they do not share a denominator, and only one of them wanted this one.

```
orders placed        : 45000
orders cancelled     : 6300 (14 percent)
rows visible in orders_v : 38700
```

```
average order value
  from orders_v    : 9883 hundredths
  from the raw table : 8500 hundredths
  which is correct : the view
  a cancelled order contributed no revenue, so including it in the
  denominator would understate the average by 1383 hundredths
```

```
total orders
  from orders_v    : 38700
  truth            : 45000
  understated by   : 6300, which is 14 percent
  a cancelled order IS an order placed; that is what the metric counts
```

```
cancellation rate
  cancelled rows visible in orders_v : 0
  rows in orders_v                   : 38700
  computed rate                      : 0 percent
  true rate                          : 14 percent
```

```
  this metric is not merely wrong; it cannot take another value
  if cancellations tripled it would still read 0
  if they stopped entirely it would still read 0
  it has one possible output and it has been on the dashboard for a year
```

```
metric                what the filter does to it
  average order value   required, this is why the view exists
  total orders          understates by the cancelled count
  cancellation rate     pins it to zero, permanently
```

```
  one filter, one view, three different consequences
  and the filter is documented, correct, and doing what it says
```

```
why nothing looked wrong
  revenue reconciles to the ledger    : yes, every month
  average order value is plausible    : yes, and it is exactly right
  total orders trends smoothly        : yes, it is 86 percent of the truth
  cancellation rate is stable         : yes, it is a constant
  a stable metric reads as a healthy one
```

```
control - the view against the question it was written for
  revenue from orders_v vs the ledger : reconciles exactly
  rows excluded that should be there  : 0, for a revenue question
  the view is correct and the comment above it is accurate
```

```
  every reader inherits a filter chosen for a question they are not asking
  and inheriting it is the reason the view was reused
```

```
null control - the same view over a period with no cancellations
  orders placed     : 45000
  cancelled         : 0
  rows in the view  : 45000
  total orders      : 45000, understated by 0
  cancellation rate : 0 percent, and now it is also true
  the pinned metric agrees with reality, which is the worst way for a
  constant to be tested
```

```
a shared view, read by metrics that do not share a question
  one definition, many readers      the reason to use a view
  one filter, many populations      the cost of using a view
  a metric about the excluded rows  cannot be computed there at all
  and returns a constant rather than an error
```

```
the test for this is not 'is the number right'
it is 'can this number take another value', and it costs one query to ask
```

orders_v excludes cancelled orders because a cancelled order is not revenue, the definition is in its comment, and the revenue it produces has reconciled every month for two years. Two later metrics were pointed at it, which is what a view is for. Total orders now reads 38700 instead of 45000, and the cancellation rate reads 0 percent - not because cancellations stopped, but because the only rows that could make it non-zero are the rows the view removes.

Verify it yourself:

```bash
pnpm eml run examples/the-metric-came-from-a-view-that-filtered/the_metric_came_from_a_view_that_filtered.eml
```
