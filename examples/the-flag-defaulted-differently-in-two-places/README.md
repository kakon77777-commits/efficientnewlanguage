# The flag defaulted differently in two places

`the_flag_defaulted_differently_in_two_places.eml` - One feature flag, read by the server and by the browser. Each side has a default for when the flag service cannot be reached. What the two defaults do together is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both defaults were chosen deliberately and both are the safe choice in their own frame. The server defaults ON, because the new code path is now the tested one and the old branch has not run in production for a month; failing to a branch nobody exercises is how you turn an outage into two. The browser defaults OFF, because the old interface is the one that certainly renders, and a blank page is the worst thing a client can do. Each side reasoned about its own failure, correctly, and reached the opposite answer.

A flag is not a property of a service. It is a property of a request that two services must agree on. Neither default is wrong; the pair is, and a pair has no owner.

```
one flag, two readers, two defaults
  server default : ON
  browser default: OFF
```

```
server   browser   agree   what the request does
  ON       ON        yes    new format sent, new format parsed
  OFF      OFF       yes    old format sent, old format parsed
  ON       OFF       no     new format sent, old parser reads it
  OFF      ON        no     old format sent, browser wants the new field
```

```
  combinations           : 4
  combinations that break: 2
  two sides choosing independently land on a broken pair with probability 50 percent
  and this pair is one of the two
```

```
the flag service is measured at 999 per mille available
  minutes per year it cannot be reached : 526
  requests per minute                   : 6000
  requests that fall back to the defaults: 3156000 per year
  of those, requests where the two sides disagree: 3156000
```

```
  the disagreement is not probabilistic
  when the flag service is down, EVERY request takes the broken pair,
  because both defaults are constants
```

```
what each team tested
  server team : flag service unreachable from the server
                server falls back to ON, browser still reads the flag
                browser gets ON, both sides ON, request works
  browser team: flag service unreachable from the browser
                browser falls back to OFF, server still reads the flag
                server reads OFF, both sides OFF, request works
```

```
  both fallback tests pass
  the failure needs ONE outage visible to BOTH, which is the actual outage
  and is the case neither test constructed
```

```
control - is either default wrong for its own failure mode
  server ON  : avoids running a branch that has not executed in a month
               correct, and the alternative is worse
  browser OFF: avoids rendering an interface that may not have its data
               correct, and the alternative is a blank page
  defaults that are wrong on their own : 0 of 2
```

```
  a review of either side approves it
  there is no review whose scope is 'the pair'
```

```
null control - the same outage, both sides defaulting OFF
  server default : OFF
  browser default: OFF
  minutes per year unreachable   : 526
  requests hitting the defaults  : 3156000
  requests that break            : 0
  same outage, same duration, same fallback code
  agreeing on the wrong answer costs nothing; disagreeing costs everything
```

```
a flag read in more than one place
  each reader needs a default            true
  each default should be locally safe    true
  the defaults must be the SAME value    this is the one nobody owns
  because it is not a property of either reader
```

```
the fix is not a better default on either side
it is one default, written once, that both sides read
```

Defaulting the server ON avoids falling into a branch that has not run in a month. Defaulting the browser OFF avoids rendering an interface without its data. Both are right about the failure each team considered. Together they are one of the 2 combinations of 4 that cannot serve a request, and for the 526 minutes a year the flag service is unreachable, every one of the 3156000 requests in that window takes it.

Verify it yourself:

```bash
pnpm eml run examples/the-flag-defaulted-differently-in-two-places/the_flag_defaulted_differently_in_two_places.eml
```
