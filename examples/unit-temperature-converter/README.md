# Case corpus: a self-authored unit-conversion program

`temperature_converter.eml` is the first case in a self-authored batch (see
[`examples/word-frequency-counter/`](../word-frequency-counter/) and
[`examples/todo-list-manager/`](../todo-list-manager/) for the other two) —
part of growing the EML case corpus toward AI-native training scale, not a
port of an existing project.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: function definitions with `return` (Phase 2), a list
literal, a list comprehension (Phase 9), a `for` loop over that list,
arithmetic on both `int` and `float` results, string concatenation with
`str()`, and the `EXPR^0(END_EXPR)` custom print terminator (Core grammar,
2026-07-19) to print two related values on one line without an intermediate
newline.

Verify it yourself:

```bash
pnpm eml transpile examples/unit-temperature-converter/temperature_converter.eml   # -> Python
pnpm eml run examples/unit-temperature-converter/temperature_converter.eml         # -> converted readings
pnpm eml trace examples/unit-temperature-converter/temperature_converter.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/unit-temperature-converter/temperature_converter.eml   # -> OK (fixpoint)
```
