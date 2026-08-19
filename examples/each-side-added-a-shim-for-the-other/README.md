# Each side added a shim for the other

`each_side_added_a_shim_for_the_other.eml` - Each team wrote a compatibility layer for the other team's changes. How many of them handle the same incompatibility is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: A shim is the right response to a breaking change you do not control. It is local, it needs nobody's agreement, it ships the same day, and it keeps a caller working through a change the caller had no say in. Every one of these was written by somebody unblocking their own team.

The other team is doing the same thing, in the other direction, against the same list of incompatibilities. Neither shim knows about the other, so the pair is maintained twice and removed never - removing one requires knowing the other exists, which is exactly the information the shims replaced.

Both sides' layers are counted against the same list of changes.

```
incompatibilities : 8
  shims written by side A : 6
  shims written by side B : 7
  shims in total          : 13
  more shims than incompatibilities, by 5
```

```
handled on both sides at once : 5 of 8
  each of those is one incompatibility with two independent fixes, and
  removing either one alone leaves the behaviour correct
```

```
incompatibility     side A   side B   still needed
  date format   yes      yes      no 
  null in totals   yes      no       yes
  renamed field   yes      yes      no 
  stricter enum   no       yes      yes
  pagination   yes      yes      yes
  error shape   yes      yes      no 
  id widening   no       yes      yes
  timezone   yes      yes      no 
```

```
underlying conditions that have gone away : 4 of 8
  shims defending nothing : 8
  shims still defending something : 5
  of those, 4 incompatibilities are double-covered AND dead,
  so 2 shims each could go and neither team can see the other's
```

```
touching a field that 5 of the doubled shims read
  layers to update : 10
  hours            : 30, at 3 hours each
  hours if each incompatibility had one owner : 15
  the duplication costs 15 hours every time
```

```
if both teams could see one list of incompatibilities
  shims that could be retired immediately : 8
  duplicates that could be halved         : 1
  shims that must stay                    : 5
  and no code changes hands, because the missing thing was the list
```

```
control - one team owning both sides of the interface
  incompatibilities : 2, double-covered : 0
  nothing is handled twice, because one person decides where it is handled
```

Every shim unblocked a real team against a real break, on the day it was needed. Two teams defending against the same list build two lists, and the only thing that reconciles them is the list neither has.

Verify it yourself:

```bash
pnpm eml run examples/each-side-added-a-shim-for-the-other/each_side_added_a_shim_for_the_other.eml
```
