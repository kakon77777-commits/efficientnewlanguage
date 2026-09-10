# The intake form got longer and the queue got shorter

`the_intake_form_got_longer_and_the_queue_got_shorter.eml` - The platform team rewrote its request form to capture what it actually needed, and the queue wait fell from twenty-one days to five. What else changed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rewrite was sound. Every field was added because a real request had stalled for want of it; the form validates as you type rather than rejecting at the end; the fields are grouped so a requester can see what is left; and the wait is measured from submission to first action, on the platform team's own tracker, not estimated.

The queue is the requests that were submitted.

```
requests a month, before        : 3400
requests a month, now           : 1250
  that stopped arriving         : 2150
  volume remaining              : 3676 per ten thousand
months since the change         : 8
```

```
fields on the form, before      : 6
fields on the form, now         : 23
  added                         : 17
median minutes to submit, before: 2
median minutes to submit, now   : 19
  added to asking               : 17
```

```
queue wait, days, before        : 21
queue wait, days, now           : 5
  taken off the wait            : 16
  wait remaining                : 2380 per ten thousand
```

```
submissions abandoned part way  : 1900
  beyond completed submissions  : 650
unrequested tools in the estate : 74
```

```
the new intake form
  every field : added because a real request stalled for
    want of it, not because somebody wanted a report
  validation : as you type, not a rejection at the end
  the fields : grouped, so a requester can see what is
    left
  the wait : measured submission to first action, on the
    team's own tracker
  days off the wait : 16
  verdict : FASTER
```

```
  justifying each field from a stalled request is the
  part almost nobody does, and it is why the form asks
  for nothing decorative
```

```
what the wait is measured over
  the population : requests that were submitted
  what submitting now costs : 19 minutes, up 
    17
  requests a month that stopped arriving : 
    2150
  submissions abandoned part way : 
    1900 a month
  which is more than the completed ones by : 
    650
```

```
  a queue got shorter and so did the line of people
  willing to join it; the wait cannot tell those apart
```

```
the work that stopped being requested
  did the need go away : nothing here says so
  tools found in the estate that nobody requested : 
    74
  who supports those : whoever installed them
  do they appear in the queue : no
  do they appear in the wait : no
  what the platform team sees of them : the audit, once
    a year
```

```
null control - two fields to ask, the rest asked later
  requests a month : 3300
  submissions abandoned part way : 
    120
  queue wait, days : 7
  the team did not get slower; the requests that had
  stopped being made came back and joined the queue
```

```
what a shorter queue guarantees
  a submitted request is picked up in 5 days :
    exactly, measured to first action on the team's own
    tracker, 8 months
  the organisation waits less for what it needs : not
    addressed; 2150 requests a month stopped being made
    and 1900 a month are abandoned mid-form
```

```
raising the cost of joining a queue shortens it; the
measurement is over the people who paid, and the people
who did not are not slow, they are absent
```

Every field was justified by a stalled request, validation is live, and the wait fell 16 days to 5 on the team's own tracker. Asking now costs 19 minutes instead of 2, so volume fell to 3676 per ten thousand of what it was, 1900 submissions a month are abandoned part way - 650 more than are completed - and the last audit found 74 tools nobody asked for.

Verify it yourself:

```bash
pnpm eml run examples/the-intake-form-got-longer-and-the-queue-got-shorter/the_intake_form_got_longer_and_the_queue_got_shorter.eml
```
