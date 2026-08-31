# The certificate was valid and the chain was not

`the_certificate_was_valid_and_the_chain_was_not.eml` - The leaf certificate is valid by every property a certificate has. Which clients can actually authenticate the server is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: "Is the certificate valid" is a question about one object: not expired, the hostname matches, the signature verifies against the issuer named in it. All three hold here, the monitoring check that asks them is green, and the operator who renewed the leaf did the renewal correctly.

Authentication is not a property of the leaf. It is a property of a PATH from the leaf to a root the client already trusts, and every link in that path is a separate certificate with its own validity window.

The intermediate expired eleven days ago. Clients that already hold it cached from an earlier handshake build the path anyway. Clients that do not, and whose stack does not chase the issuer URL in the leaf, have a valid certificate they cannot chain.

```
handshakes per day             : 1840000
served a complete chain        : 1490000
had to supply the link         : 350000
  held it cached               : 203000
  fetched the issuer url       : 81000
  could not build a path       : 66000
```

```
the certificate check, run every five minutes
  not before   : passed
  not after    : passed, 47 days remaining
  hostname     : passed, exact match
  signature    : passed, verifies against the named issuer
  key size     : passed
  verdict      : VALID
```

```
  every line is true of the leaf, and the leaf is the only
  object the check was given
```

```
the path a client must build
  leaf         : valid, 47 days remaining
  intermediate : EXPIRED 11 days ago
  root         : valid, in the trust store
```

```
  the leaf's own validity window says nothing about the
  window of the certificate that signed it
```

```
clients that cannot authenticate : 66000
  as a share of handshakes       : 358 per ten thousand
```

```
reports say 'works for me'
  succeeded on an incidental mechanism : 284000
    a cached copy from an earlier visit, or a fetch the
    stack does and the specification calls optional
  neither is configuration; neither is guaranteed
```

```
null control - the same leaf, intermediate renewed
  leaf verdict            : VALID, unchanged
  served a complete chain : 1840000
  could not build a path  : 0
  the leaf did not change; the path became buildable
```

```
what a valid certificate guarantees
  this object is well formed and unexpired : exactly
  a client can build a trusted path to it  : not addressed,
    and the check cannot address it, because the rest of
    the path is not in the object it was handed
```

```
a certificate is one link; trust is the whole chain, and the
only monitor that can see the difference is one that builds
the path from a machine holding nothing
```

The leaf is valid and the five-minute check is right to say so: 11 days after the intermediate expired, not before, not after, hostname and signature all still pass. 66000 handshakes a day - 358 per ten thousand - reach a server whose certificate is valid and cannot chain it, while 284000 more succeed on a cached copy nobody configured and nothing renews.

Verify it yourself:

```bash
pnpm eml run examples/the-certificate-was-valid-and-the-chain-was-not/the_certificate_was_valid_and_the_chain_was_not.eml
```
