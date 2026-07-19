# Case corpus: a self-authored multiplication table generator

`multiplication_table_generator.eml` is one of a six-case self-authored
batch of deterministic simulations and pattern generators (see
[`examples/fizzbuzz/`](../fizzbuzz/),
[`examples/triangle-pattern-printer/`](../triangle-pattern-printer/),
[`examples/simple-calculator/`](../simple-calculator/),
[`examples/rock-paper-scissors-simulator/`](../rock-paper-scissors-simulator/),
and [`examples/dice-roll-tally/`](../dice-roll-tally/) for the other five) —
part of growing the EML case corpus toward AI-native training scale, not a
port of an existing project.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: nested `for` loops over EML's native `[a:b]` range
literal to print a 1-10 multiplication table, `%`-string-formatting
(`"%d" % (product,)`, a tuple RHS) to render each product, a `def`/`return`
helper function with a `while` loop and string concatenation to left-pad
values for aligned columns, and building each row via repeated string
concatenation before a single `^0` print per row.

**A real interpreter gap found while authoring this case**: the first
version used `"%4d" % (product,)` (a fixed-width format spec) for the
padding. `eml run` (which shells out to real Python) printed a perfectly
aligned table, masking the problem — but `eml trace --run` (which executes
via `@eml/interp`, the browser-safe interpreter) failed immediately with
`ValueError: unsupported format character '4'`. Root cause: `@eml/interp`'s
`%` operator (`packages/interp/src/values.ts`) is deliberately scoped to
bare `%s`/`%d`/`%f`/`%%` conversions only — no flags, width, or precision
modifiers — so any width specifier throws rather than silently
mis-formatting. Fixed by keeping `%d` for the digit conversion and adding a
small `pad_left(text, width)` helper (a `while` loop appending a leading
space) to do the column alignment by hand instead of via a format-spec
width.

Verify it yourself:

```bash
pnpm eml transpile examples/multiplication-table-generator/multiplication_table_generator.eml   # -> Python
pnpm eml run examples/multiplication-table-generator/multiplication_table_generator.eml         # -> aligned 10x10 table
pnpm eml trace examples/multiplication-table-generator/multiplication_table_generator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/multiplication-table-generator/multiplication_table_generator.eml   # -> OK (fixpoint)
```
