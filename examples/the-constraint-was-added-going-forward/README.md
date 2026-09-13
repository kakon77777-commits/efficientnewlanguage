# The constraint was added going forward

`the_constraint_was_added_going_forward.eml` - The column has a NOT NULL constraint and every write since it was added has honored it. What the constraint applies to is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The constraint was added properly. It is a real database constraint, not an application-layer hope; every insert and update since is checked by the engine; a violating write is rejected outright; and the migration that added it is in version control.

The engine applied it going forward, to new writes, and did not validate the rows already there.

```
rows total                      : 4000000
  written before the constraint : 380000
  written under it              : 3620000
writes since that violated it   : 0
old rows that are null          : 5200
  that the constraint never checked : 
    5200
violating rows                  : 13 per ten thousand
```

```
the NOT NULL constraint
  kind : a real database constraint, engine-enforced
  checks : every insert and update since it was added
  on a violating write : rejects it outright
  migration : in version control
  writes since that slipped a null through : 
    0
  verdict : CONSTRAINT HOLDING
```

```
  engine enforcement rather than an application-layer hope
  is the part done right here, and it is why no new write
  can insert a null
```

```
the scope of the constraint
  when added : after 380000 rows already existed
  what the engine checked on adding it : new writes only
  what it did NOT do : scan and validate the existing
    rows
  so the guarantee : is prospective, not total
  rows predating it that are null : 5200
```

```
a reader that trusts the constraint
  what it assumes : the column is never null
  what it dropped : the null-check, now that the
    constraint exists
  rows that break it : 5200, the pre-existing nulls
  is the constraint wrong : no; it holds for every row it
    was allowed to check
  were the old rows ever checked : no
```

```
null control - validate existing rows on add
  new writes that violate : 0
  old rows the validation would reject : 
    5200
  migrations that would fail until the data is fixed : 
    1
  no row and no constraint text changed; adding it stopped
  being a promise only about the future
```

```
what an enforced constraint guarantees
  every write since it was added satisfies it : exactly,
    engine-checked, violations rejected
  every row satisfies the constraint : not addressed; the
    constraint was added going forward and applies to new
    writes - 5200 pre-existing rows violate it, and a reader
    that trusts it breaks on them
```

```
a constraint added to a table is a promise about writes, and a promise about
writes is not a fact about rows; the history the constraint never read is
exactly where the values it forbids still live
```

It is engine-enforced and rejects every violating write - no new null slips through. It was added going forward and never validated the existing rows, so 5200 pre-existing nulls remain, 13 per ten thousand, and break any reader that trusts the column, under 0 new violations.

Verify it yourself:

```bash
pnpm eml run examples/the-constraint-was-added-going-forward/the_constraint_was_added_going_forward.eml
```
