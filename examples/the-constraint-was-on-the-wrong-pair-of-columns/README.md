# The constraint was on the wrong pair of columns

`the_constraint_was_on_the_wrong_pair_of_columns.eml` - A unique constraint on room and start time, protecting a rule about rooms not being double booked. What it accepts and what it refuses is counted below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The constraint is the right instinct. The rule belongs in the database rather than in whichever service happens to be writing, it cannot be forgotten by a new caller, and it costs nothing to enforce. Putting it on room and start time is also the obvious reading: two bookings for the same room at the same moment are exactly the thing being prevented, and the constraint prevents them, every time, correctly.

The rule is about overlap and the constraint is about equality. Equality is the special case of overlap in which two bookings begin at the same instant, and it is the whole of overlap only when every booking is the same length.

Every booking was thirty minutes when the constraint was written. The fixtures are still thirty minutes. A constraint that is exactly right on the data it was designed against does not announce the day the data changes.

```
bookings : 9
the rule : no two live bookings for one room may overlap
the constraint : (room, start) must be unique
```

```
pair    room   times                  overlaps   constraint   verdict
  1+2   R4     540-600 and 570-630   1          0            ADMITS a double booking
  2+3   R4     570-630 and 600-630   1          0            ADMITS a double booking
  4+5   R7     540-570 and 540-570   0          1            REFUSES a legal booking
  6+7   R9     480-600 and 540-570   1          0            ADMITS a double booking
```

```
  pairs where the two agree      : 32
  overlaps the constraint admits : 3
  legal bookings it refuses      : 1
  one wrong pair of columns produces both errors, in opposite directions
```

```
control - the same bookings with every duration equal
  overlaps the constraint admits : 0, was 3
  legal bookings it refuses      : 1, was 1
  on equal-length bookings equality of start IS overlap, so that half of
  the constraint is not approximately right, it is exactly the rule, and
  this is the data it was designed against and is still tested on
```

```
  the refusal does not move, so it is a second defect and not this one
  the control separates them: duration explains the admissions and
  explains none of the refusal
```

```
the refusal, looked at on its own
  booking 4 in R7 at 540 is cancelled and still occupies (room, start)
  a cancelled row is not a live booking to the rule and is a row to the
  constraint, and the constraint cannot read a state column it is not on
```

```
three ways to state the rule
  unique (room, start)                : one line, admits overlaps of
    unequal length and refuses cancelled-then-rebooked
  unique (room, start) where confirmed : fixes the refusal, still admits
    every overlap that does not start on the same minute
  exclusion on room and time range     : states the rule itself
  the first two are cheap and the third is the only one with 3 and 1 at zero
```

The rule belongs in the database and two bookings at the same instant is the obvious reading of it. Equality is the whole of overlap only when every booking is the same length: on equal durations the constraint is exact, and on these nine it admits 3 overlaps and refuses 1 legal booking.

Verify it yourself:

```bash
pnpm eml run examples/the-constraint-was-on-the-wrong-pair-of-columns/the_constraint_was_on_the_wrong_pair_of_columns.eml
```
