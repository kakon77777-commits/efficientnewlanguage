# The order the workers finished changed the total

`the_order_the_workers_finished_changed_the_total.eml` - Three workers return partial sums and the reducer adds them as they arrive. What the total depends on is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding partials in completion order is the right way to write a reducer. It holds nothing, it starts as soon as the first result lands, and addition is associative, so the order the results arrive in does not matter.

Addition of floating-point numbers is not associative. Where the partials differ greatly in magnitude, a small one added to a large one is discarded, and whether that happens depends on which two arrive first. The reducer is correct and its answer is a function of the scheduling.

Every ordering of the same three partials is enumerated here.

```
three partial sums
  credit : 1e+16
  debit  : -1e+16
  fee    : 1.0
the true total is the fee, because the credit and the debit cancel
```

```
arrival order            total
  credit debit fee        1.0
  credit fee debit        0.0
  debit credit fee        1.0
  debit fee credit        0.0
  fee credit debit        0.0
  fee debit credit        0.0
```

```
distinct totals across the six orderings : 2
```

```
orderings that produce the true total of 1.0 : 2 of 6
orderings that lose it entirely           : 4
```

```
what selects the ordering in production
  which worker finishes first, which is scheduling
  nothing in the reducer, the data, or the request
  so the same job run twice can return two different totals with no code
  change and no input change
```

```
adding smallest magnitude first
  fee, then credit, then debit : 0.0
adding largest magnitude first
  credit, then debit, then fee : 1.0
  the large-first order recovers the true total here
  the small-first order does not, on this input
  neither order is right in general; what is right is a function of the
  values, which is why the answer is not a property of the reducer
```

```
sum() over the same three, in each of two orders
  credit debit fee : 1.0
  fee credit debit : 1.0
  the builtin gives the same answer for both, because it carries the
  part a plain + would drop
```

```
control - three partials of similar size
  three orderings : 243.5, 243.5, 243.5
  identical, so a job like this one can never show the dependence
```

The reducer adds what it is given in the order it is given, and every one of those additions is correct. Which additions happen is chosen by the scheduler, and one of the choices keeps the fee.

Verify it yourself:

```bash
pnpm eml run examples/the-order-the-workers-finished-changed-the-total/the_order_the_workers_finished_changed_the_total.eml
```
