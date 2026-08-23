# The objections stopped and so did the objectors

`the_objections_stopped_and_so_did_the_objectors.eml` - A design review series records fewer objections every quarter. Where the objections went and where the objectors went are computed separately below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The review process improved and the improvements were real. Templates were added, proposals arrive with a written problem statement, and the authors have got much better at pre-socialising a design before the meeting. Any of those would reduce objections on its own, and all three happened.

An objection is raised by a person who is present, and the set of people present is not constant. A falling objection rate is consistent with better designs and it is equally consistent with a smaller set of people willing to object, and the two are distinguished by counting attendance rather than by counting objections.

Both are counted below.

```
quarter   proposals   objections   invited   attended   distinct objectors
  Q1        18          41           22        19         11
  Q2        20          33           22        17         9
  Q3        19          22           23        14         6
  Q4        21          14           24        12         4
  Q5        22          9           25        11         3
  Q6        20          5           26        9         2
```

```
objections per proposal
  Q1 : 227 per 100 proposals
  Q2 : 165 per 100 proposals
  Q3 : 115 per 100 proposals
  Q4 : 66 per 100 proposals
  Q5 : 40 per 100 proposals
  Q6 : 25 per 100 proposals
  Q1 to Q6 : 227 -> 25
  a fall of 89%
```

```
attendance against invitation
  Q1 : 19 of 22 invited, 86%
  Q2 : 17 of 22 invited, 77%
  Q3 : 14 of 23 invited, 60%
  Q4 : 12 of 24 invited, 50%
  Q5 : 11 of 25 invited, 44%
  Q6 : 9 of 26 invited, 34%
  Q1 : 86%, Q6 : 34%
  the invitation list grew by 4 and the room shrank by 10
```

```
objections per attendee, which holds the room size constant
  Q1 : 215 per 100 attendees
  Q2 : 194 per 100 attendees
  Q3 : 157 per 100 attendees
  Q4 : 116 per 100 attendees
  Q5 : 81 per 100 attendees
  Q6 : 55 per 100 attendees
  Q1 : 215, Q6 : 55
  fall : 74%
  the per-proposal fall was 89%, so most of it survives the correction
  and some of it does not
```

```
how many different people raised anything
  Q1 : 11 people, 57% of the room
  Q2 : 9 people, 52% of the room
  Q3 : 6 people, 42% of the room
  Q4 : 4 people, 33% of the room
  Q5 : 3 people, 27% of the room
  Q6 : 2 people, 22% of the room
  Q1 : 11 of 19 attendees
  Q6 : 2 of 9 attendees
  the number of people who object at all has fallen by 81%
```

```
the 11 people who ever raised an objection in this series
  still attending at Q6 : 2
  stopped attending, still at the company : 5
  left the company : 2
  moved to another team : 2
  so 9 of 11 are not in the room any more
```

```
what a falling objection count is consistent with
  the designs got better       : consistent
  the room got smaller         : consistent
  the people who object left   : consistent
  all three are happening here, and the objection count alone cannot
  apportion them
```

```
what would separate them
  ask a departed objector to review a current proposal
  proposals reviewed that way : 0
  so the measurement that would distinguish the explanations has not been
  taken, and the one that has been taken cannot
```

```
control - a second series where attendance did not move
  Q1 : 20 objections, 12 of 12 attending, 7 objectors
  Q6 : 8 objections, 12 of 12 attending, 6 objectors
  the room is the same size and 6 of the 7 objectors are still in it
  objections fell 60% with the roster held constant, which is the version of
  this number that means what it appears to mean
```

The templates and the pre-socialising are real improvements and objections really are lower. An objection needs somebody present who will raise it, so the count also measures the roster, and here the roster changed.

Verify it yourself:

```bash
pnpm eml run examples/the-objections-stopped-and-so-did-the-objectors/the_objections_stopped_and_so_did_the_objectors.eml
```
