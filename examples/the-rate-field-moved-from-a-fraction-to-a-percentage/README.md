# The rate field moved from a fraction to a percentage

`the_rate_field_moved_from_a_fraction_to_a_percentage.eml` - A discount_rate field carried 0.15 and now carries 15. Same name, same numeric type. Which consumers noticed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The change was a reasonable one. Every human-facing surface was multiplying by 100 before display, three of them had rounded differently, and one had shown 14.999999999999998 to a customer. Storing the number people actually say removes a conversion from five places.

A fraction and a percentage are the same type. Nothing rejects 15 where 0.15 was expected. A consumer that was already multiplying by 100 now produces a number a hundred times too large, and a consumer that multiplies the rate by an amount now charges a hundred times too much - and both are running code that was correct the day before.

Consumers are listed with what they do to the value.

```
consumer            what it does                      records/day   correct after
  invoice display   multiplies by 100 and formats   21000        no
  discount engine   multiplies by the amount   96000        no
  partner export   writes it out unchanged   4000        no
  audit log   stores it as text   96000        yes
  rate editor   reads and writes it   300        yes
```

```
records a day handled      : 217300
handled by a wrong consumer: 121000, 55%
consumers now wrong        : 3 of 5
consumers edited           : 0
```

```
one discount of 15 percent on an amount of 20000
  intended discount        : 3000
  discount engine computes : 300000
  overcharge factor        : 100
  the engine is doing exactly the arithmetic it always did
```

```
the same rate on the invoice display
  intended display : 15%
  it displays      : 1500%
  a discount above 100% is visibly absurd, so this one is found in a day
```

```
how each wrong consumer fails
  invoice display : shows 1500%, absurd on sight, reported within a day
  discount engine : produces a number, no bound is violated, silent
  partner export  : writes 15 where the partner expects 0.15, silent until
    the partner reconciles at month end
  of the 3 wrong consumers, 1 announces itself
```

```
values the field can hold under each meaning
  as a fraction   : 0 to 1
  as a percentage : 0 to 100
  the two ranges overlap on 0 to 1, which is where every test fixture sits
  a test using 0.15 passes under both meanings
  a test using 15 fails under the old meaning and would have caught this
  fixtures in the suite using a value above 1 : 0
```

```
the contract, before and after
  field name  : discount_rate, unchanged
  type        : number, unchanged
  precision   : unchanged
  unit        : fraction -> percent
  the last line has no representation in the schema, and the first three
  are what the compatibility check compares
```

```
alternatives that cannot be silently misread
  rename to discount_percent : every consumer fails to find the field
    consumers forced to make a decision : 5
    consumers silently changed : 0
  keep the fraction and fix the display rounding centrally
    consumers touched : 1
    the original complaint - 14.999999999999998 - is a formatting defect
    in one place, and it was solved by changing the unit everywhere
```

```
control - audit log : stores it as text
control - rate editor : reads and writes it
  these two are correct under both meanings
  what protects them is that neither one knows what the number means,
  which is also why neither one could have warned anybody
```

Removing a conversion from five places was reasonable and it fixed a real rounding defect. A fraction and a percentage are the same type, so 3 of 5 consumers changed behaviour and none of them changed.

Verify it yourself:

```bash
pnpm eml run examples/the-rate-field-moved-from-a-fraction-to-a-percentage/the_rate_field_moved_from_a_fraction_to_a_percentage.eml
```
