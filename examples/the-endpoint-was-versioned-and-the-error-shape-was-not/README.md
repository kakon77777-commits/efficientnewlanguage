# The endpoint was versioned and the error shape was not

`the_endpoint_was_versioned_and_the_error_shape_was_not.eml` - The API is versioned with discipline and no success schema has broken outside a major bump in three years. What is outside the version is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The versioning is done properly. Two majors are served side by side, every documented response schema has a contract test that runs on every commit, a breaking change requires a new major rather than a note in a changelog, and the eighteen-month deprecation policy has been honoured to the point that v1 is still served three years after v2 shipped.

The contract tests assert the schemas the endpoints document, which are the success bodies. An error body is not produced by an endpoint; it is produced by one shared middleware, and that middleware is not versioned.

A framework upgrade changed the error envelope in both majors at once.

```
endpoints                        : 214
majors served side by side       : 2
success schemas documented       : 214
  with a contract test           : 214
breaking success changes in three years : 0
```

```
error schemas documented         : 0
  with a contract test           : 0
middlewares producing them       : 1
```

```
integrations                     : 96
  reading a field from an error  : 84
  reading only success bodies    : 12
  exposed share                  : 8750 per ten thousand
responses a day                  : 62000000
  that are errors                : 2480000, 400 per ten thousand
```

```
the version discipline
  majors coexist rather than replace : yes
  documented schemas with a contract test : 214 of 214
  a breaking change requires a new major : enforced, not
    written down
  deprecation policy honoured : v1 still served three
    years after v2
  verdict : VERSIONED
```

```
  serving two majors for three years costs real money and
  is the reason clients trust the guarantee
```

```
the versioned unit
  what carries a version : the endpoint
  what an endpoint produces on success : a body it
    documents, tested against its schema
  what produces the body on failure : 1 shared middleware
  which major that middleware belongs to : neither; it
    sits in front of both
```

```
  the contract is complete over the responses an endpoint
  authors, and an endpoint does not author its errors
```

```
one integration
  reads the success body : covered by the contract
  reads the error body   : to decide whether to retry, and
    to show a message
  the field it reads     : shown in an example in the
    guide, not in a schema
  integrations doing this : 84 of 96
```

```
the framework upgrade
  contract tests run     : 214
  contract tests failing : 0
  majors affected        : 2, in one deploy
  what a v1 client was promised : that v1 would not change
  what changed for a v1 client  : the body it parses on
    2480000 responses a day
```

```
null control - the error envelope is part of the contract
  success schemas tested : 214, unchanged
  error schemas tested   : 214
  majors a framework upgrade can change silently : 0
  the versioning did not get stricter; the set of responses
  it ranges over stopped being the ones written by hand
```

```
what a versioned endpoint guarantees
  its documented responses will not change under a client :
    exactly, and for three years it has held
  a client of that version will not break : not addressed;
    a client parses everything it receives, and the version
    covers what the endpoint authored
```

```
a compatibility promise is scoped to the artifact it is
attached to; responses assembled by shared machinery below
that artifact are outside every version at once
```

Versioning is real: 2 majors coexist, all 214 documented schemas have a contract test, and 0 success schemas have broken outside a major in three years. Error bodies come from 1 shared middleware with 0 documented schemas, so a framework upgrade changed the shape parsed by 84 of 96 integrations - 8750 per ten thousand - across both majors, on 2480000 responses a day.

Verify it yourself:

```bash
pnpm eml run examples/the-endpoint-was-versioned-and-the-error-shape-was-not/the_endpoint_was_versioned_and_the_error_shape_was_not.eml
```
