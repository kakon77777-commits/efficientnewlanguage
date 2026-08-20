# The rounding was applied at every step

`the_rounding_was_applied_at_every_step.eml` - Each line is rounded to the cent as it is computed, because a cent is what money is. What that costs over a run is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Rounding each line is right and is usually required. A line item that prints has to be a real amount, an invoice with three decimal places is not an invoice, and downstream systems reject fractional cents. The rule is not an approximation anybody chose casually.

Rounding is applied per line and the total is a sum of the results, so the per-line errors are added along with the amounts. The same figures rounded once at the end carry one rounding rather than N.

Everything is in tenths of a cent, as integers, so no float is involved.

```
lines : 12
exact total, in tenths of a cent : 43605
```

```
  rounding each line, then adding : 43620
  adding, then rounding once      : 43610
  they differ by 10 tenths of a cent
```

```
line   amount   rounded   error introduced
  1      1234     1230      -4
  2      5677     5680      3
  3      892     890      -2
  4      3345     3350      5
  5      7778     7780      2
  6      456     460      4
  7      2223     2220      -3
  8      9995     10000      5
  9      1116     1120      4
  10      6664     6660      -4
  11      3338     3340      2
  12      887     890      3
```

```
largest single-line error, either direction : 5 tenths
sum of the per-line errors: 15 tenths
  every line is correct to the cent and the total is not
```

```
the same rule over prefixes of the list
  after 3 lines  : per-line 7800, once 7800, gap 0
  after 7 lines  : per-line 21610, once 21610, gap 0
  after 12 lines : per-line 43620, once 43610, gap 10
```

```
what each answer is correct for
  rounding per line : every printed line matches what was charged
  rounding once     : the total matches the sum of the true amounts
  a document that shows lines AND a total cannot have both, and the
  difference has to appear somewhere or the document does not add up
```

```
putting the difference on the last line
  adjustment : -10 tenths
  last line becomes : 880 instead of 890
  the document now adds up, and one line is not what that line cost
```

```
control - amounts that are already whole cents
  per line : 11000, once : 11000
  identical, so this invoice cannot show which rule is in use
```

Every line is rounded correctly and every line prints a real amount. The total is a sum of results rather than a result of the sum, and those are two different numbers whenever a line was not already on the cent.

Verify it yourself:

```bash
pnpm eml run examples/the-rounding-was-applied-at-every-step/the_rounding_was_applied_at_every_step.eml
```
