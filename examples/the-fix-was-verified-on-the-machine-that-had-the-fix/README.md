# The fix was verified on the machine that had the fix

`the_fix_was_verified_on_the_machine_that_had_the_fix.eml` - A bug reproduces on 4 of 12 hosts. The fix was deployed to one host, verified there, and rolled out. What that verification could and could not have shown is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Verifying on one host before touching the other eleven is correct and it is the whole point of a canary. It bounds the blast radius, it is reversible in one step, and it produces a real observation from real traffic rather than from a synthetic reproduction. The engineer who did it followed the runbook exactly, and the runbook is a good runbook.

The bug depends on a host-local condition - a disk above 80 percent, which is true on 4 of the 12. The canary was host-07, chosen because it is the one with the console already open. Nobody checked whether host-07 was one of the four, because the list of four did not exist yet: producing it is what the investigation was going to do next.

A check is evidence only if it could have come out the other way. On a host where the bug does not occur, "no bug after the fix" is what happens whether the fix works, does nothing, or makes things worse.

```
hosts in the fleet        : 12
hosts where it reproduces : 4
canary chosen             : 1, at random with respect to that list
```

```
probability the canary was an affected host : 33 percent
probability it was not                      : 66 percent
```

```
if the canary WAS an affected host
  fix works    -> no bug   observed
  fix does nothing -> bug  not observed
  the two predictions differ, so green rules one out
```

```
if the canary was NOT an affected host
  fix works    -> no bug   observed
  fix does nothing -> no bug  observed
  the two predictions agree, so green rules out nothing
```

```
  the same green tick, and in one case it is proof and in the other it is
  the only thing that could have happened
```

```
the missing precondition
  did the bug occur on this host BEFORE the fix
  if yes : green afterwards is a real observation
  if no  : green afterwards is not an observation at all
  cost of asking : one log query against data already retained
```

```
canaries   chance of hitting at least one affected host
  1          333 per mille
  2          555 per mille
  3          703 per mille
  4          802 per mille
  5          868 per mille
  6          912 per mille
  7          941 per mille
  8          960 per mille
  9          973 per mille
```

```
  one canary reaches 333 per mille
  reaching 950 per mille takes 8 of the 12, which is not a canary any more
  choosing 1 host that is KNOWN affected reaches 100 percent
```

```
after the rollout
  hosts with the fix                 : 12
  hosts on which the bug could still be observed : 0
  hosts remaining to test the fix against : 0
  the fleet is now a single sample of size one, and it has no control
```

```
control - what the canary DID establish
  the fix deploys without error      : yes, observed
  the process stays up               : yes, observed
  latency did not regress            : yes, measured
  blast radius bounded to 1 host     : yes, by construction
  the bug is fixed                   : not established
  four of five, and the fifth is the one the change was for
```

```
null control - the same canary against a bug that reproduces on every host
  hosts where it reproduces : 12 of 12
  chance the canary is affected : 100 percent
  green after the fix is decisive : yes
  same runbook, same engineer, same one host
  the procedure is unchanged and now it proves what it claims
```

```
what makes a single-host check worth its cost
  the host must be able to exhibit the failure
  and it must be KNOWN to have exhibited it
  otherwise the check has one possible outcome
  a check with one possible outcome has no failure mode to report
  and it will be green on the day the fix is wrong
```

Canarying one host bounds the blast radius, keeps the rollback to one step and produces an observation from real traffic - all of which happened. It also reached a host that was one of the four with probability 33 percent. On the other 66 percent of draws, 'no bug after the fix' is what the host was going to report under every hypothesis, including the one where the fix does nothing at all.

Verify it yourself:

```bash
pnpm eml run examples/the-fix-was-verified-on-the-machine-that-had-the-fix/the_fix_was_verified_on_the_machine_that_had_the_fix.eml
```
