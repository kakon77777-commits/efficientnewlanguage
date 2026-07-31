# For sets, `<` means subset

`permission_set_algebra.eml` — models roles and permissions with set algebra.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `-` (difference) and `<`/`<=`/`>`/`>=` (subset and superset).

`a < b` is **proper subset**, not "less than". The consequence is that set
comparison is a PARTIAL order: for two roles that each hold a permission the
other lacks, all four comparisons are False and neither is bigger. Code that
sorts roles by `<` produces an arbitrary order — no error, just nonsense.

The whole family raised TypeError until this round.

Verify it yourself:

```bash
pnpm eml run examples/permission-set-algebra/permission_set_algebra.eml
pnpm eml trace examples/permission-set-algebra/permission_set_algebra.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/permission-set-algebra/permission_set_algebra.eml   # -> OK (fixpoint)
```
