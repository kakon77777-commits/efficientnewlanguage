# The limit was raised for everyone who asked

`the_limit_was_raised_for_everyone_who_asked.eml` - The default rate limit has not moved in three years. Which callers are still on it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Raising it on request is the right process. Each raise was justified with real traffic, approved by someone who checked, and none of them has caused a problem. Handing everybody a higher limit by default would have cost capacity for callers who do not need it.

The default is what a caller gets by not asking, and it was set for the traffic of three years ago. Every raise is a caller stepping off it, so the set left on the default is the set that never asked - and the default has been drifting away from all of them the whole time.

Each caller's limit is compared with its own traffic.

```
callers : 8
  raised on request : 3
  still on the default of 600 : 5
```

```
caller          limit   peak   headroom   asked
  checkout   6000    4100   1900       yes
  search   6000    5200   800       yes
  mobile bff   6000    5800   200       yes
  reporting   600    540   60       no 
  partner etl   600    720   -120       no 
  webhooks   600    610   -10       no 
  admin tools   600    90   510       no 
  batch import   600    950   -350       no 
```

```
callers on the default whose peak exceeds it : 3 of 5
  partner etl : peak 720 against a limit of 600, over by 120
  webhooks : peak 610 against a limit of 600, over by 10
  batch import : peak 950 against a limit of 600, over by 350
  each of those is being throttled, and none of them has asked
```

```
mean headroom
  callers who asked : 966
  callers who did not : 18
  the callers who asked have more room, which is what asking bought
```

```
the default limit
  set : 3 years ago, at 600
  raised since : never, because no single caller's request is a request to
  change the default
  callers whose traffic has outgrown it : 3
```

```
how a throttled caller appears
  to the platform : within policy, no action needed
  to the caller   : intermittent 429s they may read as their own bug
  to the process  : nothing, because no request was made
  the process is complete and correct about every request it received
```

```
setting the default from current traffic instead
  highest peak among all callers : 5800
  a default at 1.2x that         : 6960
  callers who would still need a raise : 
    0
  requests the process would then receive : the ones that are genuinely
  exceptional, which is what an exception process is for
```

```
control - a default recomputed from traffic every quarter
  callers silently over their limit : 0, by construction of the recompute
  requests still needed : only from callers above the recomputed level
  the difference is not the fairness of the process; it is whether the
  starting point is a measurement or a memory
```

Every raise was justified with real traffic and approved by someone who checked. The default is what a caller gets for not asking, and it was set for traffic that no longer exists.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-raised-for-everyone-who-asked/the_limit_was_raised_for_everyone_who_asked.eml
```
