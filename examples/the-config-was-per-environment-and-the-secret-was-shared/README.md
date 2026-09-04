# The config was per environment and the secret was shared

`the_config_was_per_environment_and_the_secret_was_shared.eml` - Three environments have three configuration files and forty-nine of fifty-two keys differ between them. What the three identical keys are is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The separation is real and it was built deliberately. Each environment has its own file rather than one file with conditionals; a test asserts that no file references another; the deploy refuses if the environment name in the file does not match the target; and a review after a staging job wrote to a production queue is why all of that exists.

Separation is a property of the FILES. What a key points at is a different question, and a key that names a shared location is identical in all three files by construction.

One of the three identical keys is a vault path.

```
environments                 : 3
keys per environment         : 52
keys that differ             : 49
share differing              : 9423 per ten thousand
```

```
keys identical in all three  : 3
  harmless                   : 2
  a vault path               : 1
```

```
the environment discipline
  one file per environment, not conditionals : yes
  a test asserts no file references another  : yes
  cross-file references found                : 0
  deploy refuses on a name mismatch          : yes
  deploys with a mismatched name             : 0
  written after                              : a staging job
    that wrote to a production queue
  verdict                                    : SEPARATED
```

```
  the incident that produced this was real and the
  discipline has held since
```

```
the two ways a key can be identical
  because it is the same everywhere and harmless : a log
    format, a retry count
  because it names a shared thing                : a vault
    path, a bucket, a queue
  what a diff of the files shows : that they are identical
  what it does not show          : which kind
```

```
  a review that reads the diff sees three identical lines
  and no reason to read them as three different findings
```

```
the shared credential
  environments that fetch it     : 3
  environments that should       : 1
  staging access is granted more widely : yes, by design
  the vault audit log shows      : three services fetching
    one secret, each authorised to
  anything anomalous in that log : nothing
```

```
null control - the test compares values, not just references
  cross-file references : 0, unchanged
  identical keys remaining : 2
  shared external resources : 0
  the separation did not get stricter; the test started
  reading what a key points at rather than where it lives
```

```
what per-environment configuration guarantees
  each environment is configured independently : exactly
  each environment is isolated                 : not
    addressed; isolation is a property of the resources
    the values name, and two files can differ everywhere
    and still point at one thing
```

```
separating configuration separates the decisions; whether it
separates the systems depends on the values, and a test that
checks for references between files cannot see a value they
happen to share
```

The separation is genuine: one file per environment rather than conditionals, 0 cross-file references, a deploy that refuses on a name mismatch and 0 that have slipped through, all written after a staging job reached a production queue. 49 of 52 keys differ - 9423 per ten thousand - and 1 of the 3 identical ones is a vault path, so all 3 environments hold one credential.

Verify it yourself:

```bash
pnpm eml run examples/the-config-was-per-environment-and-the-secret-was-shared/the_config_was_per_environment_and_the_secret_was_shared.eml
```
