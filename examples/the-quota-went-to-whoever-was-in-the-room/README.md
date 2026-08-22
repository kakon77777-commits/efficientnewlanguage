# The quota went to whoever was in the room

`the_quota_went_to_whoever_was_in_the_room.eml` - The quarter's compute budget was divided in a planning meeting. How the shares compare to what each team runs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Dividing it in a meeting is the right method for the problem as posed. The budget is fixed, the claims exceed it, and a room where the trade-offs are argued out loud produces a better allocation than a spreadsheet formula nobody agrees with. Everyone who spoke made a real case.

The room is the sample. A team that was not there made no case, and a team that sends a person who argues well makes a better one - and neither attendance nor argument is the quantity the budget is supposed to track.

Allocation and usage are computed side by side.

```
teams : 7, sent someone : 4
```

```
team          in the room   uses   allocated   difference
  ranking   yes           21.0%   30.0%       +9.0 points
  ingest   yes           18.0%   26.0%       +8.0 points
  billing   no            15.0%   4.0%       -11.0 points
  search   yes           12.0%   20.0%       +8.0 points
  reporting   no            19.0%   5.0%       -14.0 points
  mobile api   yes           6.0%   11.0%       +5.0 points
  ml training   no            9.0%   4.0%       -5.0 points
```

```
teams in the room : 4
  they use      : 57% of compute
  they received : 87% of the budget
teams not in the room : 3
  they use      : 43%
  they received : 13%
  the room took 30 points more than it uses
```

```
teams allocated less than they use
  billing : uses 15%, allocated 4%
  reporting : uses 19%, allocated 5%
  ml training : uses 9%, allocated 4%
  count : 3
  of those, absent from the meeting : 3 of 3
```

```
what a team does when its allocation is under its usage
  stop running the work : rarely, the work is why the team exists
  run it anyway         : the usual outcome, charged somewhere else
  escalate next quarter : which is attending the meeting, one quarter late
  so the allocation does not bind the usage; it decides who has to argue
```

```
what the meeting minutes contain
  claims made      : 4
  claims evaluated : 4
  claims not made  : 3, and these appear nowhere
  every decision in the minutes is defensible and the minutes are complete
  for the room
```

```
allocating on last quarter's measured usage instead
  points that would move : 30 (half the total absolute change)
  meetings needed        : 0, the numbers are already collected
  what is lost           : the argument about what SHOULD change, which is
  the thing a meeting is actually good at
  so the fix is not to cancel the meeting but to start it from the usage
```

```
control - a meeting with every team present
  attendance : 3 of 3
  attendance cannot explain any difference here, so what remains is the
  arguments - which is the method working as designed
```

A room where the trade-offs are argued beats a formula nobody agrees with, and every case made in it was real. The cases that were not made are absent from the minutes and from the budget, and absence is not evidence of not needing any.

Verify it yourself:

```bash
pnpm eml run examples/the-quota-went-to-whoever-was-in-the-room/the_quota_went_to_whoever_was_in_the_room.eml
```
