# The fix shipped and the cache still had the old answer

`the_fix_shipped_and_the_cache_still_had_the_old_answer.eml` - A fix is deployed to every server in forty seconds. The incident is closed. How long users keep seeing the bug is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The deploy is correct and it is fast. The rollout is atomic per server, health-gated, and reversible; forty seconds after the button, every process serving this endpoint is running the corrected code, and a request that reaches one of them gets the corrected answer. Nothing about the deploy is slow, partial, or in doubt.

A response cache holds an ANSWER, not a version. It has no way to know that the code which produced its stored copy has been replaced, because the thing it stores is the output and the output has no version in it.

So the fix is live and the wrong answer is still being served, from a cache that is behaving exactly as configured.

```
cache TTL           : 3600 seconds
rollout             : 40 seconds
requests per hour   : 180000
served from cache   : 96 percent
```

```
the deploy, against what it promises
  servers running the fix after 40s : all of them
  failed instances                  : 0
  rollbacks                         : 0
  requests reaching a server running old code, after 40s : 0
  defects in the deploy             : 0
```

```
  every claim on that list is true, and every one of them is
  about servers
```

```
after the deploy completes
  window where an entry can still be old : 3560 seconds
  requests in that window                : 180000
  of those, answered from cache          : 172800
  of those, answered by the fixed code   : 7200
```

```
  share still getting the bug : 96 percent
```

```
event                                   at
  fix merged                            T minus 12 minutes
  deploy starts                         T
  deploy completes, incident closed     T plus 40s
  last stale entry expires              T plus 3600s
```

```
  the incident is closed 59 minutes before the last user stops
  seeing what it was closed for
```

```
instrument              reads
  deploy status         green, completed
  error rate on servers 0, the fix works
  cache hit rate        96 percent, healthy
  incident state        resolved
  users seeing the bug  172800
```

```
  the first four are the ones anybody is looking at, and the
  cache hit rate being HIGH is what makes the fifth large
```

```
the reopened report
  user is on a cached response : yes
  engineer requests the endpoint directly : cache miss, sees the fix
  reproduced : no
  conclusion : cannot reproduce
```

```
  the engineer's request differs from the user's in the one
  dimension nobody is comparing
```

```
control - is the cache earning its place
  origin requests avoided per hour : 172800
  stale entries beyond the TTL     : 0
  incorrect cache keys             : 0
  defects in the cache             : 0
```

```
  the cache is not wrong; it is answering a question about
  freshness that was asked in seconds, with a fix that arrived
  in a unit the cache does not have
```

```
null control - the same deploy with a purge in the rollout
  purge completes at   : T plus 8s
  requests still stale : 400
  cache hit rate after : recovers to 96 percent
  TTL unchanged, hit rate unchanged, deploy unchanged
  one step was added to the thing that already knew a change
  had happened
```

```
what 'deployed' is a statement about
  which code the servers are running : exactly
  which answers are in flight        : nothing
  and every layer holding a previous answer - CDN, response
  cache, client store, an open page - is a copy the deploy
  cannot reach
```

```
the thing to enumerate before closing an incident is not the
servers, it is the places the wrong answer was allowed to rest
```

The rollout finishes in 40 seconds with 0 failed instances and 0 rollbacks, and after it no request reaches old code. For the next 59 minutes 172800 requests - 96 percent of the 180000 in that window - are answered from a cache holding the old output, which has no version in it to invalidate against, while the incident has already been marked resolved.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-shipped-and-the-cache-still-had-the-old-answer/the_fix_shipped_and_the_cache_still_had_the_old_answer.eml
```
