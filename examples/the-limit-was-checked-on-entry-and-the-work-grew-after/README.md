# The limit was checked on entry and the work grew after

`the_limit_was_checked_on_entry_and_the_work_grew_after.eml` - The request body limit is enforced on every request and no oversized body has ever got through. What one accepted body costs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The limit is real and correctly applied. It is checked before the body is read into memory, it is checked against the actual byte count rather than a declared header, and the rejection is counted. Nothing about its enforcement is sloppy, and it has rejected genuine oversized uploads.

What it bounds is the WIRE. The service's cost is not the wire; it is the structure the wire expands into, and between those two sits a factor the admission check has no view of.

A body under the limit expands four hundred and twelve times. The concurrency the limit implies and the concurrency the memory allows differ by more than two orders of magnitude.

```
limit, bytes                 : 1048576
an accepted body, bytes      : 918000
what it expands to, bytes    : 378216000
```

```
worker memory, bytes         : 2147483648
concurrency the limit implies: 2339
concurrency that fits        : 5
```

```
the admission check
  measured             : actual bytes read, not a header
  checked before       : the body reaches memory
  oversized admitted   : 0
  genuine oversized uploads rejected this month : 1840
  verdict              : ENFORCED
```

```
  the check is not a formality and it is not bypassable;
  it does exactly what it says
```

```
the accepted body
  share of the limit it used : 8754 per ten thousand
  under the limit            : yes, comfortably
  expansion factor           : 412
```

```
  the factor is a property of the CONTENT - nesting depth
  and repeat counts - and the check reads a length
```

```
sizing the fleet on the limit
  workers provisioned for     : 2339 concurrent
  workers survive             : 5 concurrent
  the estimate is out by      : 467 times
```

```
  every request in the overshoot is individually legal
```

```
null control - the limit applied to the expanded form
  body admissible, bytes : 2545
  workers lost to a legal request : 0
  the limit did not change; the quantity it is measured
  against became the one that costs something
```

```
what an entry limit guarantees
  no request larger than this arrives : exactly
  no request costs more than this     : not addressed, for
    any input whose processing is not linear in its length
```

```
a limit binds the quantity it is measured against; put it on
the wire and it bounds bandwidth, and the resource that runs
out is whichever one the expansion multiplies
```

The limit is enforced on every request and 0 oversized bodies have got through. A body of 918000 bytes - 8754 per ten thousand of the limit - expands 412 times to 378216000 bytes, so a worker sized on the number the limit bounds expects 2339 concurrent requests and survives 5, an estimate out by 467 times made entirely of individually legal requests.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-checked-on-entry-and-the-work-grew-after/the_limit_was_checked_on_entry_and_the_work_grew_after.eml
```
