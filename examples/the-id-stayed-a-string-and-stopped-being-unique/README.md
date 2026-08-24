# The id stayed a string and stopped being unique

`the_id_stayed_a_string_and_stopped_being_unique.eml` - An order id was globally unique and became unique per tenant. Same field, same string type, same length. When that matters is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The change was necessary. Tenants are being onboarded with their own existing order numbers, and forcing them to renumber their historical data was the blocker on three deals. Scoping the id to the tenant is the standard answer and it is what every comparable system does.

A uniqueness guarantee is not visible in a value. Every id still looks like an id, every lookup still returns a row, and a join on order_id alone still produces output. It produces the wrong output only when two tenants have chosen the same number, which is rare at first and is a function of how many tenants there are rather than of anything the code does.

Collisions are computed against the tenant count.

```
month   tenants   orders/tenant   tenant pairs   expected shared ids per pair
  M1     3        4000           3            160
  M3     8        4000           28            160
  M6     21        4000           210            160
  M9     44        4000           946            160
  M12     70        4000           2415            160
```

```
tenants : 3 -> 70
tenant pairs : 3 -> 2415
  pairs grow with the square, so the collision surface grows 805 times
  while the tenant count grows 23 times
```

```
query                joins on                  correct after the change
  order to shipment   order_id     no
  order to invoice   order_id + tenant_id     yes
  refund lookup   order_id     no
  support search   order_id     no
  nightly reconcile   order_id + tenant_id     yes
  queries now incorrect : 3 of 5
  queries that changed  : 0
  every one of those five is the same SQL it was before
```

```
what the broken joins do
  they return a row
  they return a row belonging to another tenant
  rows returned per lookup, before : 1
  rows returned per lookup, after  : 1 or more
  errors raised : 0
  the failure mode is a correct-looking answer about the wrong customer,
  which is also the worst one for a support search
```

```
first collision, by tenant count
  M1 : 3 tenants, 3 pairs, about 480 shared id values in total
  M3 : 8 tenants, 28 pairs, about 4480 shared id values in total
  M6 : 21 tenants, 210 pairs, about 33600 shared id values in total
  M9 : 44 tenants, 946 pairs, about 151360 shared id values in total
  M12 : 70 tenants, 2415 pairs, about 386400 shared id values in total
  at M1 with 3 tenants the number is small enough to look like zero
  it is not zero, and it was never zero
```

```
the contract, before and after
  field name  : order_id, unchanged
  type        : string, unchanged
  length      : unchanged
  nullability : unchanged
  uniqueness scope : global -> per tenant
  the last line is not expressible in the schema, so it is in the design
  note and in nobody's compiler
```

```
changes that carry the guarantee in the value
  prefix the id with the tenant : every old value becomes invalid, all
    consumers break at parse time
  add a composite key constraint : every unqualified join fails at the
    database rather than at the customer
  keep the field and document it : what happened
  the first two cost a migration and the third costs 3 silently wrong
  queries, and only the third one has no line item
```

```
control - order to invoice, joins on order_id + tenant_id
  correct before : yes, correct after : yes
control - nightly reconcile, joins on order_id + tenant_id
  correct before : yes, correct after : yes
  these two were written by someone who qualified the join without being
  asked to, at a time when it made no difference
  the guarantee they did not rely on is the one that later moved
```

Scoping ids to the tenant unblocked three deals and is what comparable systems do. A uniqueness guarantee is not visible in a value, so 3 of 5 queries are wrong today and none of them were edited.

Verify it yourself:

```bash
pnpm eml run examples/the-id-stayed-a-string-and-stopped-being-unique/the_id_stayed_a_string_and_stopped_being_unique.eml
```
