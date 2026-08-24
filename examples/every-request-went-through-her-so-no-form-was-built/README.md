# Every request went through her so no form was built

`every_request_went_through_her_so_no_form_was_built.eml` - A routing config is written in a format one person understands. What her turnaround does to the case for a self-serve form is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: She is fast and she is generous with it. Median turnaround is under an hour, she has never refused a request, and she wrote the format because the alternative at the time was hand-edited JSON that broke production twice. The format is genuinely better than what it replaced.

A self-serve form gets built when the queue hurts. The queue does not hurt, because she clears it. So the tool that would let anybody write the config is justified by a delay that her speed removes, and the faster she is, the weaker the case for not needing her.

Requests are counted with what each one cost and who could have done it.

```
quarter   requests   median hours   she handled   others who can
  Q1        34         1              34            0
  Q2        51         1              51            0
  Q3        78         2              78            0
  Q4        96         2              96            0
  Q5        121         3              119            1
  Q6        140         3              138            1
```

```
requests across the period : 520
she handled                : 516, 992 per 1000
requests grew              : 311%
median turnaround grew     : 1h to 3h
```

```
a self-serve form is funded when median turnaround exceeds 24 hours
  quarters over the threshold : 0 of 6
  highest median observed     : 3h, which is 8 times below the bar
  the rule has never fired, and every reading it used was correct
```

```
her side of it
  minutes per request : 15
  hours across the period : 130
  hours in the last quarter alone : 35
  as a share of one quarter of full-time work : 7%
  none of that appears in the turnaround metric, which measures how long
  the requester waited rather than what the answer cost
```

```
where the growth went
  Q1 : 34 requests, 1h median, 8 of her hours
  Q2 : 51 requests, 1h median, 12 of her hours
  Q3 : 78 requests, 2h median, 19 of her hours
  Q4 : 96 requests, 2h median, 24 of her hours
  Q5 : 121 requests, 3h median, 30 of her hours
  Q6 : 140 requests, 3h median, 35 of her hours
  requests multiplied by 4 and the median moved 2 hours
  the load landed on her calendar rather than in the queue, and the queue
  is the only one of the two with a threshold attached
```

```
the one other person who can write it
  from Q5 : 1 other person, handling 2 of 121 requests
  from Q6 : 1 other person, handling 2 of 140 requests
  share taken by the second person : 14 per 1000
  learning it took him : four months of asking her
  which is the only path there is, because the format's documentation is
  her answering questions
```

```
the form
  build cost      : 20 days
  her hours saved per quarter : 35
  quarters to repay in her time alone : 4
  requesters who could then self-serve : everyone
  none of those four numbers is an input to the rule that funds it
```

```
control - feature flags, edited directly by anyone
  requests routed through a specialist : 0
  people who write it : 14
  turnaround : not measured, because there is no queue to measure
  the absence of a queue here is an absence of a bottleneck, and above
  it is the presence of a fast one
```

She is fast, generous, and the format is better than what it replaced. The form is funded by a queue that hurts, and she has absorbed 311% growth into a median of 3 hours against a 24-hour bar.

Verify it yourself:

```bash
pnpm eml run examples/every-request-went-through-her-so-no-form-was-built/every_request_went_through_her_so_no_form_was_built.eml
```
