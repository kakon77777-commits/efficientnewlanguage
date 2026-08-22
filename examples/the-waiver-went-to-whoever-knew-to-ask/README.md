# The waiver went to whoever knew to ask

`the_waiver_went_to_whoever_knew_to_ask.eml` - The policy has an exception process. Which teams used it, and which teams qualified, are two different sets, computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Having an exception process is right. A rule with no escape hatch gets ignored or routed around, and a documented waiver with an owner and an expiry is far better than a quiet violation. Every waiver granted here was granted for a real reason by someone who checked.

A waiver has to be asked for. Asking needs knowing the process exists, knowing your case qualifies, and being willing to spend the meeting - and none of those three is correlated with how badly the exception is needed.

Both sets are computed from the same team list.

```
teams : 8
  genuinely qualify for an exception : 6
  know the process exists            : 5
  asked                              : 4
  were granted one                   : 3
```

```
team            qualifies   knows   asked   granted
  platform   yes   yes   yes   yes   
  payments   yes   yes   yes   yes   
  search   yes   yes   no    no    
  mobile   no    yes   yes   no    
  data   yes   no    no    no    
  billing ops   yes   no    no    no    
  growth   no    yes   yes   yes   
  support tools   yes   no    no    no    
```

```
teams that qualify and have no waiver : 4
  search : knows, did not ask
  data : does not know the process exists
  billing ops : does not know the process exists
  support tools : does not know the process exists
teams granted a waiver that do not qualify : 1
```

```
of the 6 teams that qualify
  do not know the process exists : 3
  for these the exception process has the same effect as not having one
```

```
of the 5 teams that know about it
  asked : 4
  so knowing is 80% of the way to a waiver, and not knowing is 0%
```

```
the record, as an approver would read it
  waivers requested : 4
  waivers granted   : 3
  approval rate     : 75%
  every decision in that record is defensible, and the record contains no
  row for a team that never asked
```

```
what a qualifying team without a waiver does
  comply at the real cost : possible, and it is the cost the exception exists to avoid
  violate quietly         : possible, and it does not appear in the waiver record
  neither shows up as an exception, so the policy's own metrics report
  3 exceptions against a true need of 6
```

```
offering the waiver to every team that qualifies
  teams contacted : 6
  teams that would newly have one : 4
  work for the requesting teams : none, the direction of the ask reverses
```

```
control - a policy that offered the exception in the same announcement
  teams that qualify : 2, qualifying teams without a waiver : 0
  none missing, because nobody had to discover the process
```

Every waiver was granted for a real reason by someone who checked, and the process is better than a rule with no escape. It is opt-in, and opting in needs three things that having a real case does not.

Verify it yourself:

```bash
pnpm eml run examples/the-waiver-went-to-whoever-knew-to-ask/the_waiver_went_to_whoever_knew_to_ask.eml
```
