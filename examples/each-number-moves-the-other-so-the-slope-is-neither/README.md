# Each number moves the other so the slope is neither

`each_number_moves_the_other_so_the_slope_is_neither.eml` - Test count and build time move together across twelve weeks. What the slope between them measures is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Reading the relationship off the data is the right instinct and the data is good: twelve clean weeks, both quantities measured by the build system itself, no missing points. The two move together tightly, and that is a real fact about the weeks observed.

Tests make the build slower, and a slower build makes people write fewer tests. Both effects are present in every week, so the observed pairing is produced by the two together and the slope through it is neither of them.

The two effects are set separately here and the observed slope is computed.

```
weeks : 12
true effects, set independently:
  each test adds 3 seconds to the build
  one test fewer is written per 200 seconds the build sits above base
```

```
week   tests   build seconds
  1      120     760
  2      125     760
  3      126     775
  4      134     778
  5      135     802
  6      141     805
  7      140     823
  8      145     820
  9      147     835
  10      151     841
  11      151     853
  12      157     853
```

```
from the first week to the last
  tests moved by : 37
  build moved by : 93
  seconds per test, read off the pair : 2
  against a true cost of 3 seconds per test
  the reading is out by -1
```

```
what the observed pair contains
  tests pushing the build up   : yes, at 3 seconds each
  build pushing the tests down : yes, one per 200 seconds above base
  a slope through the points is one number for two effects that point in
  opposite directions, so its size depends on which one moved first
```

```
adding 30 tests for a reason unrelated to build time
  tests : 120 to 150
  build : 760 to 850
  seconds per test, measured this way : 3
  which is the true value, because nothing else moved
```

```
the question : should we delete 40 slow tests
  answered with the observed slope : the build changes by -80 if the
    slope is read as causal, and the pair drifts back afterwards
  answered with the exogenous figure : 120 seconds faster, and then the
    second effect adds tests back, one per 200 seconds recovered
  the second answer has both terms and the first has one number standing
  in for both
```

```
control - the same weeks with no discouragement effect
  tests moved by 56, build by 168
  slope : 3
  equal to the true cost, so with one direction the slope is the effect
```

Twelve clean weeks, two quantities measured by the same system, and they move together. Each is moving the other, so the line through them is a number belonging to neither.

Verify it yourself:

```bash
pnpm eml run examples/each-number-moves-the-other-so-the-slope-is-neither/each_number_moves_the_other_so_the_slope_is_neither.eml
```
