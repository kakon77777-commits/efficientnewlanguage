# try / except / finally ordering

`exception_finally_ordering.eml` prints the order these actually run in,
rather than describing it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

Everyone knows "finally always runs". The parts people get wrong are the
orderings around it, and each is demonstrated by output that would change
if the rule were different.

**`finally` runs after the body on both paths — including after
`except`:**

```
divide(10, 2):            divide(10, 0):
    [try] entering            [try] entering
    [try] computed            [except] division by zero
    [finally] runs either way [finally] runs either way
  caller received 5.0       caller received 0
```

**`finally` runs even when `try` returns.** Note where the `[finally]`
line sits: the return value is computed, `finally` runs, *then* the
caller receives the value. A `finally` that ran after the caller resumed
would print in the other order.

**An exception propagates out through its own function's `finally`:**

```
    [finally] ran even though nothing here caught anything
  caught outside, after the inner finally had already run
```

**A non-matching `except` does not catch.** Checked with two exception
types so "it was caught" cannot be confused with "nothing was raised" — a
`TypeError` travels straight past a `ValueError` handler to the outer
`TypeError` one, and a sentinel records which handler actually ran.

Verify it yourself:

```bash
pnpm eml transpile examples/exception-finally-ordering/exception_finally_ordering.eml
pnpm eml run examples/exception-finally-ordering/exception_finally_ordering.eml         # -> the interleaved trace
pnpm eml trace examples/exception-finally-ordering/exception_finally_ordering.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/exception-finally-ordering/exception_finally_ordering.eml   # -> OK (fixpoint)
```
