# Palindrome checker

`palindrome_checker.eml` checks whether each of six sample words —
`level`, `radar`, `python`, `deified`, `civic`, `transpiler` — reads the
same forwards and backwards, printing a verdict for each one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: EML's native counted-range literal `[0:length-1]`
(not Python's `range(...)` call, which round-trips unstably — see below) to
drive a manual reverse-building loop, since Python's step-slice form
`s[::-1]` is **not supported by the native EML grammar**: a scratch test
(`s[::-1] => r`) fails to parse with `E_PARSE: Unexpected token COLON`, so
the reverse of each word is instead built character-by-character with
string concatenation, reading backwards through subscript expressions
(`word[length - 1 - i]`, bound with `=>` since a subscript with an
arithmetic index is not a bare primary and cannot be consumed by `^+`), a
nested `for` loop, and a plain `==` string-equality comparison to decide
the verdict. Also exercises re-binding an already-declared variable with
`=>` (`"" => reversed_word` resets the accumulator every outer iteration)
and the `EXPR^0(END_EXPR)` custom print terminator.

Verify it yourself:

```bash
pnpm eml transpile examples/palindrome-checker/palindrome_checker.eml   # -> Python
pnpm eml run examples/palindrome-checker/palindrome_checker.eml         # -> six palindrome verdicts
pnpm eml trace examples/palindrome-checker/palindrome_checker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/palindrome-checker/palindrome_checker.eml   # -> OK (fixpoint)
```
