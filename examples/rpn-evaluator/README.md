# Reverse Polish Notation evaluator

`rpn_evaluator.eml` evaluates four RPN expressions, e.g.
`[3, 4, '+', 2, '*', 7, '/'] = 2` and
`[5, 1, 2, '+', 4, '*', '+', 3, '-'] = 14`.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's second stack application, after
[`examples/balanced-brackets-checker/`](../balanced-brackets-checker/) —
and a step up from it: that case only pushes and pops, this one *computes*
with what it pops (pop two operands, combine, push the result back). Pops
are slice rebuilds (`stack[0:depth - 2] => stack`), since EML has no
`.pop()`.

Token lists mix numbers and operator strings directly rather than parsing
a text expression: converting a string to an int is an
interpreter-deferred construct, and a deferred construct would make the
whole case *skip* the `eml:equiv` execution-truth check rather than pass
it. Pre-typed tokens keep it genuinely gated. `int(a / b)` stands in for
floor division (EML has no `//` token).

Verify it yourself:

```bash
pnpm eml transpile examples/rpn-evaluator/rpn_evaluator.eml   # -> Python
pnpm eml run examples/rpn-evaluator/rpn_evaluator.eml         # -> 4 "tokens = result" lines
pnpm eml trace examples/rpn-evaluator/rpn_evaluator.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/rpn-evaluator/rpn_evaluator.eml   # -> OK (fixpoint)
```
