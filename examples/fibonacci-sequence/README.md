# Fibonacci sequence (iterative)

`fibonacci_sequence.eml` generates the first 15 Fibonacci numbers using a
`while` loop with two running variables (`a`, `b`) that are swapped and
advanced each iteration — deliberately iterative, since recursion is already
covered elsewhere in this corpus (`examples/phase6-control-flow/` covers a
similar iterative shape for a single Fibonacci value; this case generates
the whole sequence as a list and prints both the full sequence and its last
term).

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function that builds and returns a
list, the `list + [item] => list` growth idiom inside a `while` loop, the
`^+` declare-or-augment sigil for straightforward bare-literal
initialization (`a^+0`, `b^+1`, `count^+0`) versus the general bind arrow
`=>` for the computed swap values (`a + b` is a binary expression, not a
bare primary, so it cannot be the right-hand side of a `^+`/`^-`/`^*`/`^/`
sigil — it must go through `=>` into a temporary `next_value` first), and
`len(...)` plus subscript read to pull out the last element of the returned
list.

Verify it yourself:

```bash
pnpm eml transpile examples/fibonacci-sequence/fibonacci_sequence.eml   # -> Python
pnpm eml run examples/fibonacci-sequence/fibonacci_sequence.eml         # -> the 15-term sequence + last term
pnpm eml trace examples/fibonacci-sequence/fibonacci_sequence.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/fibonacci-sequence/fibonacci_sequence.eml   # -> OK (fixpoint)
```
