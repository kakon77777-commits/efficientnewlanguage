# The backup was tested and the restore was to an empty cluster

`the_backup_was_tested_and_the_restore_was_to_an_empty_cluster.eml` - Backups are not merely taken, they are restored weekly and the restored copy is checksummed, counted and smoke-tested. Which recovery that rehearses is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The drill is far past what most teams do. A backup that has never been restored is a file, and this one is restored every week by an automated job: checksums verified against the source, row counts compared table by table, and the application booted against the restored copy and driven through a smoke suite. Fifty-two drills this year, fifty-two passed, and the published recovery time objective is the time the drill actually takes.

The drill restores the whole snapshot into a freshly provisioned empty cluster. Every recovery anyone has needed this year was partial - one table, or one time range, into a cluster that is up and serving.

The backup is a physical snapshot, so a partial restore goes the long way.

```
drills this year                : 52
  passed                        : 52
  restoring into a cluster holding data : 0
  extracting a single table     : 0
  rehearsing the path used      : 0 per ten thousand
```

```
data recovery incidents         : 6
  needing a full cluster restore: 0
  needing a partial restore     : 6
```

```
published RTO, minutes          : 40
measured partial restore, minutes : 390
  beyond the published figure   : 350
  as a percent of it            : 975
```

```
the restore drill
  frequency : weekly, automated
  checksums verified against the source : yes
  row counts compared table by table    : yes
  application booted against the copy   : yes, plus a
    smoke suite
  drills this year : 52, passed 52
  verdict : RESTORABLE
```

```
  restoring rather than trusting the backup job is the
  whole difference, and this one boots the application
```

```
the rehearsed operation
  target        : a freshly provisioned empty cluster
  scope         : the whole snapshot
  concurrent load during it : none
  what it proves : the snapshot is complete, readable, and
    sufficient to stand the application up
  what a reader takes from the RTO : how long a recovery
    takes
```

```
  the drill answers the question completely and the
  question is total loss, which has not happened
```

```
the six
  clusters lost this year : 0
  incidents needing rows as of a time : 6
  target in each case : a cluster that is up and serving
  what the snapshot format allows : restore all of it
  so the procedure is : stand up a side cluster, restore
    everything, extract, copy across, reconcile
  minutes that took, measured once : 390
```

```
what an empty target never presents
  an object that already exists : never
  a sequence already ahead of the restored rows : never
  a constraint held by a row not in the snapshot : never
  a decision about which copy of a row wins   : never
  drills that meet any of these : 0
```

```
the RTO
  where it came from : the drill, measured not estimated
  what it is the duration of : a full restore into an
    empty cluster
  what a reader plans with it : the recovery they will
    actually run
  measured duration of the one they ran : 390 minutes
  as a percent of the published figure : 975
```

```
null control - half the drills rehearse a partial restore
  drills this year : 52, unchanged
  extracting a single table : 26
  into a cluster holding data : 26
  the backup did not become more restorable; the drill
  started rehearsing the recovery that gets requested
```

```
what a passing restore drill guarantees
  the snapshot is complete and readable : exactly, and
    verified by booting the application against it
  a recovery will go the way the drill went : not
    addressed; the drill fixes an initial state and a
    scope, and the recovery you get chooses both
```

```
a rehearsal is only as representative as its starting
conditions; an empty target removes every conflict a
restore can have, so the drill that proves the data is good
is the one least able to tell you how the day will go
```

The drill is real: weekly and automated, checksums against the source, row counts table by table, the application booted and smoke-tested - 52 drills, 52 passed. It restores everything into an empty cluster, while all 6 recoveries needed this year were partial into a live one, rehearsed by 0 per ten thousand of the drills, and the one measured took 390 minutes against a published RTO of 40 - 975 percent of it.

Verify it yourself:

```bash
pnpm eml run examples/the-backup-was-tested-and-the-restore-was-to-an-empty-cluster/the_backup_was_tested_and_the_restore_was_to_an_empty_cluster.eml
```
