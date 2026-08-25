# The hash was uniform and the buckets were not

`the_hash_was_uniform_and_the_buckets_were_not.eml` - The hash was tested for uniformity and passed. The bucket occupancy in production is counted below, from the same hash.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both decisions here are the standard ones. A power-of-two bucket count turns the modulo into a bit mask, which is one instruction instead of a division, and it is what every hash table in every standard library does. Testing the hash by feeding it random keys and checking that the buckets come out level is also right, and the test passes, and it would catch a genuinely bad hash.

Uniformity is not a property of a hash function. It is a property of a hash function together with an input distribution, and the test supplies its own input. Random keys are the one distribution the allocator never produces.

The order ids come from a legacy allocator that hands out blocks of eight, so every id is a multiple of eight apart from its neighbour. That input is perfectly uniform over its own domain - it is not skewed, no value is hotter than another, and no key repeats. It simply shares a factor with the bucket count, and a modulo cannot separate a value from a multiple of its divisor.

```
ids            : 512, from 1000 to 5088
allocator step : 8
distinct ids   : 512, no key repeats, no key is hotter than another
```

```
buckets   gcd(step,buckets)   predicted used   counted used   busiest   even share
  16        8                   2                2              256       32
  32        8                   4                4              128       16
  63        1                   63               63             9         8
  64        8                   8                8              64        8
  100       4                   25               25             21        5
  101       1                   101              101            6         5
  128       8                   16               16             32        4
```

```
  the predicted and the counted column are two different methods and agree
  on every row: one divides by the common factor, the other bucket-counts
  all 512 keys
```

```
the deployed configuration, 64 buckets
  buckets that receive a key      : 8 of 64
  buckets that receive nothing    : 56
  keys in the busiest bucket      : 64
  keys per bucket if spread even  : 8
  the busiest bucket carries      : 8x its share
```

```
control - the same keys with 101 buckets
  gcd(8, 101) : 1
  buckets used : 101 of 101
  busiest      : 6 against an even share of 5
  the hash function is not edited, so the hash function was not the fault
```

```
control - what the uniformity test measured
  step 1   -> gcd 1   -> 64 of 64 buckets used
  step 3   -> gcd 1   -> 64 of 64 buckets used
  step 8   -> gcd 8   -> 8 of 64 buckets used
  a step of 1 uses every bucket, which is what the test saw and reported
  the test was correct about the input it was given
```

```
what each check can and cannot see
  uniformity test with random keys : passes, and would fail a bad hash
  uniformity test with real ids    : fails immediately, and was never run
  a count of empty buckets in production : 56 of 64, no such metric
  the bucket count was chosen for the mask, the step was chosen in 2014
  and neither decision is wrong beside the other one on a page
```

A power-of-two bucket count is a mask instead of a division and the hash passes a uniformity test on random keys. The allocator's step of 8 shares that factor: 8 of 64 buckets hold every key, the busiest at 8x its share, and changing 64 to 101 uses 101 of them with the same hash.

Verify it yourself:

```bash
pnpm eml run examples/the-hash-was-uniform-and-the-buckets-were-not/the_hash_was_uniform_and_the_buckets_were_not.eml
```
