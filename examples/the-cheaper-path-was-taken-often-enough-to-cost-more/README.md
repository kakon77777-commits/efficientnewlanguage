# The cheaper path was taken often enough to cost more

`the_cheaper_path_was_taken_often_enough_to_cost_more.eml` - A request handler calls five things. The code review flagged the slowest of them. Which one that is depends on a sort order, and both orders are computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Reviewing by cost per call is the right instinct and is what a reviewer can actually do. Per-call cost is a property of the function: it can be read off the code, reasoned about at the diff, and measured by a microbenchmark that runs in a second. Call count is a property of the caller, and of the caller's caller, and of the data - none of which is in the diff. So the reviewer sorted by the number the review could see, which is the honest thing to do with the information available.

Total cost is per-call cost times call count. Neither factor dominates in general, and a per-call sort is a total-cost sort only when the counts happen to be similar. Here they span four orders of magnitude.

The function with the lowest per-call cost in the table has the highest total cost in the table, and the two orderings are close to exact reverses.

```
function            us per call   calls   total us
  audit_log        5000         2     10000
  render_template        800         12     9600
  db_query        300         40     12000
  checksum        5         20000     100000
  debug_log        20         50000     1000000
```

```
  request total: 1131600 us = 1131 ms
```

```
sorted by cost per call, which is what the review saw
  1  audit_log         5000 us per call
  2  render_template    800
  3  db_query           300
  4  debug_log           20
  5  checksum             5
```

```
sorted by total cost, which is what the request pays
  1  debug_log        1000000 us total
  2  checksum         100000
  3  db_query         12000
  4  audit_log        10000
  5  render_template  9600
```

```
  audit_log is first by per-call and fourth by total
  debug_log is fourth by per-call and first by total
```

```
function            share of request time
  audit_log        8 per mille
  render_template        8 per mille
  db_query        10 per mille
  checksum        88 per mille
  debug_log        883 per mille
```

```
if the flagged function were removed entirely
  audit_log removed : saves 10000 us, 8 per mille of the request
  debug_log removed : saves 1000000 us, 883 per mille of the request
  the review recommended the first
```

```
per-call ratio  : audit_log is 250 times debug_log
call count ratio: debug_log is 25000 times audit_log
total ratio     : debug_log is 100 times audit_log
```

```
  the per-call sort is correct about a 250x difference
  it is silent about a 25000x difference in the other factor
  and the second factor is 100 times larger than the first
```

```
control - are the per-call numbers themselves wrong
  rows checked                 : 5
  per-call cost reproduces total: 5 of 5
  every per-call figure is correct and the review used them correctly
  what is missing is a column, not a correction
```

```
null control - the same functions, all called 10 times
function            total us   rank by total
  audit_log        50000      1
  render_template  8000       2
  db_query         3000       3
  debug_log        200        4
  checksum         50         5
  this is the per-call order, unchanged
  same functions, same per-call costs, and now the review's sort is right
```

```
what a diff shows and what it does not
  cost of the line added        visible
  how often the line runs       not visible
  where the loop around it is   not visible, it may be three frames up
  what the data volume is       not visible, it is a production fact
  a reviewer sorting by what a diff shows will sort by per-call cost
```

Per-call cost is what a reviewer can read off a diff and confirm with a one-second microbenchmark, and every per-call figure here is correct. Total cost needs the call count, which lives in the caller and in the data. Sorted by per-call, debug_log is fourth of five. It is 883 per mille of the request, and the function the review flagged is 8 per mille.

Verify it yourself:

```bash
pnpm eml run examples/the-cheaper-path-was-taken-often-enough-to-cost-more/the_cheaper_path_was_taken_often_enough_to_cost_more.eml
```
