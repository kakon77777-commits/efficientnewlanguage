# The counter was atomic and the pair was not

`the_counter_was_atomic_and_the_pair_was_not.eml` - Every increment of the seat counter is atomic and no increment has ever been lost. How many seats were sold is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The counter is correct. It is a hardware atomic, every increment is a single uninterruptible operation, and a stress test running sixteen workers for an hour ends with a count exactly equal to the number of increments issued. Not one is lost. Reading it is atomic too.

The booking is not one operation. It reads the counter, compares it to the limit, and increments — three atomics, and nothing holds between them. Every step is indivisible and the sequence is not.

Sixteen workers claim the last seats at once. Each reads a number below the limit, each is right about what it read, and each increments.

```
seat limit               : 500
claim attempts           : 2400
concurrent workers       : 16
seats granted            : 523
granted beyond the limit : 23
claims refused           : 1877
```

```
the counter under the stress test
  increments issued : 2400
  increments lost   : 0
  torn reads        : 0
  final value equals the number issued : yes
  verdict           : ATOMIC
```

```
  every claim in this test is true, and the counter would
  survive a far harsher one
```

```
one booking, in operations
  1. read the counter    : atomic
  2. compare to the limit: on the value read in step 1
  3. increment           : atomic
  held across 1 to 3     : nothing
```

```
  the limit is enforced against a value that was true when
  it was read and need not be true when step 3 runs
```

```
overshoot against the limit : 460 per ten thousand
```

```
the size of the window
  workers that can sit between read and increment : 16
  overshoot observed                              : 23
  overshoot at one worker                         : 0
```

```
  the bug is a function of the fleet size, so it arrives
  when the service is scaled and not when it is written
```

```
null control - compare-and-swap instead of read then add
  increments lost          : 0, unchanged
  seats granted            : 500
  granted beyond the limit : 0
  the counter did not become more atomic; the check and
  the increment became one operation instead of two
```

```
what an atomic counter guarantees
  no increment is lost                 : exactly
  a limit tested against it is honoured: not addressed;
    atomicity is a property of one operation and a limit
    is a relation between two
```

```
composing atomics does not compose their atomicity; the
question is never whether each step is indivisible but
whether anything can change between them
```

The counter is atomic and the stress test is right to say so: 2400 increments issued, 0 lost, 0 torn reads, final value exact. 523 seats were granted against a limit of 500 - 23 beyond it, 460 per ten thousand - because the read, the comparison and the increment are three atomic operations with nothing held across them, and 16 workers can stand between the first and last.

Verify it yourself:

```bash
pnpm eml run examples/the-counter-was-atomic-and-the-pair-was-not/the_counter_was_atomic_and_the_pair_was_not.eml
```
