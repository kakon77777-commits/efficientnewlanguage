# The lock was held across a call that could block

`the_lock_was_held_across_a_call_that_could_block.eml` - A cache refresh is guarded by a mutex. The thread pool was raised from 8 to 32 and throughput did not move. What the pool size can and cannot change is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The lock is correct and its scope was chosen deliberately. The refresh reads the current entry, calls the upstream service for a new value, and writes the result back. Holding the lock across all three makes the whole operation atomic: no two threads can fetch the same key at once, so the upstream sees one request per key instead of thirty-two, and no thread can observe the entry half-updated. Narrowing the lock to just the write would reintroduce both problems. The wide lock is not laziness; it is the only scope that gives the guarantee that was wanted.

Inside the critical section there is 1 ms of local work and a 40 ms network call. A mutex serialises everything it covers. So the covered region runs one at a time, at 41 ms each, and the number of threads waiting to enter it does not appear anywhere in that sentence.

Throughput under a lock is one over the critical section duration. It is not a function of the pool size. Raising the pool raises the number of threads blocked on the mutex and nothing else.

```
critical section: 1 ms local + 40 ms network = 41 ms
```

```
pool     threads   throughput   threads waiting on the mutex
  before     8         24/s          7
  after     32         24/s          31
  absurd     512         24/s          511
```

```
  throughput is 24/s in every row, including the row with 512 threads
  the only column that responds to the pool size is the last one
```

```
the lock narrowed to the local work
pool     threads   lock permits   pool permits   throughput
  before     8         1000/s        195/s         195/s
  after     32         1000/s        780/s         780/s
  absurd     512         1000/s        12487/s         1000/s
```

```
  at 32 threads: 24/s wide, 780/s narrow, a factor of 32
  the factor is the thread count, exactly
```

```
what the wide lock was buying, and what it costs to give up
  wide lock  : upstream sees 1 request per key, throughput 24/s
  narrow lock: upstream sees up to 32 requests per key, throughput 780/s
  the fix is not 'narrow the lock', it is 'keep the guarantee without the wait'
  one per-key in-flight marker gives both: upstream still sees 1, and
  threads on OTHER keys are not serialised behind this one
```

```
control - the same two designs at a concurrency of one
  wide lock, 1 thread  : 24/s
  narrow lock, 1 thread: 24/s
  difference           : 0/s
  the defect is invisible to any test that does not run two threads
```

```
null control - the same wide lock over 41 ms of work that is all local
  critical section    : 41 ms, none of it a blocking call
  wide lock, 32 threads : 24/s
  narrowest possible    : 24/s
  difference            : 0/s
  the scope is identical and now costs nothing
  so the rule is not 'wide locks are slow'
  it is 'a lock costs the duration of what it covers, and a network call has
  a duration nobody on your side controls'
```

```
what raising a thread pool can move
  work bounded by CPU          yes, up to the core count
  work bounded by waiting      yes, that is what pools are for
  work inside one mutex        no, at any pool size
  the refresh path was the third kind and the pool was raised twice
```

```
one over the critical section is a ceiling, and a ceiling does not care how
many threads are underneath it
```

Holding the lock across the whole refresh is what makes upstream see one request per key instead of 32, and it is the only scope that gives that guarantee. It also puts a 40 ms network call inside a mutex, which fixes throughput at 24/s. The pool went from 8 to 32 and then to 512, and the answer was 24/s every time.

Verify it yourself:

```bash
pnpm eml run examples/the-lock-was-held-across-a-call-that-could-block/the_lock_was_held_across_a_call_that_could_block.eml
```
