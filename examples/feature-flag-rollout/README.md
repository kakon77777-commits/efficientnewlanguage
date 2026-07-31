# Promotion as a subset question

`feature_flag_rollout.eml` — compares feature flags across environments.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: subset for readiness, difference for the change set, and order-safe reporting.

"Is this ready to promote" is a subset test and "what would promoting
change" is a difference — one line each, with the empty cases correct for free.

dev and prod are deliberately incomparable: each has a flag the other lacks, so
there is no "more advanced" environment, only a diff.

Verify it yourself:

```bash
pnpm eml run examples/feature-flag-rollout/feature_flag_rollout.eml
pnpm eml trace examples/feature-flag-rollout/feature_flag_rollout.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/feature-flag-rollout/feature_flag_rollout.eml   # -> OK (fixpoint)
```
