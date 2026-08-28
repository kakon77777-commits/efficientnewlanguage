# The config was validated at startup and edited at runtime

`the_config_was_validated_at_startup_and_edited_at_runtime.eml` - The configuration is validated on load: every field is type-checked, every range is bounded, every reference is resolved. How many of the month's config changes go through that validation is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The validator is thorough and it was written for the right reason. A bad config used to take the fleet down on deploy, so the team wrote a validator that refuses to start rather than start wrong. It checks types, ranges, enum membership, cross-field consistency and every reference into the service registry. Refusing to boot is the correct response and it has caught real mistakes.

Hot reload was added later, for a different and also good reason: a config change should not require a restart, because a restart drops connections and a rolling restart takes eleven minutes. The reload path re-reads the file and swaps the values in.

The validator runs in the startup path. The reload path is a different function, written by different people, for a case the validator's author was not thinking about.

```
config changes per month     : 47
applied by hot reload        : 44
applied by restart           : 3
```

```
  changes that pass through the validator : 3 (6 percent)
  changes that do not                     : 44 (93 percent)
```

```
  the validator is correct, complete, and on the path taken 6 percent
  of the time
```

```
cost of each path, from the operator's side
  restart     : 11 minutes, connections dropped, validated
  hot reload  : under a minute, no disruption, not validated
  visible difference in the outcome : none, both end with the value applied
  so the faster path wins every time, which is the correct choice given
  what the operator can see
```

```
values the validator rejects, and what they do if applied without it
  max_connections = 0
      validator : range 1..4096
      unvalidated: pool refuses every checkout
  timeout_ms = -1
      validator : positive integer
      unvalidated: every call times out immediately
  region = eu-wets
      validator : enum membership
      unvalidated: no endpoint resolves
  retry_limit = 9999
      validator : range 0..10
      unvalidated: one failure becomes 9999 calls
  values in this list : 4, every one caught at startup and none on reload
```

```
a bad value, by the path it arrives on
  via restart    : instance 1 refuses to boot, rollout halts
                   instances affected : 1 of 48
  via hot reload : every instance swaps the value on its next poll
                   instances affected : 48 of 48
```

```
  the safe path fails on one instance and stops
  the fast path succeeds on all of them
```

```
control - is the validator missing any check
  fields in the config      : 31
  fields the validator checks: 31
  checks that are wrong     : 0
  bad values it has caught  : real, and it was written after one got through
  the validator is not the defect
```

```
  it is on one of two paths, and the other one carries 93 percent
  of the traffic
```

```
null control - the same validator with no reload path
  changes per month            : 47
  applied by hot reload        : 0
  passing through the validator: 47 (100 percent)
  same validator, same checks, same code
  adding a second entry point moved coverage from 100 to 6 percent
  without editing the validator by one character
```

```
a check placed on a path, when a second path appears
  is the check correct           yes, and it stays correct
  is the check complete          yes, for its own path
  what fraction of changes take that path   this is the question
  and it is answered by usage data, not by reading the check
```

```
nothing about adding a reload path looks like weakening validation
the person who added it was removing a restart, and they did
```

The validator refuses to boot on a bad value, checks all 31 fields, and was written after a bad config took the fleet down. Hot reload was added to avoid an 11-minute rolling restart, which is also right. 44 of this month's 47 changes took the reload path, so 93 percent of configuration reached production without meeting a validator that has never once been wrong.

Verify it yourself:

```bash
pnpm eml run examples/the-config-was-validated-at-startup-and-edited-at-runtime/the_config_was_validated_at_startup_and_edited_at_runtime.eml
```
