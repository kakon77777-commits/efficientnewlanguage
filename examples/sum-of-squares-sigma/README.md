# Sum of squares (Σ)

`sum_of_squares_sigma.eml` computes `Σ(i^2, i in [1:n])` for five values of
`n`, checking each against the closed form `n(n+1)(2n+1)/6`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Why this case exists.** It is the **first case in this corpus to use
EML's summation operator** — the symbol the language is named for.

Before it, the corpus held 119 programs and not one used `Σ`. Every case
was written in EML's Python-shaped subset: correct EML, but it teaches a
reader nothing about what distinguishes EML from Python with unusual
punctuation. `Σ` existed only in the `examples/phase*` language-feature
fixtures, which are regression tests rather than worked examples. A corpus
built so an AI can learn the language natively was, on this axis, teaching
the wrong language.

```eml
Σ(i^2, i in [1:n]) => total
```
transpiles to
```python
total = sum(i**2 for i in range(1, n+1))
```

The case also prints the same intent written out as a four-line loop, so
the compression is visible rather than described.

**Correctness is checked against the closed form**, an independent
computation — this verifies the summation rather than restating it. The
formula also makes the samples confirmable by hand: `n=10` gives 385,
`n=100` gives 338350.

**One deliberate constraint worth knowing.** `Σ` appears in the source but
never inside a printed string, and that was verified rather than assumed:
on a Windows cp950 host, Python's stdout encodes `Σ` as the Big5 bytes
`A3 55`, which the toolchain then reads back as UTF-8 and turns into
U+FFFD. The `eml:equiv` gate does **not** catch this — the interpreter and
the real Python run traverse the same encoding path, so they agree with
each other while both are wrong. Source text is read as UTF-8 and is
unaffected; only stdout is. Keep EML's Unicode symbols in code, out of
output.

Verify it yourself:

```bash
pnpm eml transpile examples/sum-of-squares-sigma/sum_of_squares_sigma.eml   # -> see the sum(...) expansion
pnpm eml run examples/sum-of-squares-sigma/sum_of_squares_sigma.eml         # -> 5 totals + a 5-of-5 summary
pnpm eml trace examples/sum-of-squares-sigma/sum_of_squares_sigma.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/sum-of-squares-sigma/sum_of_squares_sigma.eml   # -> OK (fixpoint)
```
