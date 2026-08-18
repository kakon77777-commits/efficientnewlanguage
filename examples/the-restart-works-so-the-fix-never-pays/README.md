# The restart works so the fix never pays

`the_restart_works_so_the_fix_never_pays.eml` - The process leaks and gets restarted. Whether fixing it pays is computed below rather than assumed either way.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Restarting is a real fix for the thing it is aimed at. It takes four minutes, it always works, it needs no review, and it can be done at three in the morning by whoever is on call. Against that, a proper repair is three weeks of somebody's time in a part of the code nobody has read this year.

The comparison people reach for is "a hack versus a real fix", and on the numbers that is not the comparison at all. What the restart does not cover is a different quantity from the time it costs, and that is the part the hours calculation cannot see.

Both columns are computed from the same incident record.

```
one restart          : 4 minutes
restarts per week    : 2
the repair           : 120 hours, which is 7200 minutes
```

```
weeks    restart minutes so far    repair minutes
  4        32                      7200
  26        208                      7200
  52        416                      7200
  104        832                      7200
  260        2080                      7200
```

```
restarting never overtakes the repair inside the window searched
```

```
at a five-year horizon
  restart minutes : 2080
  repair minutes  : 7200
  the restart is still cheaper, by 5120 minutes
  so on time alone, not repairing is the correct decision for five years
```

```
requests dropped, at 40 per restart
  by week 4 : 320
  by week 26 : 2080
  by week 52 : 4160
  by week 104 : 8320
  by week 260 : 20800
```

```
over five years : 20800 dropped requests
  the repair sets this to 0 and the restart cannot, at any speed
```

```
the choice, stated in the units each side is measured in
  restart : 2080 minutes of on-call time, 20800 dropped requests
  repair  : 7200 minutes of engineering time, 0 dropped requests
  the two costs are paid by different people out of different budgets, which
  is why the comparison keeps being made in minutes
```

```
adding a drain before the restart
  cost : 8 hours
  dropped requests after : 0
  restart minutes after  : 2080, unchanged
  it is 15 times cheaper than the repair and removes the same column
```

```
control - an incident the restart does not clear
  incidents : 3, cleared by restarting : 0
  here the repair is the only option, so its cost is not being compared to
  anything and gets approved on the first reading
```

Restarting is quick, reliable and correctly chosen on the minutes. The minutes are not the only column, and the other one does not shrink when the restart gets faster.

Verify it yourself:

```bash
pnpm eml run examples/the-restart-works-so-the-fix-never-pays/the_restart_works_so_the_fix_never_pays.eml
```
