# The test used a fixed seed and the library changed its generator

`the_test_used_a_fixed_seed_and_the_library_changed_its_generator.eml` - Every test seeds the generator, so every failure reproduces and the flaky-test problem is gone. What the suite has actually explored is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The determinism work was real and it paid. Before it, forty-one failures a week could not be reproduced and were reruns; every one of those was traced to an unseeded generator or an unordered iteration. Now the seed is a constant, a failing case reproduces byte for byte on a developer machine, and the flake count has been zero for a year.

A seed fixes the STREAM a generator produces. The property tests draw their inputs from that stream, so they draw the same inputs on every run, and the suite has explored those inputs and no others.

A minor version of the library replaced the algorithm behind the same seed.

```
property tests                  : 6
cases drawn per property test   : 500
draws per run                   : 3000
suite runs in the year          : 2600
```

```
unreproducible failures a week, before : 41
unreproducible failures a week, now    : 0
```

```
draws performed in the year     : 7800000
  distinct inputs among them    : 3000
  repeats of an earlier draw    : 7797000
new inputs after the first run  : 0
```

```
defects the property suite found in the year : 0
defects the first run after the upgrade found : 3
```

```
the determinism work
  unreproducible failures a week, before : 41
  unreproducible failures a week, after  : 0
  a failing case on a developer machine  : reproduces byte
    for byte
  cause of every flake traced : an unseeded generator or an
    unordered iteration
  verdict : REPRODUCIBLE
```

```
  a suite whose failures reproduce is worth more than one
  with more assertions, and this is how you get there
```

```
the stream
  what the seed determines : the sequence the generator
    produces
  where the property tests get their inputs : that sequence
  inputs on run one    : 3000
  inputs on run 2600 : the same 3000
  inputs the year added : 0
```

```
  reproducibility and exploration are both properties of
  the stream and the constant buys one by spending the other
```

```
the number on the dashboard
  property cases executed this year : 7800000
  of those, inputs not seen before  : 3000
  of those, repeats                 : 7797000
  what the number measures : executions
  what a reader takes it for : coverage
```

```
the library upgrade
  the seed        : unchanged
  the suite       : still deterministic, still reproducible
  the sequence    : different
  inputs never previously drawn : 3000
  defects surfaced by that first run : 3
  defects the same suite found in the preceding year : 0
  none of the three were introduced by the upgrade
```

```
null control - a recorded per-run seed
  a failing case reproduces : yes, from the recorded seed
  unreproducible failures a week : 0
  distinct inputs in the year    : up to 7800000
  the suite did not get less deterministic; the seed
  stopped being the same seed
```

```
what a fixed seed guarantees
  a failure can be reproduced exactly : yes, and it is the
    single most useful property a suite can have
  the random inputs are random         : not addressed; a
    seed selects one stream, and a property test that
    draws from it draws the same inputs forever
```

```
a generated input is only a sample if something varies
between samples; pinning the generator turns a property test
into a fixed table that nobody wrote down and nobody reviews
```

The determinism work is real: flakes went from 41 a week to 0 and every failure reproduces byte for byte. The seed is a constant, so the 7800000 property cases run this year were 3000 distinct inputs and 7797000 repeats, and a library upgrade that changed the algorithm behind the same seed found 3 defects on its first run, against 0 from the suite in the preceding year.

Verify it yourself:

```bash
pnpm eml run examples/the-test-used-a-fixed-seed-and-the-library-changed-its-generator/the_test_used_a_fixed_seed_and_the_library_changed_its_generator.eml
```
