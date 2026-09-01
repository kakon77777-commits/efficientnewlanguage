# The worker restarted and the poison message came back

`the_worker_restarted_and_the_poison_message_came_back.eml` - The supervisor restarted the worker twelve hundred times this hour and every restart succeeded. How much work was done is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The supervisor is correct and it is why this service survives. A worker that dies is replaced in three seconds, the replacement is healthy, and the same mechanism has absorbed a bad deploy, a memory leak and an upstream outage without anyone being paged. Its success rate this hour is a hundred percent.

A restart returns the WORKER to a good state. It does not return the queue to one, and the message that killed the worker was never acked, so it is at the head of the queue when the replacement connects.

One message has held the consumer for the whole hour. The supervisor reports twelve hundred successes and the backlog reports forty-two thousand.

```
restart time, seconds     : 3
restarts this hour        : 1200
failed restarts           : 0
poison messages           : 1
```

```
messages processed        : 0
throughput when healthy   : 42000
backlog added this hour   : 42000
```

```
the supervisor's report
  restarts attempted : 1200
  restarts succeeded : 1200
  restarts failed    : 0
  worker healthy after each : yes
  verdict            : HEALTHY
```

```
  every line is true and this mechanism has saved the
  service three times this quarter
```

```
the two states
  the worker  : fresh process, clean memory, restored
  the queue   : the message that killed it is still at
    the head, unacked, because the worker died before
    acking and that is the correct thing to do
```

```
  both halves are behaving as designed, and the design
  loops
```

```
where the hour went
  seconds spent restarting : 3600
  distinct messages attempted : 1
  attempts on that one message : 1200
```

```
  a retry budget would have caught this; there is one, and
  it counts per worker, and each worker is new
```

```
the alerts
  worker health : green, because it is repeatedly restored
  restart rate  : no threshold; restarts are normal
  throughput    : fired at minute four, to the queue team
  the two teams  : each sees a system behaving correctly
```

```
null control - the attempt count travels with the message
  restarts succeeded  : unchanged, the supervisor is fine
  attempts on the poison message : 5
  messages processed  : 42000
  backlog added       : 0
  the worker did not get more robust; the counter moved
  to the thing that survives the restart
```

```
what a successful restart guarantees
  the process is healthy again : exactly
  progress resumes             : not addressed; the input
    that caused the failure is still the next input, and
    a fresh process meets it with a fresh counter
```

```
any recovery that resets state must not reset the count of
how often it has recovered; put that count where the failure
lives, not where the recovery does
```

The supervisor restarted the worker 1200 times this hour with 0 failures and a healthy process every time, which is the same mechanism that saved the service three times this quarter. 1 message was attempted, 0 were processed against a healthy 42000, the backlog grew by 42000, and the retry budget did not fire because it counts per worker and every worker was new.

Verify it yourself:

```bash
pnpm eml run examples/the-worker-restarted-and-the-poison-message-came-back/the_worker_restarted_and_the_poison_message_came_back.eml
```
