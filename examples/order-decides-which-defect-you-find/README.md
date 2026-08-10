# Order decides which defect you find — two real bugs, one ticket

`order_decides_which_defect_you_find.eml` runs seven batches through two
validation stages in both orders and counts what gets reported.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: one stage rejects batches longer than five, the other
rejects batches containing a negative. Both limits are real. Which one gets
reported for a given batch is not a property of the batch — it is a property of
which stage sees it first.

```
  [1, 2, 3]  length-first ok  negative-first ok
  [1, 2, 3, 4, 5, 6]  length-first LENGTH  negative-first LENGTH
  [1, -2, 3]  length-first NEGATIVE  negative-first NEGATIVE
  [1, 2, -3, 4, 5, 6]  length-first LENGTH  negative-first NEGATIVE
  [4, 5]  length-first ok  negative-first ok
  [-1, 2, 3, 4, 5, 6, 7]  length-first LENGTH  negative-first NEGATIVE
  [9, 9, 9, 9, 9, 9]  length-first LENGTH  negative-first LENGTH

batches whose reported cause depends on order : 2 of 7
batches that violate BOTH rules               : 2
```

**The bug tracker's contents are a function of pipeline order:**

```
reports filed, by order
  length-first   : LENGTH 4  NEGATIVE 1
  negative-first : LENGTH 2  NEGATIVE 3
```

**And fixing the upstream one produces a wave of "new" failures that were
always there:**

```
NEGATIVE reports visible while the length rule runs first : 1
NEGATIVE reports once the length rule is fixed            : 3
batches that were always failing and never reported       : 2
```

Neither stage is wrong about its own subject:

```
each stage, judged only on its own rule
  length rule correct on   : 7 of 7
  negative rule correct on : 7 of 7
```

What order decides is not correctness — it is which failure is **observable**,
and an unobservable failure produces no ticket, no owner and no fix.

Verify it yourself:

```bash
pnpm eml run examples/order-decides-which-defect-you-find/order_decides_which_defect_you_find.eml
```
