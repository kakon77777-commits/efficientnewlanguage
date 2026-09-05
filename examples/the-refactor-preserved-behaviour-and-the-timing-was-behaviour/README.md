# The refactor preserved behaviour and the timing was behaviour

`the_refactor_preserved_behaviour_and_the_timing_was_behaviour.eml` - A refactor was validated by replaying millions of production inputs through both implementations. What the replay compared is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The differential test is the strong kind. It is not a suite of hand-written expectations; it captured real production inputs, ran the old and the new implementation against each of them, and compared the results byte for byte, including which exception type was raised. Four point two million inputs, no divergence in value and none in error.

What it compared is the RETURN VALUE. The old implementation gathered two hundred items into one backend call and the new one makes a call per item, so every caller sees the same answer after a different amount of time.

The downstream service's client times out at two hundred milliseconds.

```
production inputs replayed      : 4200000
outputs that differed           : 0
exception types that differed   : 0
assertions about duration       : 0
```

```
items per backend call, before  : 200
items per backend call, after   : 1
p99 before, ms                  : 38
p99 after, ms                   : 210
  increase, ms                  : 172
  after as percent of before    : 552
```

```
downstream client timeout, ms   : 200
calls per day                   : 9600000
  above the timeout             : 144000
  share                         : 150 per ten thousand
```

```
the differential test
  inputs           : captured from production, not written
  both implementations run against each : yes
  comparison       : byte for byte on the result
  errors compared  : the exception type, not just success
  inputs replayed  : 4200000
  divergences      : 0
  verdict          : EQUIVALENT
```

```
  replaying real inputs against both sides is stronger than
  any expectation somebody would have thought to write
```

```
the assertion
  one operand  : the old implementation's return value
  the other    : the new implementation's return value
  what a caller observes : the value, and when it arrives
  which of those the replay held fixed : the first
  assertions about the second : 0
```

```
  the test is exactly as strong as it looks about values
  and says nothing at all about the other observable
```

```
where the time went
  items per backend call, before : 200
  items per backend call, after  : 1
  work per item                  : unchanged
  round trips per batch          : 200 instead of 1
  what dominates the latency     : the round trip
  p99, before and after, ms      : 38 and 210
```

```
the claim as a caller reads it
  proven over          : 4200000 real inputs
  the word used        : behaviour is preserved
  what the caller has  : a client with a 200 ms timeout
  is a timeout a value : no
  is a timeout something the caller observes : yes
  calls a day now exceeding it : 144000
```

```
null control - the replay also compares durations
  outputs that differed : 0, unchanged
  inputs with a duration recorded : 4200000
  slow calls visible before the deploy : 144000
  the refactor did not get safer; the replay started
  measuring the second thing a caller can see
```

```
what a passing differential test guarantees
  the two implementations return the same value : exactly,
    over a population no hand-written suite would reach
  the two implementations behave the same        : not
    addressed; behaviour is whatever a caller can observe,
    and the assertion ranges over one of those things
```

```
an equivalence proof is only as wide as the relation it
asserts; calling that relation behaviour renames the gap
instead of closing it
```

The differential test replayed 4200000 real production inputs through both implementations and found 0 differing outputs and 0 differing exception types, which no hand-written suite would have covered. It asserted over return values and made 0 assertions about duration, so p99 moved from 38 ms to 210 ms - 552 percent of before - past a downstream timeout of 200 ms that 144000 calls a day, 150 per ten thousand, now exceed.

Verify it yourself:

```bash
pnpm eml run examples/the-refactor-preserved-behaviour-and-the-timing-was-behaviour/the_refactor_preserved_behaviour_and_the_timing_was_behaviour.eml
```
