# The quiet hours are somebody elses peak

`the_quiet_hours_are_somebody_elses_peak.eml` - Deploys go out at two in the morning, when traffic is lowest. Whose traffic is lowest is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Deploying at the trough is right and the reasoning is sound: fewer users are exposed to a bad release, the rollback window is quieter, and the on-call engineer is not also handling peak load. Every part of that holds.

The trough is a property of the aggregate, and the aggregate is a sum over regions whose days do not line up. A single global minimum can sit inside another region's working morning, and the people there are not fewer - they are simply outnumbered in the total.

Traffic is broken out by region across the day.

```
regions : 4
total traffic at the deploy hour : 670
```

```
region         share   at 02:00   own peak   at deploy as share of own peak
  team region   55%     20        900        2%
  region B   25%     300        420        71%
  region C   14%     260        300        86%
  region D   6%     90        110        81%
```

```
regions genuinely at a trough (under 20% of own peak) : 1 of 4
regions at 60% of their own peak or above             : 3
  region B is at 71% of its own peak when the deploy goes out
  region C is at 86% of its own peak when the deploy goes out
  region D is at 81% of its own peak when the deploy goes out
```

```
why the total is at its minimum
  team region is 55% of traffic and is at 2% of its peak
  the aggregate minimum is that one region's night, and it is a minimum
  because that region is the majority, not because everyone is asleep
```

```
requests during the deploy from regions other than the majority : 650
  which is 97% of the traffic in that hour
```

```
exposure to a bad release, by region
  most exposed at the deploy hour : region B, 300 requests
  the majority region, which the schedule protects, is at 20
  the schedule protects the region the schedule was chosen from
```

```
who is on call at the deploy hour
  in the team region : the middle of the night
  in the exposed regions : working hours, and they are not on this rota
  so the people best placed to see a bad release are the ones with no way
  to report it into the deploy process
```

```
deploying per region at each region's own trough
  deploys per release : 4 instead of 1
  exposure per deploy : each region at its own minimum
  total exposure : about 173 against 670 today
  lower, at the cost of 3 extra deploy windows and a version skew
  between regions that has to be designed for
```

```
control - a service with one region
  regions : 1, so the aggregate minimum and the only region's minimum are
  the same hour by construction
  the reasoning that produced the problem above is exactly right here
```

Deploying at the trough exposes fewest users and that reasoning holds. The trough is a fact about the sum, and the sum is dominated by the region the schedule was written in.

Verify it yourself:

```bash
pnpm eml run examples/the-quiet-hours-are-somebody-elses-peak/the_quiet_hours_are_somebody_elses_peak.eml
```
