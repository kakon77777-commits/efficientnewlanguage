# Full compliance was reached by changing the denominator

`full_compliance_was_reached_by_changing_the_denominator.eml` - A security standard reached 100% compliance. How many repositories changed and how many left the denominator are counted separately below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Archiving those repositories was correct. They had no owning team, no commits in over a year, and carrying them in every audit was costing real review time on code nobody was going to touch. Somebody made a clean decision about dead weight and the audit got faster.

Compliance is a ratio, and a ratio moves when either half moves. Archiving changes the denominator without touching the code, so the same repositories in the same state produce a different percentage. Whether the archived ones still run is a separate fact from whether they are counted.

Both halves are counted below.

```
repo             compliant   commits/yr   archived   deployed   requests/day
  gateway   yes         412          no        yes        9000000
  billing   yes         380          no        yes        900000
  catalog   yes         250          no        yes        4000000
  notifier   yes         90          no        yes        120000
  reporting   yes         66          no        yes        40000
  legacy-import   no         0          yes        yes        22000
  partner-sync   no         0          yes        yes        8000
  old-admin   no         0          yes        yes        300
  batch-tools   no         2          yes        no        0
  scratch-etl   no         0          yes        no        0
```

```
repositories               : 10
compliant                  : 5
archived                   : 5
in scope after archiving   : 5
```

```
the ratio, both ways
  over every repository : 5 of 10 = 50%
  over in-scope only    : 5 of 5 = 100%
  repositories whose code changed : 0
  the metric moved 50 points on a change to the denominator
```

```
the 5 archived repositories
  still deployed        : 3
  requests they serve   : 30300 a day
  compliant             : 0
    legacy-import : 22000 requests a day, not compliant, not counted
    partner-sync : 8000 requests a day, not compliant, not counted
    old-admin : 300 requests a day, not compliant, not counted
  archiving a repository stops it being audited and does not stop it
  receiving requests
```

```
requests per day, by whether the repository is audited
  audited     : 14060000
  not audited : 30300
  total       : 14090300
  the unaudited share is 2150 requests per million,
  a unit fine enough not to floor to zero the way a percentage does here
  a small share of traffic, and it is the whole of the non-compliant code
```

```
  batch-tools : archived, not deployed, 0 requests
  scratch-etl : archived, not deployed, 0 requests
repositories where archiving matched reality : 2 of 5
  for these the archive flag and the facts agree, and removing them from
  the audit removes nothing
  for the other 3 it removes 30300 requests a day from view
```

```
the same standard, weighted by requests served
  requests served by compliant code : 14060000
  requests served by all code       : 14090300
  compliance by traffic             : 99%
  by repository count, in scope     : 100%
  by repository count, everything   : 50%
  three defensible numbers for one standard, and the reporting picked one
```

```
control - reporting before and after the work
  before : compliant no, after : compliant yes
  commits in the year : 66, requests a day : 40000
  denominator before and after : 5 and 5
  here one repository changed and the ratio moved by one repository,
  which is the only movement that survives asking what changed
```

Archiving unowned code with no commits in a year was the right call and the audit really is faster. 3 of the 5 archived repositories still serve 30300 requests a day, and none of them are in the 100%.

Verify it yourself:

```bash
pnpm eml run examples/full-compliance-was-reached-by-changing-the-denominator/full_compliance_was_reached_by_changing_the_denominator.eml
```
