# Recursive descent: precedence lives in the nesting

`recursive_descent_calculator.eml` parses and evaluates arithmetic
expressions with real operator precedence, parentheses, unary minus
and error reporting.

**What it exercises**: one function per precedence level, each calling
the next one down, so the grammar reads straight off the call graph:

```
expression  ->  term   (('+' | '-') term)*
term        ->  factor (('*' | '/' | '%') factor)*
factor      ->  NUMBER | '(' expression ')' | '-' factor
```

Precedence is not a property of any one function — it exists only in the
nesting. Swap two levels and every individual function still reads
correctly, every expression still parses, and `2 + 3 * 4` quietly
becomes 20.

So no expected value is typed by hand. Every expression is checked
against a **fully parenthesised twin** that forces the intended order —
an expression whose answer was computed by the code under test proves
nothing. Six malformed inputs must raise rather than return a number.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 14 lines)

```
  1 / 0    -> division by zero
  4 5      -> trailing input at token 1
  )        -> invalid literal for int() with base 10: ')'
  1 % 0    -> modulo by zero

precedence pairs agreeing: 12/12
malformed inputs rejected: 6/6

Precedence, associativity, parentheses and error handling all hold.

Precedence lives in the nesting, not in any one function. Swap parse_term
and parse_expression and every function still reads correctly, every input
still parses, and 2 + 3 * 4 becomes 20. That is why each expression is
checked against a parenthesised twin rather than a number typed by hand.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`recursive_descent_calculator.trace.jsonl` beside this file is the recorded execution.
