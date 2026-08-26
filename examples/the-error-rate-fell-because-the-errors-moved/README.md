# The error rate fell because the errors moved

`the_error_rate_fell_because_the_errors_moved.eml` - Service A's error rate went from 3 percent to 0.2 percent after one change. Where the errors went is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The change was right and was argued for well. Service A was rejecting records on rules it had no business owning: it knew the wire format but not the domain, so it was guessing at what "valid" meant and getting it wrong in both directions. Records that were fine were being bounced because A's copy of the rules was six months behind B's, and support was fielding those. Moving validation to B, which owns the rules, removed a duplicate implementation and put the decision where the knowledge is. This is textbook, and it is correct.

A rejected record and a failed record are both one bad record. What separates them is where in the pipeline the badness is discovered, and therefore how much work has already been done that must now be undone. A rejects before anything is written. B fails after a partial write, which means a rollback, an orphaned row somewhere, and a support ticket.

The error rate on A's dashboard measures A. The change moved the errors out of A. The dashboard did exactly what it was built to do.

```
records per batch : 10000
bad records       : 300
```

```
before the change
  A rejects            : 300
  A error rate         : 30 per mille
  B receives           : 9700
  B errors             : 0
  B error rate         : 0 per mille
```

```
after the change
  A rejects            : 20
  A error rate         : 2 per mille
  B receives           : 9980
  B errors             : 280
  B error rate         : 28 per mille
```

```
  A improved from 30 to 2 per mille, a factor of 15
  the dashboard tracked A
```

```
bad records before : 300
bad records after  : 300
difference         : 0
nothing was fixed, and nothing was broken; the same records are still bad
```

```
cost of a bad record
  caught at A : 1 unit  - a 400 response, nothing written
  caught at B : 12 units - partial write, rollback, orphan row, ticket
```

```
  total cost before : 300 units
  total cost after  : 3380 units
  change            : 1126 hundredths of what it was
```

```
  the tracked error rate fell 1500 hundredths
  the total cost rose 1126 hundredths
  both numbers describe the same change and neither is wrong
```

```
stage at which a bad record is caught, and what is already done
  at the edge        nothing written                    1 unit
  after parse        buffer allocated                   2 units
  after enrichment   two upstream calls made            5 units
  inside the write   partial row, rollback, orphan     12 units
  the rules did belong to B; the check did not have to run where they live
```

```
control - a count no relocation can move
  bad records, before : 300
  bad records, after  : 300
  difference          : 0
  this is the number that would move if quality had changed
  it did not move, so quality did not change
```

```
null control - the same move, to a stage that costs the same as the edge
  A error rate after  : 2 per mille, identical to the real case
  total cost before   : 300 units
  total cost after    : 300 units
  difference          : 0 units
  the same dashboard improvement, and this time it is free
  so the dashboard cannot tell these two cases apart, and they are not the same
```

```
what a per-service error rate can and cannot see
  errors inside the service        yes
  errors this service caused elsewhere   no
  errors this service stopped catching   no, they leave the numerator
  total errors in the pipeline     no, there is no such dashboard
  every service can improve its own rate by declining to look
```

Moving validation to the service that owns the rules removed a duplicate implementation and stopped bouncing good records against a six-month-old copy of the rules. It was the right change. 300 records were bad before and 300 are bad after. A's error rate fell from 30 to 2 per mille and the cost of handling those records went from 300 to 3380 units.

Verify it yourself:

```bash
pnpm eml run examples/the-error-rate-fell-because-the-errors-moved/the_error_rate_fell_because_the_errors_moved.eml
```
