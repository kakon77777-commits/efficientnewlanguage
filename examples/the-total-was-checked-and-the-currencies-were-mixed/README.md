# The total was checked and the currencies were mixed

`the_total_was_checked_and_the_currencies_were_mixed.eml` - Every invoice is reconciled nightly against the sum of its lines, in exact integer arithmetic, and no invoice mismatches. What the sum is a sum of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reconciliation is the careful kind. Amounts are integers in minor units, never floating point, so there is no rounding to argue about; the check runs over every invoice rather than a sample; it compares the stored total against a freshly computed sum of the lines; and it has caught seven genuine bugs, each a real defect that would have reached a customer.

The sum adds the amount column. The currency lives in a different column, and addition does not read it, so a line in yen and a line in dollars add to a number that is denominated in nothing.

Nine currencies are in use and their minor units are not the same size.

```
invoices                        : 4100000
reconciled nightly              : 4100000
mismatching                     : 0
genuine bugs the check caught   : 7
amounts stored as floating point: 0
```

```
currencies in use               : 9
distinct minor unit sizes       : 3
invoices in a single currency   : 4078600
invoices mixing currencies      : 21400
  share                         : 52 per ten thousand
reconciliations grouping by currency : 0
```

```
the nightly check
  population : every invoice, not a sample
  arithmetic : integers in minor units
  floating point anywhere in the path : 0
  compares : the stored total against a fresh sum of lines
  mismatches : 0
  genuine bugs caught so far : 7
  verdict : RECONCILED
```

```
  exact integer arithmetic over the full population is the
  expensive choice and it is why the seven were found
```

```
the equality being checked
  left  : the stored total
  right : the sum of the line amounts
  what the sum reads : the amount column
  what it does not read : the currency column, which is
    populated on every line
  how the stored total was produced : by the same sum
```

```
  the two sides agree because they are the same computation
  run twice, and the thing neither reads is present in the
  row both of them read
```

```
one mixed invoice
  a line in a zero-decimal currency : an integer of whole
    units
  a line in a two-decimal currency  : an integer of
    hundredths
  distinct minor unit sizes in use  : 3
  what their sum is denominated in  : nothing
  what the check says about it      : that it matches
```

```
what a mismatch would require
  the two sides to disagree : they cannot; one is the
    other, recomputed
  the currency column to be missing : it is not
  a query grouping by currency : 0
  invoices where that query would return more than one row : 
    21400
```

```
null control - reconcile per invoice and currency
  invoices reconciled : 4100000, unchanged
  invoices reporting more than one total : 21400
  arithmetic : the same exact integers
  the check did not become more rigorous; the sum acquired
  a group, and a total acquired a unit
```

```
what a passing reconciliation guarantees
  the stored total equals the sum of the lines : exactly,
    in exact arithmetic, over every invoice
  the total is a correct amount of money       : not
    addressed; equality of two sums says nothing about
    whether the addends were addable
```

```
a total is a number and an amount is a number with a unit;
checking that two numbers agree is a strictly weaker
statement, and it is strongest exactly where the unit is
constant, which is where nobody needed the check
```

The reconciliation is exact and complete: integer minor units, 0 floating point values, every one of 4100000 invoices checked nightly, 0 mismatches, and 7 genuine bugs caught. It sums the amount column and not the currency column, across 9 currencies with 3 different minor unit sizes, so the 21400 invoices mixing currencies - 52 per ten thousand - pass by adding unlike units.

Verify it yourself:

```bash
pnpm eml run examples/the-total-was-checked-and-the-currencies-were-mixed/the_total_was_checked_and_the_currencies_were_mixed.eml
```
