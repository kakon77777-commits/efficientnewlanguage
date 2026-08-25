# The boost was a loan and nobody counted the lenders

`the_boost_was_a_loan_and_nobody_counted_the_lenders.eml` - A low-priority task held a lock that a high-priority task needed, and medium-priority work ran ahead of both. Priority inheritance fixed it. What the fix cost over the following twelve weeks is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Priority inheritance is the correct fix and it was applied correctly. When a task blocks on a lock, the holder is raised to the waiter's priority so it can finish and release. This is the textbook answer, it is what the literature recommends, and here it worked: the inversion was measured before and after, and afterwards there were none. That measurement is real and it stays true for every week below.

A boost is a loan. It is taken out on behalf of a particular waiter and it is owed back when that waiter is gone. Giving it back means knowing when the last waiter has left, and knowing that means keeping a count. The implementation kept a flag, because a flag answers the question the acquire path asks - is this task boosted - and it was the acquire path that was being written.

A flag can say boosted. It cannot say boosted on behalf of how many, so there is no moment at which it can say: not any more.

```
the system
  tasks                          : 300
  genuinely high priority        : 6
  cost of the original inversion : 120 ms, 3 medium tasks at 40 ms
```

```
week   permanently boosted   at top priority   high-priority wait ms   inversions
  w1     18                  24               44                    0
  w2     36                  42               80                    0
  w3     54                  60               116                    0
  w4     72                  78               152                    0
  w5     90                  96               188                    0
  w6     108                  114               224                    0
  w7     126                  132               260                    0
  w8     144                  150               296                    0
  w9     162                  168               332                    0
  w10     180                  186               368                    0
  w11     198                  204               404                    0
  w12     216                  222               440                    0
```

```
control - the metric the fix was judged by
  priority inversions before the fix : 3 per contended acquire
  priority inversions in week 1      : 0
  priority inversions in week 12     : 0
  the fix works, and it goes on working while everything below happens
```

```
control - a task that never takes a contended lock
  priority in week 1  : low
  priority in week 12 : low
  so this is not drift, it is the lock path and only the lock path
```

```
the tasks the priority system exists for
  wait before the fix : 120 ms
  wait in week 1      : 44 ms
  wait in week 12     : 440 ms
  the fix was better than the inversion until week 4
  after week 4 it is worse than the problem it removed
  and it is worse by 320 ms by week 12
```

```
what priority means at each end
  week 1  : 24 of 300 tasks at top priority, 8 percent
  week 12 : 222 of 300 tasks at top priority, 74 percent
  a priority that 74 percent of tasks hold does not order anything,
  so the scheduler is running arrival order with extra steps
```

```
flag against count
  flag  : one bit, answers is this task boosted, which is what acquire asks
  count : one integer, answers how many waiters, which is what release asks
  the release path was written second and reused the field it found
  tasks that would be at top priority in week 12 with a count : 6
  tasks at top priority in week 12 with a flag                : 222
```

```
quantities on the dashboard
  priority inversions per hour : yes, and it reads 0
  lock wait time               : yes, and it improved
  tasks currently boosted      : no such metric exists
  the number that was rising is the one the system had no name for
```

Priority inheritance is the right fix, it was applied correctly, and the inversion count has been 0 every week since. A boost is owed back to a specific waiter, and a flag cannot say how many, so 216 tasks now hold a priority they borrowed: high-priority work waits 440 ms against 120 ms before.

Verify it yourself:

```bash
pnpm eml run examples/the-boost-was-a-loan-and-nobody-counted-the-lenders/the_boost_was_a_loan_and_nobody_counted_the_lenders.eml
```
