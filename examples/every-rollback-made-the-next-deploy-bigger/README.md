# Every rollback made the next deploy bigger

`every_rollback_made_the_next_deploy_bigger.eml` - A bad deploy is followed by more review before the next one. What that does to the next deploy is simulated rather than argued.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Slowing down after a failure is the correct instinct and it is what every incident review recommends. More eyes on a change finds more in it, and the team that just broke production has evidence that its current rate is too fast for its current process.

Waiting does not stop the changes arriving. It stores them, so the next deploy carries everything written during the wait, and a deploy's risk is mostly its size. The response to a failure is an input to the next failure.

Both policies are run over the same stream of changes.

```
changes written per day : 3
days simulated          : 60
a deploy breaks once per 6 changes it carries
both runs start the day after an incident, at a 4-day interval
```

```
policy                          failures   shipped   largest deploy   interval at the end
  wait longer after a failure   29         180       12               30
  deploy sooner after a failure 4          180       12                1
```

```
waiting longer produced 25 more failures than deploying sooner
```

```
the cautious rule, deploy by deploy
  deploy 1 : after 4 days, 12 changes, broke, wait 5 days next
  deploy 2 : after 5 days, 3 changes, clean
  deploy 3 : after 4 days, 9 changes, broke, wait 5 days next
  deploy 4 : after 5 days, 6 changes, broke, wait 6 days next
  deploy 5 : after 6 days, 6 changes, broke, wait 7 days next
  deploy 6 : after 7 days, 6 changes, broke, wait 8 days next
  deploys in the whole run : 29, of which broke : 28
  breakages counted : 29, because a big deploy breaks more than once
  the interval goes 4 to 30; the batches do not rise monotonically,
  because a deploy only happens on a day divisible by the current interval,
  so lengthening it sometimes lands on a shorter gap first
```

```
the interval each run ends on, which a change waits half of on average
  cautious : 30 days
  forward  : 1 days
  the cautious rule ends 29 days slower per deploy as well as more broken
```

```
if each deploy carried a fixed risk regardless of size
  deploys under the cautious rule : about 2
  deploys under the forward rule  : about 60
  the cautious rule would win, with 58 fewer exposures
  which risk model holds is a fact about the change, not about the policy
```

```
control - a frozen codebase, no changes arriving
  failures : 0, interval at the end : 4
  waiting costs nothing here, because the batch does not grow while you wait
```

Reviewing harder after a failure finds more in each change, and the wait it buys is stored as batch size. The size is what the next failure is drawn from, so the response is upstream of the thing it responds to.

Verify it yourself:

```bash
pnpm eml run examples/every-rollback-made-the-next-deploy-bigger/every_rollback_made_the_next_deploy_bigger.eml
```
