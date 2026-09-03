# The permission was revoked and the session lived on

`the_permission_was_revoked_and_the_session_lived_on.eml` - A revocation propagates in forty milliseconds and the offboarding target is fifteen minutes. How long the access lasts is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The authorization service is fast and correct. A role removal is written to the store, invalidates its own read caches, and every subsequent authorization decision reflects it within forty milliseconds. It is audited, the audit is complete, and the fifteen-minute offboarding target is met by a factor of twenty thousand.

The subsequent authorization decisions are the ones that ASK. A session token carries its claims signed at issue, and a service that trusts the token does not ask — that is what the token is for, and it is why the system scales.

Tokens last eight hours.

```
revocations per month        : 214
propagation, ms              : 40
offboarding target, seconds  : 900
target over propagation      : 22500 times
```

```
token lifetime, hours        : 8
mean remaining at revocation : 4 hours
access after revocation, over the target : 16 times
person-hours of access after revocation, monthly : 856
```

```
the authorization service
  role removal written to the store : immediately
  its own read caches invalidated   : yes
  subsequent decisions reflect it   : within 40 ms
  audited                           : yes, completely
  propagation failures              : 0
  offboarding target met by         : 22500 times
  verdict                           : REVOKED
```

```
  the number is real and the service is not the problem
```

```
the two kinds of decision
  a service that calls the authorization service : sees
    the revocation in 40 ms
  a service that validates the token's signature : sees
    the claims as they were at issue
  which is more common : the second, deliberately
  why : it is what makes the system scale
```

```
  the design is not an oversight; the token exists so that
  most decisions do not need a call
```

```
the checklist
  line               : access removed
  ticked when        : the revocation returns
  time recorded      : 40 ms
  time until the person cannot act : up to 8 hours
  a line for the second : none
```

```
null control - short tokens with a refresh that re-asks
  propagation, ms      : 40, unchanged
  mean remaining access, seconds : 150
  access beyond the offboarding target : 0
  the revocation did not get faster; the population of
  decisions that ask it grew
```

```
what an instant revocation guarantees
  every decision that asks gets the new answer : exactly
  every decision gets the new answer           : not
    addressed; a signed claim is a decision cached in the
    holder's pocket, and the point of it is not to ask
```

```
revocation latency is the propagation time plus the lifetime
of whatever was issued before it; the first is measured on a
dashboard and the second is a configuration value nobody
reads as a security parameter
```

Revocation propagates in 40 ms with 0 failures, audited, meeting a 900 second offboarding target by 22500 times. Most decisions validate a signed token instead of asking, which is the design and is why it scales, so a revoked person keeps acting for a mean of 4 hours - 16 times the target - and 214 revocations a month leave 856 person-hours of access behind them.

Verify it yourself:

```bash
pnpm eml run examples/the-permission-was-revoked-and-the-session-lived-on/the_permission_was_revoked_and_the_session_lived_on.eml
```
