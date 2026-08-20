# The negation was distributed by hand

`the_negation_was_distributed_by_hand.eml` - A condition was inverted to turn a skip into a keep. Which inputs the inverted form treats differently is enumerated below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Rewriting `if not (a and b): skip` as `if not a and not b: skip` is the kind of edit that gets made while cleaning up a nested block, and the new form is shorter and reads as the same sentence in English. On the inputs anybody tries by hand it usually agrees.

The negation of an `and` is an `or` of the negations. Distributing it as an `and` produces a strictly narrower condition, so it skips fewer things - and the cases it stops skipping are the ones where exactly one clause failed.

All four combinations are enumerated, and then counted over real records.

```
a   b   not (a and b)   (not a) and (not b)   agree
  1   1   0               0                     yes
  1   0   1               0                     NO 
  0   1   1               0                     NO 
  0   0   1               1                     yes
```

```
combinations where they agree : 2 of 4
  they part company exactly where one clause holds and the other does not
```

```
records : 10
  skipped by the correct form     : 6
  skipped by the distributed form : 1
  the edit lets 5 records through that should have been skipped
```

```
the records that changed
  r2 : signed but outside the window
  r4 : unsigned but inside the window
  r6 : signed but outside the window
  r9 : unsigned but inside the window
  r10 : signed but outside the window
  each is a record failing exactly one of the two requirements
```

```
records where both clauses agree with each other : 5 of 10
  on every one of those the two forms return the same answer, so a
  spot check that happens to pick them confirms the edit
```

```
the correct distribution
  not (a and b) is (not a) OR (not b)
  records skipped by the or form : 6
  the same 6 as the original, on every record
```

```
control - records that satisfy both requirements or neither
  correct form skips 1, distributed form skips 1
  identical, so a suite built from data like this cannot catch the edit
```

The rewritten condition is shorter and reads as the same sentence. It is a narrower condition, and the records it stops skipping are the ones that failed one requirement rather than both.

Verify it yourself:

```bash
pnpm eml run examples/the-negation-was-distributed-by-hand/the_negation_was_distributed_by_hand.eml
```
