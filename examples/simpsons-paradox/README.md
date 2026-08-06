# Simpson's paradox — a treatment that wins every group and loses overall

`simpsons_paradox.eml` compares two treatments on two kinds of case. A has a
better success rate on easy cases **and** on hard cases. B has a better rate
overall.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project). The numbers are constructed here
rather than taken from a published dataset.

**What it exercises**: both statements are arithmetic, both are checkable, and
they are not in conflict — the totals answer a different question than the
groups.

| group | treatment A | treatment B | winner |
| --- | --- | --- | --- |
| easy | 19/20 (95.0%) | 170/200 (85.0%) | A |
| hard | 140/200 (70.0%) | 12/20 (60.0%) | A |
| **OVERALL** | 159/220 (72.2%) | 182/220 (82.7%) | **B** |

Both arms have the same total, so nobody can explain the reversal by one being
larger. The cause is the **mix**: A was given 9% easy cases and B 91%, so A's
total is dominated by the harder subgroup's lower rate. The weights come from
who got which treatment, which is not a property of the treatment.

The check that makes the mix the cause rather than a coincidence sitting next
to it: recompute both arms with a **common mix** of 100 easy and 100 hard, and
the reversal vanishes — A wins.

All arithmetic is integer, and rates are compared by cross-multiplication
(`a/b > c/d` exactly when `a·d > c·b`), so no rounding can be blamed for any
reversal.

Verify it yourself:

```bash
pnpm eml run examples/simpsons-paradox/simpsons_paradox.eml
```

```bash
pnpm eml trace examples/simpsons-paradox/simpsons_paradox.eml --run
```
