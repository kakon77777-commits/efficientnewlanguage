# The request was authenticated and the callback was not

`the_request_was_authenticated_and_the_callback_was_not.eml` - Every inbound request is authenticated and none has ever got through unsigned. What the outbound half proves is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The inbound authentication is thorough. Requests carry a signature over the body and a timestamp, replays inside the window are rejected by a nonce cache, the signing keys are per-tenant and rotated, and four million two hundred thousand requests this month produced zero unsigned acceptances. A penetration test last quarter did not get past it.

The API is asynchronous. It accepts work, returns immediately, and later POSTs the result to a URL the customer gave us — and that direction was designed as a notification rather than as a message anyone would act on.

The callback carries no signature. A customer receiving one cannot distinguish it from a POST anybody made to the same URL.

```
inbound requests            : 4200000
accepted without a signature: 0
```

```
callbacks sent              : 4200000
callbacks signed            : 0
customers                   : 1840
  checking the source address : 712
  checking nothing            : 1128
```

```
the request authentication
  signature over the body : required
  timestamp window        : enforced
  replay inside the window: rejected by a nonce cache
  keys                    : per tenant, rotated
  unsigned acceptances    : 0
  penetration test        : did not get past it
  verdict                 : AUTHENTICATED
```

```
  this is not a token in a header; it is a real signing
  scheme and it holds
```

```
the callback
  signature      : none
  shared secret  : none
  mutual tls     : no
  what a receiver can verify : that something POSTed
    valid json to a url
```

```
  the url is not secret either: it is submitted in the
  request, logged by both sides, and often a path under a
  documented prefix
```

```
customers acting on an unverifiable message : 6130 per ten thousand
```

```
what checking the source address establishes
  the packet came from a published range : yes
  the payload is the one we sent         : no
  the payload has not been replayed      : no
  customers relying on it                : 712
```

```
null control - sign the callback with the same key
  unsigned acceptances : 0, unchanged
  callbacks signed     : 4200000
  customers with no check : 0
  the inbound side did not get stronger; the key it
  already holds started being used in both directions
```

```
what request authentication guarantees
  we know who is asking : exactly
  they know it is us    : not addressed, and the two are
    different keys pointed in different directions even
    when they are the same key
```

```
authentication is directional; a scheme that answers 'is this
caller real' says nothing about 'is this result real', and an
asynchronous API asks the second question of its customers
```

Every one of 4200000 inbound requests was authenticated and 0 unsigned ones were accepted: signature over the body, enforced timestamp, nonce cache, per-tenant rotated keys, a penetration test that did not get past it. All 4200000 callbacks went out unsigned, so 1128 of 1840 customers - 6130 per ten thousand - act on a result they have no way to attribute to us.

Verify it yourself:

```bash
pnpm eml run examples/the-request-was-authenticated-and-the-callback-was-not/the_request_was_authenticated_and_the_callback_was_not.eml
```
