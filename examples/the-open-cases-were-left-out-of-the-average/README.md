# The open cases were left out of the average

`the_open_cases_were_left_out_of_the_average.eml` - A report gives the average time to resolve a ticket, and it averages the real resolution times of every resolved ticket correctly. Which tickets can be in the average is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is careful. It reads the real close timestamps, not estimates; it covers every ticket that has a resolution time; the mean is the honest average of days-to-close; and the intent is exactly 'how long does a ticket take to resolve'.

A ticket contributes a resolution time only once it is closed, and the slowest tickets are the ones still open, so they are absent from the average by virtue of not being done.

```
tickets opened                  : 100000
  resolved (have a close time)  : 70000
  still open (no close time yet) : 30000
```

```
average days over resolved      : 5
open ones already waited (min)  : 20
estimate including the open tail : 12
understated share of the truth  : 5833 per ten thousand
```

```
the resolution-time average
  reads : the real close timestamps, not estimates
  covers : every ticket that has a resolution time
  mean : the honest average of days-to-close
  intent : how long does a ticket take to resolve
  resolved tickets omitted : 0
  verdict : RESOLVED TICKETS AVERAGE 5 DAYS
```

```
  averaging real close times over every resolved ticket is
  the part done right here, and it is why the 5 days is a
  true statement about the tickets that closed
```

```
who contributes a resolution time
  requirement : the ticket must be closed
  which tickets are still open : the 30000 slowest
  how long they have already waited : at least 20 days, and
    counting
  so the tail longer than the mean : is entirely excluded
  what the average therefore measures : the ones fast
    enough to have finished
```

```
the result of the report
  reported average : 5 days
  the open tickets already exceed : 20 days each
  estimate that counts the open ones : 12 days
  is the mean over resolved wrong : no; it is exact for them
  is it the time a ticket takes : no; the slow half is
    right-censored, invisible until it closes
```

```
null control - include the open tickets' elapsed time
  mean over resolved only : 5
  estimate with the censored included : 12
  open tickets the estimate stops dropping : 30000
  no ticket and no timestamp changed; the slow tail stopped
  being excluded for not being finished and started
  counting as at-least-this-long
```

```
what an average over resolved tickets guarantees
  the resolved tickets took that long on average : exactly,
    real close times, every resolved ticket, honest mean
  a ticket takes that long to resolve : not addressed; a
    ticket enters the average only by closing, so the 30000
    slowest are censored out and the mean sees the fast ones
```

```
an average of the finished is an average of the fast; whatever is still running
is exactly the part that runs long, and leaving it out because it has no end time
yet removes the tail that the question was about
```

It averages real close times over every resolved ticket - the 5 days is true for them. But a ticket enters the average only by closing, and the 30000 still open are the slow tail; an estimate that counts their elapsed time gives 12 days, 5833 per ten thousand understated by the right-censoring.

Verify it yourself:

```bash
pnpm eml run examples/the-open-cases-were-left-out-of-the-average/the_open_cases_were_left_out_of_the_average.eml
```
