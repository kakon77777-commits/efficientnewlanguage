# Each stage keeps a different invariant — 3 of 3 checks pass, 1 of 4 invariants survives

`each_stage_keeps_a_different_invariant.eml` runs three stages that each name
and keep one invariant, then evaluates four invariants at every stage boundary.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: each stage is right about the thing it was asked to be
right about.

```
each stage's own check, the one its author wrote
  fill_missing  says row count unchanged : yes
  drop_zeros    says total unchanged     : yes
  merge_keys    says keys unique         : yes
```

Zero-dropping genuinely does not change a total — the rows it removes
contribute nothing. Three true statements. Then the grid:

```
grid: each invariant measured against the ORIGINAL input at each boundary
  boundary        count  total  key-seq  rel-order
  after fill    :  yes    no     yes      yes
  after drop    :  no     no     no       yes
  after merge   :  no     no     no       yes

invariants that survive end to end: 1 of 4
stage checks that passed:            3 of 3
```

```
rows  in 6 -> out 3
total in 14 -> out 25
keys  in ['ann', 'bo', 'cy', 'ann', 'dee', 'bo']
keys  out ['ann', 'bo', 'dee']
```

Every stage broke an invariant it never mentioned:

```
each stage against an invariant it never named
  fill  vs total     : BROKE (14 -> 25)
  drop  vs row count : BROKE (6 -> 4)
  merge vs row count : BROKE (4 -> 3)
```

A stage check is written from inside the stage, and the property it happens not
to mention is exactly the one the next stage is free to break.

**A wrong premise, kept in the file.** The first version folded "the key
sequence is identical" and "relative order is preserved" into a single column —
which reports a *removed row* as a *reordering*, a length change tripping a
check about order. Split apart, the grid says something the conflated version
could not: **the one invariant that survives all three stages is relative
order, and no stage claimed it.** The conflated version reported 0 of 3
surviving, which was both a worse number and a wrong one.

Verify it yourself:

```bash
pnpm eml run examples/each-stage-keeps-a-different-invariant/each_stage_keeps_a_different_invariant.eml
```
