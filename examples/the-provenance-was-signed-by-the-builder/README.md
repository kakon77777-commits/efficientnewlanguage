# The provenance was signed by the builder

`the_provenance_was_signed_by_the_builder.eml` - Nothing deploys without a signed provenance statement naming its source commit, its builder image and every step that ran, and the admission controller refuses anything that does not verify. Who writes the statement is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The control is real. Verification happens in the admission controller, so a deploy that skips it does not reach the cluster; the signing identity is short-lived and lives in an HSM rather than in a variable; every signature is written to a transparency log; and thirty-seven deploys a month are actually refused rather than warned about.

The statement is produced by the build, and signed with the build's own key.

```
artifacts attested a month      : 4600
deploys a month                 : 1900
  refused for a bad attestation : 37
  refused share                 : 194 per ten thousand
months the control has run      : 19
```

```
fields in the statement         : 11
  any other party can contradict: 0
  only the build can speak to   : 11
```

```
transparency log entries a month: 4600
  anyone has read back          : 0
  nobody has read               : 4600
```

```
independent rebuilds a month    : 0
  minutes one would cost        : 6
  hours for a month's output    : 460
```

```
the provenance control
  where it runs : the admission controller, so a deploy
    that skips it does not reach the cluster
  the key : short-lived, in an HSM, not in a variable
  every signature : written to a transparency log
  deploys refused a month : 37, refused and not warned
  months in place : 19
  verdict : ATTESTED
```

```
  refusing in the admission controller rather than in the
  pipeline is the part almost nobody does, and it is why
  the 37 a month are refusals
```

```
what the signature establishes
  who wrote the statement : the build
  what it says : this is the commit I read and these are
    the steps I ran
  who signed it : the same build, with its own identity
  fields another party could contradict : 
    0
  so a build that is wrong about itself : signs that
```

```
  the signature proves who is speaking; it cannot make
  the speaker a witness to itself
```

```
the log
  entries a month : 4600
  what an entry proves : that this statement existed at
    this time and has not been altered since
  what it does not prove : that the statement was true
    when it was written
  entries anyone has read back : 0
  so entries nobody has read : 4600
```

```
  an append-only record of unchecked claims is an
  append-only record of unchecked claims
```

```
null control - rebuild independently, compare digests
  deploys refused for a bad attestation : 
    37, unchanged
  independent rebuilds a month : 4600
  artifacts whose rebuild did not match : 
    2
  the signature check did not get stricter; a second
  party was given something to say
```

```
what a verified attestation guarantees
  the artifact carries a statement its builder signed,
    unaltered since : exactly, in the admission
    controller, logged, 19 months
  the artifact is what the statement says : not
    addressed; the statement's author is the thing it
    describes, and 0 rebuilds a month contradict it
```

```
a signature answers who said it and whether it changed;
neither question is whether it was true, and nothing here
asks a second party
```

Verification runs in the admission controller, the key is short-lived and in an HSM, every signature is logged, and 37 deploys a month are refused - 194 per ten thousand. The build writes the statement and signs it, so 11 of 11 fields have no other party who could contradict them, 4600 log entries have never been read back, and a rebuild that would settle it costs 6 minutes.

Verify it yourself:

```bash
pnpm eml run examples/the-provenance-was-signed-by-the-builder/the_provenance_was_signed_by_the_builder.eml
```
