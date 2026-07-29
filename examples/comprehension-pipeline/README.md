# List comprehensions, and what they do differently

`comprehension_pipeline.eml` examines list comprehensions — four corpus
programs had used one, none had looked at it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a comprehension is a loop that produces a list, so
the useful question is what it does *differently* from the loop you would
otherwise write. Three things, each checked against its hand-written
equivalent:

**1. The filter runs before the expression.** `[100 / n for n in xs if n != 0]`
is safe on a list containing zero — the division never sees it. Checked
against the same thing written as a loop; identical.

**2. The iteration variable does not leak.**

```
  after the comprehension, n is still 0
  after the for loop,       n is now  4
```

A `for` loop's variable survives the loop; a comprehension's never
escapes.

**3. Empty input needs no special case** — both an empty list and a
filter that matches nothing give `[]`.

**What EML does not have**: exactly one `for` clause and one optional
`if`. No nesting, no second filter. A nested transform becomes a loop
over comprehensions — which is what the wide Python version would end up
as anyway.

## What this case found

Its own subject bit it. The round-trip check failed, and the cause was
that **the reverse transpiler did not treat a `for` loop's target as a
bound name**. A later `n = 0` therefore came back as `n^+0`, which the
forward emitter renders as `n += 0` *because the name is declared* — so
`n = 0` silently became `n = n + 0`. A semantic change, not a cosmetic
one.

The guard for this already existed in the reverse emitter; it had simply
never been told about loop variables. Fixed in
`packages/transpiler-eml/src/eml-emitter.ts`, pinned in
`tests/reverse-regression.test.ts`.

Verify it yourself:

```bash
pnpm eml transpile examples/comprehension-pipeline/comprehension_pipeline.eml
pnpm eml run examples/comprehension-pipeline/comprehension_pipeline.eml         # -> filters, leakage, composition
pnpm eml trace examples/comprehension-pipeline/comprehension_pipeline.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/comprehension-pipeline/comprehension_pipeline.eml   # -> OK (fixpoint)
```
