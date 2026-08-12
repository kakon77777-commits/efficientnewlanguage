# The arbiter asks one of the parties — A wins 4 of 4, and is right once

`the_arbiter_asks_one_of_the_parties.eml` resolves disputes between two services
three ways and grades each against the event log.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the resolver calls the status endpoint, which is the
documented source of truth. The status endpoint is served by service A. From
inside the resolver that is a neutral third source; from outside it is asking one
party to adjudicate its own dispute.

```
order  A          B          truth
  o2 : shipped  cancelled  cancelled   <- dispute
  o3 : paid  shipped  paid   <- dispute
  o7 : shipped  cancelled  cancelled   <- dispute
  o8 : shipped  cancelled  cancelled   <- dispute
  disputes : 4 of 8

resolution of the 4 disputes
  A's answer chosen : 4
  B's answer chosen : 0
  the choice was correct : 1 of 4
  replaying the log is correct : 4 of 4
```

**The metric this produces is what keeps the design alive:**

```
each service's accuracy, measured against the event log
  A correct : 5 of 8
  B correct : 7 of 8

the same two services, ranked by the dispute record instead
  A won 4 disputes, B won 0
  a perfect record, produced by the arbiter rather than by A
```

A is the *less* accurate service. Its unbeaten dispute record is a property of
the resolver, not of A — and that record is the reason given for continuing to
treat A as authoritative.

Both services have real defects, and only one of them ever gets attributed:

```
orders each service gets wrong
  A : o2 says shipped, log says cancelled
  B : o3 says shipped, log says paid
  A : o7 says shipped, log says cancelled
  A : o8 says shipped, log says cancelled
```

Nothing is declared: each order's true status is derived by replaying its
events, and all three resolvers are graded against that.

An arbiter is defined by what it is independent *of*. This one is independent of
B.

**Where this round ends up.** Rounds 60 and 61 were about a defect that cannot be
seen; this round is about what happens once it can. Every tie-breaker measured
here — a majority, a tolerance, a decimal place, an alarm count, an authoritative
endpoint — resolves toward the side with more shared lineage or more habit, and
each one is defensible on its own.

Verify it yourself:

```bash
pnpm eml run examples/the-arbiter-asks-one-of-the-parties/the_arbiter_asks_one_of_the_parties.eml
```
