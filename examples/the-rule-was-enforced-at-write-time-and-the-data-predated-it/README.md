# The rule was enforced at write time and the data predated it

`the_rule_was_enforced_at_write_time_and_the_data_predated_it.eml` - A validation rule was added to the write path eighteen months ago. Every row written since satisfies it. What fraction of the table satisfies it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Enforcing at the write path was the right decision and the alternative was considered properly. Adding the constraint to the database would have required a full table rewrite with an exclusive lock, on a table serving production traffic, and the backfill needed to make the existing rows pass was estimated at four days of engineer time that nobody had. Enforcing at the write path costs nothing, takes effect immediately, and guarantees that the problem stops growing. All of that is true and all of it happened.

"The problem stops growing" and "the problem goes away" are different statements. A write-path rule makes the count of violations constant. It does not make it smaller, because nothing in a write path ever touches a row that is not being written.

What falls is the PROPORTION, and it falls only as fast as the table grows.

```
rows in the table            : 2400000
rows written before the rule : 1900000
of those, violating          : 600 per ten thousand = 114000 rows
rows written since the rule  : 500000, all compliant
```

```
violating rows in the whole table : 114000
as a share of the table           : 475 per ten thousand
```

```
before the rule   violations grew with every non-compliant write
after the rule    violations are constant at 114000
  rows removed from the violating set by the rule : 0
  the rule cannot reach them; it only sees rows being written
```

```
years   rows in table   violating   share per ten thousand
  0       2400000        114000       475
  2       4590000        114000       248
  4       6780000        114000       168
  6       8970000        114000       127
  8       11160000        114000       102
```

```
  the violating column never moves
  the share falls because the denominator grows, at 3000 rows a day
```

```
to reach 100 per ten thousand (1 percent)
  rows needed  : 11400000
  rows to add  : 9000000
  days         : 3000
  years        : 8
```

```
to reach 10 per ten thousand (0.1 percent)
  rows needed  : 114000000
  years        : 101
```

```
  and at no point does it reach zero
```

```
a function written today that assumes the field is well-formed
  rows it handles correctly : 2286000
  rows it fails on          : 114000
  failure rate              : 475 per ten thousand
  and the author is right that every row THEY have written is fine
```

```
  a test fixture built by inserting rows will never contain one
  because inserting rows goes through the write path
```

```
control - does the rule do what it says
  rows written since it landed   : 500000
  of those, violating            : 0
  rows it has rejected           : every non-compliant write attempted
  the rule is correct, complete and has never been bypassed
```

```
  it promised that the problem stops growing, and the problem stopped growing
  the promise a reader hears is that the field is well-formed
```

```
null control - the same rule added to an empty table
  rows predating the rule : 0
  violating rows          : 0
  share of the table      : 0 per ten thousand, permanently
  same rule, same write path, same documentation
  the invariant holds because there was no history for it to miss
```

```
what a write-path rule guarantees, and what it does not
  new rows comply                    guaranteed, immediately
  the violation count stops growing  guaranteed
  the violation count falls          no, nothing removes a row
  the invariant holds for readers    no, and this is what gets assumed
  the gap closes                     only by dilution, over years
```

```
a constraint added to a table is a statement about the table
a check added to a write path is a statement about future writes
they are documented in the same sentence and they are not the same claim
```

Enforcing at the write path avoided an exclusive lock on a production table and a four-day backfill nobody had time for, it took effect immediately, and every one of the 500000 rows written since is compliant. The 114000 rows that predate it are still there, no write path will ever touch them, and their share falls from 475 to 100 per ten thousand only after 8 years of growth.

Verify it yourself:

```bash
pnpm eml run examples/the-rule-was-enforced-at-write-time-and-the-data-predated-it/the_rule_was_enforced_at_write_time_and_the_data_predated_it.eml
```
