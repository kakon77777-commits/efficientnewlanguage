# The team inherited the oncall and not the decisions

`the_team_inherited_the_oncall_and_not_the_decisions.eml` - The current team has owned this service for eleven months. Which decisions the last year of pages trace back to is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Handing a service to a new team is right and normal. Someone has to own it, the previous team moved on for good reasons, and a service without an owner is worse than a service owned by people who did not build it.

What transfers cleanly is the pager. What does not transfer is the set of decisions the service is made of - the ones that were argued about, the ones that were obvious at the time, and the ones nobody remembers making. The team is accountable for the outcomes of all of them.

Each page is attributed to the decision that produced it.

```
pages in the last year : 9
  tracing to a decision the current team made  : 2
  tracing to a decision the previous team made : 6
  tracing to a decision nobody here made       : 1
```

```
distinct decisions behind 9 pages : 5
  sync writes to the audit log : 2 page(s), by previous team, written down
  no backpressure on the queue : 3 page(s), by previous team, not written down
  a config default : 1 page(s), by the library author, not written down
  the retry count : 2 page(s), by current team, written down
  the shared connection pool : 1 page(s), by previous team, written down
```

```
pages from decisions with no written record : 4 of 9
  for these the team can see the consequence and not the reasoning, so
  changing them means re-deriving an argument that was already had once
```

```
the single decision behind the most pages : no backpressure on the queue, 3
  made 31 months before the handover, by the previous team
  and it is one of the ones with no written record
```

```
what is actionable, by category
  own decisions, written down     : 2 pages, changeable this week
  inherited, written down         : the reasoning is available to argue with
  inherited, not written down     : 4 pages, and the argument has to be rebuilt
  the third category is the expensive one, and it is the largest
```

```
the service's page count, as it appears in a review
  pages : 9, owner : the current team
  what the number is a property of : eleven months of this team plus
  several years of decisions made before them
  6 of 9 are the second kind, and the review has one column
```

```
control - a service this team wrote from scratch
  pages tracing to their own decisions : all of them
  decisions with no written record     : still possible, but the people who
  made them are in the room
  the record matters less when the memory is present, which is exactly why
  it does not get written
```

Somebody has to own the service and this team owning it is better than nobody. The pager transferred and the reasoning did not, and the page count is attributed to whoever is holding it now.

Verify it yourself:

```bash
pnpm eml run examples/the-team-inherited-the-oncall-and-not-the-decisions/the_team_inherited_the_oncall_and_not_the_decisions.eml
```
