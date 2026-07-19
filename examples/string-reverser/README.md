# String reverser

`string_reverser.eml` reverses four sample strings — `"Hello World"`,
`"EML Transpiler"`, `"Neo.K"`, `"EveMissLab 2026"`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the same manual-reverse idiom as
[`examples/palindrome-checker/`](../palindrome-checker/) — native EML's
`[0:length-1]` counted range plus a backward subscript
(`text[length - 1 - i]`) and string concatenation, since Python's
`s[::-1]` step-slice does not parse in EML's grammar. Fully
interpreter-computable end to end (no deferred builtins).

Verify it yourself:

```bash
pnpm eml transpile examples/string-reverser/string_reverser.eml   # -> Python
pnpm eml run examples/string-reverser/string_reverser.eml         # -> reversed strings
pnpm eml trace examples/string-reverser/string_reverser.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/string-reverser/string_reverser.eml   # -> OK (fixpoint)
```
