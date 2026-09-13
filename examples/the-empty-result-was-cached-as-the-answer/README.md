# The empty result was cached as the answer

`the_empty_result_was_cached_as_the_answer.eml` - The lookup service served every request from cache with a 300-second freshness window, and every value it served was within that window. What a failed fetch stored is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The cache is disciplined. It stores only what a fetch returned, never a fabricated value; every entry carries a TTL and is refetched on expiry; the hit rate and latency are on a dashboard; and a stored value is exactly the bytes the backend sent.

One backend fetch timed out and returned an empty list, and the empty list was cached like any other answer.

```
cache TTL                       : 300 seconds
reads in the window             : 40000
  backend fetches that timed out: 1
  served from the cached empty  : 39999
rows that actually existed      : 1200
errors surfaced to callers      : 0
reads given a false 'none'      : 9999 per ten thousand
```

```
the cache
  stores : only what a fetch returned
  TTL : on every entry, refetched on expiry
  hit rate and latency : on a dashboard
  a stored value : exactly the backend's bytes
  fabricated values stored : 0
  verdict : SERVING FRESH
```

```
  never storing a fabricated value is the part done right
  here, and it is why a cached answer is trusted to be a
  real answer
```

```
the timed-out fetch
  what the backend sent on timeout : an empty list
  what an empty list is, to the cache : a value, like
    any other
  stored with : the normal 300-second TTL
  what it means : 'no rows', authoritatively, for five
    minutes
  what it should have meant : the fetch failed, do not
    cache
```

```
the callers during the window
  reads served the cached empty : 
    39999
  rows they should have seen : 1200
  what they got : none, and no error
  is the cache serving stale data : no; the empty is
    inside its TTL
  is empty the answer : no; it is the shape of a failure
    that looks like an answer
```

```
null control - do not cache a failed fetch
  reads in the window : 40000, unchanged
  false 'none' served : 0
  reads that would have retried the backend : 
    39999
  no row and no TTL changed; a failure stopped being
  stored as though it were a result
```

```
what a fresh cache guarantees
  every value served is within its TTL and is what a
    fetch returned : exactly, no fabricated values
  the result set is current : not addressed; a failed
    fetch returned empty and the empty was cached like any
    answer - 39999 reads got an authoritative 'none'
    while 1200 rows existed, and 0 errors surfaced
```

```
an empty result and a failed fetch have the same shape and opposite meanings;
a cache that cannot tell them apart preserves a failure as fact and serves it,
fresh and wrong, until it expires
```

It caches only real fetch bytes with a TTL and never fabricates - every value fresh. A timed-out fetch returned empty and the empty was cached, so 39999 reads got an authoritative none over 1200 real rows, 9999 per ten thousand of the window, under 0 errors.

Verify it yourself:

```bash
pnpm eml run examples/the-empty-result-was-cached-as-the-answer/the_empty_result_was_cached_as_the_answer.eml
```
