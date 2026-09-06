# The plan was empty and the state file was the comparison

`the_plan_was_empty_and_the_state_file_was_the_comparison.eml` - Infrastructure is declarative, every change is reviewed as a plan, and a nightly job alerts on any plan that is not empty. What the plan compares is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The practice is better than most. Nothing is changed by clicking; every change is a reviewed diff with the plan posted on the pull request; apply is gated on the plan that was reviewed rather than a fresh one; and a nightly job runs plan against production and alerts if it is not empty, which catches a resource someone edited by hand. Three hundred sixty-five nightly runs, three hundred sixty-five empty.

A plan compares the configuration to the recorded state, refreshing the resources that state knows about. A resource created outside the tool is in neither, so it is not a difference; it is not in the comparison at all.

The account holds three hundred seventy resources the state file has never heard of.

```
resources in the state file     : 1240
resources in the account        : 1610
  the plan cannot see           : 370
  share                         : 2298 per ten thousand
```

```
nightly plans run               : 365
  that were empty               : 365
jobs that enumerate the account : 0
alerts on a resource absent from state : 0
```

```
unmanaged resources made in the console : 214
  during an incident            : 96
  outside one                   : 118
```

```
the change process
  changes made by clicking : none, by policy
  every change reviewed as : a plan on the pull request
  apply gated on : the reviewed plan, not a fresh one
  drift check : nightly, alerting on a non-empty plan
  nightly runs : 365, empty 365
  verdict : DECLARED
```

```
  gating apply on the plan that was actually reviewed is
  the step most teams skip, and the nightly drift check is
  a real control that does catch hand edits
```

```
the two operands
  one : the configuration in the repository
  the other : the recorded state, refreshed from the
    provider for what it lists
  a hand edit to a listed resource : caught, correctly
  a resource that was never listed : in neither operand
  what an empty plan therefore says : the resources I
    manage match the configuration
  what a reader hears : the account matches the
    configuration
```

```
  state is the tool's record of what it did, so it is the
  set of things the tool can be wrong about
```

```
where the 214 came from
  during an incident : 96
  was that the right call at the time : yes; the
    pipeline is slower than the outage
  outside an incident : 118
  mostly : older than the policy that forbids it
  what would bring them back in : an import, which
    somebody has to know to do
  what tells them to : 0 alerts
```

```
the morning after
  resources created by hand overnight : some
  nightly plan : empty
  is the job broken : no
  is the plan wrong : no
  what the empty plan reports : the managed set is
    unchanged, which is true
  what the team concludes : nothing drifted
```

```
two kinds of divergence
  a managed resource edited by hand : the plan shows it,
    every night, and this has worked
  a resource that exists and is not managed : no
    operand contains it
  the second kind, counted once by hand : 370
  jobs that would count it continuously : 0
```

```
null control - enumerate the account, diff against state
  nightly plans empty : 365, unchanged and still correct
  resources the check can see : 1610
  resources outside the comparison : 0
  the plan did not get better; a second check started
  taking its population from the account instead of from
  the tool's own record
```

```
what an empty plan guarantees
  the managed resources match the configuration : exactly,
    refreshed from the provider, every night
  the account matches the configuration : not addressed;
    the comparison ranges over what the tool recorded
    doing, and it did not do these
```

```
a declarative tool reconciles a desired state with its own
record of reality; the record is written by the tool, so
anything that happened without it is not a difference but an
absence, and an absence is what an empty diff looks like
```

The practice is strong: nothing changed by clicking, every change reviewed as a plan, apply gated on the reviewed plan, and 365 nightly drift checks that do catch hand edits to managed resources. The plan compares the configuration to a state file listing 1240 of the account's 1610 resources, so 370 of them - 2298 per ten thousand - sit outside both operands, watched by 0 jobs and 0 alerts.

Verify it yourself:

```bash
pnpm eml run examples/the-plan-was-empty-and-the-state-file-was-the-comparison/the_plan_was_empty_and_the_state_file_was_the_comparison.eml
```
