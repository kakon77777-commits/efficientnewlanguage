# The repro succeeds for another reason — 140 with the defect on, 140 with it off

`the_repro_succeeds_for_another_reason.eml` measures whether a reproduction
script is sensitive to the defect it was filed against.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the report says the total comes out wrong and ships a
script that shows it. The script does show it. Everything in the report is true.
What nobody checked is *which* mechanism produces the wrong total in the script.

```
the report
  claim  : the total is wrong
  filed against : the discount is applied twice
  the script shows : total 140, expected 100
```

**The script's order, with the reported defect switched on and off:**

```
  discount defect on  : 140
  discount defect off : 140
  identical - this script cannot distinguish the defect it was filed against
```

The wrong total comes from the script's own order builder, which appends a line
twice. The reported defect is real and is not what the script demonstrates.

```
does the reproduction pass?
  builder fixed 0, discount fixed 0 : total 140 - fails
  builder fixed 0, discount fixed 1 : total 140 - fails
  builder fixed 1, discount fixed 0 : total 100 - PASSES
  builder fixed 1, discount fixed 1 : total 100 - PASSES

states in which the reproduction passes : 2 of 4
  of those, states where the reported defect was fixed : 1
  of those, states where the BUILDER was fixed         : 2
  the reproduction passes exactly when the builder is fixed, and the
  reported defect makes no difference to it either way
```

**And the reported defect is doing real damage where the script never looks:**

```
production orders, which the reproduction never touches
  wrong totals with the discount defect    : 3 of 4
  wrong totals after fixing it             : 0

    a... : got 80, expected 90
    b... : got 90, expected 95
    e... : got 20, expected 50
```

So both of the usual signals are worthless here in a specific, measurable way:
**"the repro now passes" carries no information about the reported defect**, and
**"the repro still fails" is not evidence the fix did not land**.

Nothing is declared: the two mechanisms are switched independently and every
combination is run.

**Related, and a different question.**
[mock-ignores-input](../mock-ignores-input/) is about a stand-in that cannot
respond to what it is given. This one is about a *genuine* execution of the
*real* system that nonetheless answers a different question than the one asked —
the observation is authentic and the attribution is not.

Verify it yourself:

```bash
pnpm eml run examples/the-repro-succeeds-for-another-reason/the_repro_succeeds_for_another_reason.eml
```
