# The tests were parallel and the fixture was shared

`the_tests_were_parallel_and_the_fixture_was_shared.eml` - Every test runs inside a transaction that is rolled back afterwards, so no test can see another's rows. What a rollback restores is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The isolation is the real thing, not a convention. Each test opens a transaction before its first line and rolls it back after its last, so a test that writes a thousand rows leaves none; the suite has been run in randomised order for a year; and the number of failures caused by one test seeing another's database rows is zero. Four thousand two hundred tests across eight workers.

A rollback restores the DATABASE. Three caches live in the worker process and a transaction has no opinion about process memory, so a test that changes one of them changes it for every later test in that worker.

Twenty-six tests mutate one of the three.

```
tests                           : 4200
workers                         : 8
wrapped in a rolled-back transaction : 4200
rows leaking between tests      : 0
days of randomised-order runs   : 365
```

```
process caches surviving a rollback : 3
rollback hooks that reset one   : 0
tests that mutate one           : 26
tests whose result depends on order : 140
  share of the suite            : 333 per ten thousand
```

```
retried infra failures last quarter : 212
  traced to the shared cache    : 148
  with another cause            : 64
```

```
the isolation
  where the transaction opens : before the test's first
    line
  where it rolls back         : after its last, always
  a test writing a thousand rows leaves : none
  randomised order runs        : 365 days of them
  failures from one test seeing another's rows : 0
  verdict : ISOLATED
```

```
  a rollback per test is stronger than truncating between
  files and it is why the database is genuinely clean
```

```
the rollback
  restores : everything the transaction wrote
  which is : rows
  what else the test changed : an in-process cache of
    feature flags, of the tenant record, of the currency
    table
  what a transaction knows about those : nothing; they
    are variables in a process
  hooks that reset them : 0
```

```
  the boundary is drawn around the database and the test
  runs in a process that outlives it
```

```
the randomisation
  what it shuffles : the order within each worker
  what that produces : a different set of pairs each run
  so a dependent test fails : sometimes
  what a sometimes-failing test is called here : a flake
  what a flake gets : a retry, which runs it alone or
    after a different neighbour, and it passes
  retried infra failures last quarter : 212
```

```
one retried failure
  first run  : after a test that mutated the flag cache
  retry      : in a different position
  result     : passes
  conclusion recorded : environment
  what would distinguish it : re-running in the SAME
    position with the same neighbours, which the retry
    does not do
  tests whose result depends on a neighbour : 140
```

```
the zero
  failures from one test seeing another's rows : 0
  is that number right : yes, and it was worth building
  what it counts : leakage through the database
  what it does not count : leakage through the 3
    caches, which no counter watches
  tests in the suite : 4200, of which 140 are exposed
```

```
null control - the hook clears what it cannot roll back
  rows leaking between tests : 0, unchanged
  hooks resetting a process cache : 3
  tests whose result depends on order : 0
  the isolation did not get stronger; the boundary moved
  from the transaction to the test
```

```
what a per-test transaction guarantees
  no test sees another test's rows : exactly, for all
    4200 of them, for 365 days of randomised order
  no test sees another test's effects : not addressed;
    the transaction bounds a database session, and a test
    also runs code
```

```
isolation is scoped to the store the mechanism understands;
randomising the order is the right instrument and it turns a
dependency into an intermittent failure, which a retry then
converts into an environmental one
```

Every one of 4200 tests runs inside a transaction that is rolled back, so rows leaking between tests number 0 across 365 days of randomised order. A rollback restores the database and not the 3 caches in the worker process, reset by 0 hooks, so 26 tests change what 140 others see - 333 per ten thousand of the suite - inside 212 retried infra failures.

Verify it yourself:

```bash
pnpm eml run examples/the-tests-were-parallel-and-the-fixture-was-shared/the_tests_were_parallel_and_the_fixture_was_shared.eml
```
