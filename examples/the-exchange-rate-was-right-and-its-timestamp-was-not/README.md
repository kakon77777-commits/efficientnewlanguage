# The exchange rate was right and its timestamp was not

`the_exchange_rate_was_right_and_its_timestamp_was_not.eml` - A payment is quoted in the customer's currency at authorization and settled three days later at capture. Both conversions use the published rate. The difference is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Converting at capture is the defensible choice and it was argued for by the finance team, correctly. Capture is when money actually moves, so the rate at capture is the rate the bank will use, and booking at any other rate leaves a reconciliation difference that somebody has to chase every month. It also means the ledger and the settlement file agree to the cent, which is a real operational property and not a nicety.

The customer was shown a number at authorization. That number is the quote, it is what they agreed to, and it is what appears in the confirmation email.

No wrong rate is used anywhere. Two correct rates are used, from two correct moments, and the contract names only one of them. The difference between the two moments is not an error in the rate; it is an error about which moment the promise was made in.

```
transactions per day     : 12000
average amount           : 85 units
rate at authorization    : 10850 ten-thousandths
rate at capture, 3 days later : 11045 ten-thousandths
move over the three days : 195 ten-thousandths, which is 179 per ten thousand
```

```
one transaction of 85 units
  quoted to the customer : 9222 hundredths
  charged at capture     : 9388 hundredths
  difference             : 166 hundredths
```

```
  per day  : 19920 units across 12000 transactions
  per year : 7270800 units
```

```
  every one of which is the difference between two correct numbers
```

```
the same mechanism when the rate moves the other way
  rate at capture        : 10655 ten-thousandths
  charged                : 9056 hundredths
  difference             : -166 hundredths, in the customer's favour
  complaints generated   : 0
```

```
  the error is symmetric and the reporting is not
  so the ticket volume measures the rate's direction, not the defect's size
```

```
exposure by fulfilment time, at 65 ten-thousandths of drift per day
  1 days : rate moves 65, per transaction 55 hundredths, per day 6600 units
  3 days : rate moves 195, per transaction 165 hundredths, per day 19800 units
  7 days : rate moves 455, per transaction 386 hundredths, per day 46320 units
  14 days : rate moves 910, per transaction 773 hundredths, per day 92760 units
  30 days : rate moves 1950, per transaction 1657 hundredths, per day 198840 units
```

```
  a warehouse decision moves a currency exposure, and neither team knows it
```

```
control - is either rate incorrect for its own timestamp
  rate used at authorization vs published rate that day : exact match
  rate used at capture vs published rate that day       : exact match
  incorrect rates found : 0 of 2
  the reconciliation the finance team wanted also holds exactly
```

```
  every check that reads a rate and a timestamp together passes
  the defect needs two records compared, and they live in two systems
```

```
null control - the same rule when capture is immediate
  delay between quote and capture : 0 days
  rate movement in that window    : 0 ten-thousandths
  difference per transaction      : 0 hundredths
  same code, same rate source, same rounding
  the whole error is the width of the window
```

```
a value with a timestamp, used across two moments
  is the value correct         yes, at its own timestamp
  is the timestamp correct     yes, it is the moment it was taken
  is it the RIGHT moment       this is the question, and it is not about the rate
  the promise was made at one moment and settled at another
  whichever is chosen, the other one is the one the customer read
```

Booking at capture makes the ledger and the settlement file agree to the cent, which is why finance asked for it, and both rates match the published series exactly. Over the three days between the promise and the settlement the rate moved 195 ten-thousandths, which is 166 hundredths on an average transaction, 19920 units a day, and 7270800 units a year of difference between two numbers that are both right.

Verify it yourself:

```bash
pnpm eml run examples/the-exchange-rate-was-right-and-its-timestamp-was-not/the_exchange_rate_was_right_and_its_timestamp_was_not.eml
```
