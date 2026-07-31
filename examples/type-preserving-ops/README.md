# One operator, four meanings

`type_preserving_ops.eml` — shows what `+` and `*` mean per operand family.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: concatenation, repetition, type preservation, and the refusal to coerce.

Each operation returns the type it was given: a repeated tuple is a tuple and
therefore still hashable, which a "make a sequence" helper returning a list
would silently break while passing any content-only test.

Mixing families raises rather than guessing whether `"3" + 4` meant 7 or
"34" — and the message depends on which side is the sequence:
*can only concatenate str (not "int") to str* versus the generic
*unsupported operand type(s)*.

Verify it yourself:

```bash
pnpm eml run examples/type-preserving-ops/type_preserving_ops.eml
pnpm eml trace examples/type-preserving-ops/type_preserving_ops.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/type-preserving-ops/type_preserving_ops.eml   # -> OK (fixpoint)
```
