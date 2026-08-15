# Everyone was treated, so there is no before - the mix shift hid 2.3 points of a 4.0 effect

`everyone_was_treated_so_there_is_no_before.eml` rebuilds month 3 from month 2's mix and month 2 from month 3's, so each cause can be measured separately.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: shipping to everyone is often not a choice - a pricing change, a policy, a migration: there is no version that applies to 90% of people. The experiment was not skipped, it was unavailable. What remains is before-and-after in time, and that is sound exactly when nothing else moved.

```
month   users   converted   rate
  1      1000     180        18.0%
  2      1000     180        18.0%
  3      1400     276        19.7%
```

```
the before-and-after everyone will quote
  month 2 : 18.0%
  month 3 : 19.7%
  change  : 1.7%
```

```
what differs between month 2 and month 3
  organic users : 800 -> 800
  paid users : 200 -> 600
  the change shipped in month 3, and the campaign ran in month 3
```

```
decomposition
  observed change     : 1.7%
  from the mix shift  : -2.3%
  from the change     : 4.0%
  sum of the parts    : 1.7%
  left over           : 0.0%
  the two parts account for the whole change, with nothing interacting
```

```
The mix shift alone would have made the number WORSE by 2.3%.
The reported improvement of 1.7% understates the change's own effect.
```

```
control - months 1 and 2, where nothing moved
  month 1 : 18.0%
  month 2 : 18.0%
  identical, so the comparison itself is sound
```

Before and after is a controlled comparison with time as the control. It works when time held everything else still, and whether it did is a separate question that the two numbers cannot answer.

**Two defects were caught here by reading the output rather than the code**: a `show()` that mis-rendered negative tenths (`-23` printed as `-2.7%` because `int()` truncates toward zero while `%` floors), and an unconditional line claiming the two causes interact when the measurement says they sum exactly. Both are fixed, and the interaction line is now a computed branch.

Verify it yourself:

```bash
pnpm eml run examples/everyone-was-treated-so-there-is-no-before/everyone_was_treated_so_there_is_no_before.eml
```
