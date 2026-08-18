# Nobody can prove any of them is removable

`nobody_can_prove_any_of_them_is_removable.eml` - Eleven workarounds, each added for a condition that was real. How many can be shown to be dead is computed below, and it is not the same as how many are dead.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Keeping them is the cautious choice and cautious is right here. Removing a workaround that is still load-bearing breaks production for a reason nobody will connect to the change, and the person who would have to defend that is not the person who wrote it.

Caution needs something to be cautious about. A workaround is removable when its condition is gone, and knowable-as-removable when somebody can still tell whether the condition is gone. Those are different properties and they decay at different rates, which is why the list only ever grows.

Both are counted per workaround.

```
workarounds : 11
```

```
  conditions that no longer occur   : 7
  somebody or something can still tell : 7
  both, so removal is defensible    : 4
  dead but unprovable : 3
  those stay, and they are the ones caution is protecting nothing from
```

```
id    condition   evidence available   verdict
  w1    live        a check              keep
  w2    gone        a check              removable
  w3    gone        the author              removable
  w4    live        none                 keep
  w5    gone        none                 stays, unprovable
  w6    live        a check              keep
  w7    gone        a check              removable
  w8    gone        none                 stays, unprovable
  w9    live        the author              keep
  w10    gone        none                 stays, unprovable
  w11    gone        a check              removable
```

```
conditions that still occur : 4
  with evidence saying so   : 3
  without                   : 1
  kept for the right reason by accident : 1
```

```
if every workaround logged whether its condition fired
  provably removable becomes : 7
  up 3 from 4, with no workaround removed yet
  and the ones that stay, stay on evidence rather than on nobody knowing
```

```
what the unprovable ones cost while they wait
  count       : 3
  lines       : 9, at 3 lines each
  the real cost is that each one is read by everybody who touches this file
  and cannot be understood without the incident that produced it
```

```
control - workarounds that carry their own condition check
  count : 2, provably removable : 2
  all of them, with no author reachable and no archaeology
```

Keeping a workaround whose condition might still occur is correct. The list grows because the evidence that would end an entry expires faster than the condition it was about.

Verify it yourself:

```bash
pnpm eml run examples/nobody-can-prove-any-of-them-is-removable/nobody_can_prove_any_of_them_is_removable.eml
```
