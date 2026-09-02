# The shard key was uniform and the traffic was not

`the_shard_key_was_uniform_and_the_traffic_was_not.eml` - The shard key distributes forty million keys across sixty-four shards to within three parts in a thousand. What one shard serves is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The distribution test is real and it passes. Forty million keys were hashed, every shard's share was measured, and the largest deviation from even is three parts in a thousand. The hash was chosen after an earlier key produced a forty-percent imbalance, and the test exists because of that incident.

Uniformity of KEYS is not uniformity of REQUESTS. Each key carries its own traffic, that traffic is heavy-tailed in every system that has customers of different sizes, and the placement function has no input for it.

One key takes thirty-one percent of all requests.

```
keys                        : 40000000
shards                      : 64
keys per shard              : 625000
largest key deviation       : 30 per ten thousand
```

```
requests per second         : 180000
an even shard would serve   : 2812
the hottest key alone takes : 55800
the shard holding it serves : 57740
which is the even share times: 20
```

```
the key distribution test
  keys hashed          : 40000000
  shards               : 64
  largest deviation    : 30 per ten thousand
  written after        : an earlier key with a 40 percent
    imbalance
  verdict              : UNIFORM
```

```
  the test is not theatre; it caught a real problem once
  and it would catch it again
```

```
the two populations
  keys           : 40000000, measured, uniform
  requests       : 180000 a second, not measured by this test
  the placement function's inputs : the key
  its inputs about traffic        : none
```

```
  a hash cannot weight by a quantity it is not given, and
  giving it one would make placement depend on load and
  therefore move under it
```

```
remedies, and what each does
  rehash with a different seed : the hot key lands
    somewhere else and that shard becomes hot
  add shards                   : the even share falls,
    the hot key does not
  split the key                : needs a second dimension
    in the data, which is an application change
```

```
the hot shard's load that is one key : 9664 per ten thousand
```

```
null control - measure the request distribution, not the key distribution
  key deviation        : 30 per ten thousand, unchanged
  request imbalance    : 205334 per ten thousand of even
  the sharding did not change; the test started counting
  the quantity that arrives rather than the one that is
  stored
```

```
what a uniform shard key guarantees
  keys are spread evenly     : exactly
  load is spread evenly      : not addressed; load is a
    property of each key and the hash is a function of
    the key's name
```

```
a distribution test measures what it enumerates; enumerate
the keys and you learn about storage, enumerate the requests
and you learn about the shard that falls over
```

The key distribution is uniform to 30 parts in ten thousand across 64 shards, measured over 40000000 keys by a test written after a real 40 percent imbalance. One key takes 55800 of 180000 requests a second, so its shard serves 57740 against an even 2812 - 20 times the share, 9664 per ten thousand of it a single key - and the placement function was never told.

Verify it yourself:

```bash
pnpm eml run examples/the-shard-key-was-uniform-and-the-traffic-was-not/the_shard_key_was_uniform_and_the_traffic_was_not.eml
```
