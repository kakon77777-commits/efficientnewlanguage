# The id answers which record, not which person — 10 accounts, 6 people

`the_id_answers_which_record_not_which_person.eml` counts new signups two ways
from the same rows.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: nothing is wrong with the index. Account id is the right
key for an account table, it is unique, the lookup is correct, and every count
computed from it is a correct count of accounts. The two questions come apart
exactly when one person holds more than one account — not an edge case, just
what happens when someone signs up again with a work address.

```
rows
  accounts : 10
  distinct people : 6

new this month, two ways
  month 1 : 3 accounts, 3 people
  month 2 : 7 accounts, 3 people

  totals : 10 accounts, 6 people
  the account number is larger by : 4
```

Who is actually the same person is stated as data, not guessed from the string —
`kai@x`, `kai@work` and `kai@x2` are one person because the identity table says
so, and the program reads that table rather than pattern-matching:

```
people holding more than one account
  kai : 3 accounts
  mei : 2 accounts
  ravi : 2 accounts
  people with more than one : 3
```

**Month 1 is the control**, and it is deliberately free of returning people —
without it a reader cannot tell whether the account count is simply always
inflated:

```
In month 1 the two counts agree - every new account was a new person.
In month 2 they do not: 7 accounts, 3 people.
```

The index is correct and the count is correct. Both answer a question about
accounts, and growth is usually asked about people.

Verify it yourself:

```bash
pnpm eml run examples/the-id-answers-which-record-not-which-person/the_id_answers_which_record_not_which_person.eml
```
