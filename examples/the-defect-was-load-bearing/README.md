# The defect was load bearing

`the_defect_was_load_bearing.eml` - The bug was fixed and more callers broke than were ever helped.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The fix was correct. The function was documented to reject negative quantities and it accepted them, silently clamping to zero - a real defect, reported, reproduced and repaired exactly as it should have been.

Between the defect being written and the defect being fixed, callers arrived. Some hit it and worked around it; some depended on the clamping because it was the only behaviour they had ever observed. Neither group read the doc, because the code was right there.

Every caller is run against both behaviours here, so who breaks is counted rather than guessed.

```
callers : 8
  break when the defect is fixed : 4
  helped by the fix              : 2
```

```
caller             sends negatives   own guard   after the fix
  order intake   yes               no          BREAKS
  refund flow   yes               no          BREAKS
  bulk import   yes               yes         fine
  admin tool   no                no          fine
  mobile app   yes               no          BREAKS
  partner api   yes               yes         fine
  reconciler   no                no          fine
  migration job   yes               no          BREAKS
```

```
the callers that break
  order intake : sends negatives and expects them accepted
  refund flow : sends negatives and expects them accepted
  mobile app : sends negatives and expects them accepted
  migration job : sends negatives and expects them accepted
  none of them is doing anything the code ever refused
```

```
what the fix bought
  callers that already guarded, now guarded twice : 2
  callers that will now see a real error instead of a silent zero : 4
  the second group is the point of the fix and the cost of it
```

```
before the fix
  callers sending negatives with no guard : 4
  each of them was getting a silent zero, which is the defect
  each of them also shipped, tested and passed on that zero
```

```
warn for one release, then reject
  callers warned : 4
  callers broken during the warning release : 0
  callers broken after it : 4 - the same ones, at a time they chose
```

```
control - the same fix where every caller already guards
  callers broken : 0
  here the fix is free, which is what a fix is supposed to be
```

The defect was real and the fix was right. Behaviour that shipped is behaviour somebody built on, and how many is a fact about the callers rather than about the bug.

Verify it yourself:

```bash
pnpm eml run examples/the-defect-was-load-bearing/the_defect_was_load_bearing.eml
```
