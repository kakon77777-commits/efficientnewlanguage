# The books balanced and the difference went to suspense

`the_books_balanced_and_the_difference_went_to_suspense.eml` - The daily reconciliation between the processor's settlement file and the internal ledger has balanced to the cent every day for four years. What balancing consists of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The control is genuine. The reconciliation is run by a team that does not report to the one that books the transactions; two people sign every day; the match is to the cent rather than to a tolerance; and a day that does not balance stops the close rather than being carried forward.

A line that cannot be matched is posted to a suspense account, and suspense is a ledger account like any other. Debits equal credits afterwards because the posting is what makes them equal.

```
settlement lines a day          : 214000
  matched automatically         : 213400
  matched by hand               : 308
  posted to suspense            : 292
  left for suspense, by subtraction : 292
  auto-matched                  : 9971 per ten thousand
  to suspense                   : 13 per ten thousand
```

```
days balanced in four years     : 1461
days that did not balance       : 0
signatures a day                : 2
```

```
suspense lines arriving a month : 6132
  cleared a month               : 900
  added a month                 : 5232
suspense lines open             : 148000
  older than ninety days        : 121000
  under ninety days             : 27000
  aged share                    : 8175 per ten thousand
reports carrying the balance    : 0
```

```
the daily reconciliation
  who runs it : a team that does not report to the one
    that books the transactions
  signatures : 2, every day
  tolerance : none; the match is to the cent
  a day that does not balance : stops the close rather
    than being carried forward
  days balanced : 1461 of 1461
  verdict : BALANCED
```

```
  giving it to an independent team is the part almost
  nobody does, and it is why the 0 is worth reading
```

```
what balancing means here
  the claim : debits equal credits
  what happens to a line that will not match : it is
    posted to suspense
  is suspense a ledger account : yes, like any other
  so after the posting : debits equal credits
  what could make them differ : a line left unposted,
    which the close does not permit
```

```
  the residual has somewhere to go, and the place it goes
  is inside the sum being checked
```

```
the suspense account
  lines open : 148000
  older than ninety days : 121000, or 8175 per ten
    thousand of the account
  arriving a month : 6132
  cleared a month : 900
  so added a month : 5232
  reports on which the balance appears : 0
```

```
  the number that is free to move is the one the daily
  report does not carry
```

```
null control - print suspense beside the balance
  days balanced : 1461, unchanged
  suspense lines shown : 148000
  of those, aged past ninety days : 121000
  the reconciliation did not weaken; the account that
  absorbs the residual stopped being off the page
```

```
what a ledger that balances guarantees
  debits equal credits : exactly, to the cent, 1461 days,
    2 signatures, an independent team
  every transaction was understood : not addressed; a
    line nobody could explain becomes a balanced entry
    by being posted to suspense
```

```
an identity that a posting restores is restored by the
posting; what it cost is the size and the age of the
account that took the difference, and the daily report
does not carry either
```

An independent team signs the reconciliation twice a day, matching to the cent with no tolerance, and 1461 days have balanced with 0 exceptions. Unmatched lines are posted to suspense, which is inside the sum, so 6132 arrive and 900 clear each month - 148000 open, 8175 per ten thousand of them past ninety days - across 0 reports that say so.

Verify it yourself:

```bash
pnpm eml run examples/the-books-balanced-and-the-difference-went-to-suspense/the_books_balanced_and_the_difference_went_to_suspense.eml
```
