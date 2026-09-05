# The cursor was stable and the filter changed

`the_cursor_was_stable_and_the_filter_changed.eml` - Keyset pagination returns no duplicates and skips no row, which offset pagination did both of. How many rows a full scan misses is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The change to keyset was correct and it fixed a measured bug. Offset pagination re-counts from the start on every page, so a row inserted behind the reader shifts everything down and the next page repeats one and skips another; the support queue had examples. Keyset carries the last row's sort key, so the reader resumes exactly where it stopped, and a differential test over a live table found no duplicate and no skip.

The cursor encodes the ORDER. It says where the reader is in the sort, and it says nothing about which rows are in the result set, because membership is decided by the filter each page re-evaluates.

A row whose status changes to matching, behind the cursor, is never returned.

```
rows                          : 2400000
page size                     : 100
pages in a full scan          : 24000
```

```
duplicates from keyset        : 0
skips from ordering           : 0
```

```
rows changing status mid-scan : 41000
  leaving the filter          : 22600
  entering behind the cursor  : 18400
never returned                : 76 per ten thousand
```

```
the pagination change
  offset : re-counts from the start, so an insert behind
    the reader shifts every later page
  keyset : resumes at the last row's sort key
  duplicates in a differential test over a live table : 0
  skips from ordering                                 : 0
  verdict : STABLE
```

```
  the support queue had examples of the old behaviour and
  it has none of this one
```

```
one cursor
  encodes        : the last row's position in the sort
  answers        : where am I in the order
  does not encode: which rows are in the result
  who decides that : the filter, re-evaluated on every page
```

```
  the two questions are different and only one of them is
  what stability was about
```

```
a row that changes status mid-scan
  stops matching, ahead of the cursor : correctly absent
  stops matching, behind the cursor   : already returned,
    and that is arguably right
  starts matching, ahead of the cursor: returned, fine
  starts matching, behind the cursor  : never returned,
    and no page will revisit it
```

```
what the reader can check
  pages read      : 24000
  rows returned   : consistent with the pages
  duplicates      : 0
  a count of the filter's set, taken at the end : would
    differ, and would differ for legitimate reasons too
```

```
null control - the scan reads at one snapshot
  duplicates       : 0, unchanged
  rows never returned : 0
  rows changing after the snapshot : 41000, and they
    belong to the next scan, which is a statement anyone
    can act on
  the cursor did not improve; the set stopped moving
```

```
what a stable cursor guarantees
  the reader resumes where it stopped : exactly
  the reader sees every matching row  : not addressed;
    the cursor is a position in an order, and membership
    is a predicate evaluated fresh on every page
```

```
pagination stability is about the sequence, completeness is
about the set, and a filter that can change makes the second
a question about isolation rather than about paging
```

Keyset pagination is stable and it fixed a real bug: no duplicates and 0 ordering skips in a differential test over a live table, where offset had both. The cursor carries a position in the sort, not a membership rule, so of the 41000 rows changing status during a 24000-page scan, the 18400 that begin matching behind the cursor - 76 per ten thousand - are never returned.

Verify it yourself:

```bash
pnpm eml run examples/the-cursor-was-stable-and-the-filter-changed/the_cursor_was_stable_and_the_filter_changed.eml
```
