# Both parties assumed the other checked it — 3 unchecked, all 3 seams

`both_parties_assumed_the_other_checked_it.eml` offers every item to both
parties' ownership rules and computes the four regions.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the builder checks what is theirs; the checker checks
what is theirs. Both lists were written by asking *"what do I own"* — the right
question for deciding what to **do** and the wrong one for deciding what is
**covered**, because an item nobody owns produces the same answer from both.

```
items : 10
  checked by both    : 2
  builder only       : 2
  checker only       : 3
  checked by NEITHER : 3
    module boundary A
    module boundary B
    shared clock
```

**The unchecked set is not random:**

```
the unchecked set
  items that are seams between components : 3
  items that are not                      : 0

seams in the system : 3
seams checked by somebody : 0
```

**Adding the second party did not create the gap. It moved it out of sight:**

```
with the builder alone
  covered   : 4
  uncovered : 6  - and visibly so, because there was one list

with both parties
  covered   : 7
  uncovered : 3  - and each party's own list looks complete
```

Coverage went up. Visibility of what is uncovered went down, because the gap
stopped being the tail of one list and became the space between two.

```
asked about each unchecked item, both parties answer the same way
  module boundary A : builder says not mine, checker says not mine
  module boundary B : builder says not mine, checker says not mine
  shared clock : builder says not mine, checker says not mine
  items where both answers agree, and agreement means nobody looked : 3
```

Nothing is declared: each item is run through both ownership rules and every
region is computed.

**Related, and a different level.**
[each-stage-verified-nobody-verified-the-seam](../each-stage-verified-nobody-verified-the-seam/)
is this shape between *stages of a pipeline*. This is the same shape between
*parties*, and it appears the moment a second checker is added — which is
usually the moment everyone concludes coverage improved.

Verify it yourself:

```bash
pnpm eml run examples/both-parties-assumed-the-other-checked-it/both_parties_assumed_the_other_checked_it.eml
```
