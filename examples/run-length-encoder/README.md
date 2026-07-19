# Run-length encoder

`run_length_encoder.eml` run-length-encodes the DNA-style base sequence
`"AAAAGGGGCCCCTTTTAAAAGGA"` (a genuine RLE use case — simple compression
of repeated-symbol sequences, e.g. in bioinformatics or fax-style bitmap
rows), producing `4A4G4C4T4A2G1A`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: EML's native counted-range literal `[1:length-1]`
(not Python's `range(...)` call) driving an index-tracking loop, the `^+`
augment sigil incrementing a run counter on a bare-literal RHS
(`count^+1`), resetting an already-declared variable via the general bind
arrow `=>` on a non-bare RHS (`ch => current`, `1 => count`), and building
each encoded run with a tuple literal plus `%`-string-formatting
(`"%d%s" % (count, current)`) rather than string concatenation. `len(...)`
called as a plain builtin (not an attribute call) executes natively in the
interpreter — no deferrals here: `eml:equiv` reports `ok:true` against real
Python with 0 anomalies.

Verify it yourself:

```bash
pnpm eml transpile examples/run-length-encoder/run_length_encoder.eml   # -> Python
pnpm eml run examples/run-length-encoder/run_length_encoder.eml         # -> original + encoded sequence
pnpm eml trace examples/run-length-encoder/run_length_encoder.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/run-length-encoder/run_length_encoder.eml   # -> OK (fixpoint)
```
