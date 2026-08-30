# The fallback value was plausible

`the_fallback_value_was_plausible.eml` - When a sensor does not answer, the reader returns the last known value. The dashboard shows a steady line. What a steady line means here is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Returning the last value is correct and it was chosen against the alternatives. Returning an error propagates a transient network blip into a page that will not render; returning zero puts a number into the average that is not a temperature; returning null makes every consumer handle absence, and they will handle it differently. Last-known is the least wrong of four options and somebody thought about all four.

A fallback is a value with a different provenance and the same type. The one thing this fallback lacks is any way to be recognised as one, because it is a reading that was true, only not now.

So a dead sensor and a stable one produce the same output, and the more stable the process being measured, the less anybody can tell.

```
sensors                    : 96
readings per sensor per day: 2880
readings per day           : 276480
sensors not responding     : 7
hours they have been dead  : 41
```

```
the readings
  measured                 : 256320
  substituted, per day     : 20160
  substituted since silent : 34440 over 41 hours
  marked as substituted    : 0
  distinguishable by type  : no, both are integers
  distinguishable by range : no, the last value was in range
```

```
  share substituted : 729 per ten thousand
```

```
sensor state      what the dashboard shows
  healthy, stable   a flat line
  dead              a flat line
  healthy, drifting a moving line
```

```
  the first two rows are the same picture, and the difference
  between them is the whole question
```

```
the stuck-value alert
  compares consecutive readings : yes
  fires when they are identical for a threshold : yes
  fired for these 7 sensors : 0
```

```
  it did not fire because the fallback is the last value,
  so consecutive readings ARE identical - which is the
  condition, and the alert is looking at the substitution
  rather than through it
```

```
the fleet average
  readings entering it     : 276480
  that reflect a measurement now : 256320
  the 7 dead sensors contribute a value each time
  and contribute the SAME value each time
```

```
  a stuck contributor does not widen the variance, it narrows
  it, so the average looks more trustworthy the longer a
  sensor has been dead
```

```
hour   dead sensors   substituted readings   alerts
  12     7              10080                  0
  24     7              20160                  0
  36     7              30240                  0
  48     7              40320                  0
```

```
control - is last-known the right fallback
  pages that fail to render : 0, an error would have broken them
  non-temperatures in the average : 0, a zero would have been one
  consumers handling absence inconsistently : 0
  defects in the fallback choice : 0
```

```
  every alternative is worse, and the problem is not which
  value was chosen
```

```
null control - the same value carrying its provenance
  value returned        : the last known one, unchanged
  substituted readings  : 20160, unchanged
  unmarked              : 0
  excluded from the average : the caller can now decide
  stuck-value alert     : fires, it has something to compare
  the fallback did not become better; it became visible
```

```
what makes a fallback dangerous
  being wrong        : no, a wrong value gets noticed
  being implausible  : no, that gets noticed fastest
  being plausible    : yes, because nothing downstream has a
    reason to look at it twice
```

```
the fix is not a better value; there is no value that carries
its own provenance. It is a second field, and the cost of
omitting it is paid by whichever consumer needed to know
```

Last-known is the least wrong of the four options and the other three each break something: 0 pages fail to render, 0 non-temperatures enter the average, 0 consumers handle absence inconsistently. 7 sensors have been silent for 41 hours, contributing 20160 readings a day - 729 per ten thousand - none marked, and the stuck-value alert that would catch it has fired 0 times, because the substitution satisfies the condition it is watching for.

Verify it yourself:

```bash
pnpm eml run examples/the-fallback-value-was-plausible/the_fallback_value_was_plausible.eml
```
