# The quota renewed monthly and the billing cycle did not

`the_quota_renewed_monthly_and_the_billing_cycle_did_not.eml` - The quota resets on the first of each month and the customer never exceeded it. What the invoice charges for is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The quota is enforced correctly. Five million calls a month, counted in shared storage, reset atomically at midnight on the first, with a header on every response telling the customer how much remains. The customer watched that header, stayed under it in both months, and was never throttled.

The invoice is computed over the BILLING CYCLE, which starts on the day the account was created. The two windows are both a month long and they are not the same month.

The cycle runs the eighteenth to the seventeenth, so it contains one quota reset, and the customer receives two grants inside one invoice.

```
quota per month              : 5000000
quota resets on day          : 1
billing cycle starts on day  : 18
```

```
used before the reset        : 4800000
used after the reset         : 4900000
used in the billing cycle    : 9700000
allowance on the invoice     : 5000000
overage billed               : 4700000
```

```
the quota enforcement
  limit per month     : 5000000
  counter storage     : shared, atomic reset
  remaining sent on every response : yes
  violations          : 0
  times throttled     : 0
  verdict             : WITHIN QUOTA
```

```
  the customer read that header and managed to it; both
  months are under the limit and neither is close
```

```
the two months
  the quota's month  : the first to the last of the
    calendar month
  the invoice's month: day 18 to day 17
  quota resets inside one billing cycle : 1
  grants the customer receives inside one invoice : 2
  allowance the invoice subtracts : 1
```

```
  each window is a month and neither is wrong; they
  disagree about which days go together
```

```
share of cycle usage billed as overage : 4845 per ten thousand
```

```
the dispute
  customer shows     : two months, each under 5000000
  invoice shows      : 9700000 calls against 5000000
  both are computed correctly : yes
  a document defining which month is the month : none
```

```
  the support engineer can reproduce both numbers and
  neither system has a defect to fix
```

```
null control - the quota resets on the cycle boundary
  quota violations   : 0, unchanged
  grants inside one invoice : 1
  overage billed     : 0
  neither the quota nor the invoice became more correct;
  they started dividing the year at the same points
```

```
what staying inside the quota guarantees
  no request is throttled : exactly
  no overage is charged   : not addressed; the charge is
    computed over a different window, and a window is a
    choice each system makes independently
```

```
two correct counters over two correct periods produce two
correct answers; the defect is the assumption that a limit
and a price share a calendar
```

The customer stayed inside the quota in both months - 4800000 and 4900000 against 5000000 - with 0 violations and 0 throttled requests, managed against a header the API sends on every response. The billing cycle starts on day 18 and contains one quota reset, so the invoice sees 9700000 calls against one allowance and bills 4700000 as overage, 4845 per ten thousand of the cycle.

Verify it yourself:

```bash
pnpm eml run examples/the-quota-renewed-monthly-and-the-billing-cycle-did-not/the_quota_renewed_monthly_and_the_billing_cycle_did_not.eml
```
