# The growth was the mean of the monthly rates

`the_growth_was_the_mean_of_the_monthly_rates.eml` - The average monthly growth rate is reported correctly, and each monthly figure is a true rate. What the annual number is a combination of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The monthly rates are computed properly. Each month's growth is the close over the prior close minus one; the same denominator convention is used every month; no month is dropped; and the reporting is audited against the ledger.

The annual figure is the mean of the monthly rates, times twelve.

```
months                          : 12
value start                     : 1000000
value end                       : 1180000
```

```
reported mean monthly growth    : 200 per ten thousand
annualized by times twelve      : 2400 per ten thousand
true twelve-month return        : 1800 per ten thousand
  overstatement                 : 600 per ten thousand
```

```
a 50 percent fall then rise
  mean of the two months        : 0 per ten thousand
  compounded net                : -2500 per ten thousand
```

```
the monthly growth rates
  each month : close over prior close, minus one
  denominator convention : the same every month
  months dropped : none
  audited against : the ledger
  months with a correct rate : all 12
  verdict : EACH MONTH CORRECT
```

```
  keeping one denominator convention across the year is
  the part almost nobody holds to, and it is why the
  monthly figures are comparable
```

```
the mean of the rates, times twelve
  what it assumes : that growth adds
  what growth does : compounds; each month multiplies
    the last, it does not add to it
  a down month and an up month of equal size : average
    to zero and compound to a loss
  that loss here : -2500 per ten thousand
  so the mean times twelve : overstates by 
    600 per ten thousand
```

```
the ledger, start to end
  value at the start : 1000000
  value at the end : 1180000
  the only return that happened : 
    1800 per ten thousand
  the reported annual figure : 
    2400 per ten thousand
  is any monthly rate wrong : no; the combining is
```

```
null control - compound the rates, do not average them
  mean times twelve : 2400, unchanged
  compounded return : 1800 per ten thousand
  monthly rates changed : 0
  no month's figure moved; the combining stopped adding
  the rates and started multiplying them
```

```
what a reported average monthly growth guarantees
  each month grew by its stated rate : exactly, one
    convention, no month dropped, audited
  the year grew by twelve times the average : not
    addressed; growth compounds, and the arithmetic mean of
    the monthly rates times twelve is not the twelve-month
    return - the value went 1000000 to 1180000, which is
    1800 per ten thousand, not 2400
```

```
a rate is a ratio between two levels, and ratios chain by multiplication; the
mean of a set of them scaled by their count is an answer to a question about
sums, which growth is not
```

Each monthly rate is correct, one convention, none dropped, audited. The year is the mean times twelve, and growth compounds - so the ledger's own 1000000 to 1180000 is 1800 per ten thousand, while the report says 2400, an overstatement of 600 per ten thousand.

Verify it yourself:

```bash
pnpm eml run examples/the-growth-was-the-mean-of-the-monthly-rates/the_growth_was_the_mean_of_the_monthly_rates.eml
```
