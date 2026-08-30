# The lock was released before the result was visible

`the_lock_was_released_before_the_result_was_visible.eml` - A worker takes a lock, computes a value, writes it, and releases. The lock is held across the whole critical section. What a second worker sees at the moment of release is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The lock is correct and its scope was chosen carefully. It covers the read, the computation and the write, so no two workers can compute the same key at once and no partial state is ever left behind. Narrowing it further would reintroduce the duplicate work it was placed to prevent. Every claim the lock makes about mutual exclusion holds.

A lock orders the writers. It says nothing about when a write becomes READABLE, and those are two different events whenever the write goes through a buffer, a replica, a cache, or any layer that acknowledges before it publishes.

So the second worker acquires a lock that is genuinely free, reads a store that is genuinely consistent, and finds nothing there.

```
workers                       : 40
time to compute an entry      : 2400 ms
write to readable, after ack  : 35 ms
lock acquire to first read    : 14 ms
```

```
the lock, against what it promises
  workers inside the section at once : 1, always
  partial states observed            : 0
  lost updates                       : 0
  deadlocks                          : 0
  defects in the lock                : 0
```

```
  the critical section is exactly as exclusive as it says
```

```
one handover, in milliseconds after worker A releases
  0    A releases the lock
  0    B acquires it, legitimately
  14   B reads the store
  35   A's write becomes readable
```

```
  B reads 21 ms before the value it is looking for exists
  B finds nothing, and does the work again
```

```
  a handover collides when B reads inside that window
  window            : 21 ms
  work per entry    : 2400 ms
  collisions        : 87 per ten thousand handovers
```

```
  handovers per hour     : 60000
  duplicated computations: 522 per hour
  wasted work            : 1252800 ms per hour
```

```
what every instrument says about this
  lock contention        : normal
  lock hold time         : 2400 ms, as designed
  mutual exclusion       : never violated
  store consistency      : never violated
  duplicate work         : not measured by either
```

```
  the lock is asked about exclusion and answers correctly
  the store is asked about consistency and answers correctly
  the question that fails is about the gap between them
```

```
handover   B reads at   value readable at   B finds it
  1          7 ms        35 ms              no
  2          14 ms        35 ms              no
  3          21 ms        35 ms              no
  4          28 ms        35 ms              no
```

```
  every row has a correctly held lock and a correctly consistent store
```

```
control - is the lock earning its place
  computations per hour without it : 60000
  computations per hour with it    : 2022 (1500 needed + 522 duplicated)
  share still duplicated           : 87 per ten thousand
  exclusion failures               : 0
```

```
  removing the lock returns every one of those 60000 computations
```

```
null control - the same lock over a store with no publish lag
  publish lag        : 0 ms
  window             : 0 ms
  duplicate computations : 0 per hour
  same lock, same scope, same hold time
  the lock was never the variable
```

```
what releasing a lock announces
  the section is free for the next holder : yes, exactly
  the work done inside it is readable     : not stated
  and nothing in acquire/release names the second thing
```

```
the fix is not a wider lock, which would hold across a
publish nobody can bound; it is to release on the event that
matters - the value being readable - rather than on the write
returning
```

The lock holds 2400 ms per entry with 0 exclusion failures, 0 lost updates and 0 partial states, and it cuts 60000 computations an hour to 2022. Those 522 - 87 per ten thousand - remain because a write is acknowledged 35 ms before it can be read while the next worker reads 14 ms after acquiring, leaving a 21 ms window in which the lock is free, the store is consistent, and the value is not there.

Verify it yourself:

```bash
pnpm eml run examples/the-lock-was-released-before-the-result-was-visible/the_lock_was_released_before_the_result_was_visible.eml
```
