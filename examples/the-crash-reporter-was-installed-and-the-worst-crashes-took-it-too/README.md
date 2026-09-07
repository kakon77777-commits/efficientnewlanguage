# The crash reporter was installed and the worst crashes took it too

`the_crash_reporter_was_installed_and_the_worst_crashes_took_it_too.eml` - The crash reporter ships in every build, symbolicates, deduplicates by stack, and the top five crashes it ranked were found and fixed. What it can report is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reporting is properly done. It is in every build rather than a debug one; reports are symbolicated so a stack is readable rather than a list of addresses; they are grouped by the frames that matter instead of by message, so one defect is one entry; the queue is uploaded on next launch so a crash without network still arrives; and the five entries at the top of the list were each a real defect and each was fixed.

The reporter is code in the process that is crashing. It writes its report during the fault, so it reports the faults that leave it running long enough to write.

Three termination kinds do not.

```
install share                   : 10000 per ten thousand
top entries fixed               : 5
```

```
abnormal terminations per day   : 96000
  reported by the reporter      : 41000
  producing no report           : 55000
  share reported                : 4270 per ten thousand
  share unreported              : 5729 per ten thousand
```

```
termination kinds that take it with them : 3
reports arriving from those kinds        : 0
```

```
the crash reporting
  builds it ships in : every one, not a debug build
  stacks : symbolicated, so they are readable
  grouping : by the frames that matter, so one defect is
    one entry rather than one per message
  a crash with no network : queued and uploaded on next
    launch
  top entries that were real defects : 5 of 5
  verdict : REPORTS WHAT IT SEES
```

```
  grouping by frames rather than by message is what makes
  the ranking mean anything, and it is done right
```

```
the reporter
  runs in : the process that is faulting
  writes when : during the fault, from a handler
  what it needs : enough of the process left to run
  an uncaught exception : leaves that, so it reports
  a memory kill from outside : does not
  a watchdog termination : does not
  a fault below the runtime : does not
```

```
  the instrument is inside the thing it measures, so the
  failures it cannot survive are the ones it cannot count
```

```
the priority list
  entries : ranked by report count
  reports : 41000 a day
  terminations : 96000 a day
  what the ranking orders : the survivable kinds
  where the other 55000 sit : below every entry,
    at zero, because zero is what they report
  were the five worth fixing : yes, each was real
```

```
the second measurement
  where it runs : the server
  what it counts : sessions that stop without a clean
    close
  does it depend on the client surviving : no
  is it precise : less so; it cannot say which defect
  is it independent : yes, and that is why it is the one
    that can see the gap
```

```
the install figure
  share of builds carrying the reporter : 10000
    per ten thousand
  is that number right : yes
  what it measures : deployment of the instrument
  what a reader takes it for : coverage of the failures
  share of terminations it reports : 4270 per ten
    thousand
```

```
null control - a watcher outside the process
  install share : 10000 per ten thousand, unchanged
  terminations with a recorded reason : 96000
  terminations producing nothing : 0
  the reporter did not improve; a second instrument
  appeared that does not share the failure
```

```
what a crash reporter guarantees
  the crashes it can observe are reported, grouped and
    ranked : exactly, and fixing the top 5 was correct
  the crashes are known : not addressed; the reporter is
    a passenger, and the failures it cannot survive
    contribute nothing to the count they belong in
```

```
an instrument inside the system it measures has a blind spot
shaped exactly like its own failure; the missing entries are
not scattered but selected, and they are selected for being
the most severe
```

The reporter is in every build, symbolicates, groups by the frames that matter, queues through an offline crash, and the 5 entries at the top of its ranking were each a real defect that was fixed. It runs inside the faulting process, so of 96000 abnormal terminations a day it reports 41000 - 4270 per ten thousand - and the 55000 it cannot survive are the 3 hardest kinds.

Verify it yourself:

```bash
pnpm eml run examples/the-crash-reporter-was-installed-and-the-worst-crashes-took-it-too/the_crash_reporter_was_installed_and_the_worst_crashes_took_it_too.eml
```
