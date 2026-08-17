# The error text is parsed downstream

`the_error_text_is_parsed_downstream.eml` - The error message was reworded to be clearer. Four consumers were matching on the old wording.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Rewording it was right. The old text named an internal table, said nothing about what the caller should do, and generated support tickets. The new text is shorter, actionable and was reviewed by someone who reads these for a living.

The message also carries a machine-readable code, right next to it, which is the field consumers were supposed to match on. The text is what appears in logs, in screenshots and in the one-line reproduction someone pastes into a ticket - so the text is what people had in front of them when they wrote the matcher.

Every consumer is run against both messages, so who breaks is computed.

```
old message : E_CONFLICT: duplicate key in table orders
new message : E_CONFLICT: this record already exists
```

```
consumers : 7
  broken by the rewording : 4
  unaffected              : 3
```

```
consumer               matches on   old   new
  alert router   text     yes   no 
  retry policy   code     yes   yes
  support macro   text     yes   no 
  log dashboard   text     yes   no 
  client sdk   code     yes   yes
  billing reconciler   text     yes   no 
  status page rule   code     yes   yes
```

```
by the field they matched on
  matched the code : 3, broken : 0
  matched the text : 4, broken : 4
  the stable field was stable, exactly as promised
```

```
what each field was available in
  the code : in the API response body
  the text : in the response, the logs, the screenshots and the ticket
  a matcher is written from whatever the author is looking at
```

```
control - a rewording that appends instead of replacing
  consumers broken : 0
  every old matcher still fires, and the new sentence is still there
```

The reworded message is better and the code field was always the right thing to match. Which field a consumer can see is decided by where they were standing when they wrote the matcher.

Verify it yourself:

```bash
pnpm eml run examples/the-error-text-is-parsed-downstream/the_error_text_is_parsed_downstream.eml
```
