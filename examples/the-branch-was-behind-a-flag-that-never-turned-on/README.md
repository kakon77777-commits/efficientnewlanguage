# The branch was behind a flag that never turned on

`the_branch_was_behind_a_flag_that_never_turned_on.eml` - A rewritten pricing path sits behind a feature flag. The flag has defaulted off since the day it was added. What the branch's readiness has actually been measured against is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Defaulting off was the right call and it was made deliberately. A flag that defaults on ships an unexercised path to everyone the moment it merges, and the whole reason for the flag was to decide when the branch runs rather than let the deploy decide. The branch has unit tests, it passed review, and every one of its tests has passed on every build since.

A unit test exercises a branch against the world as its author imagined it. Production exercises it against the world. The flag has held those two apart for the branch's entire life, and only the first one has ever run.

The tests call the pricing helper through a fixture, because that is what a unit test does. So the number of times this branch has met the real helper has two sources, and both of them are zero, for two unrelated reasons.

```
days since the flag was added : 400
deploys since then            : 96
unit tests on the branch      : 34
of those tests, passing       : 34
flag enabled for              : 0 percent of traffic
```

```
requests served in that time  : 960000000
of those, through the branch  : 0
```

```
where the branch could meet the real pricing helper
  in its unit tests   : 0 of 34, the rest use a fixture
  in production       : 0
  total               : 0
```

```
  two independent-looking sources of confidence, both zero,
  and zero for two reasons that have nothing to do with each other
```

```
what is reported about this branch
  line coverage         : 100 percent, all 34 tests reach it
  test failures         : 0
  production errors     : 0
  production executions : 0
```

```
  the error count and the execution count are the same number,
  and only one of them is being read
```

```
deploys since the flag was added        : 96
of those, touching the pricing helper   : 11
caught by the old path, which runs      : 11
caught by the new path, which does not  : 0
```

```
deploy   helper changed   old path notices   new path notices
  8        yes              yes                no
  16        yes              yes                no
  24        yes              yes                no
  32        yes              yes                no
  40        yes              yes                no
```

```
  the new path's tests pass at every row, because the fixture
  is the one thing in the system that cannot drift
```

```
control - did the flag do its job
  users exposed to the untested path : 0
  incidents caused by the branch     : 0
  times the flag failed open         : 0
  defects in the flag                : 0
```

```
  the flag is perfect, and being perfect is the whole mechanism
```

```
null control - the same branch at 1 percent
  branch executions in production : 9600000
  deploys that would have been caught : 11
  tests, fixture, review, coverage    : identical
  the branch is the same branch; it now runs
```

```
what a green test suite reports about an unrun branch
  the branch is correct against the fixture   : measured, and true
  the branch is correct against the helper    : not measured
  the helper has not moved                    : not measured
  and none of those three has a red state to enter
```

```
a branch that has never run in production has been tested
against one thing, and the thing it was tested against is the
one component of the system that is guaranteed not to change
```

The flag defaulted off for 400 days and protected every one of the 960000000 requests served in that time, which is exactly what it was for. Across 96 deploys, 11 touched the pricing helper; the running path noticed all 11 and the flagged path noticed 0, because its 34 tests reach it through a fixture and its production executions number 0.

Verify it yourself:

```bash
pnpm eml run examples/the-branch-was-behind-a-flag-that-never-turned-on/the_branch_was_behind_a_flag_that_never_turned_on.eml
```
