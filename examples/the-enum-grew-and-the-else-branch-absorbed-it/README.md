# The enum grew and the else branch absorbed it

`the_enum_grew_and_the_else_branch_absorbed_it.eml` - A status field gained three new values. The field name, the type and the wire format did not change. What each consumer now does with those values is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding the values was right. The three new states describe real situations that were previously being crushed into "failed", and support could not tell a card decline from a network timeout from a fraud hold. Splitting them was asked for by the people who answer the phone.

Every consumer that reads a status has an else branch, because that is what you write when you enumerate the cases you know. An else branch is a promise about values that do not exist yet, made by somebody who could not see them. The producer widened the range and each consumer's promise was kept exactly as written.

Records are counted by value and by what each consumer does with them.

```
status value   records/day   releases old   in the original enum
  settled     812000        40             yes
  pending     96000        40             yes
  failed     21000        40             yes
  declined     9400        3             no
  timed_out     3100        3             no
  fraud_hold     240        3             no
```

```
records a day          : 941740
carrying a new value   : 12740, 135 per 10000
```

```
consumer            updated   else branch does
  ledger     yes       rejects unknown
  support console     yes       shows the raw value
  retry scheduler     no       treats it as pending and retries
  weekly report     no       counts it as settled
  fraud export     no       drops the row
  updated : 2 of 5
```

```
the three new values, per stale consumer, per day
  retry scheduler : 12740 records -> treats it as pending and retries
  weekly report : 12740 records -> counts it as settled
  fraud export : 12740 records -> drops the row
  none of them errors, none of them logs, and none of them is wrong about
  the values it was written for
```

```
the retry scheduler in detail
  it retries anything it reads as pending
  genuinely pending a day : 96000
  new values it also retries : 12740
  so its retry volume rose by 13%
  and a fraud_hold is a state that must not be retried, 240 a day
```

```
the weekly report
  settled, truly            : 812000
  settled, as reported      : 824740
  overstatement             : 12740 a day, 156 per 10000
  the report has no error, no gap and no anomaly, and it is wrong by
  exactly the volume of the new values
```

```
the contract, before and after
  field name   : status, unchanged
  wire type    : string, unchanged
  serialisation: unchanged
  schema version : unchanged
  set of values it can take : widened by 3 members
  every automated compatibility check reads the first four lines
```

```
checks that would separate the two kinds of change
  a declared value set, versioned with the field : does not exist
  a consumer test asserting on an unknown value  : 0 across 5 consumers
  a producer-side list of who reads this field   : does not exist
  the widening is visible in the producer's own diff and invisible in
  everything downstream of it
```

```
control - amount changed from integer cents to decimal string
  consumers affected : 5
  consumers that failed loudly : 5
  consumers that silently continued : 0
  the same size of change to meaning, and the difference is whether the
  wire representation moved with it
```

Splitting failed into three real states was asked for by the people who answer the phone, and it is a better contract. An else branch is a promise about values that did not exist, and 3 of 5 consumers kept theirs.

Verify it yourself:

```bash
pnpm eml run examples/the-enum-grew-and-the-else-branch-absorbed-it/the_enum_grew_and_the_else_branch_absorbed_it.eml
```
