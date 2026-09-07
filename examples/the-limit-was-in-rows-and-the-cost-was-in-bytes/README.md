# The limit was in rows and the cost was in bytes

`the_limit_was_in_rows_and_the_cost_was_in_bytes.eml` - The export endpoint caps a result at ten thousand rows, enforced in the query rather than after it, and there is no way to ask for more. What ten thousand rows weigh is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The cap is enforced where it should be. It is applied as a limit in the SQL rather than by truncating a result the database already materialised, so the database does not do the work either; there is no page-size parameter a caller can raise; the response says it was truncated instead of silently returning less; and a test asserts the count.

The cap counts ROWS. Each row carries a document column whose size spans four orders of magnitude, so the same ten thousand rows are twenty megabytes or ninety-five gigabytes depending on which tenant asked.

Nothing bounds the response in bytes.

```
row limit                       : 10000
callers who can raise it        : 0
limits on response bytes        : 0
```

```
median row, KB                  : 2
  median response, KB           : 20000
p99 row, KB                     : 9500
  worst case response, KB       : 95000000
  as multiples of the median    : 4750
```

```
response budget, KB             : 512000
  as a share of the worst case  : 53 per ten thousand
exports per day                 : 12000
  that exceeded the budget      : 41
```

```
the row cap
  applied as : a limit in the query
  so the database materialises : only what is returned
  a page-size parameter a caller can raise : 0
  silent truncation : no; the response says it truncated
  asserted by a test : yes
  verdict : CAPPED
```

```
  pushing the limit into the query rather than truncating
  afterwards is the difference between a cap and a
  politeness, and it is done
```

```
the unit counted
  what the cap counts : rows
  what a response costs : bytes, to serialise, to buffer,
    to transfer
  what relates them : a document column chosen by the
    tenant
  median row : 2 KB
  p99 row    : 9500 KB
  bounds on the second quantity : 0
```

```
  the counted quantity is uniform and the spent one spans
  four orders of magnitude
```

```
where the testing lands
  a developer's own export : near the median
  the load test's fixture  : near the median
  staging data             : near the median
  median response, KB      : 20000
  what selects the tail : which tenant asked, not which
    request
  worst case in multiples of the median : 4750
```

```
what the cap prevents
  a four million row export : prevented
  was that the observed failure : yes, and it stopped
  a ten thousand row export of large documents : allowed
  is that within the cap : exactly within it
  exports over the budget last month : 41
  of 12000 a day
```

```
when it goes wrong
  the query : returns, inside its own timeout
  the row count : exactly 10000, as promised
  the serialiser : allocates until the process is killed
  the caller sees : a connection that closed
  the export log records : a request that started
  the row cap metric shows : compliance
```

```
null control - a byte budget beside the row cap
  row limit : 10000, unchanged
  limits on response bytes : 1
  worst case response, KB : 512000
  exports over the budget : 0
  the cap did not get lower; a second bound appeared on
  the quantity the response is made of
```

```
what a row cap guarantees
  no response contains more than 10000 rows : exactly,
    enforced in the query, with no parameter to raise it
  no response is too large : not addressed; the cap is
    denominated in rows and the resource is denominated
    in bytes
```

```
a bound on a count bounds the count; where each item has a
size the caller controls, the count and the cost are related
by a factor nobody bounded, and the bound that exists is
tightest exactly where it was never needed
```

The cap is enforced in the query rather than after it, with 0 ways for a caller to raise it and an explicit truncation flag in the response. It counts rows, and a row is 2 KB at the median and 9500 at p99, so 10000 rows are 20000 KB or 95000000 - 4750 times as much - against a 512000 KB budget the cap covers 53 per ten thousand of, with 0 bounds on bytes anywhere.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-in-rows-and-the-cost-was-in-bytes/the_limit_was_in_rows_and_the_cost_was_in_bytes.eml
```
