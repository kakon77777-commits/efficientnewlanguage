# The retry succeeded and the first attempt also landed

`the_retry_succeeded_and_the_first_attempt_also_landed.eml` - A client times out at two seconds and retries. The server is slower than that for a small share of requests, and it finishes them. What each party records is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The retry is correct and it is why the client-visible error rate is zero. A request that has not answered in two seconds is, from the caller's side, indistinguishable from one that never will, and waiting longer converts a recoverable blip into a user-visible failure. The timeout was set from a measured latency distribution and the retry count is one, not five.

A timeout tells the caller that no answer arrived. It does not tell the caller whether the work happened. Those are different facts and only one of them crosses the wire.

So the first attempt completes, the retry completes, and every party's own numbers are correct. The defect is not in either party's record; it is that nobody holds both.

```
requests per day            : 1200000
client timeout              : 2000 ms
slower than the timeout     : 31 per thousand
requests that timed out     : 37200
retries sent                : 37200
```

```
the client's record
  requests issued        : 1200000
  errors returned to user: 0
  success rate           : 100 percent
  retries, all successful: 37200
```

```
the server's record
  attempts received for those requests : 74400
  attempts that failed                 : 0
  success rate                         : 100 percent
```

```
the ledger
  intended effects : 37200
  recorded effects : 74400
  duplicates       : 37200
```

```
  both parties report 100 percent and neither is wrong
```

```
one request, in milliseconds
  0     client sends
  2000  client gives up, records a timeout
  2000  client sends the retry
  2400  first attempt COMMITS
  3300  retry COMMITS
```

```
  the client saw one failure and one success
  the server saw two successes
  the account was debited 2 times
```

```
what the two-second mark separates
  answers that arrived in time  : left of the line
  answers that arrived late     : right of the line
  work that did not happen      : right of the line
  work that did happen          : right of the line
```

```
  the last two are the same side, and the status code is the same
```

```
day    timed out   duplicates   cumulative
  1      37200        37200        37200
  2      37200        37200        74400
  3      37200        37200        111600
  4      37200        37200        148800
  5      37200        37200        186000
```

```
  nothing in that table is an error condition anywhere
```

```
control - is the retry doing its job
  user-visible failures without it : 37200
  user-visible failures with it    : 0
  retry storms                     : 0, the count is 1
  defects in the retry policy      : 0
```

```
  removing the retry removes the duplicates and returns 37200
  failures to users, which is a worse trade, not a better one
```

```
null control - the identical retry on an idempotent call
  requests that timed out : 37200
  retries sent            : 37200
  duplicate executions    : 37200
  duplicate EFFECTS       : 0
  the retry did not change; what it was retrying did
```

```
what a timeout is evidence of
  no answer arrived within the window : yes, that is measured
  the work did not run                : not measured, not implied
  the work will not run               : not measured, not implied
  and the caller must decide using only the first
```

```
the fix is not a longer timeout, which moves the line without
removing it; it is a key the second attempt can present so the
server can recognise it as the same intent
```

The timeout is correctly set and the retry is why 37200 users saw a success instead of an error. Both parties report a 100 percent success rate and both are telling the truth: the client counts 1200000 requests with 0 errors, the server counts 74400 attempts with 0 failures, and the 37200 duplicate effects appear in neither record because neither party holds both.

Verify it yourself:

```bash
pnpm eml run examples/the-retry-succeeded-and-the-first-attempt-also-landed/the_retry_succeeded_and_the_first_attempt_also_landed.eml
```
