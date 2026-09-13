# The queue was empty because the producer died

`the_queue_was_empty_because_the_producer_died.eml` - The consumer autoscaler scaled down to its floor when the queue drained, and its rule read the depth correctly. What a depth of zero means is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The autoscaler is well built. It reads the true queue depth, not a proxy; it scales on a sustained reading, not a single dip; it keeps a floor of one consumer; and it logs every scaling decision with the depth that triggered it.

A depth of zero can mean the consumers are caught up, or that nothing is arriving. The rule treats it as caught up.

```
queue depth                     : 0
consumers before                : 12
consumers after scaledown       : 1
  removed                       : 11
minutes the producer was dead   : 25
messages per minute that stopped: 800
backlog waiting on recovery     : 20000
```

```
the autoscaler
  reads : the true queue depth, not a proxy
  scales on : a sustained reading, not one dip
  floor : one consumer
  logs : every decision with its trigger depth
  the depth it read : 0
  verdict : CAUGHT UP, SCALE DOWN
```

```
  scaling on a sustained reading rather than a single dip
  is the part done right here, and it is why a brief lull
  does not thrash the fleet
```

```
the reading of zero
  meaning one : the consumers cleared the backlog
  meaning two : nothing is arriving to clear
  which one held here : two; the producer was dead
  what distinguishes them : the arrival rate, which the
    depth does not carry
  what the rule assumed : meaning one
```

```
the recovery that is coming
  minutes the producer was dead : 25
  messages that will arrive at once : 
    20000
  consumers left to take them : 1
  did the autoscaler misread the depth : no; it was zero
  did it misread what zero meant : yes
```

```
null control - read arrival rate, not depth alone
  depth still zero : 0
  consumers held when arrivals stop : 
    12
  minutes it would have held capacity : 
    25
  no message and no depth changed; the rule stopped
  reading an empty queue as finished work
```

```
what an empty queue guarantees
  the depth is zero : exactly, read truly, sustained, not
    a single dip
  there is no work to do : not addressed; a depth of zero
    is 'caught up' or 'nothing is arriving', and here the
    producer was dead 25 minutes - the autoscaler read
    starvation as completion and scaled 12 to 1
```

```
a depth measures the gap between what arrived and what was consumed, and zero
is that gap closed from either side; without the arrival rate beside it, an
idle queue and a starved one are the same number
```

It reads the true depth on a sustained signal with a floor of one - a correct read of zero. Zero meant the producer was dead 25 minutes, not caught up, so it cut 12 consumers to 1 with 20000 messages about to arrive at once.

Verify it yourself:

```bash
pnpm eml run examples/the-queue-was-empty-because-the-producer-died/the_queue_was_empty_because_the_producer_died.eml
```
