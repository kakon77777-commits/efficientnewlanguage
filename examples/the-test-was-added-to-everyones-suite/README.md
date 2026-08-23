# The test was added to everyones suite

`the_test_was_added_to_everyones_suite.eml` - One team added a 40-second test to the shared pre-merge suite. What it protects and what it costs are both computed below, and the answer is not that the test is bad.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The test is good. It reproduces a real corruption bug that reached production twice, it is deterministic, it fails for exactly one cause, and it was written carefully by someone who had just spent a week on the incident. A reviewer looking at that pull request should approve it, and one did.

The test runs in the shared pre-merge suite, so it runs on every change in the repository. The person who decided to add it pays its cost once, when they write it. Everybody else pays it on every merge, forever, and none of that appears in the pull request that adds it.

Both sides are counted below.

```
tests in the shared suite here : 4
suite time per run             : 66 seconds
runs per day                   : 180
```

```
test                    seconds   protects              incidents it catches
  ledger reconciliation   40        the corruption bug     2
  schema round trip   3        migration drift     1
  auth token expiry   1        an expired-token path     0
  image thumbnailer   22        an encoder upgrade     1
```

```
the 40-second test
  the author paid : one afternoon, once
  everyone pays   : 40 seconds on every merge
  per day         : 7200 seconds of waiting
  per year        : 27600 minutes, which is 460 engineer-hours
```

```
the honest comparison
  incidents of this class in the last two years : 2
  cost of one such incident : 90 engineer-hours
  hours the test saves per two years : 180
  hours the test costs per two years : 920
  the test does not pay for itself on waiting time alone
```

```
where the merges are
  ledger : 12 merges a day, can trigger this test: yes
  frontend : 74 merges a day, can trigger this test: no
  docs : 31 merges a day, can trigger this test: no
  infra : 22 merges a day, can trigger this test: no
  search : 41 merges a day, can trigger this test: no
  merges a day        : 180
  merges that could possibly fail this test : 12
  which is 6%
  so 94% of the runs cannot fail and cannot pass informatively
```

```
the same test, run only on merges that touch the ledger
  seconds a day : 7200 -> 480
  reduction     : 93%
  incidents it would still catch : 2 of 2
  because a corruption bug in the ledger arrives in a ledger merge
  the protection is identical and the cost is not
```

```
what the reviewer could see in the pull request
  lines added         : visible
  the bug it prevents : visible, it is in the test name
  seconds it adds     : visible if you time it
  merges per day it will run on : not in the diff
  engineer-hours a year         : not in the diff
  the reviewer approved the part of the change that was in front of them,
  and every number that would have changed the decision is a property of
  the repository rather than of the change
```

```
control - auth token expiry, 1 second
  a second on 180 merges is 180 seconds a day
  small enough that where it runs does not change the answer
  the externality is not the test, it is the ratio between how long
  it takes and how often it runs somewhere it cannot fail
```

The test is well written, it catches a real bug, and approving it was right. It runs 180 times a day and can fail on 12 of them, and neither of those numbers was in the change that added it.

Verify it yourself:

```bash
pnpm eml run examples/the-test-was-added-to-everyones-suite/the_test_was_added_to_everyones_suite.eml
```
