# The signature was verified and the parser ran first

`the_signature_was_verified_and_the_parser_ran_first.eml` - Every webhook verifies an HMAC with a constant-time compare, inside a replay window, against a rotated secret. Where in the request path that happens is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The verification itself is textbook. The comparison is constant time rather than a string equality, so it leaks nothing through timing; the signed payload includes a timestamp checked against a five minute window, so a captured request cannot be replayed tomorrow; the secret is rotated on a schedule with both keys accepted during the overlap; and every one of the two hundred fourteen endpoints does this rather than most of them.

The handler runs after the framework has already deserialised the body into an object. The bytes reach a parser before they reach the check.

Eighty-four thousand unsigned requests a day are rejected.

```
webhook endpoints               : 214
  verifying the signature       : 214
  share                         : 10000 per ten thousand
  verifying before parsing      : 0
  share                         : 0 per ten thousand
middlewares that parse first    : 1
```

```
replay window, seconds          : 300
secret rotation, days           : 90
```

```
unsigned requests rejected daily: 84000
  bodies parsed before rejection: 84000
parser advisories in three years: 2
```

```
the signature check
  comparison : constant time, not string equality
  signed payload includes a timestamp : yes
  replay window : 300 seconds
  secret rotation : every 90 days, both keys accepted
    during the overlap
  endpoints doing this : 214 of 214
  verdict : AUTHENTIC
```

```
  a constant-time compare and a signed timestamp are the
  two details most implementations miss, and both are here
```

```
the order
  bytes arrive : from anyone
  the framework : deserialises the body into an object
  the handler   : receives that object and verifies
  what the parser was given : unverified bytes
  endpoints where the check comes first : 
    0
  is the check weaker for it : no; it is exactly as
    strong, and it runs second
```

```
  the guarantee is about who sent the bytes, and it is
  established after something has already read them
```

```
the deserialiser
  who wrote it : a dependency
  is it well regarded : yes
  what it processes : bytes from any sender
  what has been established about the sender at that
    point : nothing
  advisories against it in three years : 
    2
  requests it parses that are then rejected : 
    84000 a day
```

```
what the eighty-four thousand show
  requests rejected daily : 84000
  is the rejection correct : entirely
  what it proves : the check works and is exercised
  what happened before each rejection : the body was
    deserialised
  so the daily figure is also : the count of unverified
    bodies handed to the parser
  the same number, read from the other side
```

```
how the order arose
  who decided it : the framework, by parsing before
    dispatch
  why : so a handler receives a typed object
  is that a bad framework decision : no; it is the
    ergonomics everyone wants
  where application code can run : after dispatch
  so a check written as application code : runs second,
    necessarily
```

```
null control - verification is a middleware over raw bytes
  endpoints verifying : 214, unchanged
  verifying before parsing : 214
  unsigned bodies parsed : 0
  the signature check did not get stronger; it moved in
  front of the first thing that reads the bytes
```

```
what a verified signature guarantees
  this body came from the holder of the secret, recently :
    exactly, in constant time, within 300 seconds
  only trusted input was processed : not addressed; the
    guarantee is established at a point, and everything
    upstream of that point ran on anything
```

```
authentication defines a trust boundary, and a boundary is a
place in a sequence; code that runs before it is outside it,
however strong the check is, and a framework that parses for
convenience decides where that line falls
```

The check is textbook: a constant-time compare, a signed timestamp inside a 300 second window, a secret rotated every 90 days with an overlap, on all 214 of 214 endpoints - 10000 per ten thousand. It runs in the handler, after 1 middleware has deserialised the body, so 0 per ten thousand verify before parsing and 84000 unverified bodies a day reach the parser.

Verify it yourself:

```bash
pnpm eml run examples/the-signature-was-verified-and-the-parser-ran-first/the_signature_was_verified_and_the_parser_ran_first.eml
```
