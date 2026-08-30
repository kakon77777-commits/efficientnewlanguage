# The tests passed in the order they were written

`the_tests_passed_in_the_order_they_were_written.eml` - A suite of one thousand four hundred tests passes on every run. It has passed on every run for eleven months. What it passes in is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Running tests in a stable order is correct and it was chosen deliberately. A deterministic order makes a failure reproducible from the report alone, makes bisecting meaningful, and keeps the run time predictable because the expensive fixtures are built once in a known sequence. A randomised order trades all three away, and the team gave up randomisation after it produced a failure nobody could reproduce for two days.

A stable order is also a stable set of preconditions. A test that reads state some earlier test left behind passes for that reason, and it will keep passing for exactly as long as the earlier test keeps running before it.

Every test in the suite passes. Some of them are not tests of what they name.

```
tests in the suite            : 1400
consecutive green months      : 11
tests touching shared fixtures: 64
```

```
the suite
  tests passing        : 1400 of 1400
  flaky failures       : 0
  order                : fixed, by file then by line
  reproducible failures: yes, every one so far
```

```
  the last row is what the fixed order was chosen to buy
```

```
tests, by what makes them pass
  pass because the code is correct      : 1391
  pass because a predecessor ran first  : 9
  report the difference                 : 0
```

```
  share depending on order : 64 per ten thousand
```

```
one of the nine, in detail
  name                : rejects an expired token
  what it does        : calls the validator and expects a rejection
  why it passes       : the clock fixture is still advanced from
                        the test above it, so every token is expired
  passes if the code stops checking expiry : yes
  passes if run alone : no
```

```
  it is green, it has always been green, and it does not
  test expiry
```

```
what would separate them
  running the suite again        : no, same order
  running it on another machine  : no, same order
  running one test alone         : yes, for that one test
  running the suite shuffled     : yes, for all of them at once
```

```
  the first two are what continuous integration does 330 times
  a month, and neither can reach it
```

```
the same suite in a random order
  tests failing      : 9
  defects in the code they name : unknown until each is read
  defects in the tests          : 9, at minimum
```

```
  a red run is the first information this suite has produced
  about those nine in 11 months
```

```
month   runs   failures   tests that would fail shuffled
  3       90    0          9
  6       180    0          9
  9       270    0          9
  12       360    0          9
```

```
  the third column is constant and the second is what gets read
```

```
control - is the fixed order earning its place
  failures reproduced from the report alone : all of them
  unreproducible failures                   : 0
  fixture rebuilds avoided by the ordering  : 64
  defects in the ordering decision          : 0
```

```
  randomising everything costs all three and the team has
  already paid that once
```

```
null control - the same fixed order over isolated fixtures
  order                       : fixed, unchanged
  failures reproducible       : yes, unchanged
  tests depending on a predecessor : 0
  tests that would fail shuffled   : 0
  the order was never the defect; the shared state was
```

```
what a green suite in a fixed order is evidence of
  every test passes in THAT order : exactly
  every test passes on its own    : not asked
  each test asserts what it names : not asked
  and a suite that has only ever run one order has one
  observation, repeated
```

```
the cheap check is not randomising the suite, which gives up
what the order was for; it is running each test alone, once,
and keeping the list of the ones that stop passing
```

The suite passes 1400 of 1400 on every run and has for 11 months, and the fixed order it runs in is why every failure so far was reproducible from the report alone, with 0 unreproducible failures. 9 of them - 64 per ten thousand - pass because an earlier test left state behind, so they would fail shuffled and pass if the code they name stopped working, and 330 runs a month in the same order cannot distinguish that from correctness.

Verify it yourself:

```bash
pnpm eml run examples/the-tests-passed-in-the-order-they-were-written/the_tests_passed_in_the_order_they_were_written.eml
```
