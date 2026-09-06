# The span was traced and the async boundary lost the context

`the_span_was_traced_and_the_async_boundary_lost_the_context.eml` - Every service is instrumented, trace context crosses every HTTP hop, errors are sampled at a hundred percent, and the traces have found real latency problems. What a trace covers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The tracing is properly deployed, which is rarer than having it at all. All forty-one services emit spans rather than the six that were easy; the context is propagated on every outbound HTTP call instead of each service starting its own; sampling is head-based at a low rate but forced to a hundred percent for anything that errors, so the interesting traces are complete; and the team has used it to find and fix real tail-latency problems.

The context lives in a task-local and is carried by the HTTP client. Work handed to a background executor gets a fresh task, so its spans have no parent, and a span with no parent starts a new trace.

Every request hands off twice.

```
services                        : 41
  emitting spans                : 41
  not instrumented              : 0
HTTP hops dropping context      : 0
```

```
spans per day                   : 84000000
root spans per day              : 6400000
  covering a whole request      : 3500000
  orphaned handoffs             : 2900000
  share                         : 4531 per ten thousand
```

```
handoffs per request that do not propagate : 2
metrics on whole-request coverage : 0
```

```
the instrumentation
  services emitting spans : 41 of 41
  context propagated on outbound HTTP : every call
  hops that drop it : 0
  sampling : head-based, forced to 100 percent on errors
  used to find real latency problems : yes
  verdict : PROPAGATED
```

```
  instrumenting all 41 rather than the easy ones is the
  work most teams stop short of
```

```
the context
  lives in : a task-local
  crosses an HTTP call : yes, the client injects it
  crosses a submit to a background executor : no; the
    executor task is a new task with a new local
  what the spans in that work do : start without a parent
  what a span without a parent is : the root of a trace
```

```
  the propagation is complete over the boundary it was
  written for, and a process has more than one boundary
```

```
one orphaned trace
  has a root span : yes
  has children and timings : yes
  is it malformed : no; it is a valid trace
  what it is missing : a parent that exists in another
    trace, which nothing records
  how it reads in the UI : a fast request
  how the request it came from reads : a fast request
    that ends at the handoff
```

```
the counts
  root spans a day : 6400000
  of those, whole requests : 3500000
  of those, orphaned handoffs : 2900000
  handoffs per request : 2
  so the count is inflated by : the exact thing that
    breaks the traces
  metrics that would separate them : 0
```

```
an error in the background work
  sampled at 100 percent : yes, as designed
  the trace kept : the orphan
  the trace of the request that caused it : sampled at
    the head rate, like any other
  are the two linked : no; that is what the parent was
  so the guarantee delivers : a complete trace of the
    failing fragment
```

```
null control - the executor carries the context across
  services emitting spans : 41, unchanged
  orphaned handoffs : 0
  root spans a day : 3500000, down from 6400000
  the tracing did not get worse; the count fell because
  it stopped counting halves of requests as requests
```

```
what propagated trace context guarantees
  a request keeps its trace across a service boundary :
    exactly, over 41 services and 0 dropped hops
  a trace covers a request : not addressed; the context
    is carried by the thing that crosses the boundary the
    instrumentation knows about
```

```
context propagation is implemented once per kind of
boundary, so it is complete for the kinds someone
enumerated; a break produces a valid trace rather than an
error, and valid traces are what the coverage metric counts
```

All 41 services emit spans, context crosses every HTTP hop with 0 drops, and errors are sampled at 100 percent so the traces that matter are complete. The context lives in a task-local that a background executor does not inherit, and each request hands off 2 times, so 2900000 of 6400000 root spans a day - 4531 per ten thousand - are valid traces of half a request, counted as traces.

Verify it yourself:

```bash
pnpm eml run examples/the-span-was-traced-and-the-async-boundary-lost-the-context/the_span_was_traced_and_the_async_boundary_lost_the_context.eml
```
