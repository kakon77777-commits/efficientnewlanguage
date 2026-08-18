# The rate is visible and the request is not

`the_rate_is_visible_and_the_request_is_not.eml` - The error rate is on the dashboard, correct to a tenth of a percent, and updated every minute. How many customer complaints it can resolve is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rate is a good number. It answers whether the service is within its budget, whether today is worse than yesterday, and whether a deploy made things worse - three real questions, all of them about the population, all of them answered correctly and cheaply by one figure.

A complaint is not about the population. It is about one request, and the rate does not contain requests; it contains a count of them. Going from the count back to the request is not a harder query, it is a query against data that was never kept.

What each level of retention can answer is computed rather than asserted.

```
requests today  : 40000
failures        : 1200
error rate      : 3.0%
complaints filed: 9
```

```
kept share   complaints matched   complaints needed for one match
  0%          0                    never
  1%          0                    100
  10%          0                    10
  100%          9                    1
```

```
at 1% sampling the expected number matched is 0, so the
first 100 complaints are expected to produce none
```

```
the rate against a 3.0% budget
  measured : 3.0%
  exactly at budget, with nothing to spare
  this is a real decision and the rate is the right instrument for it
```

```
month over month
  before : 3.0%
  after  : 2.0%
  improved by 10 tenths of a point, which is real and worth having
  failures remaining : 760
  complaints still unmatched : 9
  the improvement does not name any of the 760 that remain
```

```
to answer one complaint you need, for one request
  that it was recorded at all
  the account it came from
  what it was given back
  none of the three is derivable from a rate, at any precision
```

```
how much precision would help
  the rate to a tenth      : 3.0%
  the rate to a hundredth  : 300 hundredths of a percent
  complaints either one can resolve : 0
  precision and identity are different axes, and only one of them is being
  increased
```

```
keeping every request id for a day
  requests to store : 40000
  complaints resolvable : 9 of 9
  and the rate is still computable from the same data, by counting it
```

```
control - this month's cloud spend
  spend : 18400 against a cap of 20000
  under the cap by 1600, and the decision is about the total
  no complaint here is about one dollar, so the aggregate is the whole answer
```

The rate is accurate, cheap and the correct instrument for every question about the population. A complaint is a question about one request, and the rate is what is left after the requests are thrown away.

Verify it yourself:

```bash
pnpm eml run examples/the-rate-is-visible-and-the-request-is-not/the_rate_is_visible_and_the_request_is_not.eml
```
