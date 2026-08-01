# Retry with backoff, and the ledger that audits it

`retry_with_backoff_ledger.eml` implements exponential-backoff retry and
then proves the retry loop did not lie about what it did.

**What it exercises**: retry code is nested by nature — a `try` inside a
`while` inside a `def`, with a `finally` that has to run on four
different exits, only one of which anybody tests.

The classic bugs, all of which leave the program running and the output
plausible:

- a `return` from inside the `try` skips the attempt counter
- the backoff is computed but never accumulated
- a non-retryable error is retried anyway, burning the whole budget
- the give-up path forgets to re-raise, so the caller sees success

`finally ran == attempts` is the load-bearing check. Two of the four
jobs leave the `try` body by `return` or by `raise`, and an
implementation that runs `finally` only on the fall-through path
produces this exact output apart from that one number.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 13 lines)

```
attempts:        9  (expected 9)
successes:       2
failures:        7
finally ran:     9 times
backoff seconds: 10  (expected 10)
succeeded / gave up / refused: 2 / 1 / 1

Every attempt counted, every finally ran, and delta was never retried.

`finally ran` equalling `attempts` is the load-bearing check. Two of the
four jobs leave the try body by `return` or by `raise`, and an
implementation that runs finally only on the fall-through path still
produces this exact output apart from that one number.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`retry_with_backoff_ledger.trace.jsonl` beside this file is the recorded execution.
