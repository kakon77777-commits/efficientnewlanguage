# The allocation was pooled and the fragmentation was not

`the_allocation_was_pooled_and_the_fragmentation_was_not.eml` - The object pool cut allocations by ninety-eight percent and the measurement is right. What resident memory did is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The pool was the correct response to a real problem. Allocation churn was dominating the profile, the collector ran often enough to show up in the latency tail, and pooling the hot object removed both: allocations per second fell from two hundred and forty thousand to four thousand eight hundred, and collector pauses fell with them. That is a real improvement and the profile says so.

A pool holds a fixed slot and hands it out. The slot has to be big enough for the largest request it will serve, and every request smaller than that leaves the difference held and unusable.

The slot is sixty-four kilobytes. The mean request is two point four.

```
allocations per second, before : 240000
allocations per second, after  : 4800
removed                        : 9800 per ten thousand
```

```
pool slots                     : 8192
slot size, bytes               : 65536
mean request, bytes            : 2400
bytes held by the pool         : 536870912
bytes actually wanted          : 19660800
held and unusable              : 517210112
useful share of the pool       : 366 per ten thousand
```

```
resident memory before, MB     : 1240
resident memory after, MB      : 3180
grew by, MB                    : 1940
```

```
the allocation profile
  churn dominating the profile before : yes
  collector pauses in the latency tail: yes
  allocations per second after        : 4800
  collector pauses after              : down with them
  verdict                             : POOLED
```

```
  the pool was the right response and reverting it would
  bring back a measured problem
```

```
one slot
  sized for  : the largest request it must serve
  holds      : 65536 bytes
  typically carries : 2400
  difference : held, resident, and not available to anything
    else
```

```
  a general allocator would have returned that difference;
  a pool is the decision not to
```

```
the two measurements
  allocations per second : the metric the change was made
    for, and it improved
  resident memory        : a level, on another dashboard
  the change's write-up  : quotes the first
  a number relating them : none, because they are units of
    different things
```

```
null control - slots sized by class
  allocations per second : 4800, unchanged
  bytes held by the pool : 33554432
  useful share           : 5859 per ten thousand
  the pooling did not do less; the slot stopped being
  sized for the request it almost never serves
```

```
what pooling guarantees
  the allocator is called less often : exactly
  less memory is used                : not addressed, and
    usually the reverse: a pool is memory retained on
    purpose so that it does not have to be requested again
```

```
an optimisation trades one resource for another; the
write-up quotes the one it was made for, and the one it
spends is on a dashboard with a different owner
```

The pool removed 9800 per ten thousand of the allocations - 240000 a second down to 4800 - against a churn problem that was really dominating the profile. Each of its 8192 slots is sized at 65536 bytes for a mean request of 2400, so 517210112 bytes are held and unusable, 366 per ten thousand of the pool is doing work, and resident memory grew by 1940 MB on a chart nobody quoted.

Verify it yourself:

```bash
pnpm eml run examples/the-allocation-was-pooled-and-the-fragmentation-was-not/the_allocation_was_pooled_and_the_fragmentation_was_not.eml
```
