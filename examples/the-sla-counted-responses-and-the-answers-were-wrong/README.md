# The sla counted responses and the answers were wrong

`the_sla_counted_responses_and_the_answers_were_wrong.eml` - Availability is measured from twelve regions every thirty seconds and from the real error rate, and credits were paid the two times it was missed. What counts as available is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The measurement is honest, which is rarer than having an SLA. It is not self-reported from the load balancer alone: synthetic probes run from twelve regions on a thirty second interval, the real request stream is counted alongside them, the two are reconciled, and when the target was missed the credits were paid without the customer having to ask.

Available means a response with a success status inside the timeout. A response that returns quickly, with the right shape, and an empty list where there should be rows, is a success status inside the timeout.

One point nine million responses a day come from the degraded path.

```
availability target             : 9995 per ten thousand
probe regions                   : 12
probe interval, seconds         : 30
times the target was missed     : 2
times credits were paid         : 2
```

```
responses per day               : 84000000
  carrying a real answer        : 82100000
  from the degraded path        : 1900000
  share                         : 226 per ten thousand
  counted as unavailable        : 0
```

```
checks in the SLA about the body: 0
error budget                    : 5 per ten thousand
  the degraded share is         : 45 whole error budgets
```

```
the availability measurement
  source : synthetic probes plus the real request stream
  probe regions : 12, not one
  interval, seconds : 30
  are the two sources reconciled : yes
  self-reported from the load balancer alone : no
  credits paid without being asked : 2 of 2
  verdict : MEASURED HONESTLY
```

```
  paying before being asked is the part that makes the
  number trustworthy, and it was done
```

```
the definition
  a response with a success status : available
  inside the timeout : available
  with the right shape : not part of the definition
  with the right contents : not part of the definition
  clauses about the body : 0
  what a probe asserts : that a response came back
```

```
  the definition is precise and it is a definition about
  the envelope
```

```
the degraded path
  when it engages : a downstream is unhealthy
  what it returns : an empty result, quickly
  why that was chosen : an error would break the render
    for a partial outage
  is that the wrong choice : no
  what status it carries : success
  what the SLA counts it as : available
```

```
the probe
  asserts : a response, a status, a latency
  what it would need to catch this : a known fixture whose
    expected contents it can compare against
  does the probe have one : no; it requests a real path
    and reads the status
  is that a defect in the probe : it answers the question
    the SLA asks
  regions running it : 12, all reading the same field
```

```
the two ledgers
  ours   : responses returned, 84000000 a day
  theirs : answers that were right
  responses from the degraded path : 1900000
  counted against the target : 0
  the error budget : 5 per ten thousand
  the degraded share : 226 per ten thousand, which is
    45 whole error budgets
```

```
null control - the probe asserts a known answer
  probe regions : 12, unchanged
  checks about the body : 1
  degraded responses counted as unavailable : 1900000
  the measurement did not get more honest; it started
  ranging over the thing the customer receives
```

```
what an availability number guarantees
  a response came back, in time, from 12 regions :
    exactly, measured independently and paid out on
  the service worked : not addressed; availability is
    denominated in responses and the customer's question
    is denominated in answers
```

```
a service level is a promise about a measurable quantity, so
choosing the quantity is the whole design; a status code is
measurable everywhere and correctness is measurable only
where someone wrote down what the answer should be
```

The measurement is honest: synthetic probes from 12 regions every 30 seconds reconciled against the real request stream, and credits paid 2 of 2 times without being asked. Available means a success status inside the timeout, with 0 clauses about the body, so 1900000 responses a day carrying an empty result - 226 per ten thousand, or 45 whole error budgets - count as available.

Verify it yourself:

```bash
pnpm eml run examples/the-sla-counted-responses-and-the-answers-were-wrong/the_sla_counted_responses_and_the_answers_were_wrong.eml
```
