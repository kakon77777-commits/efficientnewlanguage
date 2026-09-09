# The upgrade was rehearsed from the version nobody is on

`the_upgrade_was_rehearsed_from_the_version_nobody_is_on.eml` - The database upgrade was rehearsed twelve times on restored copies of production, timed to the minute, with the rollback rehearsed alongside it. Which upgrade was rehearsed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rehearsal is serious. It runs against a copy restored from a real backup rather than a seeded fixture, so the data volume and the index bloat are the real ones; the clock is wall clock and the maintenance window was sized from it; the rollback is rehearsed in the same session rather than assumed; and nothing is signed off until a rehearsal has completed twice in a row.

The rehearsal cluster runs the previous version. The fleet does not all run the previous version.

```
clusters in the fleet           : 380
  on the previous version       : 134
  two versions behind           : 118
  three versions behind         : 92
  four versions behind          : 36
  starting somewhere else       : 246
  represented by the rehearsal  : 3526 per ten thousand
```

```
rehearsals run                  : 12
  hours of rehearsal            : 84
  hours per rehearsal           : 7
  rollbacks rehearsed           : 12
```

```
upgrade steps in the fleet      : 4
  the rehearsal covered         : 1
  never rehearsed               : 3
  steps covered                 : 2500 per ten thousand
format changes, previous to this: 0
format changes, three back to two : 1
```

```
the upgrade rehearsal
  the copy : restored from a real backup, so the data
    volume and the index bloat are the real ones
  the clock : wall clock, and the maintenance window was
    sized from it, not estimated
  the rollback : rehearsed in the same session, not
    assumed
  sign-off : only after two consecutive clean runs
  runs : 12, 7 hours each
  verdict : REHEARSED
```

```
  restoring a real backup rather than seeding a fixture
  is the part almost nobody does, and it is why the
  window is a measurement
```

```
the starting point
  what the rehearsal cluster runs : the previous version
  what the fleet runs : 4 different starting versions
  clusters the rehearsal stands for : 134
  clusters it does not : 246
  format changes on the rehearsed step : 
    0
  format changes on a step further back : 
    1
```

```
  twelve clean runs of one path are twelve pieces of
  evidence about that path
```

```
a cluster three versions behind
  is the target version the same : yes
  is the procedure the same : yes, the runbook does not
    branch on the starting version
  does it cross a format change : yes, 
    1 of them
  was that crossing rehearsed : no
  clusters in that position or older : 
    92 plus 36
```

```
null control - rehearse from every version in the fleet
  hours per rehearsal : 7, unchanged
  rehearsals run : 48
  upgrade steps covered : 4
  clusters represented : 380
  the rehearsal did not become more realistic; it was
  started from the places the fleet is actually in
```

```
what twelve clean rehearsals guarantee
  the upgrade from the previous version works : exactly,
    on real restored data, timed, with a rollback, twice
    consecutively
  the upgrade works : not addressed; 246 of 380
    clusters begin from a version no rehearsal began
    from
```

```
a rehearsal is evidence about the run it rehearsed; a
fleet at four different versions is four upgrades, and
repeating one of them twelve times says nothing about the
other three
```

The rehearsal restores a real backup, times the window on a wall clock, and rehearses the rollback in the same session - 12 runs, 84 hours. It starts from the previous version, which 134 of 380 clusters are on - 3526 per ten thousand - so 1 of 4 upgrade paths was exercised and the format change further back was met 3 times short of a rehearsal.

Verify it yourself:

```bash
pnpm eml run examples/the-upgrade-was-rehearsed-from-the-version-nobody-is-on/the_upgrade_was_rehearsed_from_the_version_nobody_is_on.eml
```
