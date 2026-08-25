# The load test used the shape production never has

`the_load_test_used_the_shape_production_never_has.eml` - The load test sends 8000 requests spread evenly over 8 shards. Production sends 8000 requests too. Which numbers the two runs agree on is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: An even spread is the right default for a load test and was chosen on purpose. It is reproducible, it needs no production data and so raises no privacy question, it isolates throughput from every other variable, and it gives a number that can be compared against last quarter's number. A test that replays real traffic is a test whose result changes when the traffic changes, which makes a regression and a customer indistinguishable.

The shape does not affect a sum. Total requests, total bytes, total CPU seconds are the same whichever shard each request lands on, so every aggregate the test reports is exactly right. Saturation is not a sum. A system fails at its busiest component, and an even spread is precisely the arrangement that minimises the maximum while holding the total fixed.

So the test is correct about every quantity it reports and silent about the one that decides whether the service stays up.

```
requests: 8000 over 8 shards, capacity 1500 each
```

```
shard   load test   production   capacity
  s0       1000        3200         1500
  s1       1000        1600         1500
  s2       1000        1040         1500
  s3       1000        800         1500
  s4       1000        560         1500
  s5       1000        400         1500
  s6       1000        240         1500
  s7       1000        160         1500
```

```
totals
  load test total : 8000
  production total: 8000
  difference      : 0
```

```
maxima
  load test busiest shard : 1000
  production busiest shard: 3200
  ratio                   : 32 tenths
  shards over capacity, load test : 0
  shards over capacity, production: 2
  the run that reported zero saturated shards was arithmetically correct
```

```
cache holds 10000 of 100000 keys, which is 10 percent
```

```
bucket     keyspace pct   production traffic pct   even-spread traffic pct
  hottest     1              52                       1
  warm     9              26                       9
  tail     90              22                       90
```

```
  hit rate, production shape : 78 percent
  hit rate, even spread      : 10 percent
  the even spread understates the cache by 68 points
```

```
so the one wrong shape moves two numbers in opposite directions
  headroom : overstated, the busiest shard is 2200 requests higher than tested
  cache    : understated, the real hit rate is 68 points better than tested
  neither error is conservative, and they do not cancel, because they
  land on different decisions: one sizes the fleet, the other sizes the cache
```

```
which quantities an even spread gets right
  a sum        : exact, the shape cannot move a total
  a mean       : exact, it is a sum divided by a constant
  a maximum    : wrong, and wrong in the optimistic direction by construction
  a distinct count : wrong, an even spread touches the most keys possible
  a percentile : wrong, it is a statement about a shape
  the report contained four sums, two means and no maxima
```

```
control - a quantity that is a sum
  bytes, load test  : 4096000
  bytes, production : 4096000
  difference        : 0
  the test is not broken and was never broken
  it is exactly right about everything that adds up
```

An even spread is reproducible, needs no production data and isolates throughput, which is why it was chosen. Holding the total fixed, it is also the arrangement that minimises the maximum: 0 shards over capacity in the test and 2 in production, from the same 8000 requests.

Verify it yourself:

```bash
pnpm eml run examples/the-load-test-used-the-shape-production-never-has/the_load_test_used_the_shape_production_never_has.eml
```
