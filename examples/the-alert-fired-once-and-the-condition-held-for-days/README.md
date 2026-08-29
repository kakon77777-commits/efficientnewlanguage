# The alert fired once and the condition held for days

`the_alert_fired_once_and_the_condition_held_for_days.eml` - A disk alert fires when free space crosses below fifteen percent. It fired once. What the condition did afterwards is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Firing on the crossing rather than on the state is correct and it is what the rule was written to do. An alert that re-fires while a condition holds produces one page per evaluation interval, which for a five minute interval and a three day condition is a wall of identical pages, and the reliable outcome of that is a mute rule that outlives the incident. The team chose edge-triggered deliberately, after exactly that happened with a different rule.

An edge is a moment. A condition is a duration. The rule reports the first and the runbook asks about the second.

So the page arrived, correctly, once. Everything after that moment is recorded nowhere, because nothing crossed anything again.

```
threshold                  : 15 percent free
evaluation interval        : every 5 minutes
hours the condition held   : 72
evaluations while true     : 864
alerts fired               : 1
```

```
hour   free percent   below threshold   crossings   alerts
  0     14             yes               0          0
  24     11             yes               0          0
  48     7             yes               0          0
  72     3             yes               0          0
```

```
  the free space fell from 14 percent to 3 percent
  the number of threshold crossings in that period is 0
  because it was already below when the period began
```

```
question                                  answerable from the alert
  did free space go below 15 percent          yes
  when                                        yes
  is it still below now                       no
  how far below has it gone                   no
  how long has it been below                  no
  answerable  : 2 of 6
```

```
  the four it cannot answer are the four the runbook opens with
```

```
the acknowledgement
  free space when acknowledged : 11 percent
  cleanup running              : yes
  correct decision at that moment : yes
  alerts remaining open        : 0
```

```
  after the acknowledgement the condition continued for 72 hours
  and produced 0 further signals of any kind
```

```
between the page and the outage
  free space at the page   : 14 percent
  free space at the outage : 3 percent
  further decline          : 11 points
  evaluations that observed it : 864
  evaluations that reported it : 0
```

```
  the rule looked 864 times and said nothing 864 times,
  correctly, because nothing crossed
```

```
control - did the alert rule work
  crossings that occurred    : 1
  crossings that paged       : 1
  duplicate pages            : 0
  missed crossings           : 0
  false pages                : 0
  defects in the rule        : 0
```

```
  re-firing every 5 minutes would have sent 864 pages, which is
  how the previous rule got muted
```

```
null control - the same rule on a short-lived condition
  minutes the condition held : 20
  evaluations while true     : 4
  alerts fired               : 1
  state at acknowledgement   : already recovered
  same rule, same threshold, same edge
  what changed is the ratio of the duration to the response time
```

```
what an edge-triggered alert records
  that a transition happened : yes, exactly once, and that is the point
  the state after it         : not represented
  the duration               : not represented
  the depth                  : not represented
```

```
the answer is not to re-fire, which is the failure it was
designed away from; it is to carry the current state alongside
the transition, so the page ages instead of expiring
```

The rule paged on the crossing, once, on time, with 0 duplicates, 0 misses and 0 false pages, avoiding the 864 pages a level-triggered version would have sent over 72 hours. Across those same 864 evaluations the free space fell a further 11 points to 3 percent, and the number of signals emitted about that decline was 0, because a threshold can only be crossed from above.

Verify it yourself:

```bash
pnpm eml run examples/the-alert-fired-once-and-the-condition-held-for-days/the_alert_fired_once_and_the_condition_held_for_days.eml
```
