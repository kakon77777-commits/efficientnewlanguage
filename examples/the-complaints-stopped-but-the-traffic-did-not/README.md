# The complaints stopped but the traffic did not

`the_complaints_stopped_but_the_traffic_did_not.eml` - A deprecated API stopped generating complaints and was scheduled for removal on that basis. Complaints and calls are counted separately below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The deprecation was handled properly. Eighteen months of notice, a banner in the docs, a deprecation header on every response, two emails to registered integrators and a migration guide with worked examples. The team did more than most teams do, and the complaint rate really did fall to nothing.

A complaint requires a caller who notices, knows where to complain, and expects it to help. Traffic requires only a caller. The two curves answer different questions, and only one of them was consulted before scheduling the removal.

Both are counted, per quarter, below.

```
quarter   calls/day   complaints   integrators replying   closed wontfix
  Q1        41000        34            12                     2
  Q2        38000        21            9                     6
  Q3        36000        11            5                     8
  Q4        34000        4            2                     4
  Q5        33000        1            1                     1
  Q6        32000        0            0                     0
```

```
complaints : 34 -> 0
  a fall of 100%, and the removal was scheduled on this line
calls per day : 41000 -> 32000
  a fall of 21%
```

```
the two lines, indexed to Q1 = 100
  Q1 : calls 100, complaints 100
  Q2 : calls 92, complaints 61
  Q3 : calls 87, complaints 32
  Q4 : calls 82, complaints 11
  Q5 : calls 80, complaints 2
  Q6 : calls 78, complaints 0
  one of these fell by 22 points and the other by 100
```

```
complaints per million calls
  Q1 : 829 per million
  Q2 : 552 per million
  Q3 : 305 per million
  Q4 : 117 per million
  Q5 : 30 per million
  Q6 : 0 per million
  the rate falls as well as the count, so this is not only a traffic effect
```

```
the 8 integrators who ever complained
  migrated               : 3
  still calling the old API : 5
  their combined traffic : 29000 calls a day
  which is 90% of what the old API still serves
  every one of them stopped complaining, and 5 of them stopped only
  complaining
```

```
tickets closed as wontfix : 21
  against 71 complaints in total, so 29% were closed that way
  a caller who complains twice and is told twice that the deprecation
  stands has learned what complaining does, and the third time is not
  recorded anywhere
```

```
the removal, scored on each line
  on the complaint line : 0 parties affected
  on the traffic line   : 32000 calls a day
  integrators still calling : 5
  the two answers differ by everything, and they are answers to different
  questions
```

```
what could have been measured instead
  distinct callers on the old API in Q6 : available from the access log
  calls per caller                      : available from the access log
  whether a caller has a migrated twin  : available from both logs
  cost of taking those measurements     : one query
  the complaint count was used because it was the number already on the
  dashboard, not because it was the one that answers the question
```

```
control - a second deprecation
  before : 12000 calls a day, 9 complaints
  after  : 0 calls a day, 0 complaints
  here the traffic went to zero too, so the silence is the same fact as
  the absence, and removing it breaks nobody
```

The deprecation was run properly and the complaints really did stop. Complaining takes a caller who expects it to work, and calling takes only a caller, so 32000 calls a day are still arriving from people who gave up.

Verify it yourself:

```bash
pnpm eml run examples/the-complaints-stopped-but-the-traffic-did-not/the_complaints_stopped_but_the_traffic_did_not.eml
```
