# The fix moved the boundary — 0 disagreements on every integer tested

`the_fix_moved_the_boundary.eml` runs two repairs for the same boundary defect
over two domains and measures where they come apart.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the rule is "orders of 100 or more need approval". The
check says `> 100`, so exactly 100 slips. The report names 100. Repair A lowers
the threshold to 99; repair B corrects the comparison to `>=`.

**This program was written to show that repair A leaves the defect class intact.
Over integers it does not:**

```
repair A (lower the threshold to 99) and repair B (use >=), integer amounts
  A failing : []
  B failing : []
  integer amounts where A and B disagree : 0 of 6
```

`> 99` and `>= 100` agree on every integer. Repair A is not an approximation of
the correct fix — on that domain it *is* the correct fix. The result is kept
because the real finding is narrower and less comfortable.

**The two come apart exactly on the values between the old threshold and the
new one, and whether such values exist is a fact about the domain:**

```
the same two repairs, with fractional amounts
  A failing : [99.5, 99.9]
  B failing : []
    99.5 : A says approve, B says auto, rule says auto
    99.9 : A says approve, B says auto, rule says auto
  amounts where A and B disagree : 2 of 8

probing the gap between the old and new thresholds
  probes inside the gap : 5
  of those, repair A gets wrong : 5
  of those, repair B gets wrong : 0
```

```
what an integer-only suite can establish
  A and B are indistinguishable on every integer amount
  so no integer test, however thorough, can prefer one over the other
  A is wrong on : 2 of the 8 real amounts
  B is wrong on : 0
```

The two repairs are not near-equivalent-then-wrong-at-the-edges. They are
**exactly** equivalent on the values anyone tried, and one is wrong on a region
the test set does not contain. The reviewer sees a green suite either way, and
it is the same green.

Nothing is declared: both repairs run over both domains and the failing sets are
compared as sets.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-moved-the-boundary/the_fix_moved_the_boundary.eml
```
