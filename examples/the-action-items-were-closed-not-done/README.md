# The action items were closed, not done - 6 of 6 closed, 1 of them blocks anything

`the_action_items_were_closed_not_done.eml` replays the incident step by step against the post-fix system, because "was the work done" and "would this happen again" are answered by different evidence.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: closing them was not dishonest. Each ticket says something true - the doc was written, the alert was added, the training happened - and a reviewer checking whether the stated work was done would tick every box correctly. The postmortem's question was the other one.

```
action items : 6
  closed                       : 6
  that block a step            : 1
  that change nothing the incident does : 5
```

```
the items, one by one
  [closed] write a runbook for this failure
  [closed] add an alert on queue depth
  [closed] train the on-call rotation
  [closed] add a guard rejecting empty payloads   <- blocks step 3
  [closed] file a ticket with the vendor
  [closed] document the escalation path
```

```
replaying the incident against the post-fix system
  step 1 : a malformed payload is accepted
  step 2 : it is written to the queue
  step 3 : the consumer parses it   BLOCKED
  steps reached : 2 of 5
  the incident stops at step 3
```

```
what the non-blocking items do instead
  runbook, training, escalation doc : make the response faster
  alert on queue depth              : makes the detection earlier
  vendor ticket                     : moves the fix somewhere else
  none of them changes whether step 1 happens
```

```
the two questions
  were the action items done : 6 of 6 - yes
  would it happen again      : 2 of 5 steps still run
  both answers are correct and they are not the same answer
```

```
control - the same six items, one of them placed at step 1
  closed : 6 of 6
  steps still reached : 0 of 5
  same closure rate, 2 fewer steps of the incident
```

A closed action item is a true statement about work. Whether the incident can still run is a different statement, and the postmortem is filed against the first one.

The **control** moves exactly one item to step 1 and changes nothing else - same count, same closure rate, same review - and the incident stops before it starts. The non-blocking items are not waste either: they shorten the response and improve detection, which is why they pass review and why they are counted as if they had prevented it.

Verify it yourself:

```bash
pnpm eml run examples/the-action-items-were-closed-not-done/the_action_items_were_closed_not_done.eml
```
