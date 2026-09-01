# The timezone was stored and the rule changed

`the_timezone_was_stored_and_the_rule_changed.eml` - Every event stores a UTC instant and its IANA zone name, which is the correct pair. How many future events are now an hour wrong is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The storage is right and it is the advice everyone gives. Local time alone is ambiguous twice a year and unresolvable across a rule change; storing the UTC instant plus the zone name keeps both the moment and the human intent, and a validator rejects any row missing either. Two million one hundred and forty thousand rows, no violations.

For a PAST event that pair is complete. For a FUTURE recurring event it is not: "every Tuesday at 09:00 in Europe/Lisbon" was materialised into UTC instants when the series was created, and the instant is a conclusion drawn from a rule that had not been announced yet.

Three zones changed their rules this year. The instants are still valid.

```
rows stored                     : 2140000
  describing a past moment      : 1654000
  future recurring instances    : 486000
zone rule changes this year     : 3
instances after a changed transition : 61400
```

```
the row validator
  utc instant present  : required
  iana zone name present : required
  zone name in the database : required
  instant parses as utc : required
  violations           : 0
  verdict              : VALID
```

```
  every affected row passes all four, before and after the
  rule change, because none of the four is about the rule
```

```
creating a weekly series
  what the user said   : every Tuesday at 09:00, Lisbon
  what was stored      : one utc instant per occurrence,
    plus the zone name
  when the offset was applied : at creation
  what the offset depended on : the rule as published then
```

```
  the zone name is stored and was not consulted again;
  keeping it made the row look like it could be recomputed
```

```
share of future instances now an hour out : 1263 per ten thousand
```

```
rendering one affected instance
  stored instant       : 08:00 utc
  stored zone          : Europe/Lisbon
  rendered under the old rule : 09:00 local, as intended
  rendered under the new rule : 08:00 local
  conversion correct   : both times
  meeting starts       : an hour early
```

```
null control - future recurrences stored as local time plus zone
  validation failures    : 0, unchanged
  resolved at read time  : 486000
  instances now an hour out : 0
  the storage did not become more correct; the offset
  stopped being applied before the rule was known
```

```
what storing utc plus a zone guarantees
  a past moment is unambiguous : exactly
  a future intention survives  : not addressed; converting
    at write time consumes a rule that has not happened
    yet, and keeping the zone name beside the answer does
    not make the answer a question again
```

```
an instant is a fact and a future appointment is a promise
about a rule; store the one you were given, and resolve the
other as late as you can
```

Every row stores a UTC instant and an IANA zone, the pair everyone recommends, and the validator passes all 2140000 with 0 violations before and after. 3 zones changed their rules this year, so 61400 of 486000 future instances - 1263 per ten thousand - convert correctly to a local time that is an hour from the one somebody asked for, and no check can see it because the instant was a conclusion, not an observation.

Verify it yourself:

```bash
pnpm eml run examples/the-timezone-was-stored-and-the-rule-changed/the_timezone_was_stored_and_the_rule_changed.eml
```
