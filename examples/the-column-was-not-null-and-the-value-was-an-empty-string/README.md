# The column was not null and the value was an empty string

`the_column_was_not_null_and_the_value_was_an_empty_string.eml` - The column is NOT NULL, the constraint has never been violated, and the database enforces it. How many rows carry a value is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The constraint is doing real work. It was added after a release where a nullable column reached a report as the word "None" in front of a customer, it has rejected fourteen thousand malformed inserts since, and the migration that added it took a maintenance window because the back-fill was careful. Zero violations is a true and hard-won number.

NOT NULL constrains the ABSENCE MARKER, and there is more than one way to write nothing down. The loader receives an empty field from the upstream feed and writes an empty string, which satisfies the constraint completely.

Every report that counts rows where the column is not null counts them.

```
rows                        : 14200000
holding an empty string     : 4860000
holding a value             : 9340000
not null violations         : 0
```

```
the NOT NULL constraint
  enforced by            : the database
  violations ever        : 0
  malformed inserts rejected since : 14000
  added after            : a null reaching a customer report
  verdict                : ENFORCED
```

```
  it was added for a real reason and it prevents that
  reason from recurring
```

```
what the loader does with a missing upstream field
  writes null          : rejected by the constraint
  writes empty string  : accepted
  which it does        : the second, since the constraint
    was added, because the first stopped working
```

```
  the constraint did not remove the absent values; it
  selected the spelling they are written in
```

```
share of rows with nothing in them : 3422 per ten thousand
```

```
three counts of the same column
  rows where it is not null  : 14200000
  rows where it is non-empty : 9340000
  rows a person would call filled : 9340000
```

```
  the first exceeds the third by : 4860000
  which query the dashboards use : the first
```

```
before the constraint
  these rows held        : null
  counted as filled      : no
  reports were           : correct about them
after the constraint
  these rows hold        : an empty string
  counted as filled      : yes, 4860000 of them
```

```
null control - NOT NULL plus a length check
  violations of NOT NULL : 0, unchanged
  rows holding an empty string : 0
  rows accepted          : 9340000
  the constraint did not get stricter about nulls; a
  second spelling of nothing stopped being accepted
```

```
what NOT NULL guarantees
  no row holds the null marker : exactly
  every row holds information  : not addressed; the
    constraint names one representation of absence and
    every type has others
```

```
constraining a representation redirects the values it
forbids; the ones that used to be visibly missing become
invisibly missing, and the reports get worse
```

The constraint is enforced and its zero is real: 0 violations ever and 14000 malformed inserts rejected since it was added, after a null reached a customer report. 4860000 of 14200000 rows hold an empty string - 3422 per ten thousand - so every dashboard counting not-null rows overcounts by 4860000, and before the constraint existed those same rows were counted correctly.

Verify it yourself:

```bash
pnpm eml run examples/the-column-was-not-null-and-the-value-was-an-empty-string/the_column_was_not_null_and_the_value_was_an_empty_string.eml
```
