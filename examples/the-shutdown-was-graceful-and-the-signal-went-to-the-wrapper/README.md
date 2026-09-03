# The shutdown was graceful and the signal went to the wrapper

`the_shutdown_was_graceful_and_the_signal_went_to_the_wrapper.eml` - The process handles the termination signal, drains in six seconds, and fourteen tests cover it. How many requests are killed per deploy is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The shutdown handler is well built and well tested. It stops accepting new connections, lets in-flight requests finish, closes the pool, flushes the metrics buffer and exits zero — in six seconds against a grace period of thirty. Fourteen tests send the signal and assert each step, and they pass.

The signal is sent to process one in the container. The image's entry point is a shell script that sets two variables and runs the application, so process one is the shell, and a shell waiting on a child does not pass the signal to it unless it was written to.

The application never receives the signal it handles correctly.

```
grace period, seconds        : 30
drain when the signal arrives: 6 seconds
shutdown tests               : 14
shutdown test failures       : 0
```

```
deploys per week             : 41
pods replaced per week       : 984
in-flight requests per pod   : 118
requests killed per week     : 116112
pod-seconds spent waiting for nothing : 23616
```

```
the shutdown handler
  stops accepting new connections : yes
  lets in-flight requests finish  : yes
  closes the pool                 : yes
  flushes the metrics buffer      : yes
  exits zero in                   : 6 seconds
  tests asserting each step       : 14
  failures                        : 0
  verdict                         : GRACEFUL
```

```
  the handler is correct and the tests are not decorative;
  they send the real signal and assert the real steps
```

```
where the signal is sent, in each context
  in the tests    : to the application process, directly
  in production   : to process one in the container
  process one is  : the entry-point shell script
  what a waiting shell does with it : nothing, unless it
    was written to forward
  was it          : no
```

```
  the test and production differ in one thing, and it is
  the delivery rather than the handling
```

```
the termination sequence
  signal sent          : yes
  grace period         : 30 seconds
  process exits within it : no
  what follows         : the signal that cannot be caught
  what the event log says : terminated after the grace
    period, which reads as a slow application
```

```
share of the grace period spent waiting for nothing : 8000 per ten thousand
```

```
null control - the script ends in exec, so the app is process one
  shutdown tests       : 14, unchanged, still passing
  drain, seconds       : 6
  requests killed per week : 0
  the handler did not change; the signal started arriving
  at the process that handles it
```

```
what a tested shutdown handler guarantees
  the process shuts down gracefully when signalled : exactly
  the process is signalled                          : not
    addressed, and it is the half the tests cannot cover,
    because a test delivers the signal itself
```

```
a handler test supplies its own trigger; the delivery path is
the part of the mechanism that only exists in production, and
the failure it produces is indistinguishable from slowness
```

The handler drains in 6 seconds against a 30 second grace period, and 14 tests send the real signal and assert every step with 0 failures. In production the signal goes to an entry-point shell that does not forward it, so 984 pods a week are killed after waiting 24 seconds for nothing, taking 116112 in-flight requests with them, logged as an application that shuts down slowly.

Verify it yourself:

```bash
pnpm eml run examples/the-shutdown-was-graceful-and-the-signal-went-to-the-wrapper/the_shutdown_was_graceful_and_the_signal_went_to_the_wrapper.eml
```
