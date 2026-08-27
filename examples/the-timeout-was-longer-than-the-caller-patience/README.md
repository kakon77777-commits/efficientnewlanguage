# The timeout was longer than the caller patience

`the_timeout_was_longer_than_the_caller_patience.eml` - The service times out a request after 30 seconds. The client library gives up after 5. What the server is doing between those two numbers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: 30 seconds was chosen carefully and for a reason that is still true. The report generator legitimately takes 20 to 25 seconds on a large account, and a shorter server timeout would kill those reports halfway through, leaving a partial file and a customer with nothing. The number came from measuring the slowest legitimate request and adding headroom, which is the correct method.

The client timeout is 5 seconds. It is the library default, it was never changed, and there is nothing wrong with it either - 5 seconds is a reasonable thing to wait for an API call.

Neither number is wrong on its own. What nobody owns is the relationship between them: for 25 seconds the server holds a connection, a worker and a database transaction for a request whose caller has already gone.

```
request rate       : 100 per second
slow requests      : 8 percent = 8 per second
server timeout     : 30 seconds
client timeout     : 5 seconds
connection pool    : 256
```

```
each slow request keeps working for 25 seconds after its caller gave up
```

```
  slow requests entering per second        : 8
  seconds each spends unowned              : 25
  unowned requests in flight at any moment : 200
```

```
  connections held by unowned work : 200 of 256
  that is 78 percent of the pool
```

```
  connections available to callers still waiting : 56
  requests per second those can serve at 5s each : 11
  offered load                                   : 100
```

```
what a client does at 5 seconds
  it gives up and retries
  the original request keeps running for another 25 seconds
  the retry is a NEW request that also needs a connection
```

```
attempt   unowned seconds added   cumulative unowned per slow request
  1         25                      25
  2         25                      50
  3         25                      75
  4         25                      100
```

```
  three attempts by one caller occupy 100 connection-seconds
  and the caller has been gone for 75 of them
```

```
three options
  raise the client timeout to 30s
    unowned seconds per slow request : 0
    cost : a caller may wait 30s, which the 30s was chosen for
  lower the server timeout to 5s
    unowned seconds per slow request : 0
    cost : every legitimate 25-second report is killed
  cancel server work when the connection closes
    unowned seconds per slow request : 0
    cost : none on either axis; the server stops when nobody is listening
```

```
control - is either number wrong on its own
  slowest legitimate request     : 25 seconds
  server timeout                 : 30 seconds, which is above it
  is the server timeout too long : no, it is measured plus headroom
  is the client timeout too short: no, 5 seconds is a reasonable API wait
  both reviews pass, and the defect is in neither number
```

```
  it is in the difference, and a difference has no owner
```

```
null control - the same timeouts when nothing is slow
  slow requests per second      : 0
  unowned requests in flight    : 0
  pool used by unowned work     : 0 of 256
  same 30 and same 5, and the gap costs nothing
  the gap is only entered by requests that outlive the client timeout,
  which is 8 percent of them here and 0 percent in a healthy hour
```

```
a timeout pair, read as a pair
  client shorter than server   the server works for nobody in the gap
  client longer than server    the caller waits for an answer already killed
  equal                        neither, and no headroom for the network
  the only stable arrangement is one where the server notices the caller left
  every review that reads one number at a time approves all three
```

The 30 seconds came from measuring the slowest legitimate request and adding headroom, and the 5 is a sensible default nobody should have to justify. Between them sits a 25-second window in which the server holds a connection, a worker and a transaction for a caller who has gone: 200 of the 256 pool, 78 percent, spent on work whose result nobody will read.

Verify it yourself:

```bash
pnpm eml run examples/the-timeout-was-longer-than-the-caller-patience/the_timeout_was_longer_than_the_caller_patience.eml
```
