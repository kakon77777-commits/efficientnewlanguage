# Ternary chains

`ternary_decision_table.eml` exercises EML's `cond ? a : b`, which the
corpus had almost no coverage of before this.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Three properties, each checked rather than asserted:**

**1. Equivalence with `if`/`elif`.** The nested chain and the
statement-form chain are compared across all 101 scores, not spot-checked
— `101 of 101 scores agree`.

**2. Right-associativity.** `a ? b : c ? d : e` groups as
`a ? b : (c ? d : e)`. With `a=False, c=True` the chain yields `"d"`; the
other grouping, `(a ? b : c) ? d : e`, would yield `"e"`. The agreement
in (1) is itself evidence, since the grade chain only works under the
right grouping.

**3. Order decides the answer.** The bands overlap on purpose — 95
satisfies `>= 90`, `>= 80` and `>= 70` at once. First match wins, so a
chain written worst-first collapses everything:

```
score  ternary  if/elif  worst-first
  100	  A	   A	    D
  95	  A	   A	    D
  75	  C	   C	    D
  59	  F	   F	    F

Worst-first chain differs on 31 of 101 scores.
```

Same conditions, same operator, only the order changed — and it is wrong
for every score above 69, because `>= 60` swallows them before the others
are reached. That is a real bug, printed rather than described.

Verify it yourself:

```bash
pnpm eml transpile examples/ternary-decision-table/ternary_decision_table.eml
pnpm eml run examples/ternary-decision-table/ternary_decision_table.eml         # -> 101/101 agree, 31 differ
pnpm eml trace examples/ternary-decision-table/ternary_decision_table.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/ternary-decision-table/ternary_decision_table.eml   # -> OK (fixpoint)
```
