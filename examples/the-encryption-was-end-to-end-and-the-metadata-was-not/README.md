# The encryption was end to end and the metadata was not

`the_encryption_was_end_to_end_and_the_metadata_was_not.eml` - The server cannot read a single message body and the cryptography is not the weak part. What the server does hold is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The end-to-end encryption is real. Keys are generated on the device and never leave it, the server stores ciphertext it has no key for, forward secrecy is implemented and exercised, and an independent review found no way for the operator to recover a body. Eighty-four million messages a day and zero readable ones.

A message is a body and an envelope. Delivery needs the envelope in clear — who to, from whom, when, how big — and none of that is what the cryptography was asked to hide.

Two years of envelopes is a graph.

```
messages per day             : 84000000
bodies readable by the server: 0
envelope fields in plaintext : 6
retention, days              : 730
envelopes retained           : 61320000000
distinct sender-recipient pairs per day : 11400000
```

```
the cryptography
  keys generated on the device : yes
  keys leaving the device      : never
  what the server stores       : ciphertext it has no key for
  forward secrecy              : implemented and exercised
  independent reviews finding a body-recovery path : 
    0 of 2
  bodies readable              : 0
  verdict                      : END TO END
```

```
  the claim is true and the implementation deserves it
```

```
the envelope
  recipient      : required to route
  sender         : required to reply and to rate limit
  timestamp      : required to order
  size           : required to bill and to allocate
  device         : required to fan out
  read receipt   : required by the product
  fields the cryptography was asked to cover : the body
```

```
  none of the six is an oversight; each is load-bearing
  for something the service must do
```

```
pairs as a share of messages : 1357 per ten thousand
```

```
what a graph over 61320000000 envelopes answers
  who talks to whom       : directly
  how often, at what hour : directly
  who stopped talking to whom, and when : directly
  the words exchanged     : not at all
```

```
  the protected question and the answerable one are
  different questions, and only one of them was asked of
  the cryptography
```

```
null control - sealed sender and padded sizes
  bodies readable        : 0, unchanged
  envelope fields in plaintext : 1
  the cryptography did not get stronger; the routing
  stopped requiring the fields the graph is built from
```

```
what end-to-end encryption guarantees
  the operator cannot read the content : exactly
  the operator learns nothing           : not addressed;
    the envelope is what delivery runs on, and it was
    never in the scope of the guarantee
```

```
encryption protects what it is applied to; a system's
metadata is the part that must stay legible for the system to
work, which is exactly why it is the part that accumulates
```

The encryption is genuine: device-generated keys that never leave, forward secrecy, 2 independent reviews finding no recovery path, and 0 readable bodies out of 84000000 a day. Delivery needs 6 envelope fields in clear, so 61320000000 envelopes are retained over 730 days - 11400000 distinct pairs a day, 1357 per ten thousand of the traffic - and none of them is ciphertext.

Verify it yourself:

```bash
pnpm eml run examples/the-encryption-was-end-to-end-and-the-metadata-was-not/the_encryption_was_end_to_end_and_the_metadata_was_not.eml
```
