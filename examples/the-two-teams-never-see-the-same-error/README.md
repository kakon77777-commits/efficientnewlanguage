# The two teams never see the same error

`the_two_teams_never_see_the_same_error.eml` - The client team sees failures the server team cannot find. Both dashboards are correct, and what each one can contain is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Neither instrument is broken. The client counts what the client experienced; the server counts what the server did. Each is complete about its own side and neither is hiding anything.

A request can end in a state that only one side has a row for. A client timeout that the server completed after the deadline is a success on one dashboard and a failure on the other, and it is not a disagreement - it is two correct records of two different events.

Every outcome class is scored against what each side records.

```
requests in the window : 970
  failures on the client dashboard : 610
  failures on the server dashboard : 270
  counted as a failure by both     : 120
  counted by neither               : 210
```

```
outcome                              count   client   server
  server 500   120     fail     fail
  client timeout, server finished late   340     fail     ok  
  connection reset in transit   90     fail     ok  
  client cancelled after send   210     ok       ok  
  server 200, client parse error   60     fail     ok  
  server rejected, client retried and won   150     ok       fail
```

```
of the client's 610 failures, the server also recorded 120
  which is 19%
  the other 490 have no server row that says anything went wrong
```

```
what each team can say, truthfully
  server team : our error rate is 278 per 1000, and it is
  server team : we cannot reproduce the client's numbers
  client team : our failure rate is 628 per 1000, and it is
  client team : the server says these requests succeeded
  both statements are correct and they are about different events
```

```
requests neither side counts as a failure : 210
  client cancelled after send : 210
  a user who cancels after sending got no result, and no dashboard has a
  row that says so
```

```
what a shared request id changes
  new instrumentation on the server : none, it already logs per request
  new instrumentation on the client : none, it already logs per request
  what becomes possible : joining the two, which turns 490 unexplained
  client failures into rows with a server side
  the missing thing is not a measurement, it is a key
```

```
how the disagreement is usually settled
  the server's data is centralised, complete and queryable
  the client's data is sampled, from devices, and arrives late
  so the better-instrumented side wins the argument, and it is the side
  with no row for 490 of the failures
```

```
control - server 500, 120 requests
  both sides record it, both counts agree, and neither team needs the
  other's data to see it
```

Both dashboards are complete about their own side and neither is hiding anything. A request can end in a state only one side has a row for, and the argument is settled by whichever side has the better rows.

Verify it yourself:

```bash
pnpm eml run examples/the-two-teams-never-see-the-same-error/the_two_teams_never_see_the_same_error.eml
```
