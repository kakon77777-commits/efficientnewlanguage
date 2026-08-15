# The holdout is the only thing that can say no - 12.0 without it, 0.0 with it

`the_holdout_is_the_only_thing_that_can_say_no.eml` runs two worlds through the same arithmetic: one where the change does nothing, and one where it works.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: rolling out to everyone is the default and it is not laziness. A holdout means withholding something you believe in from real users, needs extra plumbing, and delays the full effect. Skipping it costs nothing anyone can see at the time. What it costs is the ability to answer no.

```
units : 10, held out when a holdout exists : 3
```

```
WORLD A - the change does nothing
  no holdout : before 23.3 -> after 35.3   reported lift 12.0
  with holdout : treated 22.7 -> 34.7,  held out 24.6 -> 36.6
  difference in differences : 0.0
```

```
WORLD B - the change is worth 9 points
  no holdout : before 23.3 -> after 44.3   reported lift 21.0
  with holdout : treated 22.7 -> 43.7,  held out 24.6 -> 36.6
  difference in differences : 9.0
```

```
what the no-holdout number says in each world
  world A : 12.0
  world B : 21.0
  the two differ only by the real effect, and both look like success
```

```
what the holdout number says in each world
  world A : 0.0
  world B : 9.0
  in world A it says zero, which is the answer nothing else can produce
```

```
In world B the holdout reports 9.0, not zero.
The seasonal lift of 12.0 is subtracted because it happened to
both groups, and what is left is the part the change caused.
```

Before and after are separated by time, and time is not empty. The holdout is not a second measurement of the same thing - it is the only way to ask what would have happened anyway.

**World B is the control.** Without it the reader could conclude that holdouts always report nothing; in world B the holdout reports 9.0, which is the real effect with the seasonal lift subtracted because it happened to both groups.

Verify it yourself:

```bash
pnpm eml run examples/the-holdout-is-the-only-thing-that-can-say-no/the_holdout_is_the_only_thing_that_can_say_no.eml
```
