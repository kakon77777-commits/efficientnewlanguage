# The limit was on the upload and the cost was after decompression

`the_limit_was_on_the_upload_and_the_cost_was_after_decompression.eml` - The upload limit is enforced at the edge while the body streams, so an oversized request is refused without being buffered. What the limit is a limit on is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The enforcement is done the right way round. The limit is applied to the stream rather than after the body is read, so a large upload costs the edge a counter and not a buffer; it returns a documented status with a message that says the actual limit rather than a generic error; it is applied before authentication so an unauthenticated caller cannot spend memory; and in two years nothing has got past it.

The limit counts bytes that ARRIVE. The endpoint accepts gzip and the work is done on the decompressed content, so ten megabytes on the wire is bounded and what it expands to is not.

Nothing in the request path bounds the decompressed size.

```
upload limit, MB                : 10
bypasses in two years           : 0
limits on decompressed size     : 0
```

```
typical compression ratio       : 8
  typical decompressed, MB      : 80
achievable compression ratio    : 1000
  worst case decompressed, MB   : 10000
```

```
worker memory, MB               : 2048
  worst case as multiples of it : 4
the enforced limit bounds       : 10 per ten thousand of it
```

```
requests per day                : 240000
worker restarts from memory exhaustion : 34
```

```
the upload limit
  applied to : the stream, while it arrives
  cost of an oversized request : a counter, not a buffer
  applied before authentication : yes, so an anonymous
    caller cannot spend memory
  the error : a documented status naming the real limit
  bypasses in two years : 0
  verdict : ENFORCED
```

```
  counting the stream rather than the buffered body is the
  difference between a limit and a slower way to run out
  of memory, and this one counts the stream
```

```
the quantity bounded
  what the counter measures : bytes received
  what the handler allocates for : bytes after inflation
  what relates the two : a ratio chosen by the sender
  typical ratio : 8
  achievable ratio : 1000
  limits on the second quantity : 0
```

```
  the bounded quantity is real, is the one the network
  cares about, and is not the one the process spends
```

```
the two quantities
  bytes on the wire : bounded at 10 MB, by us
  bytes after inflation : chosen by the sender
  typical, MB       : 80
  worst case, MB    : 10000
  worker memory, MB : 2048
  worst case in units of worker memory : 4
```

```
accepting compression
  why : the payloads are text and the saving is real
  typical ratio seen : 8
  should the endpoint stop accepting it : no
  what is missing : a bound on the second quantity
  bounds that exist on it : 0
```

```
the thirty-four restarts
  attributed to : memory pressure, in the capacity
    dashboard
  attributed to a request : none; the process is gone
    before it can log which one
  what the upload limit metric shows : every request
    under 10 MB, which is true
  requests a day : 240000
  what a reader concludes : the service needs more memory
```

```
null control - the decompressor has a budget too
  bypasses of the upload limit : 0, unchanged
  limits on decompressed size : 1
  worst case without it, MB : 10000
  worker restarts from memory exhaustion : 0
  the edge limit did not change; a second bound appeared
  on the quantity that is actually spent
```

```
what a streaming upload limit guarantees
  no request body larger than the limit is read : exactly,
    without buffering, before authentication, for two
    years
  no request costs more than the limit : not addressed;
    the limit is denominated in received bytes and the
    work is denominated in something else
```

```
a resource limit protects the resource it is denominated in;
where a transformation sits between the measured quantity and
the spent one, the caller chooses the exchange rate, and a
limit on one side is a limit on one side
```

The limit is enforced the right way round: on the stream rather than the buffered body, before authentication, returning a documented status naming the real limit, with 0 bypasses in two years. It counts received bytes, and the work happens after inflation at a ratio the sender picks, so 10 MB becomes 80 MB typically and 10000 at 1000 to one - 4 times a worker's memory, with the enforced bound covering 10 per ten thousand of it.

Verify it yourself:

```bash
pnpm eml run examples/the-limit-was-on-the-upload-and-the-cost-was-after-decompression/the_limit_was_on_the_upload_and_the_cost_was_after_decompression.eml
```
