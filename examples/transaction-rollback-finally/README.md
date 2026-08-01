# Transaction log: `finally` as the only thing holding the books

`transaction_rollback_finally.eml` is a small transaction log in which
`finally` is the only thing standing between a half-applied batch and a
consistent one.

**What it exercises**: whatever happens in the `try` body — falling
through, returning, raising, breaking out of a loop — the `finally`
block runs before control leaves. Easy to state, easy to get wrong,
because the common case works even in an implementation that handles
nothing else.

Three of the five transactions leave the `try` body **without** falling
off the end:

| path | how it leaves | what `finally` must still do |
|---|---|---|
| commit | `return` from inside `try` | close the transaction |
| abort | `raise` | close it before the exception propagates |
| retry | `break` out of a loop | close it and roll back |

Then it reconciles: `opened == closed` (nothing left dangling) and
`applied == committed` (nothing applied outside a committed txn). The
second is the interesting one — a `finally` that closes the transaction
but forgets to roll back leaves the counters balanced and the data
wrong, which is the failure mode that survives casual testing.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  rollback withdraw (0)
  begin sweep
  rollback sweep (2)

opened:    5
closed:    5
applied:   4
committed: 4
balance:   70

Every transaction closed, and only committed work reached the balance.
expected balance: 70
Three of the five transactions here leave the try body without falling off
the end - one returns, one raises, one breaks. An implementation that runs
finally only on the fourth path balances the first two counters and still
loses money.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`transaction_rollback_finally.trace.jsonl` beside this file is the recorded execution.
