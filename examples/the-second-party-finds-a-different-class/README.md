# The second party finds a different class — 5 found against 7, and 1 that mattered

`the_second_party_finds_a_different_class.eml` runs two searchers over one
defect population and computes every region of the overlap.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the builder searches from the inside — they know which
invariant is load-bearing and which shortcut they took on a Friday. The outside
checker searches from behaviour. Both are competent, and the number worth
measuring is neither total.

```
defects in the population : 10
  found by the builder : 7  ['d1', 'd3', 'd4', 'd5', 'd6', 'd9', 'd10']
  found by the checker : 5  ['d1', 'd2', 'd5', 'd6', 'd9']

  found by both       : 4  ['d1', 'd5', 'd6', 'd9']
  builder only        : 3  ['d3', 'd4', 'd10']
  checker only        : 1  ['d2']
  found by NEITHER    : 2  ['d7', 'd8']

union of the two searches : 8 of 10
```

**The checker found fewer in total and was still worth adding:**

```
adding the second checker
  defects the builder already had : 7
  new defects the checker adds    : 1
  the checker found FEWER in total than the builder
  and they still overlap on : 4
```

**And what a *third* searcher buys depends entirely on where they stand:**

```
a second checker searching the same way adds : 0
a checker searching the other way added      : 1
```

**The unfound set has a property, and it is computed rather than guessed:**

```
the defects neither party found
  of the 2 unfound, observable from outside : 0
  of the 2 unfound, needing internal knowledge : 0
  they are neither observable nor internally obvious - which is why
  neither search reaches them, and why a third searcher of either
  existing kind would not either
```

Nothing is declared: each searcher is a rule over defect properties and every
region is computed by running both over the same population.

Adding a checker does not raise the ceiling by their headcount. It raises it by
the part of their search that does not overlap — and that part is decided by
where they stand, not by how hard they look.

Verify it yourself:

```bash
pnpm eml run examples/the-second-party-finds-a-different-class/the_second_party_finds_a_different_class.eml
```
