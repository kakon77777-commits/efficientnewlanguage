# "Are all requirements met" is a subset test

`prerequisite_checker.eml` — checks course eligibility.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: subset as an eligibility test and difference as the outstanding list.

Written as a loop with a flag, the classic bug is the empty case: a course
with no prerequisites should always be enrollable. `set() <= x` is True for
every x, so the subset form gets that right without a special case.

Verify it yourself:

```bash
pnpm eml run examples/prerequisite-checker/prerequisite_checker.eml
pnpm eml trace examples/prerequisite-checker/prerequisite_checker.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/prerequisite-checker/prerequisite_checker.eml   # -> OK (fixpoint)
```
