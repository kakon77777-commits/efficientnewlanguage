# The threshold was set after seeing the result - excludes 3 of 10 where a fixed bar excluded 6

`the_threshold_was_set_after_seeing_the_result.eml` enumerates every bar anyone in the room could have defended and asks what the rule can still exclude once the choice is made afterwards.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: nobody lied and nobody moved a number. The team genuinely did not fix a threshold in advance, because fixing one in advance is hard - the right bar depends on the cost of shipping, the cost of not shipping, and what else wants the slot, and none of those were known in week one.

```
bars anyone could have defended : 
  0.5  1.0  1.5  2.0  2.5  3.0  4.0  5.0  
```

```
if the bar had been fixed at 2.0 beforehand
  results that would ship : 4 of 10
  results that would not  : 6
```

```
if the bar is chosen afterwards, from that same list
  results that would ship : 7 of 10
```

```
  a fixed bar excludes  : 6 of 10
  a chosen bar excludes : 3 of 10
  the rule survived, and the set it can rule out shrank by 3
```

```
the only results a chosen bar can reject
  -2.0  - below the lowest bar anyone would defend
  -0.5  - below the lowest bar anyone would defend
  0.3  - below the lowest bar anyone would defend
  count : 3
  so the rule is not vacuous - it still stops the clearly bad ones
```

```
control - every fixed bar, applied to the same results
  bar 0.5 : ships 7 of 10
  bar 1.0 : ships 6 of 10
  bar 1.5 : ships 5 of 10
  bar 2.0 : ships 4 of 10
  bar 2.5 : ships 3 of 10
  bar 3.0 : ships 3 of 10
  bar 4.0 : ships 2 of 10
  bar 5.0 : ships 1 of 10
```

A threshold picked after the result is still a threshold, still defensible, and still able to reject something. What it can no longer do is reject the result it was picked for.

The **control** is the point: every fixed bar in that list is a real rule that can fail, and each one ships a different number of results. The chosen-afterwards version is the union of all of them.

Verify it yourself:

```bash
pnpm eml run examples/the-threshold-was-set-after-seeing-the-result/the_threshold_was_set_after_seeing_the_result.eml
```
