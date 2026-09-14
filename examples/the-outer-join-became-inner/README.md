# The outer join became inner

`the_outer_join_became_inner.eml` - The orders report joins every order to its shipment and the LEFT JOIN is written correctly. What a WHERE on the shipment column does to it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The join is careful. It is a LEFT JOIN, chosen on purpose so an order with no shipment still appears; it joins on the real foreign key; it runs over every order; and the report is meant to list all orders with their delivery region.

A later WHERE clause filters on shipment.region, and shipment.region IS NULL for an order that has no shipment.

```
orders                          : 50000
  with a shipment               : 47000
  never shipped                 : 3000
```

```
orders the LEFT JOIN keeps      : 50000
orders the WHERE then kept      : 47000
  dropped by the WHERE          : 3000
dropped share                   : 600 per ten thousand
```

```
the LEFT JOIN
  kind : LEFT, chosen so an unshipped order still appears
  joins on : the real foreign key
  over : every order
  intent : all orders, with their delivery region
  orders it keeps before the WHERE : 50000
  verdict : all orders present
```

```
WHERE shipment.region = 'domestic'
  what an unshipped order's shipment.region is : NULL
  what NULL = 'domestic' yields : UNKNOWN
  what WHERE keeps : rows where the predicate is TRUE
  so the unshipped orders : are dropped by the WHERE
  the LEFT JOIN, effectively : becomes an INNER JOIN
```

```
the orders that never shipped
  count : 3000
  present after the LEFT JOIN : yes, as NULL-shipment rows
  present after the WHERE : no
  is the join wrong : no; the LEFT JOIN is correct
  is a WHERE on the right table's column safe on a LEFT
    JOIN : no; it filters out the very rows the LEFT JOIN
    exists to keep
```

```
null control - predicate in ON, not WHERE
  kept, predicate in WHERE : 47000
  kept, predicate in ON : 50000
  orders it recovers : 3000
  no order and no shipment changed; the predicate stopped
  running after the join and started running inside it
```

```
what a LEFT JOIN guarantees
  every left row appears, matched or not : exactly, on
    the real key, over every order
  every order appears in the report : not addressed; the
    LEFT JOIN keeps unshipped orders as NULL rows, and a
    WHERE on the shipment's column is UNKNOWN for NULL,
    turning the outer join into an inner one - 3000
    unshipped orders vanish
```

```
a LEFT JOIN promises the unmatched rows with NULLs on the right, and a WHERE on
a right-side column tests those NULLs and drops them; the outer join survives
only until a later clause asks the missing side a question
```

The LEFT JOIN keeps all 50000 orders on the real key. A WHERE on shipment.region is UNKNOWN for the 3000 unshipped orders, so it drops them and the outer join becomes inner - the report shows 47000 of 50000, 600 per ten thousand lost.

Verify it yourself:

```bash
pnpm eml run examples/the-outer-join-became-inner/the_outer_join_became_inner.eml
```
