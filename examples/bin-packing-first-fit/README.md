# Bin packing (first-fit)

`bin_packing_first_fit.eml` packs seven items into bins of capacity 10 by
dropping each item into the first bin it still fits in, printing the
resulting contents of every bin.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a greedy heuristic — and, deliberately, one that
**visibly fails to be optimal**:

```
Items:    [2, 5, 4, 7, 1, 3, 8]   (30 units total, capacity 10)
  bin 0: [2, 5, 1] (2 unused)
  bin 1: [4, 3]    (3 unused)
  bin 2: [7]       (3 unused)
  bin 3: [8]       (2 unused)
First-fit used 4 bins
```

Thirty units into bins of ten need **at least** 3 bins, and 3 is genuinely
achievable — `{8,2}`, `{7,3}`, `{5,4,1}` each fill a bin exactly, using
all seven items. First-fit takes 4, because the small early items settle
into bins in a way that strands capacity the later large items cannot use.

Same lesson as [`examples/coin-change-dp/`](../coin-change-dp/), from the
opposite direction: there, dynamic programming *finds* what greedy misses.
Here nothing corrects the greedy choice at all — the shortfall is simply
reported honestly, which is what a packing heuristic actually does in
practice. Bin packing is NP-hard; first-fit is used because it is fast and
good enough, not because it is right.

The lower bound is computed in the program (ceiling division via
`int((total + capacity - 1) / capacity)`, since EML has no `//` token)
rather than hard-coded, so it stays correct if the item list is edited.

Verify it yourself:

```bash
pnpm eml transpile examples/bin-packing-first-fit/bin_packing_first_fit.eml   # -> Python
pnpm eml run examples/bin-packing-first-fit/bin_packing_first_fit.eml         # -> per-bin contents, bin count, lower bound
pnpm eml trace examples/bin-packing-first-fit/bin_packing_first_fit.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/bin-packing-first-fit/bin_packing_first_fit.eml   # -> OK (fixpoint)
```
