# The last point is the whole trend

`the_last_point_is_the_whole_trend.eml` - The last month is down. The year is up. Both are read off the same twelve numbers.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Reading the latest point first is not a mistake. It is the newest information, it is the only one that could still be acted on, and every other point is already spent. A reviewer who ignored it would be ignoring the only month anyone can still change.

What it cannot do is say which way things are going, because one step is not a direction. How often the newest step agrees with the direction is a property of the series, and it is enumerated here rather than assumed.

```
months : 12
  100 104 101 108 106 112 110 117 115 121 124 119 
```

```
two readings of the same series
  latest step : -5
  first to last : 19
  the newest step is down and the year is up
```

```
reading the direction from the latest step alone
  points where it agrees with the run so far : 5
  points where it disagrees                  : 5
  agreement rate : 50%
```

```
reading it from a two-month window
  agrees : 8, disagrees : 1
  agreement rate : 88%
```

```
the steps themselves
  up   : 6
  down : 5
  net  : 19
  a series can go up while 5 of its 11 steps go down
```

```
what each reading supports
  latest step : something broke last month, investigate it
  whole series : the thing is working, keep going
  both are true statements about the same twelve numbers
```

```
control - a series that really reversed
  latest step   : -10
  first to last : 10
  consecutive down steps at the end : 3
  here the newest points are the evidence and the total is the stale read
```

The latest number is the only one still actionable, and it is one step. Which of the two readings is right is a fact about the series, not about which number arrived most recently.

Verify it yourself:

```bash
pnpm eml run examples/the-last-point-is-the-whole-trend/the_last_point_is_the_whole_trend.eml
```
