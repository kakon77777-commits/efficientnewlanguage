# The disk was doubled and the retention policy relaxed

`the_disk_was_doubled_and_the_retention_policy_relaxed.eml` - Storage was doubled and was full again in four months. Whether the data rate grew is computed below, separately from whether the policy did.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Doubling the disk was the right call. The array was at 94%, deletion was being done by hand under time pressure, and two people had spent a weekend choosing what to drop. Buying capacity to stop that happening is exactly what capacity is for.

Retention was set to 30 days when 30 days was what fitted. It was not a finding about how long anybody needs data - it was a finding about how much disk there was. When the disk grew, the constraint that had produced the number went away, and the number moved without anybody deciding to change a policy.

The bytes arriving and the bytes kept are computed separately below.

```
month   capacity TB   retention   GB/day arriving   TB used   percent full
  Jan     40            30          1200              36        90%
  Feb     40            30          1240              37        92%
  Mar     80            30          1250              37        46%
  Apr     80            60          1260              74        92%
  May     80            60          1280              75        93%
  Jun     80            90          1290              79        98%
```

```
capacity  : 40 -> 80 TB, multiplied by 2
used      : 36 -> 79 TB
percent full : 90% -> 98%
```

```
how much data arrives
  Jan : 1200 GB a day
  Jun : 1290 GB a day
  growth : 7%
```

```
how long it is kept
  Jan : 30 days
  Jun : 90 days
  growth : 200%
```

```
the same six months under each variable held fixed
  arrival rate held at 1200 GB/day, retention as it moved : 108 TB
  retention held at 30 days, arrival as it moved     : 38 TB
  actual : 79 TB
  capacity : 80 TB
  with the policy held, the doubled disk is still under half full
  with the rate held, the policy alone overruns the original array
```

```
every change to the retention setting
  Apr : 30 -> 60 days
    the month before (Mar) the array was 80 TB and 46% full
  Jun : 60 -> 90 days
    the month before (May) the array was 80 TB and 93% full
  changes made with the array under half full : 1
  changes made with it already over half full : 1
  so they are not the same decision twice: the first was taken because
  the space was there, and the second because it was running out, which
  is the first one's consequence arriving
  neither was a review of how long the data is needed for
```

```
where the original number came from
  30 days at 1200 GB/day : 36 TB
  array at the time              : 40 TB
  headroom                       : 4 TB
  the policy was the largest window that fitted, so it recorded the disk
  size rather than a requirement
```

```
queries per month, by how old the data is
  1 days old : 41000 queries, 807 per 1000
  7 days old : 9000 queries, 177 per 1000
  30 days old : 700 queries, 13 per 1000
  60 days old : 40 queries, 0 per 1000
  90 days old : 3 queries, 0 per 1000
  queries against data older than 30 days : 43, 0 per 1000
  the two retention extensions cover 0 queries in a thousand and
  41 TB of the array
```

```
control - an archive with a seven-year statutory window
  Jan : 10 TB capacity, 2555 days retention, 9 TB used, 90% full
  Jun : 20 TB capacity, 2555 days retention, 9 TB used, 45% full
  retention did not move, because it is not the team's to move
  doubling the disk took it from 90% to 45% full and left it there
```

Buying disk to stop weekend deletions was correct and it stopped them. The 30 days was a measurement of the old array, so doubling the array moved the policy, and the arrival rate grew 7% across the same period.

Verify it yourself:

```bash
pnpm eml run examples/the-disk-was-doubled-and-the-retention-policy-relaxed/the_disk_was_doubled_and_the_retention_policy_relaxed.eml
```
