# Case corpus: a self-authored word-frequency counter

`word_frequency_counter.eml` is the second case in a self-authored batch
(see [`examples/unit-temperature-converter/`](../unit-temperature-converter/)
and [`examples/todo-list-manager/`](../todo-list-manager/) for the other
two) — part of growing the EML case corpus toward AI-native training scale,
not a port of an existing project.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a dict literal + subscript get/set (Phase 7b), `in`
membership on both a list and a dict (Phase 7b), list concatenation via `+`
to build a dedup'd list without a builtin method call, a manual
max-of-comparisons loop (deliberately avoiding a `sorted()`/`max()`-of-tuples
builtin the interpreter doesn't model), and string concatenation with
`str()`.

Verify it yourself:

```bash
pnpm eml transpile examples/word-frequency-counter/word_frequency_counter.eml   # -> Python
pnpm eml run examples/word-frequency-counter/word_frequency_counter.eml         # -> frequency report
pnpm eml trace examples/word-frequency-counter/word_frequency_counter.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/word-frequency-counter/word_frequency_counter.eml   # -> OK (fixpoint)
```
