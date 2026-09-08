# The probe ran inside the container and the sidecar was the dependency

`the_probe_ran_inside_the_container_and_the_sidecar_was_the_dependency.eml` - The liveness probe executes inside the container, exercises a real code path rather than a static handler, and has restarted forty-one genuinely wedged processes. What it can observe is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The probe is the good kind. It is not a handler that returns 200 unless the process is dead, which restarts nothing that was ever going to fail; it runs a small real query through the same connection pool the request path uses, so a wedged pool is visible; it has a timeout of its own; and it has restarted forty-one processes that were genuinely stuck, each confirmed from the logs.

The probe runs INSIDE the application container. Every outbound call the application makes goes through a sidecar proxy in the same pod, and the probe reaches its database through the sidecar too.

When the sidecar is the thing that is wedged, the probe fails with it.

```
processes restarted while wedged: 41
containers in the pod           : 2
  the probe runs inside         : 1
  it does not observe           : 1
  share observed                : 5000 per ten thousand
probes running outside the app container : 0
probes targeting the sidecar directly    : 0
```

```
sidecar wedges last year        : 9
  where the probe also failed   : 9
  the probe distinguished       : 0
  reported as an app failure    : 9
```

```
the liveness probe
  what it is not : a handler returning 200 unless the
    process is dead
  what it runs   : a small real query, through the same
    connection pool the request path uses
  so a wedged pool is : visible
  does it have its own timeout : yes
  processes it restarted while genuinely stuck : 
    41, each confirmed from the logs
  verdict : EXERCISES A REAL PATH
```

```
  sharing the request path's pool rather than answering
  from a static handler is what makes this probe useful
```

```
the probe's own path
  where it executes : the application container
  how its query leaves the pod : through the sidecar
  which the application also uses : the same one
  so a wedged sidecar affects : both
  containers the probe can report on : 1 of 2
  probes targeting the sidecar : 0
```

```
  the probe is inside the failure domain it reports on,
  which is why it can see a wedged pool and cannot say
  which of two containers is wedged
```

```
the remediation
  what a failed probe restarts : the application
    container
  what was wedged in those 9 cases : the sidecar
  does the restart clear it : no
  what the new process does : fails its first probe, for
    the same reason
  what that produces : a restart loop attributed to the
    application
  cases the probe distinguished : 0
```

```
the evidence a responder sees
  probe failures : yes, on the application container
  restarts       : yes, of the application container
  sidecar metrics: exported, on a different dashboard
  a signal that separates them : 0
  so the first hypothesis is : the application
  wedges recorded that way : 9 of 9
```

```
null control - a probe that is not inside the failure
  processes restarted while wedged : 41, unchanged
  probes outside the application container : 
    1
  probes targeting the sidecar : 1
  sidecar wedges distinguished : 9
  the probe did not get better; a second observer appeared
  that does not share the failure
```

```
what a real-path liveness probe guarantees
  this process can still do work : exactly, through the
    same pool the request path uses
  this process is the one that is broken : not addressed;
    the probe travels the application's path and reports
    a failure anywhere along it as the application's
```

```
a probe that shares a dependency with the thing it tests
cannot attribute; making it exercise a real path is what
gives it power and is exactly what puts it inside the
failure domain, and the remediation is aimed by the label
```

The probe runs a real query through the request path's own pool rather than answering from a static handler, and it has restarted 41 genuinely wedged processes. It executes in 1 of 2 containers and leaves through the sidecar, so all 9 sidecar wedges last year failed the probe too - 0 were distinguished, and 9 were recorded as application failures.

Verify it yourself:

```bash
pnpm eml run examples/the-probe-ran-inside-the-container-and-the-sidecar-was-the-dependency/the_probe_ran_inside_the_container_and_the_sidecar_was_the_dependency.eml
```
