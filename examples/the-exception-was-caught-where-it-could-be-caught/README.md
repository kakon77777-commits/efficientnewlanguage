# The exception was caught where it could be caught

`the_exception_was_caught_where_it_could_be_caught.eml` - The handler sits at the top of the request, because that is the function this team owns. How many of the failures it catches it can answer correctly is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Catching at the boundary is standard and it is right. It guarantees no failure escapes as a stack trace to a user, it is one place to maintain instead of forty, and it is the only layer where a team that owns the entry point can put a handler at all without editing somebody else's file.

By the time an exception reaches the boundary it has lost the thing that distinguishes it. Six causes arrive as one type, so one response is chosen for all six, and a response is either right for a cause or it is not.

Each cause is scored against the single available response.

```
distinct causes : 6
failures a week : 768
the boundary handler does one thing : log it and retry three times
```

```
what the one response does to each cause
  it is the right answer for   : 2 causes, 550 failures
  it makes things worse for    : 2 causes, 155 failures
  it changes nothing for       : 2 causes, 63 failures
  by volume the single response is right more often than not
```

```
cause                what it needs
  network reset   retry
  downstream 500   retry
  malformed payload   reject and tell the sender
  quota exceeded   back off, then retry
  auth token expired   re-authenticate, then retry
  mapper defect   a code change
  distinct responses required : 5
  responses the boundary can choose between : 1
```

```
retrying three times, on the causes it does not help
  extra calls a week : 436
  none of them can succeed, because nothing between attempts changes
  and 465 of the attempts land on a system already refusing them
```

```
how many of the six a handler can tell apart
  at the call site : 6, the cause is the thing that was raised
  at the boundary  : 1, every one arrives as the same wrapped type
  so the boundary is choosing without the field it would choose on
```

```
if the raised error carried its cause to the boundary
  causes the boundary could route : 6, by construction of the field
  responses it could then pick    : 5
  handlers to write               : 5, still all in the one function this team owns
  the boundary is the right place; it was the wrong amount of information
```

```
control - a nightly import whose answer is always skip the row
  causes : 3, rows : 47, distinct responses needed : 1
  here one handler for every cause is not a loss, because the causes differ
  in nothing the response depends on
```

The boundary is the correct place for a handler and the team that owns it owns nothing further in. What arrives there is one type, and picking one response is what one type leaves available.

Verify it yourself:

```bash
pnpm eml run examples/the-exception-was-caught-where-it-could-be-caught/the_exception_was_caught_where_it_could_be_caught.eml
```
