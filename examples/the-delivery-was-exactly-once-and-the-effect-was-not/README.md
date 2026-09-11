# The delivery was exactly once and the effect was not

`the_delivery_was_exactly_once_and_the_effect_was_not.eml` - The queue delivers each message to the handler exactly once, and that property holds. Where the handler's effect lands relative to it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The delivery guarantee is real. The broker assigns each message an offset; the handler commits the offset only after it returns; a redelivery on restart is deduplicated by offset; so the handler's function runs once per message.

The handler's effect is an email, sent to a third party before the offset commits.

```
messages                        : 1200000
broker deliveries to handler    : 1200000
  duplicate handler returns     : 0
crashes after email, pre-commit : 450
redeliveries on restart         : 450
```

```
emails sent                     : 1200450
  duplicates                    : 450
duplicate effect rate           : 3 per ten thousand
```

```
the exactly-once delivery
  each message : gets a broker offset
  the offset commits : only after the handler returns
  a redelivery on restart : deduplicated by offset
  so the handler runs : once per message
  duplicate handler invocations that completed : 
    0
  verdict : DELIVERED EXACTLY ONCE
```

```
  committing the offset only after the return is the part
  done right here, and it is why no message is processed
  to completion twice
```

```
the handler's effect
  what it is : an email to a third party
  when it is sent : inside the handler, before the return
  what commits after it : the offset
  a crash between the send and the commit : leaves the
    offset uncommitted and the email already gone
  what the broker does then : redeliver, correctly, by
    its own guarantee
  what the redelivery does : send the email again
```

```
the recipient of the emails
  messages that concerned them : counted once by the
    broker
  emails they received : 1200450
  duplicates : 450
  did the broker break its promise : no; delivery to the
    handler was exactly once
  what was not once : the effect, which lives outside the
    offset the promise is about
```

```
null control - an outbox committed with the offset
  crashes : 450, unchanged
  duplicate emails : 0
  outbox rows rolled back with the offset : 
    450
  no crash and no delivery guarantee changed; the effect
  moved inside the transaction the offset commits in
```

```
what exactly-once delivery guarantees
  the handler runs once per message : exactly, offsets
    committed after the return, redeliveries deduplicated
  each message causes its effect once : not addressed;
    exactly-once is a property of delivery to the handler,
    and the effect is an email sent before the commit - 
    450 crashes between the send and the commit sent 
    450 duplicate emails
```

```
exactly-once names the boundary the broker controls - delivery to the handler;
an effect outside that boundary is at-least-once no matter what the broker
promises, because the promise ends where the handler's side effects begin
```

Delivery is exactly-once: offsets commit after the return and redeliveries dedupe - the handler runs once. The email is sent before the commit, outside that boundary, so 450 crashes in the gap sent 450 duplicate emails, 3 per ten thousand of the messages.

Verify it yourself:

```bash
pnpm eml run examples/the-delivery-was-exactly-once-and-the-effect-was-not/the_delivery_was_exactly_once_and_the_effect_was_not.eml
```
