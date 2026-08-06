# Top-N with ties — four people tied for third

`top_n_with_ties.eml` asks for the top 3 from a list where four entries share
the third-place score, under three defensible policies, over several orderings
of the same data.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: top-N is not well defined on a list with ties. Choosing
N items requires choosing *which* of the tied items, and nothing in the data
says.

| policy | rows | who |
| --- | --- | --- |
| strict | 3 | ana, bo, cy |
| dense | 6 | everyone reaching the 3rd score |
| exclude | 2 | drops the whole tied band |

Three policies, three row counts, one input. Only strict returns exactly N.

Strict's answer depends on the order it was given: across three orderings of
the same seven scores it selects **3 different sets**. Nothing in the data
distinguishes the entries it kept from the ones it dropped — the file prints
them side by side.

**Two premises the measurement corrected.**

The first version of `exclude` returned every row scoring strictly above the
Nth score, which drops the Nth row even when nothing is tied — so it returned
N−1 on data with no ties at all, and the case blamed the tie for a defect in
the policy's implementation. The no-tie control in the file is what caught it.

The second: comparing dense's output as a rendered string made it look unstable
across orderings. It is not. Measured as three separate counts:

```
distinct strict-3 results, as sets:   3
distinct dense results, as sets:      1
distinct dense results, as SEQUENCES: 3
```

Dense answers a well-posed question and still renders it differently each time,
because the order inside the tied band comes from the input. Which of those
three counts you compare decides what you can see.

The control: with all scores distinct, every policy returns exactly 3 — so the
disagreement is caused by the tie and by nothing else.

Verify it yourself:

```bash
pnpm eml run examples/top-n-with-ties/top_n_with_ties.eml
```

```bash
pnpm eml trace examples/top-n-with-ties/top_n_with_ties.eml --run
```
