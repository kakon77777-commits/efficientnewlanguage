# The cache was invalidated and the cdn was not

`the_cache_was_invalidated_and_the_cdn_was_not.eml` - The application purges its cache on every write and the purge is verified within the request. What a user sees is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The invalidation is correct and it is the hard kind. The write and the purge are in the same transaction boundary, the purge is confirmed before the response returns rather than fired and forgotten, a read immediately after a write is verified to return the new value, and there is a test that fails if anyone makes the purge asynchronous.

It invalidates the cache the application OWNS. The rendered page is also held at the edge, by a system with its own expiry, which the application does not call and would need a credential to.

The edge holds a page for an hour.

```
writes per day                  : 18400
requests per day                : 24000000
edge ttl, seconds               : 3600
mean staleness after a write, s : 1800
```

```
served older than the origin    : 1940000
share                           : 808 per ten thousand
origin staleness incidents      : 0
```

```
the application cache
  purge and write in one boundary : yes
  confirmed before the response returns : yes, not fired
    and forgotten
  read after write returns the new value : verified
  a test fails if the purge becomes asynchronous : yes
  staleness incidents at the origin : 0
  verdict           : INVALIDATED
```

```
  this is the careful version; the easy version is a fire-
  and-forget purge and somebody deliberately did not write
  that
```

```
where else the page lives
  the edge          : holds the rendered page
  its expiry        : 3600 seconds, its own setting
  the application calls it : no
  could it          : with a credential nobody has issued
  does the origin know its content is cached there : no
```

```
  the two caches are correct and neither is aware of the
  other; only the request path knows both exist
```

```
the read-after-write test
  queries        : the origin
  passes         : always
  what it proves : the origin is fresh
  what a user reaches : the edge
  a test that queries the edge : would need to run from
    outside, and does not exist
```

```
null control - the purge also invalidates the edge
  origin staleness incidents : 0, unchanged
  served older than the origin : 0
  the application cache did not improve; the purge reached
  the copy the user actually reads
```

```
what a verified cache purge guarantees
  this cache no longer holds the old value : exactly
  no cache holds the old value             : not addressed;
    the purge names one store, and a request passes
    through every store between the user and the origin
```

```
invalidation is per-cache and freshness is per-path; a purge
is only as complete as the list of caches somebody wrote
down, and the one in front is usually owned by another team
```

The purge is the careful kind: in the write's boundary, confirmed before the response, read-after-write verified, with a test that fails if it is made asynchronous, and 0 staleness incidents at the origin. The edge holds the same page for 3600 seconds and is never called, so 1940000 requests a day - 808 per ten thousand - are served a version the origin no longer has.

Verify it yourself:

```bash
pnpm eml run examples/the-cache-was-invalidated-and-the-cdn-was-not/the_cache_was_invalidated_and_the_cdn_was_not.eml
```
