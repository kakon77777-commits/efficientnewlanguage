# The cost appeared only when it stopped being paid

`the_cost_appeared_only_when_it_stopped_being_paid.eml` - A weekly maintenance job was cancelled after 140 runs that each reported nothing found. When the bill arrived, and who was blamed for it, are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Cancelling it was the correct reading of the evidence. It had run every week for nearly three years, it cost six engineer-hours each time, and its own log line said "0 problems found" on all 140 occasions. Every measure available to the person deciding said the job produced nothing. Keeping work that has never once produced an output is how a team ends up with no time for the work that does.

The difficulty is that "0 problems found" is what a job prints when it is working, and also what it prints when it is pointless. The two worlds emit the same log, so the log cannot tell them apart, and the log was the whole case for cancellation.

What separates them is what happens afterwards, and afterwards is far away. The consequence accumulates a little each week and crosses the threshold long after the change that caused it has left everyone's memory and, more importantly, left the window the team searches when something breaks.

```
the job as the ledger recorded it
  runs            : 140
  hours per run   : 6
  hours spent     : 840
  problems found  : 0
  problems found per run : 0
  on this evidence the job returns nothing for 840 hours
```

```
world A - the job was unnecessary
  weekly log line : 0 problems found
world B - the job was preventing the problem
  weekly log line : 0 problems found
  the observation does not distinguish them, and it is the only one taken
```

```
week   fragmentation   query ms   sla
  w1     12              134        250
  w2     24              148        250
  w3     36              163        250
  w4     48              177        250
  w5     60              192        250
  w6     72              206        250
  w7     84              220        250
  w8     96              235        250
  w9     108              249        250
  w10     120              264        250
  w11     132              278        250
```

```
  breach at week  : 10, query time 264 ms against a 250 ms limit
  days since the cancellation : 70
  attribution window          : 7 days
  the cause is outside the window by a factor of 10
```

```
changes inside the 7-day window
  checkout copy edit, 1 days before, related: no
  dependency bump, 2 days before, related: no
  new dashboard panel, 4 days before, related: no
  log format change, 6 days before, related: no
  candidates examined : 4
  candidates related to the cause : 0
  the window was searched correctly and completely, and contained nothing
```

```
control - the other job cancelled that week
  job              : cache warmer, also cancelled, also 0 problems found
  effect appears after : 1 day
  inside the 7-day window : yes
  correctly diagnosed  : yes, next morning, restored the same day
  the difference between the two cases is not the team and not the
  reasoning, it is 70 days against 1
```

```
what each choice cost
  keeping the job    : 840 hours, visible, on a line item, every week
  cancelling the job : 40 hours of incident plus 70 days of degradation
  cancelling looks cheaper on any report that covers 7 days
  and on any report that covers less than 70
```

Cancelling was the right reading of the evidence: 140 runs, 0 findings, 840 hours. A preventive job prints the same line whether it is working or useless, and the bill arrived 70 days later, 10 windows outside the search. The 4 changes that were examined were all innocent.

Verify it yourself:

```bash
pnpm eml run examples/the-cost-appeared-only-when-it-stopped-being-paid/the_cost_appeared_only_when_it_stopped_being_paid.eml
```
