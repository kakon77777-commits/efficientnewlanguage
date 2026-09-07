# The retention was promised in days and the buffer held events

`the_retention_was_promised_in_days_and_the_buffer_held_events.eml` - The log retention policy says thirty days, is written down, is cited in three audits, and the store enforces it. What the store enforces is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The policy is a real policy. It is not folklore: it is written, it names the period rather than saying reasonable, it was chosen against the investigation needs rather than against the storage bill, it is cited in three audit responses, and the store is genuinely configured to delete records older than thirty days rather than keeping them forever.

The store is a fixed-size ring. It deletes at thirty days OR when it is full, whichever comes first, and at today's write rate it is full in four.

Nothing alerts when the oldest record is younger than the policy.

```
retention promised, days        : 30
  in hours                      : 720
audits citing the policy        : 3
```

```
store, GB                       : 4000
written per day, GB             : 1000
  the store therefore holds, days : 4
  in hours                      : 96
  as a share of the promise     : 1333 per ten thousand
  days promised beyond the store: 26
```

```
alerts on the oldest record     : 0
investigations needing an older window : 6
```

```
the retention policy
  written down : yes, not folklore
  names a period : 30 days, not `reasonable`
  chosen against : the investigation needs, not the bill
  cited in audit responses : 3
  is the store configured to enforce it : yes, it deletes
    at 30 days rather than keeping forever
  verdict : POLICY ENFORCED
```

```
  naming the period and choosing it against the need is
  what makes this a policy instead of a default
```

```
what the store does
  rule one : delete records older than 30 days
  rule two : delete the oldest when the ring is full
  which one fires : whichever comes first
  at 1000 GB a day into 4000 GB, that is : rule two
  hours actually held : 96
  hours promised       : 720
```

```
  both rules are correctly implemented; the policy names
  one of them and the capacity decides
```

```
the two denominations
  the policy is stated in : days
  the store is sized in   : gigabytes
  what converts between them : the write rate
  who controls the write rate : every team that logs
  who reviews the conversion : nobody; it is not a
    number either document contains
  days promised beyond what the store holds : 
    26
```

```
the drift
  changes to the policy : none
  changes to the store size : none
  changes to the write rate : many, each small
  was any of them wrong : no
  which of the three has a review process : the first
    two
  which one moved : the third
```

```
the audit answer
  question asked : how long are logs retained
  answer given   : 30 days, with the policy attached
  is the policy real : yes
  is the store configured to it : yes
  what nobody queried : the timestamp of the oldest
    record in the store
  what that query returns : 96 hours
  audits given the 30-day answer : 3
```

```
null control - alert on the age of the oldest record
  policy : 30 days, unchanged
  alerts on the oldest record : 1
  investigations surprised by an empty window : 
    0
  the store did not get bigger; the gap between the
  promise and the contents became a thing that reports
```

```
what an enforced retention policy guarantees
  nothing older than the period is kept : exactly, and
    that is the direction the policy was written to bound
  everything inside the period is kept : not addressed;
    the policy states an upper bound in time and the
    store enforces an upper bound in bytes
```

```
a policy expressed in one unit and a mechanism sized in
another are joined by a rate nobody owns; the policy stays
true, the store stays correct, and the quantity between them
moves without either document changing
```

The policy is written, names 30 days rather than saying reasonable, was chosen against the investigation needs, is cited in 3 audits, and the store deletes at that age rather than keeping forever. The store is 4000 GB and 1000 GB arrive a day, so it holds 96 hours against 720 promised - 1333 per ten thousand - with 0 alerts and 6 investigations that found it empty.

Verify it yourself:

```bash
pnpm eml run examples/the-retention-was-promised-in-days-and-the-buffer-held-events/the_retention_was_promised_in_days_and_the_buffer_held_events.eml
```
