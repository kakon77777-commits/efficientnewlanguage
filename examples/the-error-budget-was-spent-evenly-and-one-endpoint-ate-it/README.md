# The error budget was spent evenly and one endpoint ate it

`the_error_budget_was_spent_evenly_and_one_endpoint_ate_it.eml` - The service has stayed inside its quarterly error budget for eleven quarters, and the budget is a real constraint rather than a slogan. What it is a budget over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The discipline is genuine. Exceeding the budget freezes feature work, and the freeze has actually happened; the budget is spent by real customer errors rather than by a synthetic check; it is set from what customers said they could tolerate rather than from what the service happens to achieve; and it is not reset early when a quarter goes badly.

It is one budget over every request to every endpoint.

```
endpoints                       : 214
  with no errors at all         : 96
  with any error                : 118
requests a quarter              : 61000000
errors a quarter                : 475800
```

```
error budget                    : 100 per ten thousand
budget spent                    : 78 per ten thousand
quarters within budget          : 11
```

```
one endpoint
  its requests                  : 900000
  its share of traffic          : 147 per ten thousand
  its errors                    : 391000
  its share of the spend        : 8217 per ten thousand
  its own error rate            : 4344 per ten thousand
errors everywhere else          : 84800
per-endpoint budget alerts      : 0
```

```
the error budget
  what exceeding it costs : a feature freeze, and the
    freeze has happened
  what spends it : real customer errors, not a synthetic
    check
  where the number came from : what customers said they
    could tolerate
  resetting early in a bad quarter : not done
  quarters inside it : 11
  verdict : WITHIN BUDGET
```

```
  making the freeze real is the part almost nobody does,
  and it is why 78 per ten thousand is a constraint
```

```
where the spend went
  traffic on one endpoint : 
    147 per ten thousand of requests
  errors on that endpoint : 
    8217 per ten thousand of the spend
  its own error rate : 
    4344 per ten thousand
  the service-wide rate : 78 per ten thousand
  both correct, over different populations of requests
```

```
  a denominator of sixty-one million dilutes an endpoint
  that fails two times in five for everyone who calls it
```

```
the callers of the one endpoint
  what they see : 4344 per ten thousand failing
  what the budget page shows : inside budget
  does the freeze trigger for them : no; the freeze is
    keyed to the service figure
  alerts that would have fired on their behalf : 
    0
  endpoints in the same position : unknown; the budget
    is not computed per endpoint
```

```
null control - one budget per endpoint
  quarters measured : 11, unchanged
  service-wide spend : 78, unchanged
  endpoints over their own budget : 
    1
  no request changed outcome; the budget stopped being
  one pool that a large denominator can absorb an
  endpoint into
```

```
what eleven quarters inside budget guarantees
  errors across all requests stayed under 
    100 per ten thousand : exactly, real errors, a
    real freeze, no early resets
  every endpoint was reliable : not addressed; one
    carried 8217 per ten thousand of the spend on 
    147 per ten thousand of the traffic
```

```
a budget pooled across a population is spent by whoever
spends it, and a large denominator is what makes one
member's whole failure fit inside a small figure
```

Exceeding it freezes feature work and the freeze has happened, it is spent by real errors and never reset early - 78 per ten thousand against 100, 11 quarters. It is one pool, so an endpoint with 147 per ten thousand of traffic took 8217 per ten thousand of the spend at 4344 per ten thousand of its own calls, under 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-error-budget-was-spent-evenly-and-one-endpoint-ate-it/the_error_budget_was_spent_evenly_and_one_endpoint_ate_it.eml
```
