# Which clause actually decided

`which_clause_actually_decided.eml` - Access is granted if the caller is an administrator or owns the record. How often each of those was the reason is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The condition is correct and both clauses belong in it. Administrators need access to records they do not own, owners need access without being administrators, and writing both is the accurate statement of the policy.

In the traffic the system actually sees, one clause may never be the deciding one. The condition still returns the right answer every time, and the other clause has never been exercised by anything - which is a fact about the population, not about the code.

Each request is scored by which clause carried it.

```
requests : 10
  granted : 8
  denied  : 2
```

```
of the granted, which clause carried it
  administrator only : 3
  owner only         : 0
  both were true     : 5
```

```
the ownership clause has never been the deciding one
  it is correct, it is part of the policy, and removing it would change
  no answer in this traffic
```

```
granted if the condition were only the administrator clause : 8
granted if the condition were only the ownership clause     : 5
granted by both together                                    : 8
  dropping the ownership clause changes nothing on this traffic
  dropping the administrator clause would change 3
```

```
what a suite drawn from these requests establishes
  the administrator path works : yes, 8 requests
  the ownership path works     : not exercised
  a defect in the ownership clause would pass every one of these
```

```
the request shape that has not appeared
  a caller who owns the record and is not an administrator
  requests of that shape in this traffic : 0
  it is one row of the truth table and it is the whole of one clause's
  coverage, so a single fixture would move it from untested to tested
```

```
the same condition against a different population
  carried by ownership alone     : 3
  carried by administrator alone : 0
  here it is the administrator clause that is never the reason
  which clause is dead is a property of who is calling
```

```
control - traffic containing every combination
  administrator alone : 1, owner alone : 1
  both clauses are load-bearing here, and a defect in either one shows
```

The condition is the accurate statement of the policy and it answers every request correctly. Which of its clauses has ever mattered is decided by who calls, and one of them has been carried by the other the whole time.

Verify it yourself:

```bash
pnpm eml run examples/which-clause-actually-decided/which_clause_actually_decided.eml
```
