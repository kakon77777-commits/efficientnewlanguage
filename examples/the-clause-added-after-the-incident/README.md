# The clause added after the incident

`the_clause_added_after_the_incident.eml` - A clause was added to the validator after an incident. What else it rejects is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The clause is a correct response to a real incident. A payload of that shape reached production, caused damage, and would be stopped by this test. It was written from the actual payload, reviewed against the actual timeline, and it does what it says.

The rejected shape was described by the one payload anybody had. A test written from one example matches that example and everything else that happens to share the feature it keyed on, and the feature it keyed on is whatever the author could see in a single record.

Every payload is run against the validator with and without the new clause.

```
payloads : 10, genuinely malformed : 3
```

```
  rejected before the clause : 3
  rejected after             : 7
  newly rejected             : 4
  of those, actually valid   : 4
```

```
the clause rejects 4 valid payloads, which is 40% of the traffic
  each has the oversized field the incident payload had, and none of them
  is malformed
```

```
payloads carrying the incident's marker : 5
  of those, malformed and now caught : 2
  so the clause does what it was written for
```

```
malformed payloads with the marker : 2
  of those, already rejected by the old rule : 2
  the old rule caught every one of them, so the new clause added
  rejections and not protection on this traffic
```

```
the two candidate clauses
  reject if the field is oversized : rejects 4 extra, 4 of them valid
  reject if the marker is present  : rejects 3 extra, 3 of them valid
  both are drawn from the same single payload and neither names the defect
```

```
valid payloads with an oversized field, in this traffic : 4
  any one of them, held next to the incident payload, shows that the size
  is shared by both and so cannot be what separates them
```

```
control - a clause keyed on a feature only malformed payloads have
  valid payloads it would reject : 0, by construction of the feature
  the difference from the shipped clause is not the care taken, it is
  whether the feature is shared with the valid traffic
```

The clause stops the payload that caused the incident and was written from that payload. What it keys on is a property that payload shares with valid traffic, and one example cannot show which properties those are.

Verify it yourself:

```bash
pnpm eml run examples/the-clause-added-after-the-incident/the_clause_added_after_the_incident.eml
```
