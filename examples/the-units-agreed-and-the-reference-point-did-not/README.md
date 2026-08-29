# The units agreed and the reference point did not

`the_units_agreed_and_the_reference_point_did_not.eml` - Two services report a timestamp in seconds. The units match, the types match, and a comparison between them type-checks. What the two numbers are counted from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Agreeing on the unit is the hard part of an interface and both sides did it. The field is documented as seconds, both sides are integers, neither is milliseconds pretending to be seconds, and there is no floating point in the path. A whole class of interface bug is absent here, deliberately, because somebody thought about it.

A measurement is a magnitude and an origin. The unit fixes the magnitude. The origin is the other half, and nothing in the field name, the type, or the schema records it.

One side counts from the epoch. The other counts from when its process started. Both are seconds, and subtracting one from the other produces a number in seconds that means nothing.

```
service A reports : 1756425600 seconds
service B reports : 4830 seconds
both fields typed : integer seconds
```

```
the interface, checked
  unit on both sides       : seconds
  type on both sides       : integer
  schema validation        : passes
  millisecond confusion    : none
  floating point in path   : none
  unit mismatches found    : 0
```

```
the freshness check
  written  : A minus B, compared against 300
  computes : 1756425600 minus 4830
  result   : 1756420770 seconds
  verdict  : stale, by a very large margin
```

```
  the result in years : about 55
```

```
for the check to pass, B would have to report
  at least : 1756425300
  B's largest possible value is its uptime, which after a year
    of running would be about 31536000
  so the check cannot pass, ever, for any uptime
```

```
  a comparison that cannot return true is not obviously broken;
  it is a comparison that is always firing, and an always-firing
  alert is indistinguishable from a real problem the first time
```

```
B, expressed against the same origin
  B's process started at   : 1756420758 on the wall clock
  B's reading, as wall time: 1756425588
  A minus B                : 12 seconds
  verdict                  : fresh
```

```
  the conversion is one addition, and the number it needs
  is not in either message
```

```
where the units are checked
  the schema           : units match, accepted
  the type system      : both integers, accepted
  the linter           : nothing to say about it
  a unit-aware library : would accept, both are seconds
  the subtraction      : well typed, seconds minus seconds
```

```
  every layer that could object is asking about the unit,
  and the unit is correct at every one of them
```

```
control - did the unit agreement do its job
  fields where units disagree      : 0
  values off by a factor of 1000   : 0
  values off by a factor of 60     : 0
  schema rejections                : 0
  defects in the unit contract     : 0
```

```
  the contract is exactly as strong as it was written to be
```

```
null control - the same check when both count from the epoch
  A reports  : 1756425600
  B reports  : 1756425588
  difference : 12 seconds
  threshold  : 300
  verdict    : fresh
  same unit, same type, same arithmetic
  what changed is a fact neither message carries
```

```
what a shared unit establishes
  the two magnitudes are on the same scale : yes
  they are measured from the same point    : not addressed
  their difference is meaningful           : only given both
  and a subtraction requires the second one to be true
```

```
the field name says what is being counted; the thing to write
down beside it is what it is counted from, because a comparison
of two magnitudes is really a comparison of two origins
```

Both services report integer seconds, 0 fields disagree on units, 0 values are off by a factor of 1000, and the subtraction is well typed on both sides. A reports 1756425600 counted from the epoch and B reports 4830 counted from its own start, so the freshness check computes 1756420770 seconds - roughly 55 years - where the answer is 12, and no layer in the path has a place to record which point either number is counted from.

Verify it yourself:

```bash
pnpm eml run examples/the-units-agreed-and-the-reference-point-did-not/the_units_agreed_and_the_reference_point_did_not.eml
```
