# The limit was per user and the attacker had many

`the_limit_was_per_user_and_the_attacker_had_many.eml` - The rate limit is a hundred requests a minute per authenticated user and it has never been exceeded. What one actor can send is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The limit works. It is applied after authentication so it cannot be evaded by rotating addresses, the counter is in shared storage so it holds across instances, it returns a correct retry-after, and it stopped a real incident in March when a customer's integration went into a loop. Zero violations is a true number.

A per-user limit is a budget denominated in ACCOUNTS. Its total is the limit times the number of accounts an actor can hold, and that second factor is set by the sign-up flow rather than by the limiter.

Sign-up needs an email address and no verification. Four thousand accounts is an afternoon.

```
limit per user per minute   : 100
accounts held by one actor  : 4000
what that actor may send    : 400000 per minute
```

```
legitimate peak per minute  : 26000
the actor's budget is       : 15 times the peak
limit violations by the actor : 0
```

```
the rate limiter
  applied after authentication : yes, so address rotation
    does not evade it
  counter storage    : shared, holds across instances
  retry-after        : correct
  incident stopped in March : a customer integration loop
  violations         : 0
  verdict            : ENFORCED
```

```
  it is not a token bucket in a local variable; it is the
  careful version and it does its job
```

```
the budget, in two factors
  requests per account : 100, set by the limiter
  accounts per actor   : unbounded, set by the sign-up flow
  cost of an account   : 0
  verification         : none
```

```
  the limiter owns one factor and is read as bounding the
  product
```

```
the actor's share of total traffic : 9389 per ten thousand
```

```
what an investigator finds
  accounts over the limit    : 0
  accounts sending unusual volume : 0
  the pattern is visible in : the union, which no report
    groups by, because there is no column to group by
```

```
null control - a second limit on a verified identity
  per-user limit         : 100, unchanged
  verified identities the actor holds : 1
  what the actor may send : 100 per minute
  the limiter did not get stricter; the second factor
  stopped being free
```

```
what a per-user limit guarantees
  no account exceeds this rate : exactly
  no actor exceeds this rate   : not addressed; the
    limiter's unit is the account, and an actor's account
    count is decided by whatever it costs to make one
```

```
a limit is only as strong as its unit is expensive; putting
one on a free identifier bounds a number that was never the
one at issue
```

The limit is enforced correctly and 0 accounts have exceeded it: applied after authentication, shared counter, correct retry-after, and it stopped a real incident in March. An actor holding 4000 free unverified accounts may send 400000 requests a minute - 15 times the legitimate peak and 9389 per ten thousand of all traffic - while every one of those accounts is compliant.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-per-user-and-the-attacker-had-many/the_limit_was_per_user_and_the_attacker_had_many.eml
```
