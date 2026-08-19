# The target was set by what was asked for

`the_target_was_set_by_what_was_asked_for.eml` - The availability target was set to what consumers asked for, and consumers asked for what was published. What any of them needs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Setting the target from consumer requirements is the correct method and it is what every guide says: do not pick a number, ask the people who depend on you. The team did ask, wrote the answers down, and set the target to the strictest one. Nothing about the process was skipped.

A consumer asked what to ask for looks at what is on offer. So the answers come back as the published figure, the strictest of them is the published figure, and the requirement and the target are the same number arrived at twice. The one thing not in the loop is what breaks if it is missed.

Each consumer's real tolerance is computed from its own retry budget.

```
consumers : 6, published target : 3 nines
```

```
consumer        asked for   can wait   own promise   really needs
  checkout   3 nines     30s      3 nines      3 nines
  search   3 nines     120s      2 nines      2 nines
  reporting   3 nines     3600s      1 nines      1 nines
  mobile app   3 nines     60s      2 nines      2 nines
  partner feed   3 nines     900s      1 nines      1 nines
  fraud check   3 nines     5s      4 nines      4 nines
```

```
consumers whose answer equals the published figure : 6 of 6
  every answer came back as the number that was already on the page
```

```
against what each one's own promise implies
  need less than 3 nines : 4
  need exactly 3        : 1
  need more than 3      : 1
  strictest real requirement : 4 nines
  which is above the target the survey produced, by 1
```

```
  the consumer that needs it : fraud check, which can wait 5 seconds
  it asked for 3 nines, the same as everyone, and it is the one
  the target does not cover
```

```
cost of running at each level
  1 nines : 40
  2 nines : 120
  3 nines : 300
  4 nines : 900
```

```
at the published target of 3 : 300
the strictest requirement among consumers that need less than the target : 2
  4 consumers would be inside their own promise at 2 nines
  which costs 120 against 300
```

```
serving the one strict consumer separately
  the other 5 at 2 nines : 120
  one path at 4 nines      : 900
  total                       : 1020
  one uniform target at 4     : 900
  splitting costs 120 more here, so the uniform strict target wins
  on cost - and it is a different number from the one the survey found
```

```
the question that was asked : what availability do you require
the question that is answerable : how long can you wait, and what do you
  promise your own users
  the second one was answered above, in seconds and in nines, and it
  produced 4 where the first produced 3
```

```
control - a consumer that publishes nothing and has no retry budget
  what it can derive a requirement from : nothing
  what it will answer                   : the published figure
  for this consumer the survey is not circular by accident, it is circular
  because there is no second source to reach
```

Asking the consumers is the right method and the answers were recorded faithfully. A requirement gathered from people reading your own page is your own page, and the one consumer it fails is the one that answered like the others.

Verify it yourself:

```bash
pnpm eml run examples/the-target-was-set-by-what-was-asked-for/the_target_was_set_by_what_was_asked_for.eml
```
