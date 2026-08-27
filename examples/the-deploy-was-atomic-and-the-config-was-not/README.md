# The deploy was atomic and the config was not

`the_deploy_was_atomic_and_the_config_was_not.eml` - Code is deployed blue-green, so every instance switches at once. Configuration is polled every 60 seconds. What runs during those 60 seconds is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both mechanisms are right and each was chosen against the failure the other does not have. Blue-green exists precisely so the fleet is never serving two versions at once: a half-deployed fleet is the thing that makes an incident unreproducible, and switching all 48 instances together removes it. Configuration is polled rather than pushed because a push to 48 instances is a fan-out that can partially fail, and a partial push leaves some instances permanently stale with nothing to correct them. A poll is self-healing: an instance that misses one poll gets the next.

Atomic and eventually-consistent are both correct properties. They are different properties, and the code and the config are two halves of one behaviour.

Every deploy opens a window in which new code reads old configuration. The window is not a failure of either mechanism; it is the difference between their convergence times.

```
instances                : 48
code deploy              : blue-green, all instances at once
config propagation       : poll every 60 seconds
request rate             : 800 per second
```

```
convergence time
  code   : 0 seconds, by construction
  config : 30 seconds on average, 60 seconds worst case
  window in which they disagree : up to 60 seconds per deploy
```

```
  requests served in that window, per deploy : 48000
  deploys per month                          : 12
  requests served with mismatched halves     : 576000 per month
```

```
during the window, every instance is in the same state
  code version   : new, on all 48
  config version : old, on all 48 until each one polls
  instances disagreeing with each other : 0
  instances disagreeing with themselves : 48
```

```
  blue-green delivered exactly what it promised: no two instances differ
  the difference is inside each one
```

```
seconds after the deploy   instances on new config   fleet split
  0                         0                        no, all old
  15                        12                       YES
  30                        24                       YES
  45                        36                       YES
  60                        48                       no, all new
```

```
  the fleet is split for 60 seconds, in the half of the behaviour that
  blue-green does not cover
```

```
control - does either mechanism fail to converge
  code    : all 48 instances on the new version, immediately
  config  : all 48 instances on the new value within 60 seconds
  mechanisms that fail to converge : 0 of 2
  and after 60 seconds the fleet is fully consistent again
```

```
  the inconsistency is not in either end state
  it is in the interval, and neither mechanism has an interval in its spec
```

```
null control - a deploy that changes no configuration
  config values changed          : 0
  window length                  : 60 seconds, unchanged
  requests served in the window  : 48000
  requests that see a mismatch   : 0
  same deploy mechanism, same poll, same window
  the window is always open and it only costs something when both halves
  of one behaviour change together
```

```
three ways to close the window
  poll faster        : window falls to the new interval, never to zero
  push config first, wait one interval, then deploy code
                     : window closes, at the cost of an ordering rule
                       somebody has to remember
  ship the config value INSIDE the artifact
                     : window closes, because there is only one thing
                       to switch and it switches atomically
```

```
two mechanisms, each correct, that change one behaviour
  is each one atomic or convergent   yes, that is what was reviewed
  do they converge at the same rate  this is the question
  and a difference in rate is a window, not a failure
  so it appears in no error budget and on no dashboard
```

```
a behaviour split across two delivery mechanisms is only as atomic as the
slower one, and blue-green makes the faster one instantaneous, which widens
the gap rather than closing it
```

Blue-green exists so the fleet never serves two versions at once, and polling exists so a partial push cannot leave an instance permanently stale. Both are the right answer to the failure they were chosen for. Together they give every deploy a 60-second window in which all 48 instances run new code against old configuration - 48000 requests each time, 576000 a month, and a fleet that is split for exactly as long as the poll interval.

Verify it yourself:

```bash
pnpm eml run examples/the-deploy-was-atomic-and-the-config-was-not/the_deploy_was_atomic_and_the_config_was_not.eml
```
