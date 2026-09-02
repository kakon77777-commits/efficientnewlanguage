# The schema allowed the field and the parser ignored it

`the_schema_allowed_the_field_and_the_parser_ignored_it.eml` - The new field is in the schema, validates on every message, and is documented. How many consumers act on it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The change was made the careful way. The field is optional, so no existing producer breaks; the schema version was bumped; validation runs on both sides and has never rejected a message; the field is in the reference documentation with an example. Six million two hundred thousand messages a day carry it.

Forward compatibility is the property that an old consumer IGNORES what it does not recognise. It is why the additive change is safe, and it is indistinguishable, from the producer's side, from a consumer that recognises the field and does nothing with it.

Twenty-nine of thirty-four consumers ignore it. The producer's dashboard shows a hundred percent delivery.

```
messages per day carrying the field : 6200000
consumers                           : 34
  reading the field                 : 5
  ignoring it                       : 29
schema validation failures          : 0
messages rejected                   : 0
```

```
the additive change
  field optional          : yes
  schema version bumped   : yes
  validation on both sides: yes
  validation failures     : 0
  messages rejected       : 0
  documented with an example : yes
  verdict                 : COMPATIBLE, DELIVERED
```

```
  this is the correct way to add a field and every step of
  it was followed
```

```
why nothing broke
  old consumers ignore unknown fields : by design
  that is the property that makes this safe : yes
  from the producer, a consumer that ignores it looks like :
    a consumer that received it
  a signal distinguishing the two : none exists in the
    protocol, and adding one would break the property
```

```
share of consumers ignoring it : 8529 per ten thousand
```

```
delivery
  messages sent      : 6200000
  messages delivered : 6200000
  delivery rate      : complete
  consumers acting on the field : 5
  a metric for the last line : none
```

```
  the rollout was declared done on the first four numbers,
  which are the ones a message bus can produce
```

```
a consumer that ignores it
  rule applied     : the one from before the field existed
  output           : plausible, internally consistent
  errors raised    : 0
  difference from the intended result : present, and not
    computed anywhere
```

```
null control - consumers declare the schema version they implement
  validation failures : 0, unchanged
  consumers declaring a version : 34
  consumers known to be behind  : 29
  compatibility did not change; the producer stopped
  having to infer uptake from delivery
```

```
what an additive schema change guarantees
  nothing breaks         : exactly, and that is the point
  the new information is used : not addressed; the
    mechanism that guarantees the first is silence, and
    silence is what the second would have to be measured by
```

```
forward compatibility buys safety with unobservability; a
rollout that measures delivery has measured the half the
protocol reports and not the half anyone wanted
```

The field is optional, versioned, validated on both sides with 0 failures, documented with an example, and delivered on all 6200000 messages a day. 29 of 34 consumers ignore it - 8529 per ten thousand - which is the same forward-compatibility rule that made the change safe, and the producer's dashboard cannot distinguish them from the 5 that read it.

Verify it yourself:

```bash
pnpm eml run examples/the-schema-allowed-the-field-and-the-parser-ignored-it/the_schema_allowed_the_field_and_the_parser_ignored_it.eml
```
