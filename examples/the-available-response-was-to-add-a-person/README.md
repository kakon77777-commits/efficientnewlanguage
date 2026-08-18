# The available response was to add a person

`the_available_response_was_to_add_a_person.eml` - The system cannot be changed this quarter, so a person checks the output. What that catches is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The manual check is a good answer to the question that was asked. It shipped in a day, it needs no deploy, it catches real errors that were reaching customers, and the person doing it is better at the judgement calls than any rule anyone could write down in a day.

A person is also a fixed amount of throughput applied to a queue that is not fixed. The check's coverage is the ratio between those two, so it is highest on the day it is introduced and falls with every unit of growth, without anybody deciding that it should.

Coverage is computed per month rather than stated once.

```
one reviewer checks 40 items a day
defect rate : 25 per 1000 items
each month is 30 days
```

```
month   items/day   coverage   defects/month   caught   reaching customers
  1       200        20%        150            30      120
  2       240        16%        180            30      150
  3       300        13%        225            30      195
  4       380        10%        285            30      255
  5       470        8%        352            29      323
  6       600        6%        450            30      420
```

```
coverage, first month against last
  month 1 : 20%
  month 6 : 6%
  down 14 points, with the same person doing the same work
```

```
defects reaching customers, per month
  month 1 : 120
  month 6 : 420
  up by 300, and the defect rate never moved
  the check did not degrade; the denominator under it grew
```

```
over the 6 months
  defects produced : 1642
  defects caught   : 179
  which is 10% of them, all real, all found by reading
```

```
holding month 1 coverage through month 6
  items to check per day : 120
  reviewers needed       : 3 and a remainder, against 1 today
  the headcount tracks the volume, because that is what a fixed-rate check
  costs when the volume is not fixed
```

```
a rule that catches the two commonest defect shapes
  share of defects it would catch : 70%
  items it can check              : every one of them, so coverage is 100%
  at month 6 it catches 315 a month
  against 30 for the reviewer, and the gap widens with every month
  it is worse per item than a person and it does not have a queue
```

```
control - a queue capped at 30 items a day
  reviewer capacity is 40, above the queue, so coverage clamps at
  month 1 : 100%, month 6 : 100%
  unchanged, so a reviewer here is a permanent answer rather than a
  temporary one, and this queue cannot show the decay
```

The reviewer catches real defects and was the only thing that could ship that week. Coverage is capacity over volume, and only one of those two was chosen by anybody.

Verify it yourself:

```bash
pnpm eml run examples/the-available-response-was-to-add-a-person/the_available_response_was_to_add_a_person.eml
```
