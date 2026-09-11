# The payload was valid against the schema it carried

`the_payload_was_valid_against_the_schema_it_carried.eml` - Every message this month validated, and each validation is a true statement. What it was true against is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The validation is not skipped. Every message is checked before it is accepted; a validation failure is rejected at the edge, not logged and passed on; the validator is a real JSON-schema engine; and the pass rate is on a dashboard.

The schema is read from a field inside the message.

```
messages received               : 2000000
  that validated                : 2000000
validation pass rate            : 10000 per ten thousand
```

```
schema taken from the message   : 2000000
checked against the registry    : 0
disagree with the registry      : 47000
match the registry              : 1953000
real conformance                : 9765 per ten thousand
```

```
the schema validation
  when : before the message is accepted
  on failure : rejected at the edge, not passed on
  engine : a real JSON-schema validator
  pass rate : on a dashboard
  messages that validated : 2000000
  verdict : VALID
```

```
  rejecting at the edge rather than logging and continuing
  is the part almost nobody does, and it is why VALID here
  is believed to mean conforming
```

```
the schema each message used
  where it came from : a field in the message itself
  what that makes the check : the sender against the
    sender
  messages checked against the registered contract : 
    0
  a self-describing payload : is internally consistent
    exactly when it says it is
  messages that disagree with the registry : 
    47000
```

```
the downstream reader
  the contract it holds : the registered schema
  messages that break against it : 
    47000
  what the edge reported for those : VALID
  real conformance to the contract : 
    9765 per ten thousand
  who noticed at ingest : nobody; the check agreed with
    the sender
```

```
null control - validate against the registered schema
  self-schema pass rate : 10000, unchanged
  registry-schema pass rate : 
    9765 per ten thousand
  messages it would reject : 47000
  no message changed; the validator stopped reading the
  standard from the thing being measured against it
```

```
what a passing validation guarantees
  the message is consistent with a schema : exactly, all 
    2000000 of them, rejected at the edge otherwise
  the message conforms to the contract : not addressed;
    the schema was read from a field in the message, so the
    check compared the sender to the sender, and 
    47000 disagree with the registered schema
```

```
a validator proves consistency with the schema it is given,
and a schema supplied by the sender proves only that the
sender agrees with itself; the contract is the one both sides
did not write
```

Every message is checked at the edge by a real validator and rejected on failure - 10000 per ten thousand valid. The schema is a field in the message, so the check is the sender against the sender: 47000 messages break the registered contract, leaving real conformance at 9765 per ten thousand.

Verify it yourself:

```bash
pnpm eml run examples/the-payload-was-valid-against-the-schema-it-carried/the_payload_was_valid_against_the_schema_it_carried.eml
```
