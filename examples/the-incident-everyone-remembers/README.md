# The incident everyone remembers

`the_incident_everyone_remembers.eml` - The outage nobody will forget cost less than the class nobody can name.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Remembering it is not irrational. It was long, it happened during the day, it was visible to customers, and everyone was in the room for it - all of which are real features of a serious incident, and all of which are also features that make an event memorable independently of what it cost.

The other class arrives in fifteen-minute pieces, at night, one team at a time. Nobody was ever in a room for it, so there is no shared memory of it to be weighed against anything.

Both totals are computed from the same incident list.

```
class            times   each   total   daytime   all-hands
  the big one   1     380    380     yes     yes
  slow checkout   41     14    574     no      no 
  stale cache   22     9    198     no      no 
  auth flap   7     25    175     yes     no 
  total minutes : 1327
```

```
the costliest class
  slow checkout : 574 minutes  (43%)
```

```
the memorable one
  the big one : 380 minutes  (28%)
  it is not the costliest
```

```
prevention effort against cost
  the big one : 28% of the cost, 90% of the effort
  slow checkout : 43% of the cost, 6% of the effort
  stale cache : 14% of the cost, 0% of the effort
  auth flap : 13% of the cost, 3% of the effort
```

```
if effort followed cost
  the big one : 30 days spent, 9 proportional
  slow checkout : 2 days spent, 14 proportional
  stale cache : 0 days spent, 4 proportional
  auth flap : 1 days spent, 4 proportional
```

```
incidents nobody was all paged for
  their share of downtime : 71%
  their share of effort   : 9%
```

```
control - a year where the dramatic incident really is the expensive one
  the big one : 90% of downtime
  here memory and cost point the same way
```

Every property that made the outage memorable is a real property of a serious incident. None of them is duration times frequency, and that is the quantity the year is made of.

Verify it yourself:

```bash
pnpm eml run examples/the-incident-everyone-remembers/the_incident_everyone_remembers.eml
```
