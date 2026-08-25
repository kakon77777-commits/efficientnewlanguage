# The limit was per key and the caller chose the key

`the_limit_was_per_key_and_the_caller_chose_the_key.eml` - The rate limiter allows 100 requests a minute per client, and it has never allowed a bucket to exceed 100. What it allowed in total is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Limiting per client rather than in total is the right design. A single global limit means one heavy caller starves everyone else, and that is the failure the per-key limiter was built to prevent. It prevents it. Every bucket is under its limit, on every minute, and that is not a rounding of the truth.

The key comes from a header the caller sends, which is also reasonable on its face: it is the only identifier available before authentication runs, it lets one account separate its own workloads, and partners asked for exactly that so their batch jobs would not throttle their interactive traffic.

A limit is only a limit if the thing being counted is outside the counted party's control. When the caller chooses the key, the caller chooses how many buckets to be, and the limiter enforces every one of them perfectly.

```
limit : 100 requests per minute per key
key   : the X-Client-Id header, chosen by the caller
```

```
client           keys   sent    allowed   rejected   buckets over limit
  web app          1      90      90        0          0
  mobile app       1      100     100       0          0
  partner batch    1      340     100       240        0
  indexing bot     40     4000    4000      0          0
```

```
  requests sent     : 4530 per minute
  requests allowed  : 4290 per minute
  buckets over their limit : 0, on every minute since the limiter shipped
```

```
the largest caller
  keys presented        : 40
  effective limit       : 4000 per minute
  times the stated limit : 40
  share of all allowed traffic : 93 percent
  it is one of four clients and it is not breaking any rule the limiter
  is able to express
```

```
control - the same limiter keyed on the authenticated account
client           sent    allowed   rejected
  web app          90      90        0
  mobile app       100     100       0
  partner batch    340     100       240
  indexing bot     4000    100       3900
  requests allowed : 390, against 4290
  difference       : 3900 per minute
  the limiter code is not edited, only where the key comes from
```

```
control - the three clients that present one key
  sent    : 530
  allowed : 290
  the partner batch is throttled from 340 to 100, correctly
  the limiter is exactly right for every caller that does not rotate
  which is every caller anyone tested it with
```

```
what the keys cost besides the limit
  new keys per minute from one client : 40
  bucket lifetime                     : 60 minutes
  live buckets from that client       : 2400
  live buckets from the other three   : 3
  the table is keyed by a value the caller invents, so its size is also
  chosen by the caller
```

```
what the limiter measures
  requests per key      : correct, always
  keys per account      : not measured, no such counter
  requests per account  : not measured, the account is resolved later
  the quantity the limit is meant to bound is the one with no counter
```

Per-key limiting stops one caller starving the rest, and no bucket has ever exceeded 100. The key is a header the caller sends, so the caller chooses how many buckets to be: 40 keys buy 4000 requests a minute, and keying on the account instead allows 390 across all four clients rather than 4290.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-per-key-and-the-caller-chose-the-key/the_limit_was_per_key_and_the_caller_chose_the_key.eml
```
