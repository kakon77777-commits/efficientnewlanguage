# The fix from last time was in place - 1 of 5 paths closed, and 4 incidents still to come

`the_fix_from_last_time_was_in_place.eml` runs every path to the outage against every guard, so "would the existing fix have stopped this" is answered by enumeration rather than by memory.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the first postmortem was good. It found a real cause, the fix was deployed and never regressed, and the check still catches what it was built to catch. What it caught was one of the ways this outage happens - the incident's name covers several distinct mechanisms, and a fix is scoped to a mechanism while a repeat is counted by the name.

```
ways this outage can happen : 5
guards in place after last year : 1
```

```
path                                          closed by an existing guard
  config reload races the health check   yes
  a dependency returns 200 with an empty body   no
  the retry budget is shared across tenants   no
  clock skew expires the token early   no
  the pool is drained by a slow leak   no
```

```
  closed : 1 of 5
  open   : 4
```

```
the path that ran last year : config reload races the health check
  it is closed. The fix works and has not regressed.
```

```
the path that ran this year : the retry budget is shared across tenants
  it was never closed, because it was never seen
```

```
what the two incidents share
  the symptom : the same
  the alert   : the same
  the title in the incident log : the same
  the path    : different
  so the log reads as a repeat, and the fix reads as having failed
```

```
at one path closed per incident
  paths still open        : 4
  incidents still to come : 4
  and each will close one and read as a repeat of the last
```

```
a guard at the point where every path converges
  paths it closes : 5 of 5
  paths the five per-cause guards close : 5
  same coverage, and one of them exists after one incident
```

```
control - an incident whose name covers one mechanism
  paths : 1, closed : 1
  here one postmortem finishes the job, and a repeat would be a real regression
```

The fix did not fail and the postmortem was not shallow.

The **control** is an incident whose name covers exactly one mechanism - there one postmortem finishes the job and a repeat would be a real regression. Root-cause analysis is not the defect; the defect is counting repeats by a name that spans five causes.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-from-last-time-was-in-place/the_fix_from_last_time_was_in_place.eml
```
