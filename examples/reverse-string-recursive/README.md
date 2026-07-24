# Reverse string (recursive)

`reverse_string_recursive.eml` reverses five sample strings (`"hello"`,
`"EML"`, `"a"`, `""`, `"racecar"`).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: genuine self-recursion combined with string slice
syntax (`s[0:n-1]` to drop the last character each call, `s[n-1]` to read
it) — a deliberate contrast with the corpus's existing iterative
[`examples/string-reverser/`](../string-reverser/). Pairs with
[`examples/is-palindrome-recursive/`](../is-palindrome-recursive/) as the
corpus's second recursive string case, both driven by the same slice-based
"peel off the ends" idiom.

Verify it yourself:

```bash
pnpm eml transpile examples/reverse-string-recursive/reverse_string_recursive.eml   # -> Python
pnpm eml run examples/reverse-string-recursive/reverse_string_recursive.eml         # -> 5 "word -> reversed" lines
pnpm eml trace examples/reverse-string-recursive/reverse_string_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/reverse-string-recursive/reverse_string_recursive.eml   # -> OK (fixpoint)
```
