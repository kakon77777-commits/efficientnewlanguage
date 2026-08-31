# The replica was consistent and the clock was ahead

`the_replica_was_consistent_and_the_clock_was_ahead.eml` - The replica has never diverged from the primary by a single row. How many sessions it ends early is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Replication consistency is checked properly here: the replica applies the primary's log in order, a nightly job compares every row of every table by checksum, and it has reported zero divergence for the life of the cluster. There is no stale read, no lost update, no row that says one thing here and another there.

Consistency is a statement about the STORED VALUES. Every query that compares a stored value to the current time introduces a second operand the replication stream never carried, and that one comes from whichever machine is answering.

The replica's clock is three hundred and forty milliseconds ahead. Tokens are thirty seconds long. For the last three hundred and forty milliseconds of its life, a token is valid on the primary and expired here.

```
validations per day             : 62400000
token lifetime, ms              : 30000
replica clock ahead by, ms      : 340
rejected while still valid      : 707200
  recovered by a retry          : 604000
  reached a person              : 103200
```

```
the nightly row comparison
  tables compared      : all
  rows compared        : all
  rows diverged        : 0
  replication lag, rows: 0
  verdict              : CONSISTENT
```

```
  the check is exhaustive and its answer is correct; the
  replica holds exactly the primary's bytes
```

```
validating a token here
  expires_at : replicated, byte-identical to the primary
  now()      : read from this machine's clock
  the comparison mixes a value the log carried with one
  it did not
```

```
  no amount of replication correctness constrains the
  second operand
```

```
share rejected early : 113 per ten thousand of validations
```

```
the shape a user sees
  first attempt  : rejected, session ended
  retry          : accepted, same token, same second
  logged as      : transient
  reproduced in staging : no, the staging clock agrees
```

```
null control - the same replica, clock within two ms
  rows diverged              : 0, unchanged
  rejected while still valid : 4160
  it does not reach zero; the window is the clock error,
  and disciplining a clock bounds that error rather than
  removing it
```

```
what a consistent replica guarantees
  the values here equal the values there : exactly
  a query here answers as it would there : not addressed,
    for any query whose operands are not all values
```

```
replication carries data, and a comparison against the
current time is not data; the fix is to compare against a
time the primary stamped, not to replicate harder
```

The replica is consistent and the nightly comparison is right to say so: every table, every row, 0 diverged. Its clock is 340 ms ahead of a 30000 ms token, so 707200 validations a day - 113 per ten thousand - are rejected while the primary would accept them; 604000 recover on a retry that reaches the primary, and 103200 end a session that had not expired.

Verify it yourself:

```bash
pnpm eml run examples/the-replica-was-consistent-and-the-clock-was-ahead/the_replica_was_consistent_and_the_clock_was_ahead.eml
```
