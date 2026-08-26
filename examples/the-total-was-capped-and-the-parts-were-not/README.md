# The total was capped and the parts were not

`the_total_was_capped_and_the_parts_were_not.eml` - The cloud account has a hard spending cap of 10000 a month. Eight services share it. On day 7 the cap fired. Which services stopped is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: A cap on the account total is the right control and it was argued for at the top level, correctly. It is the number the finance team is accountable for. It is the only figure that cannot be gamed by moving spend between line items. It needs no per-service forecast, so it does not go stale when a service is added, and adding a service does not require anyone to re-derive a budget. One number, one owner, one alarm.

A cap is a shared resource, and a shared resource with no per-holder limit is consumed by whoever consumes fastest. The service that spends the budget is not the service that the cap stops - the cap stops everyone, and it stops them in the order their next request happens to arrive, which is unrelated to who spent the money.

The runaway service is also the one that reaches the cap first and therefore gets the most work done before it fires.

```
budget            : 10000 per month
services sharing it: 8
normal spend      : 40 per service per day
normal month total: 9600, which fits
```

```
service X develops a retry loop and spends 1200 a day
account now spends 1480 a day
```

```
day   spend that day   cumulative   cap
  1      1480            1480        10000
  2      1480            2960        10000
  3      1480            4440        10000
  4      1480            5920        10000
  5      1480            7400        10000
  6      1480            8880        10000
```

```
  the cap fired on day 7
```

```
through day 6
  service X spent   : 7200, which is 81 percent of the budget
  the other 7 spent : 1680, which is 18 percent
```

```
after the cap fires
  services stopped  : 8
  days stopped      : 24
  service-days lost : 192
  service-days lost by the service that caused it : 24
  service-days lost by services that did nothing  : 168
```

```
  87 percent of the harm landed on services with no defect
```

```
per-service cap of 1250
  service X hits its own cap on day  : 2
  X spends at most                   : 1250
  a healthy service spends all month : 1200
  is that under its cap              : 50 to spare
  services stopped                   : 1
```

```
  affected services: 8 under one shared cap, 1 under divided caps
  the total, the alarm and the finance number are unchanged
```

```
a cap on a sum, with no cap on the terms
  bounds the total                        yes, exactly
  bounds any single term                  no
  stops the term that consumed the budget  no, it stops all of them
  fires earlier the worse the runaway is   yes, which shortens the warning
  the alarm and the outage are the same event, so there is no interval in
  which anyone could have acted
```

```
control - what the cap was built to guarantee
  budget          : 10000
  actually spent  : 8880
  overspend       : -1120
  the cap held, and it would have held against any runaway of any size
  a control can be perfectly effective and still be aimed at the wrong risk
```

```
null control - the same shared cap, no runaway service
  spend for the month : 9600
  budget              : 10000
  cap fires           : no, 400 to spare
  services stopped    : 0
  the identical control, and for eleven months it was the right one
```

A cap on the account total is the figure finance is accountable for, it cannot be gamed by moving spend between line items, and it does not need a per-service forecast that goes stale. It held: 8880 against a budget of 10000, overspend -1120. It fired on day 7, after one service had taken 81 percent of the month, and it stopped all 8 of them for 24 days.

Verify it yourself:

```bash
pnpm eml run examples/the-total-was-capped-and-the-parts-were-not/the_total_was_capped_and_the_parts_were_not.eml
```
