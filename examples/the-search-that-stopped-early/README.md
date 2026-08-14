# The search that stopped early — 7 of 11 records never examined, report unchanged

`the_search_that_stopped_early.eml` runs the same scanner over a stream it was
written for and a stream that outgrew it.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the early exit was correct when it was written. Batches
were written one per stream and the end-of-batch marker really was the last
record, so continuing past it would have been reading uninitialised space.
Later the writer began appending batches to the same stream. Nothing about the
scanner changed, and nothing about the scanner is wrong in the world it was
written for.

**The one-batch stream is the control** — there the early exit costs nothing,
so the scanner cannot be blamed for its number alone:

```
one-batch stream
  records            : 5
  examined by early  : 4
  early exit reports : 1
  full walk reports  : 1
  the two agree - the early exit is invisible here
```

**Same scanner, a stream that grew:**

```
appended stream
  records            : 11
  examined by early  : 4
  never examined     : 7
  early exit reports : 1
  full walk reports  : 3

  missed             : 2
```

**Where the missed ones are:**

```
bad records by position
  before the first marker : 1
  after it                : 2
  the report is exactly the prefix, and says so nowhere
```

**And the part that survives review:**

```
The scanner returns 1 for both streams.
One of those streams holds 1 bad records and the other holds 3.
```

A scan that stops has two results — what it found, and where it stopped. Only
the first one is returned.

Verify it yourself:

```bash
pnpm eml run examples/the-search-that-stopped-early/the_search_that_stopped_early.eml
```
