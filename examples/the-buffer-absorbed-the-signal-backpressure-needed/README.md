# The buffer absorbed the signal backpressure needed

`the_buffer_absorbed_the_signal_backpressure_needed.eml` - A queue has both a buffer to absorb bursts and backpressure to slow the producer. When each one engages is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both are correct. The buffer was sized from a measured burst profile and it absorbs the twice-daily spike that used to drop messages. Backpressure was added because an unbounded producer once filled the disk. Each was a good change and neither team was guessing.

Backpressure engages on observed lag. The buffer's entire purpose is to keep lag from being observed during a burst. So the buffer hides the signal for exactly as long as it has capacity, and backpressure engages only after the buffer is exhausted - which is the moment when slowing down helps least, because there is already a full buffer of work to drain.

Depth and latency are computed per minute across one sustained overload.

```
minute   produced/s   consumed/s   net/s   buffer depth   lag seconds   backpressure
  t+0     800         1000         -200     0         0            off
  t+1     1400         1000         400     24000         24            off
  t+2     1400         1000         400     48000         48            off
  t+3     1400         1000         400     60000         60            ON
  t+4     1400         1000         400     60000         60            ON
  t+5     1400         1000         400     60000         60            ON
  t+6     1400         1000         400     60000         60            ON
```

```
buffer capacity      : 60000 messages
backpressure engages : lag above 55 seconds
first engaged at     : t+3
```

```
how long the buffer conceals a sustained 400/s surplus
  buffer capacity / surplus per minute : 60000 / 24000
  minutes before the buffer is full    : 2
  during those minutes the observed lag rises from 0, so the signal is not
  absent - it is present and below the threshold that acts on it
```

```
the state at the moment backpressure engages
  buffer depth   : 60000 messages
  drain rate     : 1000/s
  time to drain, with the producer stopped completely : 60 seconds
  the oldest message in the buffer is already that old
  slowing the producer now removes future arrivals and does nothing about
  the queue that is already there
```

```
the same producer against a 6000-message buffer
  minutes before full : 0
  drain time at engagement : 6 seconds
  backpressure engages 2 minutes earlier and with 54 seconds
  less accumulated work to clear
  the smaller buffer drops more during the twice-daily burst, which is the
  thing the large one was bought for
```

```
buffer size against how late backpressure can act
  6000 messages : hidden for 0 min, 6 s of work at engagement
  20000 messages : hidden for 0 min, 20 s of work at engagement
  60000 messages : hidden for 2 min, 60 s of work at engagement
  120000 messages : hidden for 5 min, 120 s of work at engagement
  the buffer is sized by the burst profile and the engagement delay is a
  consequence nobody chose
```

```
a signal that a buffer cannot absorb
  observed lag       : absorbed, by design, that is what the buffer is
  buffer depth       : rises immediately, already recorded
  arrival minus service rate : rises immediately, already recorded
  controls reading either of the second two : 0
  the rate difference is visible in the first minute of the overload and
  the control waits for a quantity the buffer is built to suppress
```

```
control - a 60-second burst rather than a sustained overload
  burst : net 800/s, depth 48000, lag 48s
  after-1 : net -600/s, depth 12000, lag 12s
  after-2 : net -600/s, depth 0, lag 0s
  peak depth 48000 against capacity 60000, which is 80%
  peak lag 48s against the 55s threshold
  and the queue returns to empty on its own
  backpressure never engaged, and it was right not to
  the same buffer, the same rule, and the difference is whether the
  surplus ends on its own
```

The buffer absorbs the burst it was measured for and backpressure stopped a disk from filling. Backpressure waits on lag and the buffer's job is to absorb lag, so the second control cannot act until the first has run out.

Verify it yourself:

```bash
pnpm eml run examples/the-buffer-absorbed-the-signal-backpressure-needed/the_buffer_absorbed_the_signal_backpressure_needed.eml
```
