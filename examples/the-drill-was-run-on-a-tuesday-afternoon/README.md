# The drill was run on a tuesday afternoon

`the_drill_was_run_on_a_tuesday_afternoon.eml` - The regional failover is drilled every quarter with real traffic, timed end to end, and the recovery time has been under half an hour every time. When the drills happen is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The drill is not a tabletop. Traffic is actually shifted to the secondary region and served from it for an hour; the primary is actually made unreachable rather than politely drained; the clock runs from the moment the first alert fires to the moment error rates return to baseline; and a drill that misses the target is a finding rather than a rounding.

Every drill so far has begun on a weekday afternoon with the team assembled. The event it stands in for does not choose its hour.

```
drills run                      : 16
  years of drills               : 4
  begun outside working hours   : 0
  mean recovery, minutes        : 22
```

```
engineers in the room, a drill  : 9
  reachable at 0340 on a holiday: 2
  the difference                : 7
  roster present at night       : 2222 per ten thousand
```

```
steps in the failover runbook   : 31
  needing a second approver     : 6
  share needing two             : 1935 per ten thousand
  approvers on the night rota   : 1
  approvers such a step needs   : 2
  approvers short at night      : 1
  steps that wait at night      : 6
  one person can take           : 25
decisions left to judgement     : 4
```

```
real failovers                  : 1
  minutes                       : 96
  beyond the drill mean         : 74
  against the drill             : 43636 per ten thousand
```

```
the failover drill
  traffic : actually shifted and served from the
    secondary for an hour
  the primary : actually made unreachable, not drained
  the clock : from the first alert to error rates back
    at baseline
  a miss : recorded as a finding, not rounded
  runs : 16 over 4 years, mean 22 minutes
  verdict : RECOVERS
```

```
  making the primary genuinely unreachable rather than
  draining it is the part almost nobody does, and it is
  why the 22 minutes are a measurement
```

```
the conditions every drill shared
  the hour : a weekday afternoon, 16 times out of 16
  who was present : 9, in one room
  approvals : available immediately, in person
  the 4 judgement calls : made by whoever knew
    most, without waiting
  drills begun outside those conditions : 
    0
```

```
  the system was varied and the people were not; the
  runbook's slowest steps are the ones with a person in
  them
```

```
the same runbook at 0340 on a holiday
  engineers reachable : 2
  steps needing a second approver : 
    6
  approvers on the rota : 1
  approvers short of what a step needs : 
    1
  so steps that wait for somebody to wake : 
    6, all of them
  judgement calls, with the person who knew most asleep :
    4
  what the one real event took : 96 minutes
```

```
null control - begin one drill unannounced, at night
  drills run : 16, unchanged
  begun outside working hours : 1
  minutes that one took : 96
  the failover did not get slower; the condition the
  drills had all shared was allowed to vary
```

```
what sixteen clean drills guarantee
  the failover completes with the team assembled :
    exactly, real traffic, real unreachability, mean
    22 minutes, 4 years
  the failover completes : not addressed; 6 steps wait
    for an approver who is not on the rota and 
    4 decisions wait for a person
```

```
a rehearsal varies what it was built to vary; holding the
hour and the room constant across every run makes them one
observation repeated, and the untested variable is the one
the real event chooses
```

Traffic is really shifted, the primary is really made unreachable, the clock runs to baseline, and 16 drills over 4 years average 22 minutes. All 16 began on a weekday afternoon with 9 people in a room, against 2 reachable at 0340 on a holiday, 6 steps waiting for an absent approver - and the one real failover took 96 minutes, 43636 per ten thousand of the drill mean.

Verify it yourself:

```bash
pnpm eml run examples/the-drill-was-run-on-a-tuesday-afternoon/the_drill_was_run_on_a_tuesday_afternoon.eml
```
