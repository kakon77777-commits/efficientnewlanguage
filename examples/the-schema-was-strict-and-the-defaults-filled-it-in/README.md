# The schema was strict and the defaults filled it in

`the_schema_was_strict_and_the_defaults_filled_it_in.eml` - The configuration is validated against a strict schema and has never failed validation. How much of it anybody chose is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The schema is strict in the ways that matter. Unknown keys are rejected rather than ignored, so a typo does not silently do nothing; types are enforced; ranges are bounded; and it has caught seven real mistakes this year, including a timeout written in milliseconds where the field is seconds. Refusing to start on an invalid config is the right behaviour.

A schema validates what is PRESENT. Forty of the fifty-two keys have defaults and are absent from the file, so they are not validated against anything a person wrote — they are validated against the value the schema itself supplies.

Three of those defaults changed in a library upgrade, with no diff to review.

```
keys in the schema        : 52
set in the file           : 12
supplied by a default     : 40
share from defaults       : 7692 per ten thousand
validation failures       : 0
```

```
the config validator
  unknown keys      : rejected, so a typo cannot be a no-op
  types             : enforced
  ranges            : bounded
  refuses to start on invalid : yes
  real mistakes caught this year : 7
  verdict           : VALID
```

```
  one of the seven was a timeout written in milliseconds
  for a field measured in seconds; this validator earns
  its place
```

```
the two kinds of value
  written by a person : 12, validated against the schema
  supplied by the schema : 40, validated against
    themselves
  the second is always valid : necessarily
```

```
  'the config is valid' and 'the config was chosen' are
  different sentences, and the file is the evidence for
  the second
```

```
the upgrade
  lines changed in the config file : 0
  defaults that moved              : 3
  effective values that changed    : 3
  validation after the upgrade     : passes
  a review that would have shown it : none, there was no
    diff to review
```

```
share of the config that changed silently : 576 per ten thousand
```

```
null control - the effective config snapshotted at startup
  validation failures : 0, unchanged
  keys visible to a reviewer : 52
  values that can move without a diff : 0
  the schema did not get stricter; the values it supplies
  became as reviewable as the values a person supplies
```

```
what a strict schema guarantees
  every value present is well formed : exactly
  every value in force was decided   : not addressed; a
    default is the schema agreeing with itself, and it is
    indistinguishable in the result from a choice
```

```
validation is about a document and configuration is about a
running system; the gap between them is every key nobody
wrote down, and it is usually most of them
```

The schema is strict and has never failed: unknown keys rejected, types enforced, ranges bounded, 7 real mistakes caught this year including a timeout in the wrong unit. 40 of 52 keys are absent from the file and supplied by the schema - 7692 per ten thousand - so a library upgrade moved 3 effective values with 0 lines of config diff, and validation still passed.

Verify it yourself:

```bash
pnpm eml run examples/the-schema-was-strict-and-the-defaults-filled-it-in/the_schema_was_strict_and_the_defaults_filled_it_in.eml
```
