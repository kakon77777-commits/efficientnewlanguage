# The throughput doubled and the tail got worse

`the_throughput_doubled_and_the_tail_got_worse.eml` - The batch size was raised from 10 to 100. Throughput went from 166 to 416 items a second. What a single request experiences is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Batching is correct and the change was made for good reasons, with a before-and-after measurement to back it. Each batch carries a fixed 40 ms of overhead - one round trip, one transaction, one index update - and that cost is paid once whether the batch holds 10 rows or 100. Amortising a fixed cost over more work is the oldest optimisation there is, the benchmark confirmed it, and the confirmation was honest: throughput really did go up 2.5 times.

Throughput is items per second, measured across the batch. Latency is a property of one request, measured from when it arrived. Batching moves cost from the first quantity to the second: it makes the shared overhead smaller per item and makes every item wait for the whole batch.

Both numbers are real. Only one of them was on the dashboard.

```
each batch costs 40 ms fixed plus 2 ms per item
requests arrive at 200 per second
```

```
saturated benchmark - a full batch is always ready
config          batch   ms per batch   items/sec   ms per item   request latency
  no batching    1        42            23         4200 centims        42
  before    10        60            166         600 centims        60
  after    100        240            416         240 centims        240
```

```
  throughput and cost per item both improve with batch size
  request latency gets worse with batch size, in the same table
```

```
production at 200 arrivals per second
config          batch   fill time   first-in waits   last-in waits   mean wait
  no batching    1       5          47             42            44
  before    10       50          110             60            85
  after    100       500          740             240            490
```

```
throughput  : 166 -> 416 items/sec, better by 250 hundredths
worst wait  : 110 -> 740 ms, worse by 672 hundredths
```

```
at 200 arrivals a second, 166 items/sec was already enough
the capacity that was bought was not short, and the wait that was sold was real
```

```
service time vs sojourn time
  service time  : time inside the batch call            -> 240 ms
  fill time     : time waiting for the batch to fill    -> 500 ms
  sojourn time  : what the caller experiences           -> 740 ms
  the timer was started when the batch call began
  so it measured 240 of the 740 ms the caller waited
  it was not reporting a wrong number, it was reporting a different one
```

```
control - the quantity the change genuinely improved
  batch 1: 23 items/sec sustained
  batch 10: 166 items/sec sustained
  batch 100: 416 items/sec sustained
  configs measured: 3, and throughput rises in every step
  the benchmark was right, repeatable, and about the wrong axis
```

```
null control - the same batch of 100 at 10000 arrivals per second
  fill time     : 10 ms
  first-in waits: 250 ms
  at 200 arrivals it was 740 ms
  same batch size, same code, same overhead constants
  what changed is only how long 100 requests take to exist
```

```
batch size trades one axis against the other, always in the same direction
  items per second   rises with batch size
  cost per item      falls with batch size
  service time       rises with batch size
  fill time          rises with batch size, and falls with arrival rate
  sojourn time       rises with both
  a benchmark run at saturation cannot see the fill term at all
```

Amortising a fixed 40 ms over 100 items instead of 10 is correct, and the benchmark that confirmed it was honest: 166 to 416 items per second, repeatable. It ran against a saturated queue, where a batch is always full. Production arrives at 200 a second, where a batch of 100 takes 500 ms to exist, and the first request into each one waits 740 ms for a capacity increase it did not need.

Verify it yourself:

```bash
pnpm eml run examples/the-throughput-doubled-and-the-tail-got-worse/the_throughput_doubled_and_the_tail_got_worse.eml
```
