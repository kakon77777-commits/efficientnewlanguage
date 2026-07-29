# All-or-nothing, with rollback

`transaction_rollback_with.eml` is the pattern `with` exists for: a change
that either fully happens or fully doesn't, decided by how the block was
left.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

```
Opening balance: 100

  COMMIT   pay rent -> balance 70
  ROLLBACK pay rent again -> balance restored to 70
           pay rent again refused: insufficient funds
  COMMIT   salary -> balance 115

Final balance:   115
Replayed from the commit log: 100 + [-30, 45] = 115
  The balance matches the committed transfers exactly.
```

**What it exercises**: why this is a context-manager problem rather than a
`try`/`except` one. The rollback has to happen on *every* exit path,
including ones the author hasn't thought of yet. `__exit__` is told
whether the block raised and commits or rolls back accordingly, so a new
failure mode added inside the block later is handled without touching the
manager.

**The manager deliberately does not swallow the exception** — it returns
`False`, so the caller still learns the transfer failed. Rolling back and
staying silent would be the worst of both.

**Two checks, not one.** The final balance is compared against a total
replayed from the commit log — an independent source that only records
transfers that were actually accepted. Checking the balance alone would
pass even if a rolled-back transfer had left a partial trace; without the
rollback the account would sit at `-430` at the moment of failure and
`-385` at the end.

Verify it yourself:

```bash
pnpm eml transpile examples/transaction-rollback-with/transaction_rollback_with.eml
pnpm eml run examples/transaction-rollback-with/transaction_rollback_with.eml         # -> 2 commits, 1 rollback, balances agree
pnpm eml trace examples/transaction-rollback-with/transaction_rollback_with.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/transaction-rollback-with/transaction_rollback_with.eml   # -> OK (fixpoint)
```
