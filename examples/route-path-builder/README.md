# Extending a path without mutating it

`route_path_builder.eml` — builds a route by concatenating tuples.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `tuple + tuple`, which returns a NEW tuple.

Concatenation returning a fresh tuple is what makes it safe to hand a path to
a function that might extend it — the caller's copy cannot change underneath
them. A list extended by `.append` gives no such guarantee.

`tuple + tuple` raised TypeError until this round: the concatenation branch
handled `str + str` and `list + list` and simply had no tuple case.

Verify it yourself:

```bash
pnpm eml run examples/route-path-builder/route_path_builder.eml
pnpm eml trace examples/route-path-builder/route_path_builder.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/route-path-builder/route_path_builder.eml   # -> OK (fixpoint)
```
