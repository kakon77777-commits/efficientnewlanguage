# Retry loops

`retry_until_success.eml` uses exceptions for control flow rather than
for reporting a crash.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the failure modes that are invisible on the happy
path.

Retry logic is easy to write slightly wrong — retrying forever, counting
attempts off by one, swallowing the final failure and returning a wrong
answer as though it succeeded, retrying an error that retrying cannot
fix. None of those shows up when the first attempt works.

So the failures here are **deterministic**, not random: `FlakyService`
fails its first `fail_times` calls and then succeeds, and a counter
records how many attempts each run actually took.

```
Retry budget: 3 attempts

  never fails:                          got 42 on attempt 1 (service saw 1 calls)
  fails once:                           got 42 on attempt 2 (service saw 2 calls)
  fails twice (last attempt works):     got 42 on attempt 3 (service saw 3 calls)
  fails three times (budget exhausted): gave up after 3 attempts; last error: ...
                                        (service saw 3 calls - the whole budget, no more)
```

The four scenarios pin the boundaries rather than looking impressive:
attempt counts of exactly 1, 2 and 3 catch off-by-one errors in the
budget, and the third case is the one where the *last permitted attempt*
is the one that works.

**The fourth case is the one that matters.** A retry loop that returned a
default instead of re-raising would print a plausible number there, and
the program would look like it worked. Re-raising is the whole difference
between a retry loop and a bug.

Verify it yourself:

```bash
pnpm eml transpile examples/retry-until-success/retry_until_success.eml
pnpm eml run examples/retry-until-success/retry_until_success.eml         # -> 3 succeeded, 1 gave up
pnpm eml trace examples/retry-until-success/retry_until_success.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/retry-until-success/retry_until_success.eml   # -> OK (fixpoint)
```
