# The cache served through the origin outage

`the_cache_served_through_the_origin_outage.eml` - The service stayed healthy through the forty minutes under review, and every health signal it read was real. What health is measured on is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The health check is honest. It measures real served requests, not a synthetic ping; it reads end-to-end latency and error rate from actual traffic; it is evaluated every ten seconds; and it pages the moment either crosses its threshold.

Health is measured on reads, and reads are served from a cache that was still fresh while the origin was unreachable.

```
cache hit rate                  : 10000 per ten thousand
reads served from cache         : 2000000
minutes the origin was down     : 40
writes attempted                : 15000
  succeeded                     : 0
  failed unseen                 : 15000
alerts on origin reachability   : 0
write failure rate              : 10000 per ten thousand
```

```
the health check
  measures : real served requests, not a synthetic ping
  reads : end-to-end latency and error rate from traffic
  evaluated : every ten seconds
  pages when : latency or error rate crosses a threshold
  thresholds crossed : none
  verdict : HEALTHY
```

```
  measuring real traffic rather than a synthetic ping is
  the part done right here, and it is why the green is not
  a fake-healthy prober
```

```
the reads the check reads
  where they are served from : a cache, still within TTL
  what the cache needs from the origin : nothing, while
    its entries are fresh
  so a read : succeeds, fast, correct, origin down or not
  what the check therefore sees : health
  what it does not touch : the write path to the origin
```

```
the write path, in the same window
  writes attempted : 15000
  writes that reached the origin : 0
  what a failed write showed on the health board : nothing
  is the health signal wrong : no; the reads it measured
    really were healthy
  is a read-shaped signal the whole of health : no; and
    the cache will expire
```

```
null control - probe the write path too
  read health : 10000, unchanged
  write health : 0 per ten thousand
  alerts it would raise : 1
  no read and no cache entry changed; health stopped being
  measured only where the cache could answer
```

```
what a healthy service guarantees
  served reads are fast and correct : exactly, real
    traffic, every ten seconds, thresholds armed
  the system is healthy : not addressed; health is
    measured on reads and the cache served every read
    through a 40-minute origin outage - 15000 writes failed
    unseen, and the outage surfaces only when the cache
    expires
```

```
a cache in front of an outage is a held breath, and health measured on the
reads it answers is health measured on the breath, not the need for air; the
outage is real the whole time and invisible until the cache lets go
```

It measures real traffic every ten seconds and pages on a threshold - reads genuinely healthy. Those reads came from a still-fresh cache through a 40-minute origin outage, so 15000 writes failed unseen, 10000 per ten thousand, under 0 reachability alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-cache-served-through-the-origin-outage/the_cache_served_through_the_origin_outage.eml
```
