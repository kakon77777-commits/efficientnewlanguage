# The runbook was followed and the topology had changed

`the_runbook_was_followed_and_the_topology_had_changed.eml` - The runbook was written after a real incident, drilled, and used successfully twenty-three times. How much of it still describes the system is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: It is a good runbook. It was written the week after an outage by the people who were on the call, every step names the exact command rather than the intent, every step states the output to expect, it is drilled on game days instead of being filed, and mean time to recovery went from ninety-four minutes to eleven. Twenty-three real uses, all successful.

A runbook is a description of a system. The system was re-architected eight months ago; the commands in the runbook are still valid commands, so the steps that no longer describe anything still run and still report success.

Nothing has re-read the runbook against the current topology.

```
runbook steps                   : 14
  commands that still execute   : 14
  that still describe the system: 9
  that describe the old one     : 5
  share stale                   : 3571 per ten thousand
```

```
successful uses                 : 23
mean time to recovery, before   : 94 minutes
mean time to recovery, after    : 11 minutes
  minutes the runbook saves     : 83
```

```
months since the topology changed : 8
reviews of the runbook since      : 0
game days since                   : 2
  against the current topology    : 0
```

```
the runbook
  written by     : the people who were on the call
  each step names: the exact command, not the intent
  each step states: the output to expect
  drilled or filed: drilled
  real uses      : 23, all successful
  minutes saved per incident : 83
  verdict : EFFECTIVE
```

```
  naming the command instead of the intent is what makes it
  usable at three in the morning, and it is the right call
```

```
one step
  what it is  : a command plus an expected output
  what it assumes : the thing the command acts on exists
    and is the thing that matters
  what checks that assumption : the operator, from memory
  what happens if it is false : the command runs anyway,
    because it is a valid command against a real system
```

```
  naming the exact command is what makes it executable and
  is also what lets it execute after it stopped being true
```

```
the five stale steps
  address objects that no longer exist : none of them
  address objects that exist and no longer matter : all
  therefore they return : success
  and the operator reads that as : the step worked
  a step that errored would be : better, and none do
```

```
the drills
  game days since the change : 2
  run against staging        : both
  when staging was cloned    : before the change
  run against the current topology : 0
  so the drill result is     : correct, about a system
    that is no longer the one on call
```

```
one successful use
  steps run     : 14
  steps that acted on the right thing : 9
  steps that acted on the wrong thing : 5
  incident resolved : yes
  what the write-up records : the runbook worked
  what would separate the two groups : an assertion per
    step about the state it expects, which none have
```

```
null control - every step asserts its own precondition
  minutes the runbook saves : 83, unchanged
  steps executing against the wrong thing : 0
  steps refusing and naming the mismatch  : 5
  the runbook did not get more accurate; it started
  checking the description it depends on
```

```
what a drilled runbook guarantees
  the steps are executable and were rehearsed : exactly,
    which is more than most procedures manage
  the steps do what they say                  : not
    addressed; a command is executable against any system
    that has the objects it names
```

```
a procedure is a description with no reader that can
disagree with it; the system it describes changes without
consulting it, and the steps that stopped applying are
exactly the ones that report success and do nothing
```

The runbook is the good kind: written by the people on the call, naming exact commands and expected outputs, drilled rather than filed, and used 23 times to cut recovery from 94 minutes to 11. It describes a topology that changed 8 months ago and has been reviewed 0 times since, so 5 of its 14 steps - 3571 per ten thousand - still execute, still succeed, and act on nothing.

Verify it yourself:

```bash
pnpm eml run examples/the-runbook-was-followed-and-the-topology-had-changed/the_runbook_was_followed_and_the_topology_had_changed.eml
```
