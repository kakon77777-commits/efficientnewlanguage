# Not deciding had a cost and no owner - waiting overtakes being wrong at week 17

`not_deciding_had_a_cost_and_no_owner.eml` computes both costs on the same scale, week by week, so the comparison nobody makes is available to make.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: waiting for better evidence is the responsible instinct and usually right. A wrong decision has an owner, a postmortem and a number attached to it. Waiting has none of those, which is exactly why it is the safe option for the person choosing - and why its price is never compared with the price it is avoiding.

```
weekly cost of not having decided : 40
cost of a wrong decision, caught after 1 week(s) : 640
```

```
weeks waited   cost of waiting   cost of having been wrong
  4             160              640
  8             320              640
  12             480              640
  16             640              640
  20             800              640
```

```
the week at which waiting has cost more than being wrong would have : 17
```

```
attribution
  a wrong decision : has an owner, a postmortem, and a number
  waiting          : has none of those
  and after 17 weeks it is the larger number
```

```
what each week of waiting must remove from the risk to pay for itself
  4 weeks costs 160 - worth it only if it removes at least 25% of the wrong-call cost
  8 weeks costs 320 - worth it only if it removes at least 50% of the wrong-call cost
  12 weeks costs 480 - worth it only if it removes at least 75% of the wrong-call cost
  16 weeks costs 640 - worth it only if it removes at least 100% of the wrong-call cost
  20 weeks costs 800 - worth it only if it removes at least 125% of the wrong-call cost
```

```
control - a decision that costs nothing to defer
  20 weeks of waiting : 0
  cost of being wrong : 640
  here waiting is free and the wrong call is not, so wait
```

Both branches have a price. Only one of them produces a document with a name at the top, and that is a fact about the process rather than about the two numbers.

The **control** keeps this from reading as "always decide fast": where deferring is free, waiting for better evidence is straightforwardly correct. The difference is the weekly cost, not the size of the decision.

Verify it yourself:

```bash
pnpm eml run examples/not-deciding-had-a-cost-and-no-owner/not_deciding_had_a_cost_and_no_owner.eml
```
