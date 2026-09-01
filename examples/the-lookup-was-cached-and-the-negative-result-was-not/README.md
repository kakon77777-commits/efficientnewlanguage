# The lookup was cached and the negative result was not

`the_lookup_was_cached_and_the_negative_result_was_not.eml` - The cache reports a ninety-nine point four percent hit rate and the number is correct. Where the database load comes from is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The cache is doing its job. Forty-one thousand three hundred and fifty lookups a second are answered without touching the database, the eviction policy was tuned against real traces, and removing the cache would take the database down in seconds. The hit rate is not inflated and it is not a vanity metric.

A hit rate is computed over lookups that CAN hit. A key that does not exist produces no entry to store, so it is not a miss the cache could have avoided — it is a lookup the cache is structurally unable to serve, and it is not in the denominator.

Something is enumerating identifiers. All of that traffic is absent keys.

```
lookups per second           : 48000
  for keys that exist        : 41600
  for keys that do not       : 6400
```

```
cache hits                   : 41350
misses on existing keys      : 250
database queries per second  : 6650
```

```
the reported hit rate
  numerator   : 41350
  denominator : 41600
  rate        : 9939 per ten thousand
  correctness incidents : 0
  verdict     : HEALTHY
```

```
  both operands are right and the ratio is right; the
  denominator is the set of lookups a cache could serve
```

```
database load, by cause
  misses on existing keys : 250
  lookups for absent keys : 6400
  share from absent keys  : 9624 per ten thousand
```

```
  the cache is at 9939 per ten thousand and 9624 per ten
  thousand of what reaches the database is traffic it was
  never asked about
```

```
the usual remedy
  double the cache size          : possible
  additional absent keys served  : 0
  additional existing keys served: at most 250
  ceiling on the improvement     : 250 of 6650
```

```
null control - absence cached for 60 seconds
  hit rate on existing keys : 9939 per ten thousand, unchanged
  repeat lookups for one absent key reaching the database : 
    0 after the first
  database queries per second : 250, for an enumerator
    that never repeats a key this is the wrong control and
    it is stated as such: negative caching helps repeats,
    and enumeration has none
```

```
what a high hit rate guarantees
  cacheable lookups are being cached : exactly
  the database is protected            : not addressed;
    the ratio's denominator excludes precisely the traffic
    the cache cannot absorb
```

```
a rate is a claim about its denominator; when the denominator
is 'the work this component can do', the rate cannot report
the work it cannot
```

The cache is at 9939 per ten thousand with 0 correctness incidents, and both operands of that ratio are right. Of the 6650 queries a second reaching the database, 6400 are lookups for keys that do not exist - 9624 per ten thousand - which are not misses, are not in the denominator, and are not reduced by any cache size, because each identifier is asked for once and never again.

Verify it yourself:

```bash
pnpm eml run examples/the-lookup-was-cached-and-the-negative-result-was-not/the_lookup_was_cached_and_the_negative_result_was_not.eml
```
