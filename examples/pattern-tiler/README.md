# Repetition preserves the type

`pattern_tiler.eml` — tiles a pattern to fill a width.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `*` on str, list and tuple — and what each one returns.

A repeated tuple is a **tuple**, not a list. That matters beyond tidiness: the
result is still hashable, so it can still key a dict. A helper that always
returned a list would pass any test comparing only contents.

Zero and negative counts give an empty sequence rather than an error, and
`True` counts as 1 because bool is an int subtype.

Verify it yourself:

```bash
pnpm eml run examples/pattern-tiler/pattern_tiler.eml
pnpm eml trace examples/pattern-tiler/pattern_tiler.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/pattern-tiler/pattern_tiler.eml   # -> OK (fixpoint)
```
