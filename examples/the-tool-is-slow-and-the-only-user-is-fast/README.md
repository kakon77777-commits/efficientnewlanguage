# The tool is slow and the only user is fast

`the_tool_is_slow_and_the_only_user_is_fast.eml` - An internal tool takes many steps to do anything. Its recorded task time is good. Who produced that number is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The tool works. It has never lost data, it does things no other tool here can do, and the person who uses it most has genuinely mastered it - she knows the keystroke order, she knows which two screens can be skipped, and she is fast. Her speed is real skill and not a trick.

Time-per-task is measured over the people who do the task. One person does 94% of them. So the tool's ergonomics are recorded through the one operator who has adapted to them completely, and the measurement that would show the tool is hard is taken almost entirely from the person it is no longer hard for.

Tasks are counted by operator, with the time each one takes.

```
operator            tasks/month   seconds/task   months of practice
  the expert   470           40             38
  second operator   18           220             7
  occasional a   6           480             2
  occasional b   4           520             1
  new starter   2           900             0
```

```
tasks a month        : 500
mean seconds per task, weighted by who does them : 59
the expert's share   : 94%
```

```
mean seconds per task
  weighted by task volume : 59
  unweighted across operators : 432
  ratio : 7 to 1
  the first is what the dashboard shows and the second is closer to what a
  person newly asked to do this would experience
```

```
the tool is queued for rework when mean task time exceeds 120 seconds
  on the weighted mean (59s) : 0
  operators for whom a single task exceeds the bar : 4 of 5
  the rule does not fire, and 4 of 5 people are over the bar every
  time they touch it
```

```
seconds per task against months of practice
  38 months : 40s
  7 months : 220s
  2 months : 480s
  1 months : 520s
  0 months : 900s
  from 0 months to 38 months : 900s to 40s
  a factor of 22
  that gradient is the tool's difficulty, expressed as how long it takes to
  stop being slowed by it
```

```
hours a month spent in this tool
  as it is                       : 8
  if everyone were as fast as her : 5
  the gap is 3 hours, carried by the 30 tasks she does not do
```

```
why she does 94% of them
  a task takes her 40s and the second operator 220s
  so routing a task to her is 5 times cheaper, every single time
  each individual routing decision is correct
  and each one adds to her practice and to nobody else's
```

```
control - a second tool, an experienced and a new operator
  30 months of practice : 22s per task
  1 months of practice : 26s per task
  spread : 4s, against 860s for the tool above
  here who is holding the mouse barely moves the number, so the number is
  a measurement of the tool
```

Her speed is real skill and the tool has never lost data. Task time is averaged over whoever does the task, she does 94% of them, and the bar is 120 seconds against her 40.

Verify it yourself:

```bash
pnpm eml run examples/the-tool-is-slow-and-the-only-user-is-fast/the_tool_is_slow_and_the_only_user_is_fast.eml
```
