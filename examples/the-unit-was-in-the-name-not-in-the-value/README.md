# The unit was in the name not in the value

`the_unit_was_in_the_name_not_in_the_value.eml` - Every field carries its unit in its name. How many of the arithmetic sites check that name is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Putting the unit in the name is a real discipline and it works. A reader of `timeout_ms` knows what the number is, review catches a mismatch on sight, and it costs nothing at runtime because it is not a runtime thing at all.

That last part is the whole of it. The name is checked by people, and the value is used by arithmetic, which sees a number with no unit attached. Where two correctly-named fields meet in one expression, nothing but the reader stands between them.

Every pairing is enumerated and the ones that are dimensionally wrong are counted.

```
fields : 5
field              unit   value   in ms
  timeout_ms   ms     500     500
  retry_delay_s   s     2     2000
  budget_ms   ms     1500     1500
  poll_interval_s   s     30     30000
  deadline_ms   ms     900     900
```

```
the check: timeout must be under the budget
  timeout_ms 500 against budget_ms 1500
  passes, and both are in ms, so the comparison means what it says
```

```
the same check against retry_delay_s
  raw values : 2 against 1500
  passes on the raw numbers
  in one unit: 2000 ms against 1500 ms
  the delay is actually 500 ms over the budget
  the raw comparison passed because 2 is smaller than 1500, and 2 was
  seconds
```

```
pairings of two fields in one expression
  pairs                       : 10
  pairs with different units  : 6
  of those, where comparing the raw values gives the opposite answer : 6
```

```
what checks the unit
  the reader        : every time, and correctly
  review            : every time it is looked at
  the compiler      : never, both are integers
  the test suite    : only where a fixture crosses units
```

```
storing every duration in milliseconds at the boundary
  pairs that can be compared wrongly : 0
  the names keep their suffixes for the reader and the arithmetic has one
  unit, so the two audiences stop needing the same field to do both jobs
```

```
control - three fields that are all in milliseconds
  mismatched pairs : 0
  none, so this codebase cannot show whether the discipline is holding
```

The naming discipline is real and every field here obeys it. The name is read by people and the value is read by arithmetic, and only one of those two ever sees the unit.

Verify it yourself:

```bash
pnpm eml run examples/the-unit-was-in-the-name-not-in-the-value/the_unit_was_in_the_name_not_in_the_value.eml
```
