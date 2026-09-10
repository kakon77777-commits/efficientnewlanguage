# The coverage target was met and the assertions thinned

`the_coverage_target_was_met_and_the_assertions_thinned.eml` - Line coverage on the semantics packages has been above its eighty-five percent target for nine quarters, and the gate that enforces it is real. What rose with it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The gate is properly built. Coverage is measured on the semantics packages rather than diluted across the whole repository; a pull request that lowers it fails rather than warns; generated files are excluded by an explicit list somebody maintains rather than by a pattern that quietly grows; and the number comes from the same run that executes the tests.

It counts lines a test caused to run. A line runs whether or not anything looked at what it did.

```
lines of semantics              : 84000
coverage target                 : 8500 per ten thousand
  coverage now                  : 8620 per ten thousand
  above the target by           : 120
quarters the target has been met: 9
```

```
tests                           : 6400
  with no assertion at all      : 610
  that assert something         : 5790
  asserting nothing             : 953 per ten thousand
assertions per hundred tests
  when the target arrived       : 290
  now                           : 142
  lost                          : 148
```

```
mutants killed                  : 4100 per ten thousand
  coverage, per ten thousand lines : 8620
  mutants killed, per ten thousand mutants : 4100
mutation runs that gate a merge : 0
```

```
the coverage gate
  scope : the semantics packages, not diluted across the
    whole repository
  a pull request that lowers it : fails, not warns
  exclusions : an explicit list somebody maintains, not
    a pattern that quietly grows
  the number : from the same run that executes the tests
  quarters met : 9
  verdict : COVERED
```

```
  keeping the exclusion list explicit is the part almost
  nobody does, and it is why 8620 per ten thousand
  is about the code it claims to be about
```

```
what raises coverage
  a line counts when : a test caused it to run
  what a test must do to make a line run : call it
  what a test must do to make a line CHECKED : assert
    something about what it did
  tests that do the first and not the second : 
    610
  assertions per hundred tests, then and now : 
    290 and 142
```

```
  the cheapest way to raise the number is to run more
  lines, and running is the half it counts
```

```
mutation score, measured but not enforced
  what it asks : if the code is changed, does a test
    notice
  mutants killed : 4100 per ten thousand
  coverage : 8620 per ten thousand
  the distance between them : not a quantity;
    one is a fraction of lines and the other a
    fraction of mutants; they share a suffix and
    not a denominator
  merges gated on it : 0
  which of the two a pull request must satisfy : the
    one that counts running
```

```
null control - gate on the second instrument instead
  coverage at the switch : 
    8620, unchanged
  mutants killed at the switch : 
    4100, unchanged
  merges gated on it : 1
  no test changed on the day of the switch; the quantity
  a pull request has to move stopped being the one that
  counts execution
```

```
what a met coverage target guarantees
  8620 per ten thousand of semantics lines are executed by
    the suite : exactly, measured in the run itself,
    enforced on every pull request, 9 quarters
  the suite would notice if they were wrong : not
    addressed; 610 tests assert nothing, and the second
    instrument reads 4100 over a
    different population
```

```
a number under a gate is a number under pressure; when two
actions raise it and only one of them is the point, the
cheaper one is what a population does
```

Coverage is scoped to the semantics packages, exclusions are an explicit list, a pull request that lowers it fails, and the target has held 9 quarters at 8620 per ten thousand. It counts lines run, so assertions per hundred tests went 290 to 142, 610 of 6400 tests assert nothing, and the mutation score reads 4100 per ten thousand mutants, which is not 8620 minus anything, across 0 gated runs.

Verify it yourself:

```bash
pnpm eml run examples/the-coverage-target-was-met-and-the-assertions-thinned/the_coverage_target_was_met_and_the_assertions_thinned.eml
```
