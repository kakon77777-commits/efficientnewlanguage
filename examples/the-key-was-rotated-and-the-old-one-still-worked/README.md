# The key was rotated and the old one still worked

`the_key_was_rotated_and_the_old_one_still_worked.eml` - Fourteen signing keys were rotated on schedule. Every rotation is recorded as complete. What the old keys can still do is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The overlap is correct and it is why rotation is possible at all. A key cannot be replaced instantaneously across services that deploy on their own cadence: accept both for a window, let each consumer move when it can, then retire the old one. Cutting straight over means an outage for whoever had not redeployed, which is how a security improvement becomes an incident and then becomes something nobody schedules again.

The window has two ends. Issuing the new key is a dated event with an owner; retiring the old one is a deletion that breaks whoever has not moved, and it has no deadline that anything enforces.

So the first half completes on time, fourteen times, and the second half is the step that gets deferred once and then stops being tracked.

```
keys rotated                   : 14
intended overlap               : 7 days
consumers of these keys        : 27
```

```
the rotation, against what it promises
  new keys issued              : 14 of 14
  distributed to every consumer: yes
  failed authentications after : 0
  rotations recorded complete  : 14
  defects in the rotation      : 0
```

```
  everything on that list is about the NEW key
```

```
the old keys
  still accepted          : 14 of 14
  mean age                : 143 days
  intended overlap        : 7 days
  days past the window    : 136
  revocations performed   : 0
```

```
  the overlap is 20 point 4 times as long as designed
```

```
who the deletion would break
  consumers migrated       : 24 of 27
  consumers not migrated   : 3
  services owned by other teams : 3
```

```
  88 percent of consumers are ready
  and the retirement is blocked by the other 3 of 27,
  none of them owned by the team
  holding the delete button
```

```
a key that leaked the day before rotation
  still valid after the new key was issued : yes
  still valid 143 days later            : yes
  window during which it is useful         : unbounded
```

```
  the leak is contained by the retirement, and the retirement
  is the half that did not happen
```

```
key   rotated   old key retired   status recorded
  1     yes       no                complete
  2     yes       no                complete
  3     yes       no                complete
  4     yes       no                complete
```

```
  the status column is reporting the issuance, truthfully
```

```
control - is the overlap earning its place
  consumers that would break on a hard cutover : 3
  outages caused by rotation so far            : 0
  rotations abandoned midway                   : 0
  defects in the overlap mechanism             : 0
```

```
  removing the overlap does not retire the old keys,
  it breaks 3 services and stops the next rotation happening
```

```
null control - the old key given an expiry when the new one is issued
  overlap                  : 7 days, as designed
  old keys still accepted  : 0
  consumers that break     : 3, on day 7, loudly
  the deadline did not become easier to meet
  it stopped depending on somebody choosing a day to delete
```

```
what a completed rotation records
  a new key exists and is trusted   : yes, dated, owned
  the old key no longer works       : a separate act, undated
  and only the second one is the security property
```

```
an overlap with an end date somebody must choose is not an
overlap, it is a permanent second key; the expiry has to be
set by the same event that issues the replacement
```

All 14 rotations completed on schedule with 0 failed authentications and 0 outages, which is what the overlap was for: 3 of 27 consumers would break on a hard cutover. All 14 old keys are still accepted at a mean age of 143 days - 20 point 4 times the designed window, 136 days past it - and the number of revocations is 0, because issuing has an owner and deleting has a blocker.

Verify it yourself:

```bash
pnpm eml run examples/the-key-was-rotated-and-the-old-one-still-worked/the_key_was_rotated_and_the_old_one_still_worked.eml
```
