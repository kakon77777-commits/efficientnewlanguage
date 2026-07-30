# Blending colours, one channel at a time

`rgb_palette_blender.eml` adds and scales `(r, g, b)` tuples with each
channel clamped independently.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: tuples returned from functions, `int()` truncation
inside a scale factor, and `sum`/`max`/`min` over a tuple.

```
blended        = (220, 180, 250)
raw sums would be (220, 180, 250) - the red channel needed clamping
Brightest channel of (220, 180, 250) is 250
A colour always has 3 channels - that is what makes it a tuple and not a list.
```

Independent clamping is the reason a colour is a record of three values
rather than one number: adding two bright colours overflows past 255, and
each channel has to be corrected on its own. Printing the raw sums beside
the clamped result makes the correction visible instead of silent.

Verify it yourself:

```bash
pnpm eml run examples/rgb-palette-blender/rgb_palette_blender.eml
pnpm eml trace examples/rgb-palette-blender/rgb_palette_blender.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/rgb-palette-blender/rgb_palette_blender.eml   # -> OK (fixpoint)
```
