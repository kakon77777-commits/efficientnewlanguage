# The health check hid the shortfall from the autoscaler

`the_health_check_hid_the_shortfall_from_the_autoscaler.eml` - A health check removes unhealthy instances and an autoscaler adds capacity when the fleet is loaded. What each measures is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both are correct. The health check exists because a half-dead instance serving errors is worse than one fewer instance, and removing it from the load balancer is the standard and right response. The autoscaler exists because manual capacity planning missed two growth curves, and it scales on average CPU across the fleet, which is the usual and reasonable input.

The autoscaler averages over the instances in service. The health check's job is to take instances out of service. So an instance failing under load leaves the pool, and leaves the average with it - and the surviving instances, now carrying its share, look no worse than before because the arithmetic dropped the evidence at the same moment it dropped the instance.

Instances are listed with their state and load.

```
instance   healthy   cpu   rps carried
  i-1        yes       71    340
  i-2        yes       74    350
  i-3        yes       69    330
  i-4        no       99    0
  i-5        no       99    0
  i-6        yes       73    345
  i-7        no       99    0
  i-8        yes       70    335
```

```
instances            : 8
in service           : 5
removed by the check : 3
```

```
average cpu, two ways
  over instances in service : 71%
  over every instance       : 81%
scale-up threshold        : 80%
```

```
the autoscaler does not scale, because 71 is below 80
over the whole fleet the same rule would scale, because 81 is not
```

```
load per instance
  spread across the 5 in service : 340 rps each
  spread across all 8            : 212 rps each
  the check moved 128 rps onto every surviving instance
  and the autoscaler's input fell at the same moment, because the
  instances carrying nothing are the ones it stopped averaging over
```

```
what happens as more instances fail
  0 removed : 8 in service, 212 rps each, autoscaler sees the average of the healthy
  1 removed : 7 in service, 242 rps each, autoscaler sees the average of the healthy
  2 removed : 6 in service, 283 rps each, autoscaler sees the average of the healthy
  3 removed : 5 in service, 340 rps each, autoscaler sees the average of the healthy
  4 removed : 4 in service, 425 rps each, autoscaler sees the average of the healthy
  each removal raises the load on the rest and removes a 99% reading from
  the average, so the input can fall while the situation worsens
```

```
the three removed instances
  i-4 : cpu 99%, carrying 0 rps
  i-5 : cpu 99%, carrying 0 rps
  i-7 : cpu 99%, carrying 0 rps
  they are at 99% cpu and serving nothing, which is what a saturated
  instance looks like after it stops answering
  the check is right to remove them and their cpu reading is the clearest
  evidence the fleet is short of capacity
```

```
inputs available at the moment of the decision
  average cpu over in-service instances : used
  count of instances removed as unhealthy : recorded, not used
  requests per second per in-service instance : recorded, not used
  desired vs actual in-service count : recorded, not used
  three quantities that rise when the fleet is short, and the rule reads
  the one that falls
```

```
control - i-9 removed because of bad deploy, wrong image
  its cpu : 4%
  including it would pull the average DOWN, not up
  here the check removes a reading that is genuinely uninformative about
  capacity, and the autoscaler is better off without it
  what distinguishes this from the other three is the direction the
  removed reading would have moved the average
```

Removing a half-dead instance from the load balancer is correct, and CPU average is a reasonable autoscaling input. The check removes the instances whose readings say scale up, so the fleet is 3 short and reads 71%.

Verify it yourself:

```bash
pnpm eml run examples/the-health-check-hid-the-shortfall-from-the-autoscaler/the_health_check_hid_the_shortfall_from_the_autoscaler.eml
```
