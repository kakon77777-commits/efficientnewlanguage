# Is palindrome (recursive)

`is_palindrome_recursive.eml` checks six sample strings (`"racecar"`,
`"hello"`, `"level"`, `"python"`, `"a"`, `""`) for whether they read the
same forwards and backwards.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: genuine self-recursion combined with string slice
syntax (`s[1:n-1]` to peel off both outer characters each call) — a
deliberate contrast with the corpus's existing iterative
[`examples/palindrome-checker/`](../palindrome-checker/). The empty string
and single-character `"a"` both exercise the `n <= 1` base case directly.

Verify it yourself:

```bash
pnpm eml transpile examples/is-palindrome-recursive/is_palindrome_recursive.eml   # -> Python
pnpm eml run examples/is-palindrome-recursive/is_palindrome_recursive.eml         # -> 6 "word -> bool" lines
pnpm eml trace examples/is-palindrome-recursive/is_palindrome_recursive.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/is-palindrome-recursive/is_palindrome_recursive.eml   # -> OK (fixpoint)
```
