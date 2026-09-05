# The index was unique and the writes were in two regions

`the_index_was_unique_and_the_writes_were_in_two_regions.eml` - Uniqueness is a database constraint rather than an application check, and it has rejected every duplicate it saw. Where it is evaluated is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Choosing the constraint over a read-then-write check was right and it is not a small difference. An application that selects and then inserts has a window between the two; the index has none, the database refuses the second write inside the same transaction that attempts it, and the caller gets a conflict it can act on. It has rejected two thousand one hundred duplicate signups this year, each one synchronously, each one visible to the person signing up.

An index is a structure inside one database. Two regions run two writable primaries with asynchronous replication, so there are two indexes, and a uniqueness check is a statement about the rows one node can see.

Replication lag at the ninety-ninth percentile is three hundred forty ms.

```
regions with a writable primary : 2
unique indexes                  : 2
  spanning both regions         : 0
replication lag p99, ms         : 340
```

```
duplicates rejected this year   : 2100
duplicates from a read-then-write race : 0
```

```
signups per day                 : 74000
  the constraint can decide     : 73939
  duplicate lands elsewhere first : 61
  share                         : 8 per ten thousand
rows in the conflict table      : 14900
alerts on it                    : 0
```

```
the unique index
  enforced by  : the database, in the write transaction
  window between check and write : none
  what the caller gets : a conflict, synchronously
  duplicates rejected this year : 2100
  duplicates from a read-then-write race : 0
  verdict : UNIQUE
```

```
  the constraint is strictly stronger than the check it
  replaced and the difference is the window it removed
```

```
the evaluation
  where it happens : inside one primary
  the rows it compares against : the rows that primary has
  rows written to the other primary 340 ms ago : not yet
    among them
  indexes that span both : 0
  is that a defect in the index : no; an index is a
    structure in a database, and there are two databases
```

```
  each index is correct over its own rows and the property
  the product needs is over the union
```

```
the two outcomes compared
  same region : refused in the transaction, the caller is
    told, the caller retries with something else
  across regions : both writes succeed, both are durable,
    replication notices later
  where the second is recorded : the conflict table
  rows there now : 14900
  alerts on it   : 0
  who is told    : nobody; the writes already returned 201
```

```
what the dashboard counts
  constraint violations : the successful rejections
  and those are         : the system working
  cross-region collisions : not violations of any index,
    because no index saw both rows
  a query that would find them : one that groups the union
    of both regions, which no job runs
```

```
null control - the key routes to one owning region
  regions with a writable primary : 2, unchanged
  duplicates rejected synchronously : 2100
  duplicates landing in two regions : 0
  the index did not get stronger; both writes started
  arriving where the index could compare them
```

```
what a unique index guarantees
  no two rows in this database share the key : exactly,
    with no window, enforced by the storage engine
  no two rows exist with this key            : not
    addressed; the guarantee is scoped to the rows one
    node holds, and the deployment has two
```

```
a constraint is enforced over the set the enforcing node can
see; replicating that node replicates the constraint and not
the set, so the strongest local guarantee available says
nothing about the pair that matters
```

Uniqueness is enforced by the database rather than by application code, with no window between check and write, rejecting 2100 duplicates this year, each one synchronously. There are 2 indexes and 0 spanning both regions, so of 74000 signups a day the 61 whose duplicate reaches the other primary within the 340 ms lag - 8 per ten thousand - both succeed, into a conflict table with 14900 rows and 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-index-was-unique-and-the-writes-were-in-two-regions/the_index_was_unique_and_the_writes_were_in_two_regions.eml
```
