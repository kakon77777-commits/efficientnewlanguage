# The counter reset at midnight and the shift crossed it

`the_counter_reset_at_midnight_and_the_shift_crossed_it.eml` - The daily counter resets at midnight, which is what a daily counter does. When the page fires is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The counter is correct. "Errors today" means errors since the start of the UTC day, it is documented that way, the reset is atomic, and the dashboard label says today. Nobody has ever mis-implemented it and there is no drift.

The threshold on it is a statement about a RATE, written as a level, on a quantity that returns to zero at a moment nobody chose with an incident in mind. An incident that crosses that moment starts its accumulation again.

The night shift runs 22:00 to 06:00. The reset sits two hours into it.

```
errors per hour            : 1850
page threshold             : 5000
shift starts at hour       : 22
```

```
hours to threshold, uninterrupted : 3
errors discarded at midnight      : 3700
hours from shift start to the page: 5
```

```
the counter
  meaning        : errors since the start of the utc day
  documented     : yes, in those words
  reset          : atomic, at 00:00 utc
  drift observed : none
  label on the dashboard : errors today
  verdict        : CORRECT
```

```
  it is not lying and it is not misnamed; today is today
```

```
the alert as written
  condition      : errors today is above 5000
  what it is for : catching a sustained error rate
  what it reads  : a level on a quantity that is reset
  the two agree  : for any incident inside one day
```

```
  the rule and the intent coincide most of the time, which
  is why nobody has looked at it
```

```
an incident starting at 22:00
  would page at            : hour 3 of the incident
  pages at                 : hour 5
  delay, hours             : 2
  extra errors in the delay: 3700
  delay as a share of the intended time : 6666 per ten thousand
```

```
the graph at 00:00
  value before  : 3700
  value after   : 0
  shape         : a vertical drop to zero
  reads as      : the thing recovering
  is            : the day changing
```

```
null control - a sliding window instead of a calendar day
  counter correctness : unchanged, both are correct
  hours to the page   : 3
  delay, hours        : 0
  the counter did not become more accurate; the window
  stopped having an edge in the middle of the night
```

```
what a correct daily counter guarantees
  the number is the count for this day : exactly
  a threshold on it detects a rate     : not addressed;
    the count is reset on a boundary chosen by the
    calendar, and an incident does not know about it
```

```
a level on a resetting quantity is a rate alarm with a blind
spot the width of its own reset; the boundary is invisible
because it is correct
```

The counter is correct: errors since the start of the UTC day, documented, atomic reset, no drift. At 1850 errors an hour the 5000 threshold is reached in 3 hours, but an incident starting at 22:00 has 3700 errors discarded at midnight and pages 2 hours late - 6666 per ten thousand of the intended time - after 3700 more errors, on a graph whose drop to zero reads as recovery.

Verify it yourself:

```bash
pnpm eml run examples/the-counter-reset-at-midnight-and-the-shift-crossed-it/the_counter_reset_at_midnight_and_the_shift_crossed_it.eml
```
