# The guard was moved for readability

`the_guard_was_moved_for_readability.eml` - The two clauses of a condition were swapped so the important one reads first. Which inputs that changes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Putting the meaningful test first is good style and reviewers ask for it. A reader wants to see what the condition is about before seeing the bookkeeping that makes it safe to evaluate, and on almost every input the two orders accept and reject exactly the same things.

`and` stops at the first false clause, so the left clause decides whether the right one runs at all. When the right one is only defined given the left, the order is not presentation - it is the guard.

Every input is run through both orders and the difference is counted.

```
inputs : 5
the condition : the average per item is over 20, and the batch is non-empty
```

```
input              size   total   guard first   meaning first
  normal   4      100     yes           yes
  single   1      25     yes           yes
  empty batch   0      0     no            DIVIDES BY ZERO
  large   50      900     no            no 
  empty with total   0      40     no            DIVIDES BY ZERO
```

```
inputs where the two orders give the same answer : 3 of 5
inputs where the readable order divides by zero : 2
  on every other input the two are indistinguishable, which is why the
  swap passed review and passed the suite
```

```
inputs in this set with an empty batch : 2 of 5
  a suite without one of these cannot tell the two orders apart, and an
  empty batch is the input least likely to be written down as a case
```

```
when does clause order matter
  both clauses defined for every input : never
  the right clause defined only when the left holds : always
  here the right clause divides by size, so it is defined only when the
  left clause is true, and that is what makes the order a guard
```

```
the same condition with the meaning named first
  is_worthwhile = average over 20, defined for non-empty batches
  the check then reads: batch is non-empty AND is_worthwhile
  the reader sees the meaning in the name and the machine sees the guard
  in the order, and neither has to give way
```

```
control - two clauses that are defined for every input
  inputs where the two orders agree : 3 of 3
  identical under both orders, so here the swap costs nothing at all
```

The swapped condition reads better and returns the same answer on every input the suite holds. One clause is defined only when the other is true, and the order was carrying that.

Verify it yourself:

```bash
pnpm eml run examples/the-guard-was-moved-for-readability/the_guard_was_moved_for_readability.eml
```
