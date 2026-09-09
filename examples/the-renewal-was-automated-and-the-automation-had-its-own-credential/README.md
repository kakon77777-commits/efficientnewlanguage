# The renewal was automated and the automation had its own credential

`the_renewal_was_automated_and_the_automation_had_its_own_credential.eml` - Certificate renewal is fully automated across two thousand one hundred certificates, runs thirty days before expiry, and has gone four years without an expiry incident. What the automation needs in order to run is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The automation is good. It renews on a schedule rather than on an alert, so there is a month of slack rather than an emergency; a renewal that fails is itself alerted on and sixty-one such failures have been caught and fixed; the monitor watches the certificate that is actually served rather than the one in the store; and nothing about it depends on a person remembering.

It authenticates to the certificate authority with a credential of its own. That credential is issued by hand.

```
certificates under automation   : 2100
renewals a month                : 175
months of operation             : 48
automated renewals so far       : 8400
days before expiry a renewal runs : 30
renewal failures caught         : 61
expiry incidents                : 0
```

```
the agent's own credential
  lifetime, months              : 24
  renewals due so far           : 2
  renewals performed            : 2
  people who have ever done it  : 1
  runbook steps written for it  : 0
  monitors watching its expiry  : 0
  days of notice last time      : 0
```

```
automated runs per manual run   : 4200
certificates depending on the manual path : 2100
```

```
the renewal automation
  when it runs : 30 days before expiry, on a
    schedule, so a failure has a month of slack
  what the monitor reads : the certificate the server
    actually presents, not the one in the store
  failures caught and fixed : 61
  expiry incidents in 48 months : 0
  dependence on a person remembering : none
  verdict : AUTOMATED
```

```
  monitoring the served certificate rather than the
  stored one is the part almost nobody does, and it is
  why the 61 failures never became incidents
```

```
two paths, and how often each runs
  the renewal of a certificate : 8400 times
  the renewal of the credential that permits it : 
    2 times
  so automated runs per manual run : 
    4200
  runbook for the manual one : 0 steps
  people who have done it : 1
```

```
  the exercised path stands on an unexercised one, and
  the unexercised one is the only path to the exercised
  one
```

```
the credential renewal, two years ago
  how it was noticed : renewals began failing
  days of notice before that : 0
  what the monitor said : that the certificates were
    fine, which they were, for another 
    30 days
  who fixed it : the 1 person who had done it before
  what was written down afterwards : 
    0 steps
```

```
null control - monitor and rehearse the credential too
  expiry incidents : 0, unchanged
  monitors watching the agent credential : 
    1
  days of notice : 45
  times that path has been exercised : 
    4
  the automation did not change; the path it stands on
  was given the same treatment as the path it runs
```

```
what four years without an expiry guarantees
  a certificate is renewed before it expires : exactly,
    8400 times, 30 days early, 61 failures caught
  the renewal will happen next time : not addressed; it
    requires a credential issued by hand, watched by 
    0 monitors, renewed by 1 person
```

```
the frequency of a path is not the strength of the system
that contains it; a path run four thousand times for every
one run of its prerequisite has been tested four thousand
times and its prerequisite twice
```

Renewal runs 30 days early on a schedule, the monitor reads the served certificate, and 61 failures were caught across 8400 renewals with 0 expiry incidents. It authenticates with a hand-issued credential renewed 2 times by 1 person - 4200 automated runs per manual one - under 0 monitors and 0 written steps.

Verify it yourself:

```bash
pnpm eml run examples/the-renewal-was-automated-and-the-automation-had-its-own-credential/the_renewal_was_automated_and_the_automation_had_its_own_credential.eml
```
