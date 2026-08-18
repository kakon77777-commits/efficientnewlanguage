# Muting the alert removed the only evidence

`muting_the_alert_removed_the_only_evidence.eml` - Two alerts were muted in the same week. Their histories since are identical. Only one of the two conditions stopped.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Muting the noisy one was right. It fired hundreds of times for a handful of real events, and an alert that is wrong that often trains people to close it without reading, which costs more than the alert buys. Turning it off was a considered decision with a number behind it.

What the mute also did was remove the only thing counting the condition. From that week on, both conditions produce the same alert stream - nothing - and a reader of that stream has no way to tell a condition that stopped from a condition that is no longer being watched.

Both conditions are counted here against a source that is not the alert.

```
months : 8, both alerts muted after month 4
```

```
                      before the mute      after the mute
  cache stampede
    alerts fired      18                    0
    really happened   18                    0
  retry storm
    alerts fired      375                  0
    really happened   30                   31
```

```
since the mute both alert histories read 0, and they are the same number
the conditions behind them differ by 31 occurrences
```

```
the case for muting the retry storm alert
  alerts before the mute : 375
  real events behind them: 30
  of every 100 alerts, this many were real : 8
  it was wrong far more often than right, and people had stopped reading it
```

```
a reviewer reading the alert history for months 5 to 8
  cache stampede alerts : 0
  retry storm alerts    : 0
  both flat at zero, so both read as resolved
  one of the two is still occurring, 31 times, and the history says nothing about it
```

```
month by month, from the source that is not the alert
  month 5 : stampede 0, retry storm 7
  month 6 : stampede 0, retry storm 8
  month 7 : stampede 0, retry storm 9
  month 8 : stampede 0, retry storm 7
  the alert stream is identical across every one of those rows
```

```
a monthly heartbeat instead of a mute
  heartbeats that would have been sent : 4
  each says the check ran and found the count, including when the count is 0
  a missing heartbeat is then itself the alert, and the noise problem is
  solved by reporting a number rather than by firing on every event
```

```
control - a third alert, never muted
  alerts in months 5 to 8 : 0
  real occurrences        : 0
  the same zero as the muted pair, and here it carries information
  because an occurrence would have produced a line
```

Muting the noisy alert was a good decision made from a real number. It also removed the only instrument counting the thing, and a zero from an instrument that cannot fire is the same zero either way.

Verify it yourself:

```bash
pnpm eml run examples/muting-the-alert-removed-the-only-evidence/muting_the_alert_removed_the_only_evidence.eml
```
