# The upstream guard makes the downstream guard dead — and the dead one is wrong

`upstream_guard_makes_the_downstream_guard_dead.eml` runs six orders through
two validators in series, then through the second one alone.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: both validators check the same rule — a line must have a
positive quantity. The first uses `<= 0`. The second uses `< 0`, so it lets a
zero through. In the pipeline that never matters, because nothing with quantity
zero survives the first check to reach the second.

```
with the upstream guard in place
  upstream rejected   : 3
  downstream rejected : 0
  accepted            : 3
  invalid accepted    : 0

with the upstream guard removed
  downstream rejected : 1
  accepted            : 5
  invalid accepted    : 2
```

**The second validator's reject branch has never run against real data:**

```
downstream validator, outcomes reachable through the pipeline
  reject branch reached : 0 times
  accept branch reached : 3 times

downstream validator, outcomes reachable when called directly
  reject branch reached : 1 times
  accept branch reached : 5 times
```

The disagreements exist and are invisible:

```
orders the two validators disagree about
  b qty 0: upstream 0 downstream 1
  e qty 0: upstream 0 downstream 1
  total: 2
```

The upstream guard removes exactly the orders the two disagree about.

**This is not an argument for deleting the second check.** It is an argument
for noticing that its correctness has never been observed. The day the first
check moves, is replaced by a schema, or stops running for one code path, the
second becomes load-bearing for the first time — and it is wrong.

Composition did not hide a bug behind a bug. It made the second check's
**answer unobservable**, which is a different and quieter thing.

Verify it yourself:

```bash
pnpm eml run examples/upstream-guard-makes-the-downstream-guard-dead/upstream_guard_makes_the_downstream_guard_dead.eml
```
