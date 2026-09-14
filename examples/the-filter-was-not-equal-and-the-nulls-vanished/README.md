# The filter was not equal and the nulls vanished

`the_filter_was_not_equal_and_the_nulls_vanished.eml` - The query for rows that are not closed returns exactly the rows whose status differs from 'closed', and the SQL is correct. What a NULL status does to that test is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The query is careful. It filters on the real status column; it uses the database's own comparison, not a string it built; it runs over every row; and 'not closed' is exactly what the ticket-triage report asks for.

status <> 'closed' is UNKNOWN when status IS NULL, and UNKNOWN is not TRUE, so those rows are excluded.

```
rows                            : 40000
  status = active               : 26000
  status = closed               : 9000
  status IS NULL                : 5000
```

```
rows that are not closed        : 31000
rows the query returned         : 26000
  silently dropped              : 5000
dropped share                   : 1612 per ten thousand
```

```
the not-closed query
  filters on : the real status column
  comparison : the database's own, not a built string
  over : every row
  what triage asked for : the rows that are not closed
  rows returned : 26000, every one status = active
  verdict : NOT CLOSED
```

```
  using the engine's comparison rather than a hand-built
  predicate is the part done right here, and it is why no
  active row is missed
```

```
status <> 'closed' on a NULL status
  what the comparison yields : UNKNOWN, not TRUE
  what WHERE keeps : rows where the predicate is TRUE
  so a NULL-status row : is neither closed nor kept
  rows with no status : 5000
  a three-valued logic : where 'not closed' excludes
    'unknown whether closed'
```

```
the tickets with no status set
  count : 5000
  are they closed : no
  did the not-closed report include them : no
  is the query wrong : no; it is exactly status <> 'closed'
  is 'status <> closed' the same as 'not closed' : not
    when the status can be NULL
```

```
null control - a null-safe not-closed predicate
  returned, plain <> 'closed' : 26000
  returned, null-safe : 31000
  rows it recovers : 5000
  no row and no status changed; the predicate stopped
  treating an unknown status as a failed comparison
```

```
what status <> 'closed' guarantees
  every returned row has a status that is not closed :
    exactly, the engine's own comparison
  every row that is not closed is returned : not
    addressed; status <> 'closed' is UNKNOWN for a NULL
    status, and UNKNOWN is not TRUE, so the 5000 rows with
    no status are dropped from a query that asked for 'not
    closed'
```

```
a comparison against NULL is neither true nor false but unknown, and a WHERE
keeps only the true; 'not equal to closed' and 'not closed' diverge exactly on
the rows whose status is not known to be anything
```

It filters on the real column with the engine's comparison over every row - the returned rows are exactly status <> 'closed'. That excludes the 5000 NULL-status rows, which are not closed either, so a 'not closed' report dropped 5000 of 31000, 1612 per ten thousand.

Verify it yourself:

```bash
pnpm eml run examples/the-filter-was-not-equal-and-the-nulls-vanished/the_filter_was_not_equal_and_the_nulls_vanished.eml
```
