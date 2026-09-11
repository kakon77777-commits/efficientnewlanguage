# The delivery was confirmed by the senders receipt

`the_delivery_was_confirmed_by_the_senders_receipt.eml` - The delivery rate has been at 100 per hundred for the whole quarter, and every delivery it counts is real. What a delivery is counted at is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The pipeline is instrumented well. Every send emits a structured event; the events are collected without sampling; a send that throws is caught and counted as failed; and the rate is reconciled against the send log nightly.

The delivery event is emitted by the sender, when it hands off to the carrier.

```
messages sent                   : 900000
  receipts emitted              : 900000
  deliveries reported           : 900000
reported delivery rate          : 10000 per ten thousand
```

```
recipient acknowledgements      : 861000
  never acknowledged            : 39000
bounced after the handoff       : 39000
real delivery rate              : 9566 per ten thousand
```

```
the delivery metric
  every send : emits a structured event
  collection : no sampling
  a send that throws : caught and counted as failed
  reconciliation : against the send log, nightly
  deliveries reported : 900000
  verdict : DELIVERED
```

```
  counting a thrown send as failed is the part almost
  nobody does, and it is why the rate is trusted not to
  quietly drop errors
```

```
the delivery event
  who writes it : the sender
  when : at handoff to the carrier
  what it proves : the carrier accepted the message
  what it does not observe : anything the carrier does
    after accepting it
  messages that bounced past that point : 
    39000
  acknowledgements from the recipient : counted here? no
```

```
the recipient side
  messages that acknowledged arrival : 
    861000
  messages with no acknowledgement : 
    39000
  what the dashboard shows for those : DELIVERED
  bounces the sender's receipt recorded : 0; the receipt
    was already written
  real delivery once acks are counted : 
    9566 per ten thousand
```

```
null control - count acknowledgements, not handoffs
  handoff-based delivery : 10000, unchanged
  ack-based delivery : 
    9566 per ten thousand
  messages the ack view calls undelivered : 
    39000
  no message moved; the count stopped being taken at the
  moment the sender let go and started at the moment the
  recipient caught
```

```
what a 100 per hundred delivery rate guarantees
  every message was handed to the carrier : exactly, all 
    900000, each with a receipt, thrown sends counted
    as failed
  every message reached the recipient : not addressed;
    the receipt is written by the sender at handoff, and 
    39000 messages bounced after the point the receipt
    records
```

```
a receipt is written by whoever holds the thing when it is
written, and a sender writes its receipt when it lets go; the
event proves the release, not the arrival, and the two are
separated by everyone downstream
```

Every send emits an unsampled event and a throw counts as failed - 10000 per ten thousand delivered. The receipt is written by the sender at handoff, so 39000 messages bounced past it uncounted, leaving real delivery at 9566 per ten thousand against 39000 never acknowledged.

Verify it yourself:

```bash
pnpm eml run examples/the-delivery-was-confirmed-by-the-senders-receipt/the_delivery_was_confirmed_by_the_senders_receipt.eml
```
