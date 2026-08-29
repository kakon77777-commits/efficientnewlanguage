# The mutex guarded the handle and not the data

`the_mutex_guarded_the_handle_and_not_the_data.eml` - A cache maps keys to entry handles, and a mutex guards the map. Thirty-two threads run against it without a crash, without a corrupt map, and without a single lost entry. What the mutex is protecting is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The lock is correct and its scope was chosen with care. It covers every operation on the container: insert, lookup, evict, resize. That is the part of the structure the standard library documents as unsafe to share, and it is the part that produces a segfault rather than a wrong number when it is wrong. Nobody has argued the lock should be wider, and the reason is good: holding it across the work would serialise the pool.

A handle is a name for a thing, not the thing. Two threads can take the same handle out of the map, entirely correctly, entirely under the lock, and then both hold a way to reach one object that nothing is guarding.

The map never breaks. Its invariants are the ones being enforced.

```
threads                 : 32
increments per thread   : 500
increments issued       : 16000
```

```
the map, under the lock
  operations performed  : 16000
  corrupt map states    : 0
  crashes               : 0
  entries lost or torn  : 0
  lookups returning the wrong handle : 0
```

```
  every invariant the mutex was placed to protect held, 16000 times
```

```
the object each handle points at
  read-modify-write cycles issued : 16000
  cycles that overlapped another  : 6688
  updates visible at the end      : 9312
  updates lost                    : 6688
```

```
step                                   thread A   thread B
  lock the map                           held        -
  look up the key                        ok          -
  unlock the map                         -           -
  lock the map                           -          held
  look up the key                        -           ok
  unlock the map                         -           -
  read the value through the handle      n           n
  add one                                n+1         n+1
  write it back                          n+1         n+1
```

```
  every lock operation above is correct and every one is honoured
  the two rows that collide are the three that never take the lock
```

```
who can see the lost update
  the mutex            : no, it was never asked about the value
  the map's invariants : no, they are all intact
  a data race detector : only if it watches the pointed-at object
  the final count      : yes, and only by comparing it to 16000
```

```
  expected : 16000
  observed : 9312
  the gap  : 6688
```

```
control - is the mutex doing its job
  container operations : 16000
  container failures   : 0
  lock ordering bugs   : 0
  deadlocks            : 0
  defects in the lock  : 0
```

```
  widening the lock to cover the work would fix the count and
  serialise the pool, which is the tradeoff it was placed to avoid
```

```
null control - the same lock over immutable entries
  increments issued : 16000
  updates lost      : 0
  final count       : 16000
  same mutex, same scope, same threads, same map
  the lock did not become correct; the data moved inside it
```

```
what a lock's scope actually names
  the region of code it covers      : stated, and enforced
  the memory that region touches    : not stated anywhere
  a handle carries reachability out of the region for free
  and nothing in the type or the lock records that it did
```

```
the question is not whether the critical section is correct
it is which bytes are still reachable after it ends
```

The mutex handled 16000 container operations with 0 failures, 0 deadlocks and 0 lock-ordering bugs, which is the entire job it was given. Of the 16000 read-modify-write cycles run through the handles it hands out, 6688 were lost, leaving 9312, because the three steps that touch the value are the three that hold no lock at all.

Verify it yourself:

```bash
pnpm eml run examples/the-mutex-guarded-the-handle-and-not-the-data/the_mutex_guarded_the_handle_and_not_the_data.eml
```
