# The crontab was utc and the report was local

`the_crontab_was_utc_and_the_report_was_local.eml` - The scheduler runs in UTC, which is the right choice and was made deliberately. What the daily report covers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Running the scheduler in UTC is correct and it was a decision, not a default. A scheduler on local time skips an hour once a year and runs an hour twice on another day; on UTC every job runs exactly once, the interval between two runs is always the same, and the incident that produced this policy was a double-billed hour.

The report the job produces is read by people, and it says "yesterday". The query behind it takes a local day, because a business day is local.

The job runs at 02:00 UTC. The office is UTC+8.

```
office offset, hours       : 8
job runs at, UTC           : 2
which is local            : 10
```

```
hours of today already elapsed when it runs : 10
hours of today not yet happened             : 14
share of today the report can see           : 4166 per ten thousand
```

```
runs per job per day       : 1
skipped or doubled runs    : 0
```

```
the scheduler
  timezone            : UTC, chosen rather than defaulted
  jobs skipped in a spring transition : 0
  jobs run twice in an autumn one     : 0
  interval between two runs : always the same
  policy written after      : a double-billed hour
  verdict             : CORRECT
```

```
  a local-time scheduler has both failure modes and this
  one has neither
```

```
the two days
  the scheduler's day : a UTC day, uniform, 24 hours
  the report's day    : a local day, because a business
    day is local
  the word on the page: yesterday
  which yesterday     : the local one, computed from the
    instant the job happens to run
```

```
  each system's choice is right for what it does, and the
  report is where they meet
```

```
the report generated at 10:00 local
  covers          : the previous local day, completely
  is correct      : yes
  is stamped with : the date it ran
  read as covering: that date, by everyone who opens it
  the day it actually covers : the one before
```

```
the same job for an office at UTC minus 6
  job runs at, local : -4, which is the previous day
  the report's yesterday : two local days back
  the same code, the same schedule, a different answer
```

```
null control - the window from a stated date, not from now
  runs per day        : 1, unchanged
  skipped or doubled  : 0, unchanged
  reports covering the wrong day : 0
  the scheduler stayed on UTC, which is right; the report
  stopped deriving its window from when it happened to run
```

```
what a UTC scheduler guarantees
  every job runs once, at a fixed interval : exactly, and
    a local-time scheduler cannot
  the output covers the period a reader means : not
    addressed; a period a person names is local, and the
    job knows only the instant it started
```

```
UTC is right for scheduling and wrong for reporting, and the
boundary between them is a job that computes its window from
its own start time
```

The scheduler is on UTC deliberately, after a double-billed hour, and it has 0 skipped and 0 doubled runs where a local-time scheduler has both. It fires at 2:00 UTC, which is 10:00 in the office, 4166 per ten thousand of the way through the local day, so the report is stamped with the date it ran and covers the one before - and for an office at UTC minus 6 it covers two.

Verify it yourself:

```bash
pnpm eml run examples/the-crontab-was-utc-and-the-report-was-local/the_crontab_was_utc_and_the_report_was_local.eml
```
