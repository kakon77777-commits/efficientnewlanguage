# The zone was dropped and the value stayed valid

`the_zone_was_dropped_and_the_value_stayed_valid.eml` - The zone was dropped at one hop and every timestamp is still a well-formed timestamp. How many of them now mean a different moment is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The hop that drops it is not careless. Its storage column is a naive timestamp, which is the right type for a value that is already normalised, and the team that owns it normalises everything to one zone on the way in. Within that system every value is correct and comparable.

A timestamp with the zone removed is not malformed. It parses, it sorts, it renders, and it is wrong by exactly the offset that was removed. Nothing in the chain has a shape to reject, so the error arrives as data rather than as a failure.

Every record is carried through the hop and the shift is counted.

```
records : 7
record   local hour   offset   true UTC hour   read as UTC after the hop
  e1     9           0       9            9
  e2     14           8       6            14
  e3     22           8       14            22
  e4     3           -5       8            3
  e5     17           8       9            17
  e6     11           -5       16            11
  e7     6           0       6            6
```

```
records whose meaning changed : 5 of 7
records already in UTC, unaffected : 2
  those are correct before and after, and they are the ones a developer
  in that zone would have used as fixtures
```

```
what each value looks like to a validator after the hop
  values in the valid hour range : 7 of 7
  every one of them, so a schema check on the field passes for all
  the value is not out of range, it is the wrong moment in range
```

```
records where the true UTC time is on a different calendar day
  count : 0
```

```
largest shift in the set : 8 hours
  the error is a constant per record and not random, so an average over
  many records is shifted rather than noisy, and looks like a real pattern
```

```
what a zone-carrying type would have done at the same hop
  values it accepts : the ones with a zone
  values it rejects : the ones without
  the hop would have failed on the first record instead of the report
  failing on the wrong day three weeks later
```

```
control - a source that emits UTC only
  records whose meaning changed : 0 of 3
  none, so this source cannot show that the hop drops anything
```

The storage type is right for values that are already normalised and the team that owns it normalises on the way in. What arrives from elsewhere is still a valid timestamp afterwards, and that is why nothing objects.

Verify it yourself:

```bash
pnpm eml run examples/the-zone-was-dropped-and-the-value-stayed-valid/the_zone_was_dropped_and_the_value_stayed_valid.eml
```
