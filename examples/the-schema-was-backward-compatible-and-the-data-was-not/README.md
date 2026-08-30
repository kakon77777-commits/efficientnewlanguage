# The schema was backward compatible and the data was not

`the_schema_was_backward_compatible_and_the_data_was_not.eml` - A field is added with a default. Every old reader keeps working and the compatibility checker passes. What the old rows now say is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding an optional field with a default is the textbook compatible change and it is genuinely compatible. A reader written before the change ignores the field; a reader written after it gets the default where the writer said nothing. No deserialiser throws, no consumer needs redeploying, and the checker that enforces this is not a formality — it has blocked six incompatible changes this year.

Compatibility is a property of the SCHEMAS. It says a reader of version N can parse data written at version N plus one, and it says nothing about whether the value it reads is true of that record.

The default is applied to rows written before the field existed, and for those rows the default is an assertion nobody made.

```
rows in the table           : 2400000
written before the change   : 1850000
written after               : 550000
```

```
the compatibility checker
  old readers parse new data : yes
  new readers parse old data : yes
  deserialisation failures   : 0
  consumers needing redeploy : 0
  incompatible changes blocked this year : 6
```

```
  every one of those is true and the checker is not a
  formality
```

```
the new field: verified, a boolean, default false
  rows where a writer set it : 550000
  rows where the default applies : 1850000
  rows where false means 'not verified' : 550000
  rows where false means 'nobody said'  : 1850000
```

```
  share carrying an unstated value : 7708 per ten thousand
```

```
a report counting unverified accounts
  written after the change : yes
  reads the field          : yes, correctly
  rows genuinely false, checked by somebody : 31000
  rows false by default                    : 1850000
  rows it counts                           : 1881000
  rows that are unverified because somebody checked : some
  rows that are unverified because the field did not exist : 1850000
```

```
  the query is correct, the field is correct, and the count
  is dominated by rows the question was not about
```

```
choosing the default
  false : old rows claim unverified, which is untrue of most
  true  : old rows claim verified, which is worse
  null  : old rows say nothing, and every reader must handle it
```

```
  the third is the only one that is true, and it is the one
  the compatibility rule discourages, because a nullable field
  pushes work onto readers
```

```
the backfill
  rows needing one   : 1850000
  rows backfilled    : 0
  required by the compatibility checker : no
  required for the data to be true      : yes
```

```
  the checker and the backfill are answering two questions and
  only one of them has a gate
```

```
cohort            rows        field means
  before change    600000      nothing was said
  before change    1200000      nothing was said
  before change    1800000      nothing was said
  after change     550000       a writer decided
```

```
control - is the checker earning its place
  incompatible changes blocked : 6
  reader outages from schema changes : 0
  false blocks                 : 0
  defects in the checker       : 0
```

```
  removing it returns the outages it prevents and does not
  make one old row more true
```

```
null control - the same change with the backfill run
  compatibility verdict : compatible, unchanged
  rows backfilled       : 1850000
  rows carrying an unstated value : 0
  the report's count    : only rows somebody checked
  the schema did not change; the data caught up to it
```

```
what backward compatible guarantees
  old code will not break on new data : exactly
  new code will not break on old data : exactly
  the values new code reads are true  : not addressed, and a
    default is the mechanism that makes the guarantee hold
    while making the values untrue
```

```
a compatible schema change has two halves: the schema, which a
checker can gate, and the data, which nothing does; the second
half is where the default becomes a claim
```

The change is compatible and the checker is right to pass it: 0 deserialisation failures, 0 consumers redeployed, and 6 genuinely incompatible changes blocked this year. The default lands on 1850000 rows written before the field existed - 7708 per ten thousand of the table - where false means nobody said rather than somebody checked, 0 have been backfilled, and no gate asks for it.

Verify it yourself:

```bash
pnpm eml run examples/the-schema-was-backward-compatible-and-the-data-was-not/the_schema_was_backward_compatible_and_the_data_was_not.eml
```
