# Finding outruns fixing — same capacity, same count fixed, 127 against 71

`finding_outruns_fixing.eml` simulates a defect queue under two work orders with
identical throughput.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: while the queue drains, "work in the order received" is
fair and costs nothing. Once arrivals outrun departures the queue never empties,
and the order stops deciding *when* things are fixed — it decides *which* things
are fixed at all, and how long each unfixed one keeps costing.

```
findings arriving : 10 over 6 periods
fix capacity      : 1 per period, 6 total
  arrivals exceed capacity - the queue cannot empty

in the order received
  cost accrued  : 127
  findings fixed : 6
  still open     : 4

worst first
  cost accrued  : 71
  findings fixed : 6
  still open     : 4

same capacity, same arrivals
  both policies fixed the same number : 6
  cost difference : 56
```

Nothing about capacity differs. Both policies fix six findings. Only the order.

**What is left behind differs by four times:**

```
left open at the horizon
  in the order received : ['f7', 'f8', 'f9', 'f10']
  worst first           : ['f1', 'f3', 'f5', 'f9']

  harm per period still accruing, order received : 20
  harm per period still accruing, worst first    : 5
```

**And the control — the same two policies with capacity to spare:**

```
the same two policies at capacity 10 per period
  in the order received : 48
  worst first           : 48
  identical - with spare capacity the order is a preference
```

That row is why the other numbers mean something: the difference is not an
artifact of the simulation, it appears exactly when the queue stops draining.

Nothing is declared: the queue is simulated period by period and cost is
accumulated as harm × periods spent unfixed.

A queue policy is free while the queue drains. The moment finding outruns fixing
it becomes the thing that decides what the system is like to use — and nobody
chose it for that job.

Verify it yourself:

```bash
pnpm eml run examples/finding-outruns-fixing/finding_outruns_fixing.eml
```
