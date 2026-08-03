# Validating first is not a way back

`partial_write_rollback.eml` replays a transfer history against three write strategies and checks the one invariant that can see the damage.

**What it exercises**: a two-step update that fails halfway leaves a
state no single operation produced. Measured: the direct strategy loses
**250**, and every *other* invariant still holds — no negative balances,
all integers, the same account set. That is why the total is the only
check that works.

The `checked` strategy took two corrections and both are recorded. It
first validated only the *source*, and every failure in the attempt list
came from the destination, so it scored identically to the naive
version — a pre-check protects against the failures it names. After
checking both sides, a per-account ceiling enforced inside the write
still leaves the half-applied state, because the caller does not know
the rule exists. It now loses 200 instead of 250.

Note what "better" had to be measured as: both broken strategies hold
the invariant on **zero** attempts, because once money is lost it stays
lost and every later check fails too. Only the amount separates them.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
money lost by checked: 200
money lost by journal: 0

properties that hold for ALL THREE, including the one that lost money:
  no negative balance:  True / True / True
  all integers:         True / True / True
  same account set:     True / True / True

checks passed: 5/5
Only the rollback keeps the total. Every other invariant survives the loss.

Validating first is a real improvement and is not a fix. It removes the
failures you can enumerate; the half-applied state is caused by the ones you
cannot. The difference between the two is not how careful the code is - it
is whether there is a way back, which has to be built before the write
rather than reasoned about after it.
```
