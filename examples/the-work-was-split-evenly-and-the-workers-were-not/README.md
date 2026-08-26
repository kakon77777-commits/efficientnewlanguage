# The work was split evenly and the workers were not

`the_work_was_split_evenly_and_the_workers_were_not.eml` - A batch of 2400 documents is split across 8 workers. Every worker gets exactly 300. How long the batch takes, and how long the report says it takes, are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: An equal split is the right default and was chosen deliberately. It is the only allocation that needs no information about the workers, so it cannot go stale when a machine is replaced, it cannot be gamed, it is one line of code, and it is defensible to anyone who asks why they got the share they got. Every scheduler that has to run before it knows anything starts here.

The fleet is not uniform. Four machines are current generation, two are a generation behind, one is the old box nobody has decommissioned, and one is a VM on shared hardware. Nobody chose this; it accumulated.

A batch is not finished when the average worker is finished. It is finished when the last worker is finished. An equal split across unequal workers maximises the gap between those two numbers, because it gives the slowest machine exactly as much work as the fastest.

```
documents: 2400 split 8 ways = 300 each
```

```
worker   rate/min   assigned   seconds to finish
  w0        100         300         180
  w1        100         300         180
  w2        100         300         180
  w3        100         300         180
  w4        60         300         300
  w5        60         300         300
  w6        40         300         450
  w7        25         300         720
```

```
  batch finishes when the LAST worker finishes : 720 seconds
  mean worker completion time                  : 311 seconds
  the status page reported the mean
```

```
  fleet capacity                     : 585 documents per minute
  shortest possible batch time       : 246 seconds
  actual batch time                  : 720 seconds
  cost of the equal split            : 474 seconds
  that is 65 percent of the wall clock
```

```
  worker-seconds paid for   : 5760
  worker-seconds working    : 2490
  worker-seconds idle       : 3270
  utilisation               : 43 percent
```

```
  the four fastest machines finished in 180 seconds and waited 540 more
```

```
quantity                      does the split shape it
  documents processed         no, it is a sum
  documents per worker        no, that is what was equalised
  total worker-seconds        no, work is conserved
  batch completion time       YES, it is a maximum
  utilisation                 YES, it is a ratio against a maximum
  the dashboard showed the first three
```

```
a maximum is the only statistic an equal split gets wrong, and it is the
only statistic the customer experiences
```

```
control - a quantity no allocation can move
  documents completed, equal split      : 2400
  proportional shares before remainder  : 2398
  documents lost to truncation          : 2
  a real scheduler assigns the remainder, so it must hand out those 2
  documents completed, proportional     : 2400
  difference                            : 0
  work is conserved, so this cannot detect the problem
```

```
null control - the same equal split across a uniform fleet
  batch time            : 246 seconds
  shortest possible     : 246 seconds
  cost of the split     : 0 seconds
  utilisation           : 100 percent
  the same allocation is optimal here, so the rule is not 'equal is wrong'
  it is 'equal is wrong exactly as far as the fleet is unequal'
```

An equal split needs no information about the workers, which is what makes it safe to write and impossible to get stale. It is also what makes it assign the 25-a-minute box the same 300 documents as the 100-a-minute box. The batch took 720 seconds against a possible 246, the fleet was idle for 3270 worker-seconds of the 5760 paid for, and every document was processed.

Verify it yourself:

```bash
pnpm eml run examples/the-work-was-split-evenly-and-the-workers-were-not/the_work_was_split_evenly_and_the_workers_were_not.eml
```
