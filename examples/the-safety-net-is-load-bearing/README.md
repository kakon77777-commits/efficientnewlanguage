# The safety net is load-bearing — and it is the only correct code in the pipeline

`the_safety_net_is_load_bearing.eml` measures what fraction of a pipeline's
correct output arrives through the reconciliation pass rather than through the
path that is supposed to produce it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the filter drops records it should keep. Months later
somebody noticed records going missing and wrote a reconciler rather than
finding the hole. It works — the output is correct:

```
the pipeline as shipped
  records that should be visible : 6
  produced by the main path      : 3
  added by the reconciler        : 3
  final output                   : 6
  missing from the final output  : 0
  present but should not be      : 0
```

**Half the answer comes through the net:**

```
share of the correct output that arrives through the net
  through the main path : 3 of 6
  through the net       : 3 of 6
  the net is not a safety margin, it is part of the answer
```

Delete it as the redundant-looking thing it is described as, and:

```
main path alone, the net removed
  lost: bo balance 0
  lost: di balance 0
  lost: ha balance 0
  records lost : 3
```

**The measurement points at a fix nobody would guess from the labels.** Remove
the *filter* instead and keep only the net:

```
the net alone, the filter removed
  records produced : 6
  missing          : 0
  wrongly present  : 0
```

The net alone is exactly right. The thing called the main path is the one
carrying the defect — it uses `balance > 0` where the rule is `balance >= 0`:

```
records the two predicates disagree about
  bo balance 0 active: filter 0, rule 1
  di balance 0 active: filter 0, rule 1
  ha balance 0 active: filter 0, rule 1
  total: 3
```

And the pressure to delete the right one is real:

```
comparisons the reconciler performs
  on 9 records : 18
  it grows with the product of the inputs, which is why someone will
  eventually propose removing it as an optimisation
```

Nothing is declared. The two predicates are two implementations of one rule and
the program runs both against the same records.

**How this differs from
[each-stage-keeps-a-different-invariant](../each-stage-keeps-a-different-invariant/).**
There, each stage holds a different property and no stage holds the one that
matters. Here both stages are about the *same* rule, one of them has it wrong,
and the correct one runs second and quietly repairs the first — which is why the
pipeline is green and why the cheapest-looking cleanup is the dangerous one.

Verify it yourself:

```bash
pnpm eml run examples/the-safety-net-is-load-bearing/the_safety_net_is_load_bearing.eml
```
