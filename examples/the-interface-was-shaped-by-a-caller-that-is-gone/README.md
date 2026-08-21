# The interface was shaped by a caller that is gone

`the_interface_was_shaped_by_a_caller_that_is_gone.eml` - Six features of this interface exist because of one integration. That integration was retired two years ago. What still depends on each is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Shaping the interface around the caller was right. There was one consumer, its needs were real and specific, and designing for a hypothetical second consumer instead of the actual first one is how interfaces end up serving nobody.

When that consumer goes, its requirements do not leave with it. They are now properties of a published interface that other callers have arrived at and written against, so each one is either dead weight or has been picked up by somebody who never needed it in the first place.

Each feature is checked against the callers that exist now.

```
features shaped by the retired integration : 6
  now used by nobody      : 3
  picked up by other callers : 3
```

```
feature                    exists because                        callers   cost
  synchronous mode   the retired integration could not poll   0         3
  the flat response shape   their parser was hand-written   4         1
  the legacy date format   their platform predated ISO   1         2
  batch size capped at 50   their gateway timed out   0         2
  the duplicated id field   they read one and wrote the other   2         1
  the sync-only error code   their retry logic keyed on it   0         1
```

```
maintenance cost per release : 10
  spent on features with no caller : 6, which is 60%
```

```
features other callers now depend on : 3
  callers depending on them : 7
  the flat response shape : 4 caller(s), and it exists because their parser was hand-written
  the legacy date format : 1 caller(s), and it exists because their platform predated ISO
  the duplicated id field : 2 caller(s), and it exists because they read one and wrote the other
  none of those callers asked for the shape; they wrote against what was
  there, which is what every caller does
```

```
removing an adopted feature
  callers broken : 7
  the original reason : gone
  the current reason  : 7 callers, which is a reason that did not
  exist when the feature was designed and is now the only one
```

```
removing an orphaned feature
  callers broken : 0
  cost recovered : 6 per release
  what stops it  : it is published, so removal is a version bump, and a
  version bump costs every caller including the 7 who use other parts
```

```
what is recorded about why each feature exists
  in the interface itself : nothing; a shape has no reason attached
  in the design doc       : the integration's name, which now resolves to
  nothing
  the reason survived exactly as long as the people who were in the room
```

```
control - a feature two independent consumers asked for
  original callers : 2
  if one retires : the requirement still has a caller and a reason
  the difference is not the design work; it is whether the reason was ever
  attached to more than one party
```

Designing for the actual caller was right and designing for a hypothetical one is how interfaces serve nobody. The caller left and its requirements stayed, and other callers have since written against them.

Verify it yourself:

```bash
pnpm eml run examples/the-interface-was-shaped-by-a-caller-that-is-gone/the_interface_was_shaped_by_a_caller_that_is_gone.eml
```
