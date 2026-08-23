# The pool doubled and the backlog did not move

`the_pool_doubled_and_the_backlog_did_not_move.eml` - The worker pool was doubled and the overnight backlog is the same length it was. What changed and what did not are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Doubling the pool was correct and it worked. February overran the window by six minutes, the request was made on that measurement, throughput really did double, and in March the run finished in less than half the time. Nobody was mistaken about the capacity.

The batch that feeds the pool is sized by the operator to whatever finishes in the window. That rule is sensible - it is how you avoid a batch still running at nine in the morning - and it means the batch grows whenever the window stops binding. Capacity added to a system whose input is sized by its own output does not shorten the queue, it enlarges the work.

Times are computed in minutes, because at hourly resolution an overrun and an on-time finish round to the same number.

```
month   workers   jobs      minutes to finish   window   slack   backlog
  Jan     20        40000     533                540      7      0
  Feb     20        41000     546                540      -6      0
  Mar     40        41000     273                540      267      0
  Apr     40        62000     413                540      127      0
  May     40        78000     520                540      20      0
  Jun     40        81000     540                540      0      0
```

```
capacity : 20 -> 40 workers, multiplied by 2
jobs     : 40000 -> 81000, 202 per 100
runtime  : 533 -> 540 minutes
backlog  : 0 -> 0
```

```
the month the window was breached
  Feb : ran 546 minutes into a 540-minute window, over by 6
  months over the window : 1 of 6
  at hourly resolution that month reads as 9 hours against a 9-hour window,
  which is the same number an on-time finish produces
```

```
the three months around the doubling
  Feb : 20 workers, 41000 jobs, 546 minutes
  Mar : 40 workers, 41000 jobs, 273 minutes
  Apr : 40 workers, 62000 jobs, 413 minutes
  March doubled the pool with the batch unchanged, and the runtime halved
  April resized the batch to a window that had stopped binding
```

```
slack, month by month
  Jan : 7 minutes
  Feb : -6 minutes
  Mar : 267 minutes
  Apr : 127 minutes
  May : 20 minutes
  Jun : 0 minutes
  peak slack : 267 minutes in Mar
  back to nothing by : Jun
  so the headroom the doubling bought lasted from Mar to Jun
  it was not consumed by demand, it was consumed by a batch size that is a
  decision rather than an input
```

```
jobs per worker, which takes the capacity change out
  Jan : 2000 jobs per worker
  Feb : 2050 jobs per worker
  Mar : 1025 jobs per worker
  Apr : 1550 jobs per worker
  May : 1950 jobs per worker
  Jun : 2025 jobs per worker
  Jan 2000 -> Jun 2025, a change of 1%
  per-worker load is back within 1% of where it was before the pool
  doubled, which is what it means for demand to have absorbed the
  capacity completely
```

```
the request for more capacity, checked step by step
  measured  : the run overran by 6 minutes
  predicted : 273 minutes at double the pool
  observed  : 273 minutes, in the first month
  observed now : 540 minutes
  every step of that reasoning was correct and the prediction held for
  exactly as long as the batch size was held
```

```
what would settle it
  jobs the business needs run : not measured anywhere
  jobs submitted              : 81000
  rule setting that number    : whatever finishes before morning
  under that rule capacity and demand are one variable, so a request for
  more of the first is a request for more of the second
```

```
control - a second pipeline fed by a fixed daily export
  Jan : 20 workers, 12000 jobs, 160 minutes, slack 380
  Jun : 40 workers, 12300 jobs, 82 minutes, slack 458
  jobs grew 2%, capacity grew 100%
  runtime 160 -> 82 minutes, and it stayed there
  the input is a fact about the world rather than a decision about the
  window, so the extra capacity is still extra capacity six months on
```

Doubling the pool worked and the throughput measurement was correct. The batch is sized to whatever finishes before morning, so the window fills by construction and the backlog is 0 either way.

Verify it yourself:

```bash
pnpm eml run examples/the-pool-doubled-and-the-backlog-did-not-move/the_pool_doubled_and_the_backlog_did_not_move.eml
```
