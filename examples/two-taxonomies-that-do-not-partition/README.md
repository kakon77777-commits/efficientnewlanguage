# Two taxonomies that do not partition - both totals are 12 and their numbers cannot be added

`two_taxonomies_that_do_not_partition.eml` labels every defect under both schemes, so what each can and cannot say about one population is measured rather than argued.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: neither scheme is worse. One asks where the defect was introduced because that is what the team can act on; the other asks what the user lost because that is what gets reported upward. Both are complete and unambiguous within themselves.

```
defects : 12
```

```
scheme A - where it was introduced
  design : 3
  implementation : 5
  integration : 4
scheme B - what the user lost
  correctness : 5
  availability : 4
  data : 3
```

```
  scheme A totals : 12
  scheme B totals : 12
  both partition the population exactly - neither is sloppy
```

```
the same defects, both labels at once
              correctness  availability  data
  design       2            1            0        
  implementation       2            1            2        
  integration       1            2            1        
```

```
a report that quotes one number from each
  'implementation defects : 5'
  'correctness defects    : 5'
  read as a total : 10
  defects that exist : 12
  the overlap : 2
```

```
can scheme A answer 'how much correctness damage came from integration'
  scheme A alone : no - it has no correctness axis
  scheme B alone : no - it has no origin axis
  both together  : yes - 1
```

```
  no defect is both design and data
  empty cells : 1 of 9
  neither scheme's own table shows this, because each sums the cell away
```

```
control - a coarse scheme that groups scheme B's classes
  blocking : 4
  non-blocking : 8
  blocking is exactly availability, so the two nest and can be compared
```

Both schemes are complete and unambiguous. What neither carries is the other axis, and a number is quoted without the scheme it came from.

The **control** is a coarse scheme that groups the other's classes: where one scheme refines the other the counts nest and comparison is exact. Cross-scheme arithmetic is not always wrong - it is wrong when the schemes cut different ways.

Verify it yourself:

```bash
pnpm eml run examples/two-taxonomies-that-do-not-partition/two_taxonomies_that_do_not_partition.eml
```
