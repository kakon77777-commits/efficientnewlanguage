# Flush timer is a debounce — the latency guarantee held while the system was idle

`flush_timer_is_a_debounce.eml` replays three arrival streams through two
buffer implementations and reports the worst latency any record actually
experienced, against the bound the timer is supposed to provide.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "flush after T ticks" and "flush T ticks after the last
arrival" differ by which event resets the clock — and the second is what you
get if the reset lives next to the code that handles an arrival, which is where
an arrival handler naturally lives.

Size limit 5, timer T = 10.

| stream | impl | flushes | worst latency | bound T |
| --- | --- | --- | --- | --- |
| idle trickle (gap 20) | deadline | 6 | 5 | 10 |
| idle trickle (gap 20) | debounce | 6 | 10 | 10 |
| steady stream (gap 4) | deadline | 17 | 9 | 10 |
| steady stream (gap 4) | debounce | 8 | **16** | 10 |
| slow stream (gap 9) | deadline | 18 | 9 | 10 |
| slow stream (gap 9) | debounce | 4 | **36** | 10 |

Both stay inside the bound on the idle trickle — that is the test everybody
writes, and it passes for both implementations, which is why the difference
never surfaces.

The arrival gap decides everything:

```
gap 4    flushes: 4   below the size limit: 0   worst latency: 16
gap 8    flushes: 4   below the size limit: 0   worst latency: 32
gap 9    flushes: 4   below the size limit: 0   worst latency: 36
gap 10   flushes: 4   below the size limit: 0   worst latency: 40
gap 11   flushes: 20  below the size limit: 20  worst latency: 10
gap 15   flushes: 16  below the size limit: 16  worst latency: 10
```

Below T the quiet never comes, the timer never fires once, and the only rule
left is the size rule. At gap 11 the timer fires on every flush and the bound
is exactly honoured. The guarantee is conditional on idleness and stated
unconditionally.

Note where the damage lands: the *slow* stream is the worst, not the fast one.
A fast stream is rescued by the size rule. Light load is where nobody is
looking.

**A wrong premise, kept in the file.** The first check asserted the two
implementations produce the *same* worst latency on an idle stream. Measured: 5
and 10. They never agree, even when idle, because the debounce measures from
the last **arrival** and the deadline from the last **flush**, and the flush
came first. Equality was the wrong claim; staying inside the bound is the one
that matters and the one that holds.

Verify it yourself:

```bash
pnpm eml run examples/flush-timer-is-a-debounce/flush_timer_is_a_debounce.eml
```
