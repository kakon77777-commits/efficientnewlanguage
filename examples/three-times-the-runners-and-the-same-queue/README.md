# Three times the runners and the same queue

`three_times_the_runners_and_the_same_queue.eml` - CI runners went from 8 to 24 and the median wait is back where it started. What changed in between is computed below, and it is not the amount of code.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Tripling the runners was correct. The wait was eleven minutes, engineers were batching unrelated changes into one push to avoid paying it twice, and that batching was making review harder and bisection worse. Buying runners to remove a queue that is distorting how people work is a good use of money, and the wait did drop to a minute immediately.

Pushing is a decision and the cost of pushing was the queue. Removing the cost removed the reason to batch, so the same work now arrives as more, smaller pushes. That is the outcome the purchase was arguing for. It is also what consumes the capacity that produced it.

The queue is measured, not modelled - it is the observed median from the CI logs, in the data below. Utilisation is computed from it.

```
month   runners   pushes/day   commits/10 pushes   commits/day   queue min   utilisation
  Jan     8        210          40              840          11          92%
  Feb     8        220          40              880          13          97%
  Mar     24        225          40              900          1          33%
  Apr     24        390          22              858          3          57%
  May     24        560          15              840          8          82%
  Jun     24        630          14              882          12          92%
```

```
runners     : 8 -> 24, multiplied by 3
pushes/day  : 210 -> 630, 300 per 100
commits/day : 840 -> 882, 105 per 100
queue       : 11 -> 12 minutes
utilisation : 92% -> 92%
```

```
the two demand measures
  Jan : 210 pushes carrying 840 commits
  Feb : 220 pushes carrying 880 commits
  Mar : 225 pushes carrying 900 commits
  Apr : 390 pushes carrying 858 commits
  May : 560 pushes carrying 840 commits
  Jun : 630 pushes carrying 882 commits
  pushes grew  : 200%
  commits grew : 5%
  the work moved by 5% and the number of submissions by 200%,
  which is the batching coming apart rather than the team writing more
```

```
commits per push against the queue in the same month
  Jan : queue 11 min, batch 40 commits per 10 pushes
  Feb : queue 13 min, batch 40 commits per 10 pushes
  Mar : queue 1 min, batch 40 commits per 10 pushes
  Apr : queue 3 min, batch 22 commits per 10 pushes
  May : queue 8 min, batch 15 commits per 10 pushes
  Jun : queue 12 min, batch 14 commits per 10 pushes
  the batch falls as the queue falls and does not recover when it returns,
  because by then pushing small is the habit
```

```
what the change of shape is worth, and it is not nothing
  commits per push : 4 -> 1 (14 per 10 pushes)
  a red run now implicates 1 commit rather than 4
  commits a reviewer sees at once : 4 -> 1
  this is exactly the improvement the purchase argued for, and it is real
  and permanent, unlike the queue time
```

```
runner-minutes
  Jan : demand 3570, capacity 3840
  Feb : demand 3740, capacity 3840
  Mar : demand 3825, capacity 11520
  Apr : demand 6630, capacity 11520
  May : demand 9520, capacity 11520
  Jun : demand 10710, capacity 11520
  Jun utilisation : 92%
  Jan utilisation : 92%
  three times the runners are running at close to the load the original
  eight were running at
```

```
if the queue is used as the trigger a second time
  queue then : 11 minutes on 8 runners serving 210 pushes
  queue now  : 12 minutes on 24 runners serving 630 pushes
  the queue differs by -1 minute and the system differs by 16 runners
  and 420 pushes a day
  a request citing only the queue cites a number that came back, from a
  system that did not go back
```

```
control - a release repository cut on a fixed calendar
  Jan : 4 runners, 20 runs, queue 6 min, utilisation 22%
  Jun : 12 runners, 21 runs, queue 0 min, utilisation 8%
  runs grew 5% while runners grew 200%
  the arrival rate is set by the release calendar rather than by what it
  costs to push, so the extra runners are still spare six months later
```

Tripling the runners was right and the batching it removed was a real cost that has stayed removed. The queue was the price of pushing, so removing it changed how often people push: 5% more work in 200% more runs.

Verify it yourself:

```bash
pnpm eml run examples/three-times-the-runners-and-the-same-queue/three_times_the_runners_and_the_same_queue.eml
```
