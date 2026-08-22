# The breach was priced by who found it

`the_breach_was_priced_by_who_found_it.eml` - Eight incidents of the same rule being broken. What each one cost the team that broke it is computed below, alongside what it cost the company.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Responding proportionately to who is affected is right. A breach a customer noticed needs a customer response; one an internal linter caught needs a commit. Scaling the response to the audience is not favouritism, it is how incident response is supposed to work.

The consequence for the team, though, ends up scaled to the audience rather than to the breach. Two identical violations can differ by an order of magnitude in what happens next, and the difference is decided by who happened to notice.

Severity and response are counted separately.

```
incidents of the same rule : 8
```

```
incident   severity   found by      response hours   review
  v1         4          a customer   40                yes
  v2         4          the linter   1                no 
  v3         2          a customer   32                yes
  v4         5          the linter   2                no 
  v5         3          an auditor   24                yes
  v6         5          an engineer   3                no 
  v7         1          a customer   28                yes
  v8         4          an engineer   2                no 
```

```
response hours, grouped by real severity
  severity 1 : 1 incident(s), 28 hours
  severity 2 : 1 incident(s), 32 hours
  severity 3 : 1 incident(s), 24 hours
  severity 4 : 3 incident(s), 43 hours
  severity 5 : 2 incident(s), 5 hours
```

```
response hours, grouped by who found it
  a customer : 3 incident(s), 100 hours, mean severity 23 tenths
  the linter : 2 incident(s), 3 hours, mean severity 45 tenths
  an auditor : 1 incident(s), 24 hours, mean severity 30 tenths
  an engineer : 2 incident(s), 5 hours, mean severity 45 tenths
```

```
the sharpest pair
  v4 : severity 5, found by the linter, 2 hours
  v6 : severity 5, found by an engineer, 3 hours
  v7 : severity 1, found by a customer, 28 hours
  the least severe breach cost 9 times the hours of the most severe one
```

```
incidents that reached a review : 4 of 8
  their mean severity   : 25 tenths
  mean severity of the rest : 45 tenths
  the incidents that did NOT reach a review are the more severe group
```

```
what the pattern teaches a team that broke the rule
  severity of the breach     : does not predict the consequence
  who noticed                : does
  the available action that follows is to reduce who notices, which is not
  the same as reducing breaches
```

```
pricing the response on severity instead
  total severity across all 8 : 28
  hours available           : 132
  hours per severity point  : 4
  the same total effort, allocated to the breaches rather than to the
  audiences, and it needs no new budget
```

```
control - a rule where every breach is caught by the same check
  distinct finders : 1
  response hours, by severity : 
    severity 4 : 2 hours
    severity 2 : 1 hours
    severity 5 : 3 hours
  the ordering follows severity here, because the only thing left to vary
  is the breach
```

Matching the response to who is affected is how incident response works and none of these responses was wrong for its audience. The consequence a team faces is therefore a fact about who was watching.

Verify it yourself:

```bash
pnpm eml run examples/the-breach-was-priced-by-who-found-it/the_breach_was_priced_by_who_found_it.eml
```
