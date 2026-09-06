# The licence was checked at install and the machine was cloned

`the_licence_was_checked_at_install_and_the_machine_was_cloned.eml` - The licence file is signed, verified against a public key at install, bound to a hardware fingerprint, and the installer refuses without a valid one. How many running machines verified it is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The check is properly built. The licence is a signed document rather than a key that can be typed from a forum post; the signature is verified against a public key compiled into the installer rather than one fetched at runtime; expiry is enforced rather than warned about; and the installer exits without installing when verification fails. Forty licences, forty installs, forty signature verifications, none skipped.

The check runs at INSTALL and records that it passed. The customer builds one machine image by running the installer once and the autoscaling group clones it, so the recorded result is copied along with everything else.

Two thousand one hundred forty machines are running the software.

```
licences purchased              : 40
installs performed              : 40
  without a valid licence       : 0
signature verifications that ran: 40
```

```
machines running the software   : 2140
  that verified                 : 0
  build machines that installed : 40, none of them in this fleet
  that never verified anything  : 2140
  share verified                : 0 per ten thousand
```

```
installer runs per machine image: 1
fingerprint checks after install: 0
runtime verifications           : 0
```

```
the licence check
  the licence is : a signed document, not a typed key
  the public key comes from : the installer binary, not
    a runtime fetch
  expiry : enforced, not warned about
  on failure : the installer exits without installing
  verifications that ran : 40
  installs without a valid licence : 0
  verdict : VERIFIED
```

```
  a compiled-in public key and a hard refusal are the two
  choices that make this hard to defeat, and both are made
```

```
the moment of the check
  when it runs : once, while installing
  what it writes : a record that it passed
  where that record lives : the filesystem
  what the customer does with that filesystem : bakes it
    into a machine image
  what the autoscaling group does with the image : clones
    it, 2140 times
  what a clone re-checks : 0
```

```
  the check is unforgeable and it is a statement about an
  event, and the event happened once
```

```
the customer
  bakes an image and scales it : yes
  is that documented by the vendor : yes, as the
    recommended deployment
  has anyone modified the licence file : no
  has anyone bypassed the installer : no
  is the deployment within the agreement : that is a
    question about the agreement, and the check does not
    answer it either way
```

```
the fingerprint
  read when : during install
  read on which machine : the one building the image
  compared to the licence : yes, and it matched
  machines later running the software : 2140
  of those, machines whose fingerprint was ever read :
    0
  re-reads after install : 0
```

```
the vendor's report
  licences sold        : 40
  installs recorded    : 40
  failed verifications : 0
  what the report concludes : full compliance
  what it counts        : installs
  what the agreement is priced on : running instances
  instances the report can see : 0 of 2140
```

```
null control - the check runs when the process starts
  installs without a valid licence : 0, unchanged
  machines that verify : 2140
  machines that never verified : 0
  the cryptography did not get stronger; the check moved
  from an event that happens once to a state that
  persists
```

```
what an install-time licence check guarantees
  this installation was authorised : exactly, with a
    signature that cannot be forged and a refusal that
    cannot be skipped
  this software is running under a licence : not
    addressed; the check is an event and running is a
    state, and the filesystem carrying the result is
    copyable
```

```
a check performed once produces a fact about that moment,
which is then stored; storing it makes it duplicable, so the
strength of the verification bounds forgery and says nothing
about multiplicity
```

The check is properly built: a signed licence, a public key compiled into the installer, expiry enforced, and a refusal to install on failure - 40 verifications, 0 installs without a valid licence. It runs once per image and the result is baked into the filesystem, so of 2140 machines running the software 2140 never verified anything - 0 per ten thousand did - with 0 fingerprint re-reads and a compliance report that counts installs.

Verify it yourself:

```bash
pnpm eml run examples/the-licence-was-checked-at-install-and-the-machine-was-cloned/the_licence_was_checked_at_install_and_the_machine_was_cloned.eml
```
