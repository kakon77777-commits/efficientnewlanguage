# The total is right and every line is wrong - net error zero, six lines off

`the_total_is_right_and_every_line_is_wrong.eml` compares each line against its true value and sums the errors, alongside the reconciliation that is actually run.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: reconciling the total is a good check - it catches dropped rows, double counting and most arithmetic slips, and it is the only one that can be run against an external number. What it cannot catch is an error that moves value between lines.

```
the check that is run
  true total   : 7010
  posted total : 7010
  reconciles exactly
```

```
the lines
  a1 : true 1003, posted 1000   (-3)
  a2 : true 2007, posted 2010   (+3)
  a3 : true 505, posted 500   (-5)
  a4 : true 1495, posted 1500   (+5)
  a5 : true 802, posted 800   (-2)
  a6 : true 1198, posted 1200   (+2)
  lines wrong : 6 of 6
  total absolute error : 20
  net error : 0
```

```
Every line is wrong and the net error is zero, so the check that exists
passes and the check that would fail was never written.
```

```
  accounts credited too much : 3
  accounts credited too little : 3
  a per-account complaint is the only signal left
```

```
a per-line check on the same data
  lines it flags : 6
  cost : one comparison per line, against a number that already exists
```

```
control - a dropped row, which changes the sum
  true total   : 3500
  posted total : 3000
  the total check catches this one immediately
```

The reconciliation is a real check and it passes for a real reason. It constrains one number, and the report has six.

The **control** is a dropped row, which changes the sum: the total check catches that one immediately. The check is not weak in general - it is blind to exactly the error class that conserves the total.

Verify it yourself:

```bash
pnpm eml run examples/the-total-is-right-and-every-line-is-wrong/the_total_is_right_and_every_line_is_wrong.eml
```
