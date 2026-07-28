# A class that defends an invariant

`bank_account_invariant.eml` keeps one rule — the balance is never
negative — and raises rather than returning a status when asked to break
it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: classes plus `raise`, and the design point behind
choosing between them.

Returning `False` is easy to ignore: a caller writes
`account.withdraw(500)` on its own line and the failure evaporates.
Raising cannot be ignored by accident — the caller has to write a handler,
and if it does not, the program stops.

```
  deposit  50	-> balance 150
  withdraw 30	-> balance 120
  REFUSED  -500	-> insufficient funds: balance 120, requested 500
  deposit  200	-> balance 320
  REFUSED  0	-> withdrawal must be positive, got 0
  withdraw 120	-> balance 200
  REFUSED  -100000	-> insufficient funds: balance 200, requested 100000
```

## Two checks, not one

```
Final balance: 200
Sum of the 5 ACCEPTED operations: 200
  The balance equals the accepted operations - nothing slipped through.
  The invariant held: balance never went negative.
```

The second check is the one that does the work. `balance >= 0` alone
would still pass if a refused withdrawal had quietly succeeded for a
smaller amount. Comparing the balance against an **independent** total —
summed from the log of operations that were actually allowed, not from
the account — is what makes "refused" mean the balance genuinely did not
move.

Verify it yourself:

```bash
pnpm eml transpile examples/bank-account-invariant/bank_account_invariant.eml
pnpm eml run examples/bank-account-invariant/bank_account_invariant.eml         # -> 4 accepted, 3 refused, both checks pass
pnpm eml trace examples/bank-account-invariant/bank_account_invariant.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/bank-account-invariant/bank_account_invariant.eml   # -> OK (fixpoint)
```
