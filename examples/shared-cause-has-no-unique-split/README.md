# Shared cause has no unique split — every factor was necessary, none was sufficient, and the form has one box

`shared_cause_has_no_unique_split.eml` runs a necessity test on every factor of
three incidents — remove it, does the outcome still happen — then applies five
allocation rules and reports how often they disagree.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: an incident needed a config change AND a latent bug AND
a traffic spike. Take any one away and nothing happens. That is a conjunction,
and a conjunction has no distinguished member.

| incident | factors | each necessary | outcome without any one |
| --- | --- | --- | --- |
| 1 | 3 | 3 | fires in 0 of 3 removals |
| 2 | 2 | 2 | fires in 0 of 2 removals |
| 3 | 3 | 3 | fires in 0 of 3 removals |

Who each rule blames:

| incident | most-recent | earliest | the-thing-that-changed | has-an-owner |
| --- | --- | --- | --- | --- |
| 1 | traffic-spike | unbounded-queue | retry-storm | retry-storm |
| 2 | timeout-lowered | slow-dependency | timeout-lowered | timeout-lowered |
| 3 | deploy-window | cold-start-cost | cache-warmup-removed | cache-warmup-removed |

The rules disagree on **3 of 3** incidents. Every rule names a factor that is
genuinely necessary — none of them is blaming something irrelevant.

```
incident 1: retry-storm           named by 3/5 rules, owned by platform
incident 1: unbounded-queue       named by 1/5 rules, unowned
incident 1: traffic-spike         named by 1/5 rules, unowned
incident 2: timeout-lowered       named by 3/5 rules, owned by api
incident 2: slow-dependency       named by 2/5 rules, owned by search
incident 3: cache-warmup-removed  named by 3/5 rules, owned by web
incident 3: cold-start-cost       named by 1/5 rules, unowned
incident 3: deploy-window         named by 1/5 rules, owned by release
```

**A wrong question, kept in the file.** That section first asked which
necessary factors *no* rule ever names, and measured **zero** — five rules over
two or three factors name all of them between them. But an organisation does
not run five rules; it runs one, whichever its form implies. The quantity that
matters is how many of the five *would* name a factor, because a factor named
by one rule out of five is invisible under the other four.

Measured that way: **4 factors are reachable by exactly one rule, and 3 of those
are unowned**. A factor with a team attached gets named by `has-an-owner`
whatever else is true. The ones that fall through every rule are the ones nobody
is responsible for — which is also why they were still there.

Verify it yourself:

```bash
pnpm eml run examples/shared-cause-has-no-unique-split/shared_cause_has_no_unique_split.eml
```
