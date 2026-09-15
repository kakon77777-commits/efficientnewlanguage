# The first seen was read as the first time

`the_first_seen_was_read_as_the_first_time.eml` - A cohort report counts accounts acquired in the first month, and it reads the earliest recorded activity for every account correctly. What the earliest record actually marks is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It reads the real earliest recorded timestamp, not an estimate; it covers every account; it takes the true minimum; and the intent is exactly 'when did the account first become active'.

Logging began on the window's first day, and any activity before then was never recorded, so a pre-existing account's earliest record is the window start, not its real first activity.

```
accounts                        : 500000
  truly first active in month 1 : 40000
  pre-existing, clamped to day 1 : 200000
```

```
counted as new by first-seen    : 240000
truly new in month 1            : 40000
spurious new accounts           : 200000
spurious share of the count     : 8333 per ten thousand
```

```
the acquisition count
  reads : the real earliest recorded timestamp
  covers : every account
  takes : the true minimum of the recorded times
  intent : when did the account first become active
  accounts omitted : 0
  verdict : 240000 ACCOUNTS FIRST SEEN IN MONTH 1
```

```
  taking the real minimum recorded time over every account
  is the part done right here, and it is why a genuinely
  new account's first-seen is exact
```

```
the earliest recorded activity
  when logging began : the window's first day
  activity before that : happened, but was never recorded
  so a pre-existing account's minimum record : is the
    window start, not its real first activity
  what first-seen therefore marks : the observation
    boundary, for anyone older than it
  the tell : 200000 accounts share the exact first-day
    timestamp
```

```
the result of the cohort report
  accounts it calls new : 240000
  accounts that are actually new : 40000
  pre-existing accounts counted as new : 200000
  is the minimum computed wrong : no; it is the true min of
    what was recorded
  is first-seen the first time : no; the record starts at
    the window, and everything earlier is left-censored
```

```
null control - treat first-seen on day 1 as censored, not as new
  clamped accounts counted as new, before : 200000
  clamped accounts counted as new, after : 0
  accounts that remain genuinely new : 40000
  no account and no timestamp changed; the first-day pile-up
  stopped being read as an acquisition date and started
  being read as the edge of the record
```

```
what an earliest-recorded-activity count guarantees
  it is the true minimum of the recorded timestamps :
    exactly, real times, every account, honest min
  it is when the account first became active : not
    addressed; logging began at the window start, so a pre-
    existing account's minimum is that boundary - 200000 old
    accounts are counted as new
```

```
the first record is the first time you were watching, not the first time it
happened; everything before the window collapses onto the window's edge, and a
minimum taken there measures when observation started, not when the thing did
```

It takes the true minimum recorded time over every account - a genuinely new account is dated exactly. But logging began at the window start, so 200000 pre-existing accounts pile onto day 1 and are counted as new; 8333 per ten thousand of the acquisition count is left-censoring, until day-1 is read as censored.

Verify it yourself:

```bash
pnpm eml run examples/the-first-seen-was-read-as-the-first-time/the_first_seen_was_read_as_the_first_time.eml
```
