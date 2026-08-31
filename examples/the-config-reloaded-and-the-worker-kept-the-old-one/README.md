# The config reloaded and the worker kept the old one

`the_config_reloaded_and_the_worker_kept_the_old_one.eml` - The reload succeeded and the log line saying so is true. When the change reaches the last worker is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The reload works. The parent re-reads the file, validates it, applies it to its own state and logs the version it moved to. It is not a stub, it is not swallowing an error, and if the file were invalid it would refuse and say so. The line "config reloaded, version 41" means the parent is on version 41.

Requests are not served by the parent. They are served by pre-forked workers holding the copy they inherited at fork, and a worker's copy changes when the worker is replaced, not when the parent reloads.

Workers recycle after a fixed number of requests. Nobody chose that number as a propagation delay, and it is the propagation delay.

```
workers                        : 48
requests before a worker recycles : 250000
requests per second, total     : 3100
per worker                     : 64
seconds for a worker to recycle: 3906
minutes for a worker to recycle: 65
```

```
the reload
  file re-read        : yes
  validated           : yes
  applied to          : the parent
  failures            : 0
  logged              : config reloaded, version 41
  verdict             : RELOADED
```

```
  the line is true of the process that wrote it
```

```
immediately after the reload
  processes on the new config : 1, the parent
  processes serving requests  : 48
  workers on the new config   : 0
  requests served with it     : 0
```

```
  the reload is complete and no request has seen it
```

```
the mitigation
  logged as applied at   : the reload
  reaches the last worker: 65 minutes later
  requests served on the old config in between : 
    12108600
  the graph recovers gradually and reads like the fix
    taking hold, which is what a staged rollout looks like
    and what this is not
```

```
incident length, minutes : 84
the mitigation was still propagating for : 7738 per ten thousand of it
```

```
null control - workers re-read on the parent's signal
  reload failures : 0, unchanged
  seconds to full propagation : 1
  requests on the old config  : 0
  the reload did not get better; the processes that serve
  requests were included in it
```

```
what a successful reload guarantees
  the process that reloaded holds the new config : exactly
  requests are served with it                    : not
    addressed, wherever the serving happens somewhere the
    reload did not reach
```

```
the recycle count is a resource-hygiene number that became a
deployment latency; nobody reviews it in that role because
nothing in the system writes it down as one
```

The reload succeeded and the log line is true: the file was re-read, validated, applied, 0 failures. The parent serves no requests, so 48 workers keep the copy they forked with until they recycle after 250000 requests - 65 minutes - and 12108600 requests are served on the old config first - still propagating for 7738 per ten thousand of the 84-minute incident, on a curve that reads like the mitigation taking hold.

Verify it yourself:

```bash
pnpm eml run examples/the-config-reloaded-and-the-worker-kept-the-old-one/the_config_reloaded_and_the_worker_kept_the_old_one.eml
```
