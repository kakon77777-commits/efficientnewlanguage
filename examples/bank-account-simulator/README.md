# Case corpus: a self-authored bank account simulator

`bank_account_simulator.eml` is a class-based case in a self-authored batch
of six OOP utilities (alongside `examples/simple-stack/`,
`examples/simple-queue/`, `examples/inventory-tracker/`,
`examples/library-catalog/`, and `examples/parking-lot-tracker/`) — part of
growing the EML case corpus toward AI-native training scale, not a port of
an existing project.

A `BankAccount` class holds an owner and a numeric balance. It simulates a
realistic sequence of deposits and withdrawals on a single account —
including one deliberate overdraft attempt that is caught and reported
instead of crashing the program.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `class` + `self` attribute state (a string owner and
a numeric balance), instance construction via `ClassName(args) => var`,
arithmetic reassignment through `self` attributes (`self.balance + amount =>
self.balance`), and `try`/`except`/`raise ValueError` for an
insufficient-funds withdrawal — the same `raise ValueError(...)` idiom used
for an invalid move in `examples/mvp-tic-tac-toe/tic_tac_toe.eml`.

Verify it yourself:

```bash
pnpm eml transpile examples/bank-account-simulator/bank_account_simulator.eml   # -> Python
pnpm eml run examples/bank-account-simulator/bank_account_simulator.eml         # -> balance updates + overdraft message
pnpm eml trace examples/bank-account-simulator/bank_account_simulator.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/bank-account-simulator/bank_account_simulator.eml   # -> OK (fixpoint)
```
