# The count was distinct and the join multiplied the rows

`the_count_was_distinct_and_the_join_multiplied_the_rows.eml` - A report joins orders to their line items so it can break revenue down by product category. Three numbers on the same report are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The join is necessary and correct. Category lives on the line item, revenue lives on the order, and a report that shows revenue by category has to bring them together - there is no other way to write it. The join condition is right, the foreign key is enforced, and no row is invented or lost: every output row corresponds to exactly one real line item on one real order.

A join to a one-to-many side multiplies the parent rows. That is not a defect; it is what the join is for. Every aggregate computed afterwards is computed over the multiplied set, and an aggregate over the multiplied set answers a different question from the same SQL keyword.

COUNT(DISTINCT order_id) survives it. COUNT(*) and SUM(order_total) do not, and all three sit on one report under headings that read the same.

```
orders                 : 8400
line items per order   : 35 tenths
rows after the join    : 29400
true revenue           : 2100000
```

```
metric                     value        correct
  COUNT(DISTINCT order_id)   8400         yes
  COUNT(*)                   29400        no, that is line items
  SUM(order_total)           7350000      no, each order counted 35 tenths of a time
```

```
  revenue overstated by : 5250000
  which is 350 percent of the true figure
```

```
where the extra revenue comes from
  rows invented by the join     : 0
  orders that do not exist      : 0
  line items that do not exist  : 0
  order_total values that are wrong : 0
  every row is real, and 21000 of them repeat a total already counted
```

```
  a data-quality check on this table finds nothing, because there is
  nothing wrong with the data
```

```
aggregate                  survives a one-to-many join
  COUNT(DISTINCT parent)     yes, DISTINCT undoes the multiplication
  MIN / MAX of a parent col  yes, repetition does not move an extremum
  COUNT(*)                   no, it counts the multiplied set
  SUM of a parent column     no, each value appears once per child
  AVG of a parent column     yes, numerator and denominator scale together
  SUM of a CHILD column      yes, that is what the fan-out is for
```

```
  the report used three of these and only checked the first
```

```
category   items per order   revenue reported vs true
  books     12 tenths          120 percent
  grocery     84 tenths          840 percent
  single     10 tenths          100 percent
  mixed     35 tenths          350 percent
```

```
  the single-item category is exactly right
  and its correctness is what makes the page look checked
```

```
control - is the join correct
  expected rows from the schema : 29400
  actual rows                   : 29400
  orphan line items             : 0, the foreign key is enforced
  orders lost by the join       : 0, it is an inner join over a mandatory key
  defects in the join           : 0
```

```
  the join is right and the aggregate above it is asking the wrong set
```

```
null control - the same report where every order has one line item
  rows after the join : 8400
  COUNT(*)            : 8400, and it equals the order count
  SUM(order_total)    : 2100000
  true revenue        : 2100000
  difference          : 0
  same query, same joins, same aggregates, and every number correct
  the test fixture had one item per order
```

```
an aggregate after a join
  is the join correct              usually yes, and it is what gets reviewed
  is the aggregate correct         only for aggregates that ignore repetition
  which side does the column live on   this decides it, and it is not in
                                       the aggregate's own text
  SUM(a.total) and SUM(b.amount) look identical and differ completely
```

```
the check is one query: compare the aggregate against the same aggregate
computed before the join, and a difference is the fan-out, exactly
```

Category lives on the line item and revenue lives on the order, so the report has to join them; the join is correct, the key is enforced, and not one row is invented or lost. 21000 of the 29400 output rows repeat an order total that was already counted, so revenue reads 7350000 against a true 2100000, while COUNT(DISTINCT order_id) on the same page reads 8400 and is exactly right.

Verify it yourself:

```bash
pnpm eml run examples/the-count-was-distinct-and-the-join-multiplied-the-rows/the_count_was_distinct_and_the_join_multiplied_the_rows.eml
```
