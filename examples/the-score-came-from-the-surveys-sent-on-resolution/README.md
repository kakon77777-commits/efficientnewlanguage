# The score came from the surveys sent on resolution

`the_score_came_from_the_surveys_sent_on_resolution.eml` - The support satisfaction score has sat at 4.72 out of 5 for three years, and the survey behind it is carefully run. When it is sent is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The survey is well made. It is two questions long; the scale is unlabelled at the midpoint so the wording cannot lean; no agent can see who answered what, so nobody can chase a score; there is no incentive to answer; and the team ran a non-response study to check that the people who reply are not systematically happier than the people who do not.

It is sent when a ticket moves to Resolved. A ticket that ends any other way does not send one.

```
tickets a quarter               : 86000
  that reached Resolved         : 61400
  that ended another way        : 24600
  reachable by the survey       : 7139 per ten thousand
```

```
surveys answered                : 19000
  response rate                 : 3094 per ten thousand
  mean score, times one hundred : 472
years at the same score         : 3
non-response studies run        : 1
```

```
tickets that sent no survey     : 24600
  no response from the customer : 15800
  closed as duplicate           : 5100
  withdrawn by the customer     : 3700
surveys sent for those          : 0
```

```
the satisfaction survey
  length : two questions
  scale : unlabelled at the midpoint, so the wording
    cannot lean
  attribution : no agent can see who answered what, so
    nobody can chase a score
  incentive to answer : none
  non-response study : 1, checking that repliers are not
    systematically happier than non-repliers
  verdict : WELL RUN
```

```
  hiding the responses from the agents is the part almost
  nobody does, and it is why the 472 is not a number
  anyone was able to manage
```

```
when the survey is sent
  the trigger : the ticket moving to Resolved
  what Resolved means : the agent believes the customer
    has what they asked for
  what the survey then asks : whether they are satisfied
  so the population asked : the ones an agent judged
    served
  tickets that never met the trigger : 24600
```

```
  the condition for being asked and the thing being
  asked about are the same judgement, made twice
```

```
the study's own population
  who it compared : people who answered against people
    who did not
  where both groups came from : tickets that reached
    Resolved
  people whose ticket never resolved : outside it
  how many : 24600
  what the study says about them : nothing, correctly;
    it was not asked to
```

```
null control - send it on close, whatever the reason
  survey design : unchanged, two questions, no incentive
  surveys sent : 86000
  surveys answered : 22400
  mean score, times one hundred : 449
  the instrument did not get worse; it was pointed at
  the people who had been unable to answer it
```

```
what a high satisfaction score guarantees
  people whose problem was resolved are satisfied :
    exactly, 472 out of 500, 3 years, no incentive
    and no agent able to see a reply
  people who asked for help are satisfied : not
    addressed; the survey is sent by the resolution and
    24600 tickets a quarter never reach one
```

```
when the event that triggers the measurement is the
outcome being measured, the score is a description of the
trigger; the dissatisfied case is the one that cannot fire
it
```

The survey is two questions, unincentivised, unattributable to an agent, and a non-response study checked the repliers against the non-repliers. It is sent by the move to Resolved, so 24600 of 86000 tickets a quarter send none - the score covers 7139 per ten thousand of tickets at a 3094 per ten thousand response rate - and the study's own population was the resolved ones too.

Verify it yourself:

```bash
pnpm eml run examples/the-score-came-from-the-surveys-sent-on-resolution/the_score_came_from_the_surveys_sent_on_resolution.eml
```
