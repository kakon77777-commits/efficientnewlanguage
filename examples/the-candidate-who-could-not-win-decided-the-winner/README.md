# The candidate who could not win decided the winner

`the_candidate_who_could_not_win_decided_the_winner.eml` - Seventeen people rank three proposals. One proposal wins under none of the three counting rules. What happens to the result when it is taken off the ballot is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Putting the third proposal on the ballot was right. Four people rank it first, it is a real option that a real constituency wants, and removing an option because of what its presence does to the arithmetic is choosing the outcome and calling it a procedure. The whole argument for asking people to rank rather than to pick is that their actual preferences should be recorded.

Counting the first choices is also right, or at least defensible. It is the rule everyone already understands, it can be audited by hand in a room, and it needs no explanation to the losing side.

The two together produce a result that neither of them contains. A tally is a function of the SET of options as well as of the preferences, so an option that cannot win can still decide who does. Nobody has to be strategic, nobody has to be confused, and nobody has to change their mind.

Whether any voter changed their mind is not assumed here. It is the control at the end, and it is a tally rather than a claim.

```
the ballots
  8 voters : A > B > C
  5 voters : B > C > A
  4 voters : C > B > A
  electorate : 17
```

```
rule 1 - count first choices
  A : 8
  B : 5
  C : 4
  winner : A
```

```
rule 2 - eliminate the fewest first choices, then recount
  eliminated first : C with 4 first choices
  A after the transfer : 8
  B after the transfer : 9
  winner : B
```

```
rule 3 - points by rank, 2 for first, 1 for second, 0 for third
  A : 16
  B : 22
  C : 13
  winner : B
```

```
C wins under rule 1 : False
C wins under rule 2 : False
C wins under rule 3 : False
  C is the option that cannot win, under every rule on the table
```

```
every head-to-head contest
  B beats A, 9 to 8
  C beats A, 9 to 8
  B beats C, 13 to 4
```

```
rule 1 - count first choices, C removed from the ballot
  A : 8
  B : 9
  winner : B
```

```
  this is the same arithmetic as rule 2's final round, which is why rule 2
  already elected B without anybody removing anything
```

```
the same rule, the same voters, the same ballots
  winner with C on the ballot  : A
  winner with C off the ballot : B
```

```
control - the A against B tally, with C present and with C removed
  with C    : A 8, B 9
  without C : A 8, B 9
  identical : True
  voters who changed their A-against-B preference : 0
  so the flip is not in anyone's opinion, it is in the aggregation
```

```
what the first-choice rule did with the 9 voters who prefer B to A
  B is preferred to A by 9 of 17, a majority
  under rule 1 with C present, B is credited with 5
  the missing 4 ranked C first and B second
  rule 1 reads a ranking's first entry and discards the rest, and the
  discarded part is where the majority was written down
```

4 people rank C first, so C belongs on the ballot, and counting first choices is the rule everyone can audit. C wins under none of the three rules and still decides the outcome: A wins with C present and B without, while 9 of 17 voters prefer B to A in both counts.

Verify it yourself:

```bash
pnpm eml run examples/the-candidate-who-could-not-win-decided-the-winner/the_candidate_who_could_not_win_decided_the_winner.eml
```
