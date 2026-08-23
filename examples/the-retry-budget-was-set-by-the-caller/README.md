# The retry budget was set by the caller

`the_retry_budget_was_set_by_the_caller.eml` - Every caller configures its own retry count. What each caller pays and what each caller costs are computed below, and they are not the same number.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Retrying is correct. A transient failure that succeeds on the second attempt is a request the user never saw fail, and every one of these teams picked their retry count after a real incident. Nobody here is careless and no single setting is wrong on its own.

A retry is decided by the caller and executed against the callee. The caller watches its own error rate fall. The shared service watches its load rise. Those are the same event measured from two ends, and the two ends have different dashboards, different budgets and different on-call rotas.

Both ends of every retry are counted below.

```
callers                       : 5
requests the users made       : 1431000
requests the service received : 1459771
added by retries              : 28771
```

```
caller       retries   user requests   service receives   added
  checkout     4        120000          122448        2448
  search     1        900000          918000        18000
  reporting     6        8000          8163        163
  mobile     2        400000          408160        8160
  admin     0        3000          3000        0
```

```
errors that still reach the user, per day
  checkout : 0 of 120000
  search : 360 of 900000
  reporting : 0 of 8000
  mobile : 3 of 400000
  admin : 60 of 3000
  each caller reports this number, and each one is correct
```

```
load each caller adds to the shared service, per day
  checkout : 2448
  search : 18000
  reporting : 163
  mobile : 8160
  admin : 0
  largest addition : search at 18000
```

```
ranked two ways
  most retries configured : reporting at 6
  most load added         : search at 18000
  different callers, so the retry setting alone does not find the cost
  search adds 18000 on 1 retry, because it is large
  reporting adds 163, because it is small
```

```
capping every caller at 2 retries
  callers whose setting changes : 2 of 5
  requests the service receives : 1459771 -> 1459771
  saved                         : 0
  the cap saves nothing at all, because at 2% per attempt the third
  retry onward is already rounding to nothing
```

```
where the added load actually is
  requests added by the FIRST retry only : 28560
  requests added by every retry          : 28771
  so the first retry is 99% of the cost
  and it is the one retry nobody would propose removing
```

```
control - admin, 0 retries
  user requests : 3000, service receives : 3000
  added : 0
  errors reaching its users : 60
  it imposes no load it did not receive, and its error rate is the
  untreated one
```

Every retry setting here was chosen for a real incident and each one works. A retry is decided at one end and paid at the other, so a caller's error rate and the service's load are one event with two owners.

Verify it yourself:

```bash
pnpm eml run examples/the-retry-budget-was-set-by-the-caller/the_retry_budget_was_set_by_the_caller.eml
```
