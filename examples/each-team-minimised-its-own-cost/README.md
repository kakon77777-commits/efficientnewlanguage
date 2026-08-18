# Each team minimised its own cost

`each_team_minimised_its_own_cost.eml` - Four teams, four correct decisions, one total. Whether the total is the smallest available is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Each team did the arithmetic properly. Each compared the options in front of it, picked the cheapest for the budget it is accountable for, and can produce the spreadsheet. Nobody was lazy and nobody was empire-building.

A local minimum is a minimum over the options one team can choose between. Some of the cost of a choice lands on a different team, and that part is not in the spreadsheet - not because it was hidden, but because it is not a number that team is given.

Both totals are computed from the same option table.

```
team      local choice        cost here   cost elsewhere   total
  ingest   batch hourly   10          0               10
  store   compress   8          12               20
  serve   cache 24h   5          18               23
  report   nightly rebuild   6          9               15
  total                                                    68
```

```
team      total-cost choice   cost here   cost elsewhere   total
  ingest   batch hourly   10          0               10
  store   compress   8          12               20
  serve   cache 1h   14          3               17
  report   nightly rebuild   6          9               15
  total                                                    62
```

```
choosing on the total costs 6 less than four correct local choices
```

```
what changes for each team's own budget
  serve : 5 to 14
  team budgets that go up : 1, and each is measured on that line
  the total falls anyway, because the increase is smaller than what it saves
```

```
the two totals, by whose budget they land in
  local choices  : 29 on the deciding teams, 39 elsewhere
  total choices  : 38 on the deciding teams, 24 elsewhere
  the deciding teams pay 9 more to save 6 overall
```

```
the number each team is given
  its own line   : yes
  the other line : no, it is a different team's budget
  a team choosing on what it can see chooses the left column every time,
  and being given the second number is the whole intervention
```

```
control - the ingest team, whose options cost nobody else anything
  local choice total : 10, total-cost choice : 10
  the same option under both rules, so this team cannot show the gap
```

Each team compared its options correctly and picked the cheapest. The cheapest of what a team is shown is a different quantity from the cheapest available, and the difference is the column nobody hands them.

Verify it yourself:

```bash
pnpm eml run examples/each-team-minimised-its-own-cost/each_team_minimised_its_own_cost.eml
```
