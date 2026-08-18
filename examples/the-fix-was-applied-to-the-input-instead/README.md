# The fix was applied to the input instead

`the_fix_was_applied_to_the_input_instead.eml` - The consumer belongs to another team, so the input is cleaned before it gets there. What that covers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Cleaning at the edge was the right call. It shipped without a cross-team ticket, it fixed every shape that was actually breaking, and an edge that normalises its input is a reasonable design and not a workaround by itself.

A sanitiser is a list of shapes somebody has seen. It handles those and passes everything else through unchanged, which is the same behaviour as having no sanitiser for exactly the inputs nobody has met yet. Meanwhile the consumer's own guard stops being reached for the handled shapes, so how it behaves is no longer being observed.

Both defences are scored per shape against the same traffic.

```
malformed shapes seen : 7
items a day           : 1857
```

```
the sanitiser
  shapes it knows : 4 of 7
  items it fixes  : 1760 of 1857, which is 94%
  items it passes through unchanged : 97
```

```
of the items the sanitiser does not know
  the consumer's own guard handles : 55
  nothing handles                  : 42
  so 42 items a day are defended by neither
```

```
shape                              sanitiser   consumer guard
  trailing whitespace   yes         yes
  empty string for a number   yes         yes
  null in a required field   yes         no 
  date as dd/mm/yyyy   yes         yes
  nested object where a scalar goes   no          yes
  array with one element   no          no 
  unicode digits   no          no 
```

```
the consumer's guard, items reaching it per day
  before the sanitiser : 1555
  after the sanitiser  : 55
  down 1500, so 96% of its evidence is gone
  it has not changed and nobody knows whether it still works
```

```
when a new malformed shape appears tomorrow
  the sanitiser knows it : no, by definition
  the defence that runs  : the consumer's guard
  the last time that path ran on a shape it was written for : before the
  sanitiser shipped
```

```
the two defences compared on today's traffic
  sanitiser alone : 1760 items
  consumer alone  : 1555 items
  the sanitiser covers more of what is arriving now, by 205
  and only one of the two is reached by a shape neither has met
```

```
control - the same sanitiser rejecting anything not on its list
  items rejected at the edge : 97
  items reaching the consumer malformed : 0
  the same items, arriving as a refusal instead of as a surprise
  it costs a rejection for every shape that was merely unusual
```

The sanitiser fixed every shape that was breaking and shipped the same week. What it handles is what somebody has already seen, and it made the defence behind it stop being watched.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-was-applied-to-the-input-instead/the_fix_was_applied_to_the_input_instead.eml
```
