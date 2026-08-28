# The signature covered the payload and not the headers

`the_signature_covered_the_payload_and_not_the_headers.eml` - Every incoming webhook is signed and every signature verifies. Which fields the signature actually covers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Signing the body is the standard practice and it was implemented correctly. The HMAC uses a shared secret, a constant-time comparison, a per-partner key, and the verification runs before any parsing so a forged body cannot reach the decoder. Four things that are commonly done badly are all done right here, and the implementation has been reviewed twice.

The signature is computed over the body because that is what the partner's library signs. Routing information travels in headers, because headers are what a gateway can read without buffering a request - which is a good reason, and it is why the fields ended up on that side of the line.

A signature is a statement about exactly the bytes it covered. It says nothing whatsoever about bytes it did not, and "the request is authentic" is a sentence about the whole request.

```
security-relevant fields in the request : 4
fields the signature covers             : 1
signature verification pass rate        : 100 percent
```

```
field                where     signed   decides
  body        body     yes      what the transaction says
  X-Target-Account    header   no       which account is credited
  X-Idempotency-Key    header   no       whether it posts twice
  X-Timestamp    header   no       how old a replay may be
```

```
  signed   : 1
  unsigned : 3
  the field that decides where the money goes is in the second group
```

```
one captured request, replayed with headers changed
  body                : unchanged, so the signature still verifies
  signature check     : passes
  X-Target-Account    : changed, and nothing detects it
  X-Idempotency-Key   : changed, so the deduplicator sees a new operation
  X-Timestamp         : changed, so the replay window resets
```

```
  the request is authentic in exactly the sense the signature claims:
  these bytes came from the partner
  it was read as: this operation was authorised by the partner
```

```
  coverage of the decision surface : 25 percent
  coverage reported by the check   : 100 percent, of what it covers
  both numbers are correct and they are about different denominators
```

```
one captured payment, replayed with fresh idempotency keys
  amount per posting : 50000 hundredths
  replays            : 6
  total posted       : 300000 hundredths
  duplicate detections : 0, every key is new
  signature failures   : 0, the body never changed
```

```
control - is the signature implementation itself sound
  constant-time comparison    : yes
  per-partner key             : yes
  verified before parsing     : yes
  forged bodies rejected      : yes, all of them
  defects in the implementation : 0
  the crypto is not the problem and never was
```

```
  a review of the implementation asks 'is this HMAC correct'
  the question that was needed is 'what is inside the HMAC'
```

```
null control - the same signature when every deciding field is in the body
  security-relevant fields : 4
  covered by the signature : 4
  coverage                 : 100 percent
  replay with changed headers : changes nothing that decides anything
  same HMAC, same key, same code path
  the strength of a signature is the same; its SCOPE is the whole finding
```

```
reading a signature honestly
  what it proves      these exact bytes came from the holder of the key
  what it is read as  this request is authorised
  the gap             every byte outside the covered range
  and that range is decided by whichever library the partner uses
```

```
the check is not 'does the signature verify'
it is 'list the fields that change the outcome, and mark which are inside'
a field that decides something and is not covered is the whole finding
```

The HMAC is correct: constant-time comparison, per-partner key, verified before parsing, and it rejects every forged body. It covers 1 of the 4 fields that decide what the request does, which is 25 percent of the decision surface and 100 percent of what it was asked to cover. The account the money reaches is in a header, and a header is outside the bytes the signature is a statement about.

Verify it yourself:

```bash
pnpm eml run examples/the-signature-covered-the-payload-and-not-the-headers/the_signature_covered_the_payload_and_not_the_headers.eml
```
