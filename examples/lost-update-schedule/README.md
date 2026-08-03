# Every interleaving, written down

`lost_update_schedule.eml` enumerates all 20 interleavings of two read-modify-write transactions and runs three strategies over every one.

**What it exercises**: lost updates are normally discussed as a
concurrency problem, which makes it sound like studying them needs
threads. It does not — the set of schedules is finite. There are no
threads here; a schedule is a list of steps naming which transaction
acts.

Measured: the naive version is correct on **2 of 20** schedules — and
being correct on *some* is exactly why it ships, because under low load
the bad interleavings never come up. An atomic increment is correct on
all 20.

Compare-and-set is the result worth stating. It never produces a value
above the expectation on any schedule — zero corruption — and it also
never silently succeeds where the naive version failed. It **refuses**,
on 18 of 20, and the caller has to retry. A design that treats a CAS
failure as an error rather than a retry has converted a lost update into
an outage, which is better and is not the same as correct. With the
serial retry included, CAS reaches the right answer on all 20.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  A:r A:m B:r A:w B:m B:w -> 101
  A:r A:m B:r B:m A:w B:w -> 101
  A:r A:m B:r B:m B:w A:w -> 101
  A:r B:r A:m A:w B:m B:w -> 101

CAS results above the expected value (would be corruption): 0
CAS results below it (a refused write, needing a retry):    18
CAS plus a serial retry of each refusal: 20/20

checks passed: 5/5
CAS is never wrong and is not always enough; the retry is part of the fix.

The naive version is correct on most schedules, which is exactly why it
ships. A test that runs two increments and checks the total passes unless
the interleaving happens to be one of the bad ones, and under low load it
never is. Enumerating the schedules turns a probability into a list.
```
