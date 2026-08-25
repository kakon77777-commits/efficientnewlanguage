# The counter was emptied by whoever read it first

`the_counter_was_emptied_by_whoever_read_it_first.eml` - A counter that reports events since the last read, and a second collector added during a region migration. What each collector sees afterwards is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: A read-and-reset counter is a real design and a defensible one. The endpoint holds a small integer instead of a monotonic total that has to survive restarts, the collector does no subtraction and needs no memory of the previous value, and a missed scrape is visible as a larger number rather than invisible as a gap. Plenty of metrics protocols work exactly this way.

Adding a second collector is the safest operation there is. It is a read. It takes no lock anyone can see, it changes no configuration on the instance, and it is how every other metric on the fleet is collected twice for redundancy. The migration runbook lists it under low risk and it belongs there for every metric except this one.

A read that mutates is not a read. Two collectors on a normal counter both see the truth; two collectors on this one divide it, because the interval each of them measures is bounded by the other one's last visit rather than by its own.

```
true event rate    : 100 per second
collector interval : 30 seconds
alert threshold    : 80 per second
```

```
the timeline, collectors A and B fifteen seconds apart
  t=15   B reads, drains 15 seconds of events, counter returns 1500
  t=30   A reads, drains 15 seconds of events, counter returns 1500
  t=45   B reads, drains 15 seconds of events, counter returns 1500
  t=60   A reads, drains 15 seconds of events, counter returns 1500
  t=75   B reads, drains 15 seconds of events, counter returns 1500
  t=90   A reads, drains 15 seconds of events, counter returns 1500
```

```
collectors   seconds each read covers   events per read   reported rate   alert
  1            30                         3000              100             fires
  2            15                         1500              50              silent
  3            10                         1000              33              silent
  4            7                          700               23              silent
```

```
  with two collectors each reports 50 per second against a true 100
  the alert needs 80 and the highest number anywhere in the system is 50
```

```
control - a gauge on the same endpoint, read by the same two collectors
  queue_depth reported by A : 412
  queue_depth reported by B : 412
  they agree, and they are right
  so the endpoint, both collectors and the transport are all correct
```

```
control - the same counter before the migration, one collector
  seconds each read covers : 30
  reported rate            : 100
  true rate                : 100
  correct, for eleven months
  so the counter is not wrong either, and nothing was edited
```

```
how to combine two collectors' readings
  take either one    : 50, which is the rule for every other metric
  take the maximum   : 50, which is the rule for a counter that is not drained
  add them together  : 100, which is correct here and catastrophic anywhere else
  the right aggregation for this metric is the one that is a bug for the
  rest of them, and the collector cannot tell which kind it is holding
```

```
why nothing looked broken
  errors raised          : 0
  scrapes failed         : 0
  series missing         : 0
  collectors disagreeing : 0, they both report the same wrong number
  a disagreement would have been noticed within a day
  agreement is what made it survive
```

A read-and-reset counter is a real design and adding a second collector is a read. A read that resets is not one: each collector measures the interval since the other one's visit, so both report 50 per second against a true 100, they agree with each other, and the 80 threshold is never crossed.

Verify it yourself:

```bash
pnpm eml run examples/the-counter-was-emptied-by-whoever-read-it-first/the_counter_was_emptied_by_whoever_read_it_first.eml
```
