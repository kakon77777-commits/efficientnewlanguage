# The value was validated on the client and trusted on the server

`the_value_was_validated_on_the_client_and_trusted_on_the_server.eml` - The client checks every field before submitting and catches twenty-six thousand bad inputs a day. How many submissions reach the server unchecked is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The client-side validation is thorough and it is not security theatre — it is there for the user. Every field is checked as it is typed, the message says what is wrong rather than that something is, and it turns twenty-six thousand would-be round trips a day into an immediate correction. Removing it would make the product worse.

It runs where the user is. Server-side validation covers fourteen of fifteen fields; the fifteenth was left out during a deadline with the note that the form already checks it, which was true and is a statement about one caller.

A hundred and twelve thousand submissions a day do not come from the form.

```
submissions per day        : 840000
  from the form            : 728000
  from an integration      : 112000
caught by the client daily : 26400
```

```
fields                     : 15
  checked on the server    : 14
  trusted from the client  : 1
```

```
the form
  checks every field as it is typed : yes
  message names what is wrong       : yes
  round trips saved per day         : 26400
  is it security theatre            : no, it is for the user
  verdict                           : GOOD VALIDATION
```

```
  removing it would make the product worse and nobody
  should
```

```
the scope of a client-side check
  submissions it inspects : the ones it produced
  submissions it inspects that it did not produce : none,
    because it is not on that path
  what the note said : the form already checks it
  what the note meant : the form's submissions are checked
```

```
  the sentence is true; the inference drawn from it names
  a population one caller does not cover
```

```
share arriving with that field unchecked : 1333 per ten thousand
```

```
the callers
  the form               : one client
  documented integrations : several, supported, intended
  anyone bypassing a control : nobody
  clients the note considered : one
```

```
null control - the fifteenth field checked on the server too
  caught by the client : 26400, unchanged
  submissions with an unchecked field : 0
  the form did not change; the check moved to the place
  every caller passes through
```

```
what client-side validation guarantees
  this client sends well-formed values : exactly
  the server receives well-formed values : not addressed;
    it is a property of one caller, and the server's
    population is every caller
```

```
a check is evidence about the traffic that passes through it;
moving one to the client improves the experience of that
client and removes it from the boundary
```

The form checks every field as it is typed and saves 26400 round trips a day, which is real and worth keeping. 14 of 15 fields are also checked on the server; the fifteenth was left to the form, so the 112000 submissions a day that arrive from documented integrations - 1333 per ten thousand - carry that field unchecked, and nobody bypassed anything.

Verify it yourself:

```bash
pnpm eml run examples/the-value-was-validated-on-the-client-and-trusted-on-the-server/the_value_was_validated_on_the_client_and_trusted_on_the_server.eml
```
