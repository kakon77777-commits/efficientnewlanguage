# The backup ran nightly and the change was hourly

`the_backup_ran_nightly_and_the_change_was_hourly.eml` - The backup has succeeded every night for four hundred nights. The recovery point objective is one hour. What is actually recoverable is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: A nightly full backup at 02:00 is the right shape for this system and was chosen carefully. It runs in the quiet window, it does not contend with the day's traffic, it produces a single self-contained artifact that can be restored without replaying anything, and its integrity is verified by a checksum every morning. Four hundred consecutive successes is a real number and it was earned.

The RPO is a separate promise, written in a different document, by people who were describing what the business could tolerate rather than what the backup schedule provides. Nobody compared the two numbers, because they live in two documents and neither one mentions the other.

A backup's success rate measures whether the artifact was produced. The recovery point measures how old that artifact is when it is needed, and the schedule alone decides that.

```
backup runs at        : 2:00, nightly, full
consecutive successes : 400
changes per hour      : 4200
RPO promised          : 1 hour
```

```
failure at   hours since backup   changes lost   within the 1-hour RPO
  4:00        2                  8400          no
  8:00        6                  25200          no
  12:00        10                  42000          no
  16:00        14                  58800          no
  20:00        18                  75600          no
```

```
  hours in the day measured        : 21
  hours that meet the RPO          : 1
  worst case, a failure just before the next backup : 88200 changes
```

```
to meet a 1-hour RPO the backup must run every 1 hour
  backups per day required : 24
  backups per day scheduled: 1
  the schedule is short by a factor of 24
```

```
  no amount of backup SUCCESS closes that gap
  a backup that never fails still cannot be newer than its schedule
```

```
what 400 consecutive successes establishes
  the job runs                    yes
  the artifact is complete        yes, checksummed
  the artifact can be restored    only if a restore was actually run
  the artifact is recent enough   no, and this is not a property of the job
```

```
  the first two are about the backup
  the fourth is about the SCHEDULE, which cannot fail and therefore cannot
  appear in a success rate at all
```

```
control - is the backup doing what it says
  nights run          : 400
  nights succeeded    : 400
  corrupt artifacts   : 0
  missed windows      : 0
  failures found      : 0 of 400
  the backup is excellent and the number above is real
```

```
  it answers 'did we take a copy', and the RPO asks 'how old is it'
```

```
null control - the same nightly backup over a weekly-changing system
  changes per week        : 1
  worst-case changes lost : 1
  RPO of 1 hour           : met on most days by accident
  same schedule, same job, same success rate
  the exposure is the change rate times the interval, and only one of
  those two numbers is in the backup's documentation
```

```
two numbers that describe a backup, and where each lives
  success rate      in the job's monitoring, and it is 400 of 400
  recovery point    in the SCHEDULE, and nothing monitors a schedule
  the first is measured continuously
  the second is decided once and never observed again
  a green backup dashboard is consistent with any RPO whatsoever
```

```
the measurement that would have found this is one subtraction:
interval between backups, against the interval the RPO promises
```

A nightly full at 2:00 runs in the quiet window, produces one self-contained artifact, and has succeeded 400 nights running with a verified checksum every morning. A failure at 21:00 loses 79800 changes against an RPO of 1 hour, and the worst hour of the day loses 88200. The success rate cannot move in response to any of that, because the schedule is not something the job can fail at.

Verify it yourself:

```bash
pnpm eml run examples/the-backup-ran-nightly-and-the-change-was-hourly/the_backup_ran_nightly_and_the_change_was_hourly.eml
```
