# Over-invalidation hides a broken cache key — and the cache never worked

`over_invalidation_hides_a_broken_cache_key.eml` sweeps a cache's flush interval
and reports when a key that drops a field starts answering.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the rendered page depends on user *and* locale; the cache
key is the user alone. Two requests from one user in two locales share an entry.
That is a defect, and it has never produced a wrong answer:

```
the shipped policy, flush every 1
  wrong answers : 0
  cache hits    : 0
  the cache has never returned anything it stored
```

The thing hiding the defect is the cache not working. Relax the interval — a
pure performance change, touching nothing about keys — and it speaks on the
very first step:

```
broken key: wrong answers served, and cache hits, by flush interval
  flush every 1 : wrong 0, hits 0
  flush every 2 : wrong 1, hits 1
  flush every 4 : wrong 3, hits 4
  flush every 12 : wrong 5, hits 9

correct key: the same sweep
  flush every 1 : wrong 0, hits 0
  flush every 2 : wrong 0, hits 0
  flush every 4 : wrong 0, hits 1
  flush every 12 : wrong 0, hits 6
```

**The metric that would defend the broken key is inflated by the defect.** A
colliding key produces extra hits, because two different requests land on one
entry:

```
cache hits, broken key minus correct key
  flush every 2 : 1 vs 0, extra 1, wrong 1
  flush every 4 : 4 vs 1, extra 3, wrong 3
  flush every 6 : 6 vs 1, extra 5, wrong 5
  flush every 12 : 9 vs 6, extra 3, wrong 5
  intervals where the broken key looks like the better cache: 5 of 6
  intervals where every extra hit is exactly a wrong answer  : 5 of 6
```

At five of the six intervals every extra hit *is* a wrong answer. At the sixth
the subtraction stops being a clean comparison, because by then the correct key
is getting hits too.

**The defect does not depend on the policy at all:**

```
request pairs the broken key cannot tell apart
  pairs compared            : 66
  same key, different page  : 12
```

That number is the same at every flush interval. Only whether anyone is still
holding the entry changes.

Nothing is declared: every served page is compared against a freshly rendered
one, and the correct-key sweep runs alongside so the policy and the defect can
be told apart.

**Related, and a different question.**
[memo-key-collision](../memo-key-collision/) asks whether a key can distinguish
what it must — a property of the key. This one takes the collision as given and
asks what has been keeping it quiet.

Verify it yourself:

```bash
pnpm eml run examples/over-invalidation-hides-a-broken-cache-key/over_invalidation_hides_a_broken_cache_key.eml
```
