# Slicing is half-open, and that's the whole story

`slice_toolkit.eml` works through slicing, which five corpus programs had
touched only in passing.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `s[a:b]` includes `a` and excludes `b`. Everything
convenient about slices follows from that one choice, and the program
demonstrates each consequence rather than asserting it.

| property | why it matters |
|---|---|
| `len(s[a:b]) == b - a` | the length is the difference — no ±1 |
| `s[:k] + s[k:] == s` | any split point reassembles exactly (checked at all 11) |
| `s[a:a] == ""` | an empty slice is legal, not an error |
| `s[7:2] == ""` | a backwards range is empty, not an error |
| `s[:99]` clamps | out-of-range bounds clamp; `s[99]` would raise |

That last pair is the real reason slices are pleasant: **the bounds are a
request, not an assertion.** The windowing function at the end leans on
it and needs no boundary arithmetic at all —

```
  4 windows of 3 over 6 items = 6 - 3 + 1
  windows(xs, 99) -> []   (the while never runs)
```

— and no special case was written for the too-large window.

**EML note**: negative indices and a step (`s[::2]`) are outside the
supported slice grammar, so everything here uses non-negative bounds.

Verify it yourself:

```bash
pnpm eml transpile examples/slice-toolkit/slice_toolkit.eml
pnpm eml run examples/slice-toolkit/slice_toolkit.eml         # -> 11/11 split points, clamping, windows
pnpm eml trace examples/slice-toolkit/slice_toolkit.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/slice-toolkit/slice_toolkit.eml   # -> OK (fixpoint)
```
