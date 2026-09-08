# Each region had headroom and the failover chose one

`each_region_had_headroom_and_the_failover_chose_one.eml` - Every region runs at sixty percent and the capacity plan requires forty percent headroom in each, checked weekly. What a failover asks for is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The headroom rule is real capacity planning. It is not a number somebody remembered; it is checked weekly against measured peak rather than average, it is enforced by refusing to schedule new load into a region above the line, it has forced two capacity purchases, and every one of the four regions is inside it today.

The rule is per REGION. A regional failover moves one region's traffic onto the others, and the headroom that receives it is the headroom of the regions that are left, not of the fleet.

The routing policy sends a failed region's traffic to its nearest neighbour.

```
regions                         : 4
utilisation per region, percent : 60
required headroom, percent      : 40
actual headroom, percent        : 40
regions inside the rule         : 4
capacity purchases it forced    : 2
```

```
regions a failover sends traffic to : 1
  regions not receiving it      : 3
  percent arriving there        : 60
  its utilisation after         : 120
  over capacity by, percent     : 20
checks on the post-failover figure : 0
```

```
the headroom rule
  measured against : peak, not average
  checked          : weekly
  enforced by      : refusing to schedule new load into a
    region above the line
  capacity purchases it forced : 2
  regions inside it today : 4 of 4
  verdict : HEADROOM EXISTS
```

```
  measuring peak rather than average, and refusing new
  load rather than warning, is what makes this a rule
```

```
the unit of the guarantee
  what has 40 percent spare : each region
  what a failover needs spare : the regions that remain
  how many receive the traffic : 1, by routing policy
  what arrives there : 60 percent of a region
  what it holds : 40 percent
  the difference : 20 percent
```

```
  the headroom is real in every region and the arithmetic
  that consumes it adds across regions
```

```
the fleet arithmetic
  regions : 4
  spare per region, percent : 40
  traffic needing a home : 60 percent of one region
  is there enough spare in total : comfortably
  is any of it where the traffic goes : 1 region's worth
  what routes traffic : a policy, not a total
```

```
the weekly check
  what it computes : utilisation and headroom, per region
  is every figure correct : yes
  does it model the loss of a region : 0 times
  what such a model needs : the routing policy, which is
    in a different system
  so the two facts live : apart, and neither is wrong
```

```
null control - headroom is checked after the failover
  measured against peak : unchanged
  checks on the post-failover figure : 1
  regions sharing a failed region's load : 4
  over capacity by, percent : 0
  no region gained capacity; the rule started being
  evaluated on the state it exists for
```

```
what per-region headroom guarantees
  each region can absorb its own growth : exactly,
    measured on peak and enforced by refusal
  the fleet can absorb a region's loss : not addressed;
    the rule is a predicate on one region and a failover
    is a statement about a redistribution
```

```
a per-element margin is consumed by an event that moves load
between elements, so the guarantee holds exactly where it is
stated and the quantity that matters is a sum the rule never
forms
```

The rule is real capacity planning: measured on peak, checked weekly, enforced by refusing new load, and it forced 2 purchases - all 4 regions are inside it. It is stated per region, and the routing policy sends a failed region's 60 percent to 1 neighbour holding 40 percent spare, which is 20 percent over, checked 0 times by the weekly review.

Verify it yourself:

```bash
pnpm eml run examples/each-region-had-headroom-and-the-failover-chose-one/each_region_had_headroom_and_the_failover_chose_one.eml
```
