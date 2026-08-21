# Nobody has ever passed the second argument

`nobody_has_ever_passed_the_second_argument.eml` - The function takes an optional second argument. How many call sites pass it is computed below, and so is what it costs to keep.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding the parameter was right. A caller genuinely might need to override the behaviour, adding it later would be a breaking change for anyone who had already written a positional call, and it is optional so no existing caller had to change. This is the standard advice and it was followed.

A parameter nobody passes is a branch nobody runs, and unlike dead code it cannot be deleted by a linter, because it is reachable in principle and part of the published signature. It is carried by every change to the function.

The call sites and the maintenance cost are counted separately.

```
parameters on the signature : 5
call sites : 47
```

```
parameter      passed by   branches   review mentions
  strict   0 of 47     2          6
  encoding   3 of 47     1          1
  timeout_ms   12 of 47     1          0
  legacy_mode   0 of 47     3          9
  on_error   0 of 47     2          4
```

```
parameters no call site has ever passed : 3 of 5
  branches behind them : 7
  times they came up in review anyway : 19
```

```
branches in the function : 9
  reachable from a real call site : 2
  reachable only in principle      : 7, which is 77%
```

```
what a change to this function has to consider
  behaviours a caller depends on : 2
  behaviours that must be preserved anyway : 7
  the second group has no caller to break and cannot be shown to work
```

```
evidence available for each kind of branch
  passed by a call site : production traffic, every day
  passed only by a test : whatever the test asserts
  never passed at all   : the code reads correctly
  the third is the same evidence the code had on the day it was written
```

```
review mentions across all parameters : 20
  of those, about parameters nobody passes : 19, which is 95%
  a reviewer has to reason about them because they are in the signature,
  and no reviewer can check them against a caller
```

```
removing a parameter no call site passes
  callers that break : 0, by the count above
  branches removed   : 7
  what stops it      : it is published, so removal is a breaking change to
  an interface rather than to any caller
  the parameter costs nothing to any caller and cannot be removed for the
  sake of the callers it has none of
```

```
control - timeout_ms, passed by 12 of 47 call sites
  its branch runs in production, so a change to it is caught by the
  callers rather than by a reviewer imagining them
```

The parameter was added for a real reason and adding it later would have broken callers. Nothing has passed it, so what is known about the code behind it is what was known the day it was written.

Verify it yourself:

```bash
pnpm eml run examples/nobody-has-ever-passed-the-second-argument/nobody_has_ever_passed_the_second_argument.eml
```
