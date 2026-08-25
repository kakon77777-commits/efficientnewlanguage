# The latency was measured at the wrong end

`the_latency_was_measured_at_the_wrong_end.eml` - Three endpoints were changed to stream their results instead of building the whole response first. The latency dashboard recorded the best week it had ever seen. What the clients saw is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Streaming was the right change and it did what it was supposed to do. A report that takes two seconds to assemble should not make the caller wait two seconds staring at nothing, memory no longer holds the whole body, and the first rows arrive while the rest are still being computed. Every argument for it is sound and every one of them is still true at the end of this file.

The latency metric is recorded when the response begins, which is where a handler naturally has something to record: the moment it hands the first bytes to the socket. For an endpoint that writes its whole body at once, that instant is also the end, so the metric has been exactly right for years, on every endpoint, which is why nobody thought about which end it measured.

Streaming is the change that moves those two instants apart. It improves the quantity being recorded and it is free to make the other one worse, and the other one is the one the caller is waiting for.

```
requests per minute across the fleet : 2925
client timeout                       : 1200 ms
```

```
endpoint         streams   first byte           complete
                           before   after       before   after
  report/summary   yes       800      40          800      1400
  report/detail    yes       1250     55          1250     2100
  export/csv       yes       2900     30          2900     3400
  account/get      no        60       60          60       60
  account/list     no        110      110         110      110
  search           no        180      180         180      180
  cart/add         no        45       45          45       45
  health           no        5        5           5        5
```

```
the number on the dashboard, weighted by traffic
  first byte, before : 143 ms
  first byte, after  : 81 ms
  reported change    : 43 percent
```

```
the number the caller waits for
  complete, before : 143 ms
  complete, after  : 182 ms
  actual change    : 27 percent worse
```

```
requests that exceed the client timeout
  before : 55 per minute
  after  : 175 per minute
  change : 120 more per minute
  these are recorded by the client as failures and by the server as
  successes, because the server did respond, promptly
```

```
control - the endpoints that do not stream
  endpoints          : 5
  total gap between first byte and completion : 0 ms
  on these the metric is not approximately right, it is the same number
  which is why it was never questioned, and it is still true today
```

```
control - the same three endpoints before they streamed
  gap between first byte and completion, before : 0 ms
  so the gap is not a property of these endpoints either
  it is a property of streaming, and it opened on the day of the change
```

```
why completion got worse and not just later
  before : one query, one serialisation, one write
  after  : one query per page, one write per page, and the client parses
           each page before the next arrives
  the work did not move, it was divided, and division has a per-piece cost
  report/summary : 800 ms to 1400 ms complete, 40 ms to first byte
```

Streaming was right: the first rows now arrive in 40 ms instead of 800. The metric records the instant the response begins, which was the same instant as the end on every endpoint until three of them streamed: the dashboard improved 43 percent while timeouts went from 55 to 175 per minute.

Verify it yourself:

```bash
pnpm eml run examples/the-latency-was-measured-at-the-wrong-end/the_latency_was_measured_at_the_wrong_end.eml
```
