# The reconciliation matched the ledger to its own export

`the_reconciliation_matched_the_ledger_to_its_own_export.eml` - The daily reconciliation has matched to the cent for the whole quarter, and the match is real. What the two sides of it are is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reconciliation is run properly. It compares two totals, not one; it runs every day, unattended; a mismatch of a single cent halts settlement; and the result is logged with both figures.

The second total is an export generated from the first.

```
accounts                        : 4200
ledger total                    : 88400000 cents
export total                    : 88400000 cents
  reconciliation gap            : 0 cents
  discrepancies found           : 0
```

```
bank statement total            : 88815000 cents
  pending excluded from both    : 415000 cents
  true gap against the bank     : 415000 cents
  as a share of the bank total  : 46 per ten thousand
independent sources compared    : 1
```

```
the reconciliation
  compares : two totals, not one
  runs : every day, unattended
  on a one-cent mismatch : halts settlement
  logs : both figures
  days it matched : all of them
  verdict : RECONCILED
```

```
  halting on a single cent is the part almost nobody
  dares to wire up, and it is why a match here is trusted
```

```
the two totals
  the first : the ledger
  the second : an export generated from the ledger
  what that makes the match : the ledger against itself
  a row missing from the ledger : is missing from the
    export too, so the two still agree
  pending transactions in neither : 
    415000 cents
```

```
the statement from the bank
  its total : 88815000 cents
  the reconciled total : 88400000 cents
  the gap : 415000 cents
  what the daily match said about it : nothing; the bank
    is not one of the two sides
  where the gap lives : the pending class excluded from
    the ledger and therefore from its export
```

```
null control - reconcile against the bank, not an export
  ledger vs its export : 0 cents, unchanged
  ledger vs the bank : 415000 cents
  discrepancies it would raise : 1
  no figure changed; the second source stopped being
  derived from the first
```

```
what a matched reconciliation guarantees
  the two totals compared are equal : exactly, to the
    cent, every day, settlement halted otherwise
  the books are correct : not addressed; the export is
    generated from the ledger, so the two agree by
    construction, and 415000 cents excluded from both
    is invisible to their comparison
```

```
a comparison is evidence only between independent sources; two views of one
source agree because they are one source, and the error they share is the one
error the match can never surface
```

It compares two totals daily and halts on a one-cent gap - matched all quarter. The second total is an export of the ledger, so it is the ledger against itself: 415000 cents of pending sits in neither, and the bank shows a 415000-cent gap the match could not see, 46 per ten thousand, under 1 independent source.

Verify it yourself:

```bash
pnpm eml run examples/the-reconciliation-matched-the-ledger-to-its-own-export/the_reconciliation_matched_the_ledger_to_its_own_export.eml
```
