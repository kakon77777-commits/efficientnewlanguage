# The balance was non negative at every commit

`the_balance_was_non_negative_at_every_commit.eml` - Every committed transaction left the account non-negative, and each check is real. What two concurrent withdrawals each validated against is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The invariant is enforced properly per transaction. Each withdrawal reads the balance, refuses if the debit would take it below zero, and only then commits; the check and the debit are in one transaction; and every committed state on record is non-negative.

Two withdrawals ran concurrently, and each read the balance before either committed.

```
starting balance                : 100
withdrawal one                  : 80
withdrawal two                  : 80
balance each withdrawal read    : 100
```

```
one validated against           : 20 remaining, allowed
two validated against           : 20 remaining, allowed
committed states that were negative : 0
final balance                   : -60
the overdraft                   : 60
```

```
the non-negative check
  each withdrawal : reads the balance first
  refuses if : the debit would go below zero
  check and debit : in one transaction
  committed states on record : all non-negative
  transactions that each passed the check : both
  verdict : NEVER NEGATIVE, PER COMMIT
```

```
  putting the check and the debit in one transaction is
  the part done right here, and it is why no single
  transaction leaves a bad state
```

```
the two concurrent withdrawals
  what one read : 100, enough for 80
  what two read : 100, enough for 80
  when they read it : before either had committed
  so each validated against : a balance the other was
    about to spend
  the check each passed : true of the state it saw,
    false of the state it made
```

```
the account after both commit
  what each commit left, in isolation : non-negative
  what the two together left : -60
  the overdraft : 60
  did any transaction break its own check : no
  what was violated : a property of the pair, which
    neither transaction was checking
```

```
null control - serialize on the balance
  overdraft when serialized : 0
  overdraft when concurrent : 60
  withdrawals the second check would now refuse : 
    1
  no amount and no check changed; the second read stopped
  seeing a balance the first was about to spend
```

```
what a per-commit non-negative invariant guarantees
  every committed state is non-negative : exactly, check
    and debit in one transaction, all commits clean
  the balance never goes negative : not addressed; each
    withdrawal validated against the balance it read, and
    two interleaved reads both saw 100, so both committed
    and left -60
```

```
an invariant checked per transaction holds for each transaction against the
state it saw; concurrency means the state it saw is not the state it commits
into, and the property of the sequence is not the property of any step
```

Each withdrawal checks and debits in one transaction and every committed state is non-negative - no step breaks the rule. Two ran concurrently and both read 100 before either committed, so both were allowed and the account ended at -60, an overdraft of 60 no single commit created.

Verify it yourself:

```bash
pnpm eml run examples/the-balance-was-non-negative-at-every-commit/the_balance_was_non_negative_at_every_commit.eml
```
