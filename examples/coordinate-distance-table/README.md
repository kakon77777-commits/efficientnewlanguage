# Points are tuples

`coordinate_distance_table.eml` measures four points against the origin,
two ways.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuples as fixed-shape records, `len`/`sum`/`max`/`min`
over a tuple, and lexicographic tuple comparison.

`(x, y)` is not a list of two numbers — it is one thing with two parts.
Appending to it would not produce a longer point; it would produce
nonsense. That is the test for whether you want a tuple.

```
For (3, 4):  len=2  sum=7  max=4  min=3
(1, 5) < (2, 0) is True    <- first element decides
(2, 0) < (2, 9) is True    <- tie, so the second decides
```

Tuples compare element by element, left to right, so ordering points by
tuple order is lexicographic — **not** by distance from the origin.

## Three gaps this case closed

- `len((1, 2, 3))` raised TypeError, and so did `sum((1, 2, 3))`. The
  interpreter's notion of "things with a length" and "things you can
  iterate" had been written out by hand in three places, and tuple was
  missing from two of them. They now share one definition.
- `(1, 5) < (2, 0)` raised TypeError. Lists already had lexicographic
  comparison; tuples were simply left off the same branch — the fourth
  place in one day where a hand-written type list omitted tuple.
- The **reverse** transpiler emitted `x^+(3, 4)` for a tuple assignment,
  which the forward parser then read as a **call**, `x(3, 4)`. Tuples now
  use the unambiguous arrow form. Only `(` was affected, because only `(`
  is also a postfix operator; `[1, 2]` and `{1: 2}` were always fine.

The round-trip gate caught that last one — the same way it caught
`n = 0` becoming `n += 0` in an earlier round.

Verify it yourself:

```bash
pnpm eml run examples/coordinate-distance-table/coordinate_distance_table.eml
pnpm eml trace examples/coordinate-distance-table/coordinate_distance_table.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/coordinate-distance-table/coordinate_distance_table.eml   # -> OK (fixpoint)
```
