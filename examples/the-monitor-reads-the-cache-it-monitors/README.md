# The monitor reads the cache it monitors — 0 of 6 stale ticks caught

`the_monitor_reads_the_cache_it_monitors.eml` grades three freshness monitors
against what was actually served.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the monitor is written the way every other consumer is
written — call the data access layer, look at what comes back. That is the
correct way to build a client and the wrong way to build a monitor, because the
data access layer is the thing under suspicion. Asked whether the cache is
stale, it compares the cache against itself.

```
  ticks where the served value was stale: 6 of 12

monitor                     caught  false alarms
  reads through the cache : 0 of 6     0
  reads the source        : 6 of 6     0
  alarms every tick       : 6 of 6     6

The cache-reading monitor never fires. It has one outcome, so it is
not measuring anything - it is reporting that a value equals itself.
```

**The always-alarming monitor is in the program on purpose.** It catches every
stale tick, which is exactly why a detection count alone is not a score:

```
The always-alarming monitor catches every stale tick, which is why
detection is only half a measurement. Its 6 false alarms are the
other half, and the direct monitor raises 0.
```

**And the blind monitor does not get better as the problem gets worse:**

```
the same three monitors as the refresh interval is stretched
  refresh every 1 : stale 0, cache-monitor caught 0, direct caught 0
  refresh every 2 : stale 0, cache-monitor caught 0, direct caught 0
  refresh every 3 : stale 6, cache-monitor caught 0, direct caught 6
  refresh every 4 : stale 6, cache-monitor caught 0, direct caught 6
  refresh every 6 : stale 8, cache-monitor caught 0, direct caught 8
```

The first two rows are worth as much as the rest: at a refresh interval fast
enough to keep up with the source there is genuinely nothing stale, and the
direct monitor correctly reports nothing. It is not simply always-on.

A monitor is not a consumer. Every other component should reach the data the
same way the users do; this is the single component that must not, and it is
the one most likely to be written by copying a consumer.

Verify it yourself:

```bash
pnpm eml run examples/the-monitor-reads-the-cache-it-monitors/the_monitor_reads_the_cache_it_monitors.eml
```
