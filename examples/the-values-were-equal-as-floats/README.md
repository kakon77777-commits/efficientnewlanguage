# The values were equal as floats

`the_values_were_equal_as_floats.eml` - The reconciliation passed on every pair it compared, and each comparison ran without error. What the comparison treats as equal is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reconciliation is careful. It compares the two sides pair by pair, not in aggregate; it runs on every pair, no sampling; a difference is meant to fail the pair and halt; and the pairs it passed it really did evaluate as equal.

The comparison is == on floating-point dollars, and cents below the float's precision at that magnitude round away before the compare.

```
pairs compared                  : 90000
  that truly differ by a cent   : 37
  equal as floats               : 37
  the reconciliation failed     : 0
hidden discrepancies            : 37
discrepancy total               : 37 cents
hidden share                    : 4 per ten thousand
```

```
one pair, in cents and as floats
  side A : 100000000001 cents
  side B : 100000000000 cents
  differ by : 1 cent
  as float dollars : both nearest the same value, so ==
```

```
the reconciliation
  compares : pair by pair, not in aggregate
  coverage : every pair, no sampling
  on a difference : fails the pair and halts
  pairs it passed : evaluated equal, genuinely
  pairs it failed : 0
  verdict : RECONCILED
```

```
  comparing pair by pair rather than netting the totals is
  the part done right here, and it is why offsetting errors
  cannot hide
```

```
the comparison itself
  operator : == on floating-point dollars
  what a float holds at ten-figure magnitudes : not every
    cent
  a one-cent difference there : rounds to the same
    representable value
  so the two sides : are equal as floats, unequal as cents
  pairs this hid : 37
```

```
the same pairs, in integer cents
  pairs that differ by a cent : 37
  what the reconciliation said about them : equal
  cents unaccounted for : 37
  is the comparison wrong : no; as floats they are equal
  are they equal : no; as cents they differ
```

```
null control - compare integer cents
  hidden discrepancies, cent compare : 
    0
  pairs the cent compare fails : 37
  cents it would surface : 37
  no amount changed; the comparison stopped rounding the
  cents away before it looked
```

```
what a passed reconciliation guarantees
  every compared pair evaluated equal : exactly, pair by
    pair, no sampling, halt on a difference
  equal amounts reconcile : not addressed; the comparison
    is == on floats and cents beyond the float's precision
    vanish - 37 pairs compared equal while differing by a
    cent, hiding 37 cents
```

```
equality is only as fine as the type it is tested in, and a float at a large
magnitude cannot hold a cent; two amounts a cent apart are the same number to
it, and the reconciliation asks it, not the ledger
```

It compares pair by pair with no sampling and halts on a difference - every pair equal. The compare is == on float dollars, which cannot hold a cent at ten figures, so 37 pairs a cent apart read as equal, 37 cents hidden, 4 per ten thousand of the pairs, under 0 failures.

Verify it yourself:

```bash
pnpm eml run examples/the-values-were-equal-as-floats/the_values_were_equal_as_floats.eml
```
