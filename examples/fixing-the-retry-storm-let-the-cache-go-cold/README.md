# Fixing the retry storm let the cache go cold

`fixing_the_retry_storm_let_the_cache_go_cold.eml` - The retry storm was fixed and the cache hit rate fell. What the retries had been doing is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Fixing the storm was right and overdue. Three layers each retried three times, the amplification was measured at 27x during incidents, and the fix - one retry budget shared across the call chain - is the correct design. Nobody wants the storm back.

The retries were also traffic, and traffic is what kept the cache populated for the entries nobody asks for often. Removing the duplicate requests removed the refreshes that came with them, which nothing had ever asked for and which nothing was accounting for.

The cache is counted per key class before and after.

```
requests per day : 47020 -> 40490
  removed by the retry fix : 6530, which is 13%
  every one of those was a duplicate of a request already in flight
```

```
key class   requests before   after   windows covered before   after
  hot      40000            38000     288                      288
  warm      6000            2200     288                      288
  cool      900            260     288                      260
  cold      120            30     120                      30
```

```
  cool was covered in every window before and is not now
key classes that stopped being continuously warm : 1
```

```
cost of a miss, by class
  hot : 0 uncovered windows a day at 40ms each
  warm : 0 uncovered windows a day at 90ms each
  cool : 28 uncovered windows a day at 400ms each
  cold : 258 uncovered windows a day at 1200ms each
  recompute time added per day : 320800ms
```

```
which classes lost the most coverage
  largest loss : cold, 90 windows
  its share of traffic : 0%
  its recompute cost   : 1200ms
  the dearest class to recompute is cold at 1200ms
  the classes that fell out are the low-traffic, high-recompute ones, which
  is the combination the retries were quietly covering
```

```
what the dashboards do at the change
  request volume : down 13%, celebrated
  cache hit rate : down, and read as a cache regression
  p99 latency    : up, and attributed to the cache
  none of those is wrong, and the cause of all three is the same change
```

```
warming the cold classes deliberately
  cost of refreshing every window on purpose : 460800ms a day
  requests it adds : 288
  against 6530 duplicate requests removed, so the deliberate
  version is far cheaper than the accidental one it replaces
```

```
control - hot, 38000 requests a day against 288 windows
  covered before : 288, after : 288
  unchanged, because the real traffic alone covers every window
control - warm, 2200 requests a day against 288 windows
  covered before : 288, after : 288
  unchanged, because the real traffic alone covers every window
```

The retry fix is the correct design and 27x amplification was not defensible. The duplicates were also refreshes, and the keys they were refreshing are the ones with too little traffic to refresh themselves.

Verify it yourself:

```bash
pnpm eml run examples/fixing-the-retry-storm-let-the-cache-go-cold/fixing_the_retry_storm_let_the_cache_go_cold.eml
```
