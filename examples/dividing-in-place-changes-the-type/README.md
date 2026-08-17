# Dividing in place changes the type

`dividing_in_place_changes_the_type.eml` - Four compound assignments look alike. One of them changes what the variable is.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: `^+`, `^-` and `^*` on two integers give an integer. `^/` gives a float, always, even when the division is exact - which is the right rule, because the alternative is a division whose result type depends on the values.

The consequence is that a counter updated with `^/` stops printing the way it did while still comparing the way it did, in code that changed by one character. Which of those two survives is measured below, not asserted here.

```
starting from 12
  ^+ 4 : 16
  ^- 4 : 8
  ^* 4 : 48
  ^/ 4 : 3.0
```

```
how each renders
  the three integer results carry no point
  the divided one renders as 3.0
  and 12 divided by 4 leaves no remainder, so the point is the type
```

```
  d == 3 is true, so equality still holds across the types
  but str(d) is '3.0' and str(3) is '3'
```

```
halving a counter until it is below 10
  step 1 : 50.0
  step 2 : 25.0
  step 3 : 12.5
  step 4 : 6.25
  steps : 4
```

```
the same loop keeping an integer
  step 1 : 50
  step 2 : 25
  step 3 : 12
  step 4 : 6
  steps : 4
```

```
comparing the two loops step by step
  both ran 4 steps
  steps that print differently : 4 of 4
  steps that hold a different number : 2 of 4
  so 2 of them are the same number wearing a point
```

```
a division that is not exact
  ^/ 2   : 12.5
  int(/2): 12
  here the two disagree on the value, not only on the rendering
```

```
control - the other three, applied as identities
  ^+ 0 : 7, ^- 0 : 7, ^* 1 : 7
  all three render exactly as they started
```

One character separates the three that preserve the type from the one that does not, and the divided value is still equal to the integer it should be.

Verify it yourself:

```bash
pnpm eml run examples/dividing-in-place-changes-the-type/dividing_in_place_changes_the_type.eml
```
