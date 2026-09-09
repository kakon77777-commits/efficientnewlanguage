# The envelope was validated and the payload was a string

`the_envelope_was_validated_and_the_payload_was_a_string.eml` - Every message on the event bus is validated against a registered schema before the broker will accept it, and the broker rejects what fails. What the schema describes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The registry is real. A schema is versioned, a publish is refused unless the new version is compatible with the one consumers hold, fourteen breaking changes have been stopped at that check, and the validation runs in the broker rather than in a library each producer may or may not have upgraded.

The envelope schema types the payload as a string. So the eight envelope fields are checked and the object inside is carried as text.

```
schemas registered              : 118
months the registry has run     : 31
breaking changes blocked        : 14
envelope fields validated       : 8
payload fields the broker checks: 0
```

```
messages a day                  : 4100000
  rejected                      : 1830
  accepted                      : 4098170
  rejection rate                : 4 per ten thousand
```

```
schemas typing payload a string : 103
  that describe the payload     : 15
  opaque share                  : 8728 per ten thousand
consumers on the bus            : 260
  that validate after parsing   : 12
  that do not                   : 248
  validating share              : 461 per ten thousand
```

```
the schema registry
  versions : every schema, and a publish is refused
    unless it is compatible with what consumers hold
  breaking changes stopped at that check : 14
  where validation runs : in the broker, not in a
    library each producer may not have upgraded
  messages refused a day : 1830
  months in place : 31
  verdict : VALIDATED
```

```
  running the check in the broker is the part almost
  nobody does, and it is why the 4 per ten thousand
  are refused rather than logged
```

```
two objects
  what the schema describes : the envelope, 8 fields
  what the consumer acts on : the object inside
  how the schema types that object : as a string
  schemas in that shape : 103 of 118
  what the broker checks inside it : 0 fields
```

```
  a validator that is told a field is text will confirm
  it is text, and it is
```

```
an amount sent as text
  is the envelope valid : yes, all 8 fields
  does the broker accept it : yes
  does it count against the rejection rate : no; it was
    never a rejection
  who decides what it means : each consumer, 260 of them
  how many check after parsing : 12
  how many do not : 248
```

```
null control - describe the payload, validate it too
  envelope failures a day : 1830, unchanged
  schemas describing the payload : 118
  messages rejected a day : 19400
  the envelope validator did not get stricter; a
  description was written for the object that was being
  carried past it
```

```
what a fully validated bus guarantees
  every message has a well-formed envelope : exactly,
    8 fields, in the broker, 31 months
  every message has a well-formed body : not addressed;
    the schema types the body as text and text is what
    it is
```

```
a schema is a description of an object, and a message that
satisfies it has satisfied the description that was
written; nothing here describes the part that was left
opaque
```

The broker refuses 1830 of 4100000 messages a day against versioned schemas whose compatibility check has blocked 14 breaking changes in 31 months. The payload is typed as a string in 103 of 118 schemas - 8728 per ten thousand - so the broker checks 0 fields inside it and 248 of 260 consumers parse it without validating.

Verify it yourself:

```bash
pnpm eml run examples/the-envelope-was-validated-and-the-payload-was-a-string/the_envelope_was_validated_and_the_payload_was_a_string.eml
```
