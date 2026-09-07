# The breaker was per instance and the dependency was shared

`the_breaker_was_per_instance_and_the_dependency_was_shared.eml` - The circuit breaker is per dependency, trips on consecutive failures, probes with a single half-open call, and it demonstrably shed load during a real outage. Where it lives is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The breaker is properly implemented. It is per dependency rather than global, so one sick backend does not open the path to a healthy one; it trips on consecutive failures rather than a rate, so a single blip does not open it; recovery is a single half-open probe rather than a flood; and during the March outage it cut the error path from a full timeout to an immediate rejection, which is what kept the front end responsive.

The breaker is an object in a process. Two hundred forty processes hold two hundred forty of them, and the dependency they protect is one.

Nothing is shared between them.

```
instances                       : 240
dependencies being protected    : 1
breakers protecting it          : 240
breaker state shared            : 0
```

```
consecutive failures to trip one: 20
failed calls before the fleet is open : 4800
```

```
half-open probes per instance   : 1
probe interval, seconds         : 30
probes per interval, fleet-wide : 240
probes per minute against a dead dependency : 480
```

```
the circuit breaker
  scope of one breaker : per dependency, not global
  trips on : consecutive failures, not a rate, so a blip
    does not open it
  recovery : a single half-open probe, not a flood
  measured in the March outage : the error path went from
    a full timeout to an immediate rejection
  verdict : PROTECTS THE CALLER
```

```
  per dependency rather than global is the design decision
  that makes a breaker useful instead of dangerous
```

```
the two things a breaker can do
  stop this process waiting on a dead dependency : yes,
    completely, and that is what it is for
  stop the dependency being called while it is dead : that
    is a property of the fleet, not of a process
  processes holding one : 240
  state shared between them : 0
  so each one learns the outage : independently
```

```
  the guarantee is local and correct, and the quantity the
  dependency experiences is a sum over all of them
```

```
from the dependency's side
  calls it must fail to open one breaker : 20
  calls it must fail to open all of them : 4800
  probes it receives per minute while dead : 480
  what those probes are : correct, minimal, one per
    instance per interval
  what they are in aggregate : steady traffic to
    something that is trying to restart
```

```
the moment it comes back
  probes in flight when it first answers : 240
  each of them succeeding : yes
  what each instance does then : closes its breaker and
    resumes full traffic
  how many do that : all of them, at once
  what the policy was designed to prevent : exactly this
  is the policy wrong : no; it is per instance
```

```
why March looked like a success
  front end responsive : yes, measured
  error path latency   : cut, measured
  the metric watched   : this service's own latency
  the dependency's inbound rate during its outage : not on
    that graph, and it is on the dependency's
  who read both together : nobody
```

```
null control - one breaker for the fleet
  scope per dependency : unchanged
  breakers protecting it : 1
  failed calls before the fleet is open : 20
  probes per interval : 1
  the policy did not change; the object holding it stopped
  being one per process
```

```
what a per-instance breaker guarantees
  this process stops waiting on a dead dependency :
    exactly, and it is what kept the front end up
  the dead dependency stops being called : not addressed;
    that is a claim about 240 processes and the breaker
    is a claim about one
```

```
a protection installed per instance is multiplied by the
instance count wherever it touches something shared; the
gentlest per-process policy is still a fleet-sized policy
when the thing it is gentle towards is singular
```

The breaker is per dependency rather than global, trips on 20 consecutive failures rather than a rate, recovers with 1 half-open probe, and in March it cut the error path from a full timeout to an immediate rejection. It is an object in a process and there are 240 of them with 0 shared state, so the dependency must fail 4800 calls to be shut out and receives 480 probes a minute while it is down.

Verify it yourself:

```bash
pnpm eml run examples/the-breaker-was-per-instance-and-the-dependency-was-shared/the_breaker_was_per_instance_and_the_dependency_was_shared.eml
```
