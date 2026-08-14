# Two definitions, one column name — the roll-up says 11 and only 10 people exist

`two_definitions_one_column_name.eml` derives both teams' numbers and the true pooled numbers from one event log.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Neither definition is wrong and neither team is careless. One counts anyone who
opened the app, the other anyone who completed an action, and both published
the definition next to the number. The roll-up reads a column named `active`
from each and sums it.


```
the roll-up, which reads a column called active
  A + B : 11
```

```
  roll-up says      : 11
  opened, pooled    : 9
  acted, pooled     : 8
  people who exist  : 10
  the roll-up exceeds the larger of the two real numbers
  and exceeds the number of people, so it counts no set at all
```

```
causes of the excess
  users appearing under both teams : 5
  the two definitions count different things, so the sum is of no single set
```

```
control - disjoint teams, one shared definition
  A + B : 4
  pooled distinct : 4
  here the sum is exact
```

Both numbers are correct and the column name is the only thing they share.
Addition needs the parts to be pieces of one set, and a shared name is not
evidence of that.

Verify it yourself:

```bash
pnpm eml run examples/two-definitions-one-column-name/two_definitions_one_column_name.eml
```
