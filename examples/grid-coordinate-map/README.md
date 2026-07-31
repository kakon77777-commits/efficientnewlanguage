# A grid keyed by (row, col)

`grid_coordinate_map.eml` — a sparse grid whose keys are coordinate tuples.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuples as dict keys, recursive hashability, and neighbour lookup.

Keying a grid by `(row, col)` is the single most common reason to reach for
a tuple, and it raised `unhashable type: 'tuple'` until this round. The usual
workaround — a string key like `"2,3"` — is worse than it looks: it
stringifies, so the coordinates cannot be read back without parsing, and
distinct values can collide.

Hashability is recursive in Python: `(1, [2])` is not hashable, and the error
now names both halves — *cannot use 'tuple' as a dict key (unhashable type:
'list')* — the value you wrote and the element that made it impossible.

Verify it yourself:

```bash
pnpm eml run examples/grid-coordinate-map/grid_coordinate_map.eml
pnpm eml trace examples/grid-coordinate-map/grid_coordinate_map.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/grid-coordinate-map/grid_coordinate_map.eml   # -> OK (fixpoint)
```
