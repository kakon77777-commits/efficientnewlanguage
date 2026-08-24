# The shim is maintained so the migration never finishes

`the_shim_is_maintained_so_the_migration_never_finishes.eml` - A compatibility shim translates between an old schema and a new one. One person maintains it by hand. What that does to the migration is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The shim is good work. It has carried every field correctly for two years, it handles four edge cases the automated converter never did, and writing it was the right call - without it the cutover would have needed every consumer migrated in one weekend, which is how the previous attempt failed.

A migration finishes when the old path stops working. The shim's whole purpose is to keep it working. So every quarter the shim is maintained is a quarter in which no consumer has to move, and the person keeping the old path alive is the reason the new one is still optional.

Consumers are counted by which schema they read, each quarter.

```
quarter   on old   on new   shim edge cases   his days on the shim
  Q1        14        0        2                 9
  Q2        12        2        3                 7
  Q3        11        3        3                 6
  Q4        11        3        4                 8
  Q5        10        4        4                 7
  Q6        10        4        4                 6
  Q7        10        4        5                 9
  Q8        9        5        5                 8
```

```
consumers moved across 8 quarters : 5
consumers still on the old schema  : 9
his days spent on the shim         : 60
```

```
migration rate
  quarters elapsed : 8
  consumers moved  : 5
  remaining        : 9
  quarters to finish at the observed rate : 14
  which is 3 years
```

```
the decision a consumer team makes each quarter
  cost of migrating now      : 4 to 12 days of their own work
  cost of not migrating now  : 0, the shim carries them
  date the old path stops working : not set
  every one of those teams is making the correct call with the information
  in front of it, and the information is that nothing forces the move
```

```
shim edge cases over time
  Q1 : 2
  Q2 : 3
  Q3 : 3
  Q4 : 4
  Q5 : 4
  Q6 : 4
  Q7 : 5
  Q8 : 5
  2 -> 5, growing by 3 across the period
  each new edge case is a behaviour the old path has that the new one must
  eventually reproduce, so the migration target moves every time the shim
  gets better at its job
```

```
his days per quarter : 7
across 8 quarters   : 60 days
consumers migrated in that time : 5
  his days per consumer migrated : 12
  and none of those days were spent migrating anybody - they were spent
  making it unnecessary
```

```
the same eight quarters with a shutdown date announced in Q1
  consumers on the old schema at Q1 : 14
  cost to migrate all of them       : 112 days of consumer-team work
  his shim days that would not be needed : 60
  net : 52 days more work in total
  so the shim is genuinely cheaper in aggregate, and it is cheaper by
  moving work from many teams onto one person indefinitely
```

```
the quantity that decides when this stops
  consumers remaining : 9, falls slowly
  shim maintenance cost : 7 days a quarter, flat
  shim edge cases : 5, rising
  a shutdown date : none
  of those four, only the last one can terminate the process, and it is
  the only one that is not a measurement
```

```
control - legacy auth, shutdown announced two quarters ahead
  consumers at announcement : 9
  quarters to complete      : 2
  shim still maintained     : 0 days a quarter
  same shape of problem, same size, and the difference is that the old
  path had a date on which it stopped working
```

The shim carries every field correctly and it prevented a one-weekend cutover that had already failed once. A migration ends when the old path stops working, and 60 days of good work have kept it working.

Verify it yourself:

```bash
pnpm eml run examples/the-shim-is-maintained-so-the-migration-never-finishes/the_shim_is_maintained_so_the_migration_never_finishes.eml
```
