# The holdout was not held out - 50% of the effect recovered, and still the right shape

`the_holdout_was_not_held_out.eml` counts which control requests share a cache key with treated traffic, then measures the effect with and without that leak.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the exclusion is real and correctly implemented - control requests never enter the new code path, and an audit of the routing would find nothing wrong. The leak is one layer down, in a component neither group is assigned to, which both groups read and only one writes.

```
requests : 16, control : 8
  control requests whose key a treated request already warmed : 4
  contamination : 50%
```

```
if the cache were per-group, as everyone assumes
  treated : 120.0
  control : 100.0
  measured effect : 20.0
  true effect     : 20.0
```

```
with the shared cache that is actually there
  treated : 120.0
  control : 110.0
  measured effect : 10.0
  true effect     : 20.0
```

```
  the measurement recovers : 50% of the effect
  and it is still positive, still stable, and still the right shape
```

```
the control group's own view
  control mean, no leak : 100.0
  control mean, leaking : 110.0
  the control group improved, which reads as 'the world got better'
```

```
control requests, one by one
  r9 key k1 : WARMED by treated traffic -> got the benefit
  r10 key k6 : cold -> did not
  r11 key k2 : WARMED by treated traffic -> got the benefit
  r12 key k7 : cold -> did not
  r13 key k3 : WARMED by treated traffic -> got the benefit
  r14 key k8 : cold -> did not
  r15 key k4 : WARMED by treated traffic -> got the benefit
  r16 key k9 : cold -> did not
```

```
control - only the control requests with keys of their own
  such requests : 4
  their mean    : 100.0
  effect against treated : 20.0
  the full effect, recovered by excluding what was never excluded
```

A holdout is a claim that two groups differ in exactly one way. The claim is about every layer, and it was checked at the layer where the split was made.

The effect is not destroyed, which is what makes this hard to notice - it is attenuated, and the measured number stays positive, stable and the right shape at every level of contamination.

Verify it yourself:

```bash
pnpm eml run examples/the-holdout-was-not-held-out/the_holdout_was_not_held_out.eml
```
