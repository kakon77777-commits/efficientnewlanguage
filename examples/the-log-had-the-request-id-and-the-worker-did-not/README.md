# The log had the request id and the worker did not

`the_log_had_the_request_id_and_the_worker_did_not.eml` - Every log line in the request path carries a correlation id and tracing across four services works. What share of the work is traceable is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The correlation is properly built. The id is generated at the edge, propagated in a header, put into a context that every logger reads without being asked, and it survives four service hops. Pasting one id into the log search returns the whole request, in order, across all four. It was a real piece of work and it pays for itself weekly.

It propagates along the CALL. The asynchronous half is not a call: the handler enqueues a job with the payload it needs, and the enqueue was written against a job schema that has fields for the work and none for the context.

Sixty-one percent of the processing time is in that worker.

```
requests per day               : 4200000
services the id survives       : 4
```

```
log lines per request, service : 7
log lines per request, worker  : 11
share with no correlation id   : 6111 per ten thousand
untraceable lines per day      : 46200000
worker share of processing time: 6100 per ten thousand
```

```
the request path
  id generated at    : the edge
  propagated in      : a header
  read by every logger : yes, from context, without being
    asked
  services it survives : 4
  one id pasted into search returns : the whole request,
    in order, across all four
  verdict            : CORRELATED
```

```
  this pays for itself weekly and nobody should undo it
```

```
the enqueue
  what the job carries : the payload the work needs
  fields for context   : none in the job schema
  a header to propagate: there is no request to put one on
  the worker's logger  : reads a context that is empty
    because this process did not handle a request
```

```
  nothing was dropped; the mechanism is a call-scoped one
  and this is not a call
```

```
investigating a worker failure
  the worker's own lines    : present, complete, timestamped
  which request caused it   : not recorded
  matching on the payload   : possible, unindexed, and not
    unique
  the service's lines for that request : present, and not
    linkable to these
```

```
null control - the id carried in the job
  services the id survives : 4, unchanged
  traceable lines per request : 18
  untraceable lines per day   : 0
  the propagation did not improve; the job schema gained
  a field for the thing that was already being propagated
  everywhere else
```

```
what request correlation guarantees
  everything on the call path shares an id : exactly
  everything caused by the request does    : not addressed;
    the mechanism is scoped to a call, and the work that
    was moved off the call to make it fast is precisely
    what leaves that scope
```

```
context propagation follows the shape of the control flow;
the moment work becomes asynchronous it needs the context as
data, and a job schema written for the work has no field
for it
```

Correlation works across all 4 services and one id returns the whole request in order, which is real and earns its keep. The worker is reached by an enqueue rather than a call, so its 11 lines a request carry no id - 6111 per ten thousand of the lines and 46200000 a day - covering the 6100 per ten thousand of processing time where the failures being investigated actually happen.

Verify it yourself:

```bash
pnpm eml run examples/the-log-had-the-request-id-and-the-worker-did-not/the_log_had_the_request_id_and_the_worker_did_not.eml
```
