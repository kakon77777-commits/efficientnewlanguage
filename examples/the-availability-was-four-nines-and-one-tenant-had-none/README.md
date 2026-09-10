# The availability was four nines and one tenant had none

`the_availability_was_four_nines_and_one_tenant_had_none.eml` - Availability has been above its target for twenty-two months, measured from real requests rather than from a synthetic probe. What the number is an average over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is sound. It counts real customer requests, not a prober hitting a health endpoint; a request that returns an error counts as failed even when the error is polite; the window is the calendar month the contract names rather than a rolling one chosen afterwards; and maintenance is not excluded.

It is one ratio over every request from every tenant.

```
tenants                         : 1400
  with any failure at all       : 61
  that saw nothing              : 1339
requests a month                : 94000000
  that failed                   : 28200
  that succeeded                : 93971800
```

```
availability target             : 9990 per ten thousand
availability across everyone    : 9997 per ten thousand
months the target has been met  : 22
```

```
one tenant
  minutes their shard was down  : 540
  their requests in the month   : 78000
  of those, failed              : 21000
  their own availability        : 7307 per ten thousand
  their share of all failures   : 7446 per ten thousand
credits paid under the contract : 0
```

```
the availability measurement
  what it counts : real customer requests, not a prober
    on a health endpoint
  a polite error : counts as failed
  the window : the calendar month the contract names,
    not a rolling one chosen afterwards
  maintenance : not excluded
  months met : 22
  verdict : AVAILABLE
```

```
  refusing to exclude maintenance is the part almost
  nobody does, and it is why 9997 per ten thousand
  is comparable month to month
```

```
the shape of the failures
  tenants that saw any failure : 
    61 of 1400
  failures belonging to a single tenant : 
    21000, or 7446 per ten thousand of them
  that tenant's own availability : 
    7307 per ten thousand
  the figure everyone reads : 
    9997 per ten thousand
  both are correct, and they are ratios over different
    populations of requests
```

```
  a denominator of ninety-four million absorbs an outage
  that was the whole month for the people in it
```

```
nine hours on one shard
  what their users got : errors, for 540 minutes
  what the status page said : available
  what the contract measures : the figure across
    everyone
  so credits owed : 0
  was the measurement wrong : no. It is a correct ratio,
    and the tenant is inside its denominator
```

```
null control - one figure per tenant, then count them
  tenants measured : 1400, unchanged
  availability across everyone : 
    9997, unchanged
  tenants below the target : 6
  no request changed outcome; the question stopped being
  asked once for everybody at the same time
```

```
what a met availability target guarantees
  9997 per ten thousand of all requests succeeded :
    exactly, from real traffic, maintenance included,
    22 months
  every customer was served : not addressed; one tenant
    ran at 7307 per ten thousand and carried 
    7446 per ten thousand of the month's failures
```

```
an average is a true statement about a population and no
statement about a member; when the failures are not spread
the way the denominator is, the figure and the experience
are about different things
```

It counts real requests, calls a polite error a failure, uses the contract's calendar month and excludes no maintenance - 9997 per ten thousand, 22 months running. It is one ratio over 94000000 requests, so one tenant's 540 minutes gave them 7307 per ten thousand and 7446 per ten thousand of every failure, against 0 credits.

Verify it yourself:

```bash
pnpm eml run examples/the-availability-was-four-nines-and-one-tenant-had-none/the_availability_was_four_nines_and_one_tenant_had_none.eml
```
