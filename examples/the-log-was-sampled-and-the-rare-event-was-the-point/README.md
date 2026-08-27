# The log was sampled and the rare event was the point

`the_log_was_sampled_and_the_rare_event_was_the_point.eml` - Request logging was sampled at 1 percent to bring the bill down. What each class of event looks like afterwards is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Sampling was the right call and it was done properly. The bill was real, the 1 percent was chosen so the error-rate estimate would still be accurate to three decimal places, and that claim was checked rather than assumed. The alternative on the table was cutting retention from 30 days to 3, which would have removed whole incidents instead of thinning them. Sampling keeps every day and thins every day equally, which is the fairer of the two.

A uniform sample multiplies every count by the same factor. The counts are not uniform: routine events are hundreds of thousands a day and the ones worth investigating are a handful. Multiplying a handful by one hundredth does not thin it, it removes it.

What a sample preserves is a RATE. What an investigation needs is an INSTANCE, and specifically several instances close enough together to compare. Those are different things and only the first survives division.

```
requests per day : 10000000
sampled at       : 1 percent
a pattern needs  : 3 instances to compare
```

```
class          per day   sampled/day   days to 3 sampled instances
  routine     200000        2000            0
  common error     2000        20            0
  uncommon     200        2            1
  rare     20        under 1          15
  very rare     2        under 1          150
```

```
without sampling, the same column
  routine     200000 per day -> 0 hours
  common error     2000 per day -> 0 hours
  uncommon     200 per day -> 0 hours
  rare     20 per day -> 3 hours
  very rare     2 per day -> 1 days
```

```
the sampling is uniform; what it costs is not
class          unsampled wait   sampled wait     multiplier
  routine     0 min          0 min       100x
  common error     2 min          200 min       100x
  uncommon     21 min          2100 min       100x
  rare     216 min          21600 min       100x
  very rare     2160 min          216000 min       100x
```

```
  the multiplier is 100 in every row, because it is 100 over the sample percent
  the consequence is nothing in the first rows and total in the last,
  because the rows differ by five orders of magnitude and the sample
  does not
```

```
control - the error rate, which sampling estimates correctly
  true rate     : 2000 in 10000000 = 200 per million
  sampled rate  : 20 in 100000 = 200 per million
  difference    : 0 per million
  the estimate is exact, and it was exact for every class
```

```
  a rate is a ratio and division does not disturb a ratio
  an instance is a thing and division removes 99 of every 100 of them
  the pre-change check measured the first
```

```
questions the sampled log can and cannot answer
  how often does this happen           yes, to three decimals
  is it getting worse                  yes, the trend survives
  which customers are affected         no, 99 of 100 are not in the sample
  what did the failing requests share  no, that needs the instances
  show me three to compare             no, for anything under 300 a day
```

```
null control - the same 1 percent over classes of similar size
  class a: 90000 per day -> 900 sampled
  class b: 80000 per day -> 800 sampled
  class c: 70000 per day -> 700 sampled
  class d: 60000 per day -> 600 sampled
  classes with enough sampled instances : 4 of 4
  same sampling rate, same code, and it costs nothing here
```

```
keeping the bill and the instances at the same time
  sample the routine class at 1 percent
  keep everything that errored
  errors are 222 per million of traffic, so keeping all of them costs
  0 percent of the unsampled bill
  the saving was never coming from the rows worth keeping
```

Sampling kept all 30 days instead of cutting retention to 3, and the 1 percent was chosen so the error-rate estimate stayed accurate - which it did, exactly. A rate is a ratio and survives division. An investigation needs instances, and a class at 20 a day goes from 3 hours to 15 days. The multiplier was 100 in every row, and the rows span five orders of magnitude.

Verify it yourself:

```bash
pnpm eml run examples/the-log-was-sampled-and-the-rare-event-was-the-point/the_log_was_sampled_and_the_rare_event_was_the_point.eml
```
