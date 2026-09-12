# The page was assembled from fragments each fresh

`the_page_was_assembled_from_fragments_each_fresh.eml` - Every fragment on the page was within its cache TTL when it was read, and each freshness check is real. When the fragments were read relative to each other is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The caching is careful per fragment. Each fragment has a 30-second TTL; a fragment past its TTL is refetched, not served stale; the TTL is checked at the moment of read; and no fragment on the page had expired.

The page is assembled over 40 seconds, so the first fragment is read 40 seconds before the last.

```
fragments                       : 8
  each TTL                      : 30 seconds
  served past TTL               : 0
  within TTL                    : 8
seconds to assemble the page    : 40
  page span over one TTL by     : 10 seconds
```

```
a shared total changed at second: 20
  fragments read before it      : 5
  fragments read after it       : 3
totals shown that never coexisted : 1
```

```
the per-fragment freshness
  each fragment TTL : 30 seconds
  past its TTL : refetched, never served stale
  checked : at the moment of read
  fragments expired on the page : 0
  fragments within TTL : 8
  verdict : EVERY FRAGMENT FRESH
```

```
  checking the TTL at read time rather than trusting an
  age stamp is the part done right here, and it is why no
  fragment is stale
```

```
fresh but not simultaneous
  each fragment : read within its 30-second window
  the window the page spans : 40 seconds
  so two fragments both fresh : can still be read 
    40 seconds apart
  a value that changed at second 20 : is old in the
    ones read before and new in the ones read after
  what freshness bounds : age, not agreement
```

```
the page the viewer gets
  fragments showing the old total : 
    5
  fragments showing the new total : 
    3
  a state where both were true at once : never existed
  is any fragment stale : no; each is inside its TTL
  what the page is : a snapshot of no single instant
```

```
null control - read all fragments at one version
  inconsistent pages, snapshotted : 
    0
  inconsistent pages, assembled over time : 
    1
  fragments that go stale : 0
  no TTL and no fragment changed; the reads stopped being
  spread across a window in which the data moved
```

```
what per-fragment freshness guarantees
  each fragment is within its TTL when read : exactly, 30
    seconds, refetched otherwise, checked at read
  the page is a consistent snapshot : not addressed; each
    fragment is within its 30s TTL, and freshness is not
    simultaneity - 5 fragments were read before a change and 
    3 after, so the page shows a mix that never coexisted
```

```
freshness bounds how old each part is, and consistency asks that the parts be
of one instant; a page assembled across a window longer than nothing can be
all-fresh and still show a whole that never existed
```

Each fragment is within its 30-second TTL, refetched otherwise, checked at read - none stale. The page takes 40 seconds to assemble, longer than a TTL, so a total that changed at second 20 is old in 5 fragments and new in 3, a snapshot of no instant under 0 stale fragments.

Verify it yourself:

```bash
pnpm eml run examples/the-page-was-assembled-from-fragments-each-fresh/the_page_was_assembled_from_fragments_each_fresh.eml
```
