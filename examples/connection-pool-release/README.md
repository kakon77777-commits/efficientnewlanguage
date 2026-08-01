# Connection pool: release on every exit path

`connection_pool_release.eml` is a lease-based connection pool whose
releases are driven by a context manager. It exists to answer one
question: does the release still happen when the body does **not** fall
off the end?

**What it exercises**: a `with` block has four ways out, and only the
first is the one people test.

| exit | how the body leaves | tested here |
|---|---|---|
| 1 | runs to the end | yes |
| 2 | `break` | yes |
| 3 | `return` | yes |
| 4 | raises | yes |

A pool that releases only on (1) looks perfect in a demo and leaks in
production, because (2) and (3) are what real code does the moment there
is an early exit. The leak is silent — nothing errors, the pool just
slowly runs out.

So the check is not "did it print the right thing" but the invariant a
pool must never break — `leased == released` — asserted after each of
the four paths separately, so a failure names **which** exit was not
covered. The lease/release log is checked for ORDER as well as totals: a
release that fires twice still balances the counters.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 22 lines)

```
  caught: the body failed
  outstanding after raise: 0

Lease/release log, in order:
  normal:lease
  normal:release
  break:lease
  break:release
  break:lease
  break:release
  return:lease
  return:release
  raise:lease
  raise:release

leased:   5
released: 5

Balanced on all four exit paths, and every lease was released once.
The three interesting paths are break, return and raise. A context manager
tested only on a body that runs to completion passes every time and still
leaks, because early exits are what production code is made of.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`connection_pool_release.trace.jsonl` beside this file is the recorded execution.
