# The amounts were summed at each days rate

`the_amounts_were_summed_at_each_days_rate.eml` - The multi-currency balance is summed correctly to a single dollar figure, and each conversion is right. What rate each line was converted at is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The conversion is done properly per line. Each amount is converted with the official rate for its own booking day; the rate source is the same for every currency; no line is dropped; and the arithmetic is exact to the cent.

Each line keeps the rate of the day it was booked, and the sum mixes them.

```
reported total (each day's rate): 12040000 cents
total at one month-end rate     : 11890000 cents
  difference from mixing rates  : 150000 cents
  as a share of the total       : 126 per ten thousand
currencies                      : 3
lines dropped                   : 0
reported total in dollars       : 120400
```

```
the per-line conversion
  rate used : the official rate for the line's booking
    day
  rate source : the same for every currency
  lines dropped : 0
  arithmetic : exact to the cent
  lines converted correctly : all of them
  verdict : EACH LINE CORRECT
```

```
  one rate source across all currencies is the part done
  right here, and it is why no line used a stray quote
```

```
the total
  how it was formed : the per-day conversions, added
  what each conversion fixes : the value on its own day
  what the market did across the month : moved
  so the sum : mixes rates from different days into one
    figure
  what it is the value of : no single day's holdings
```

```
the reader of the balance
  what they take it to be : what the holdings are worth
    now
  what it is : a sum of what each line was worth on its
    own day
  the gap at one consistent rate : 
    150000 cents
  is any line wrong : no; each is exact on its day
  is the total a valuation : not at any one date
```

```
null control - one rate for the whole balance
  summed at each day's rate : 12040000, unchanged
  summed at one month-end rate : 11890000 cents
  lines changed : 0
  no amount and no booking date changed; the rates
  stopped being mixed across a moving month
```

```
what a correct multi-currency total guarantees
  each line is converted at its own day's official rate :
    exactly, one source, nothing dropped, to the cent
  the total is what the holdings are worth now : not
    addressed; each line was converted on its booking day,
    so the sum mixes rates across a moving month and is not
    any single day's valuation - at one rate it is 
    11890000
```

```
a valuation is taken at an instant, and a sum of conversions taken at different
instants belongs to no instant; each term is right on its day and the total is
a date that never happened
```

Each line uses its booking day's official rate, one source, exact to the cent - no line wrong. The sum mixes rates across a moving month, so it is not a valuation at any date: at one month-end rate it is 11890000 cents, 150000 from the reported 12040000, 126 per ten thousand.

Verify it yourself:

```bash
pnpm eml run examples/the-amounts-were-summed-at-each-days-rate/the_amounts_were_summed_at_each_days_rate.eml
```
