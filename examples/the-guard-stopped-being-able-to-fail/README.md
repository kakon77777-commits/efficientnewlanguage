# The guard stopped being able to fail — same green, 1 guard alive, then 0

`the_guard_stopped_being_able_to_fail.eml` drills every test in a suite by
breaking the code it guards and re-running it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the test checks that a discount cap is enforced. When it
was written its fixture was above the cap, so removing the cap turned it red —
a real guard. Later somebody refreshed the fixtures to smaller, more typical
amounts. The test was not touched. The cap was not touched.

```
the suite as it was when the guard was written
  with the cap enforced : 3 of 3 pass
  with the cap removed  : 2 of 3 pass
  tests that can still fail if the cap is removed : 1

the same suite after the fixtures were refreshed
  with the cap enforced : 3 of 3 pass
  with the cap removed  : 3 of 3 pass
  tests that can still fail if the cap is removed : 0
```

```
what changed between the two suites
  test names unchanged  : 2 of 3
  assertions unchanged  : 2 of 3
  fixture amounts changed : 1
  (premise, not measured here: no test code was edited - only fixture data)
```

**The cap is still load-bearing:**

```
orders on which removing the cap changes the answer
  amount 300 : capped 50, uncapped 90
  amount 900 : capped 50, uncapped 270
  amount 1000 : capped 50, uncapped 300
  affected : 5 of 6
```

**And a green run cannot tell the two suites apart:**

```
what a green run reports, in each suite
  original fixtures : all pass
  refreshed fixtures : all pass
  guards alive, original  : 1
  guards alive, refreshed : 0
  the refreshed suite is green and guards nothing
```

One fixture restores it:

```
after adding one fixture above the cap
  with the cap enforced : 4 of 4
  with the cap removed  : 2 of 4
  guards alive          : 2
```

Nothing is declared: each test is drilled — the code it guards is broken and the
test re-run — so *ability to fail* is measured rather than assumed.

A guard that cannot fail and a guard with nothing to catch produce the same
green. Telling them apart costs one deliberate break, and nothing in a passing
run will ever prompt you to spend it.

**Where this closes round 65.** The other four cases each show a "fixed" signal
that is downstream of a choice made by the person being checked — the tested
domain, the suite's assertions, the reporting population, the verification
inputs. This one is the same shape in time: a check that was genuinely
independent when written, and became downstream of a fixture refresh nobody
connected to it.

Verify it yourself:

```bash
pnpm eml run examples/the-guard-stopped-being-able-to-fail/the_guard_stopped_being_able_to_fail.eml
```
