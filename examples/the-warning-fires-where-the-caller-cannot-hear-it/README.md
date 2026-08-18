# The warning fires where the caller cannot hear it

`the_warning_fires_where_the_caller_cannot_hear_it.eml` - The deprecation warning was moved into the call itself, which is the right place for it. How many callers can act on it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Putting the warning where the call happens fixes the audience problem: the people who trigger it are exactly the people who use the thing. That is the correct instinct, and it is why a runtime warning beats a blog post.

Between the warning firing and somebody changing a line of code there are three more steps, and each one is a place the signal can stop: the log level has to keep it, somebody on the calling team has to read that stream, and the call site has to be one they can edit. A caller who fails any of the three gets a warning that is emitted, correct, and inert.

The funnel is measured per caller rather than assumed.

```
callers : 8
warnings emitted per day : 21250
  every one of them is correct, and names the deprecated call
```

```
callers the warning reaches, step by step
  warning fires for              : 8
  survives the log level         : 5
  lands in a stream they read    : 4
  and they can edit the call     : 2
```

```
  6 of 8 callers get a warning nothing can come of
```

```
how many are lost at each step
  log level drops it   : 3
  nobody reads it      : 1
  cannot edit the call : 2
  largest single loss : the log level, 3 callers
```

```
the same funnel counted in calls rather than callers
  calls from callers who can act    : 6500
  calls from callers who cannot     : 14750
  most of the traffic comes from callers the warning cannot reach
```

```
callers who read the warning and cannot change the call
  partner etl : 300 calls/day
  vendor sdk : 3300 calls/day
  for these the actionable step is an upgrade or a ticket, not an edit
```

```
control - a deprecation that fails the build
  callers it reaches : 8 of 8
  6 more than the runtime warning, and none of them can defer it
  the ones who do not own the call site now cannot build until someone else moves
```

The warning is in the right place and every one it emits is true. Whether it changes a line depends on three things after the emit, and none of them is decided by the code that emits it.

Verify it yourself:

```bash
pnpm eml run examples/the-warning-fires-where-the-caller-cannot-hear-it/the_warning_fires_where_the_caller_cannot_hear_it.eml
```
