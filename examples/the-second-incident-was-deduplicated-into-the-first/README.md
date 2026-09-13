# The second incident was deduplicated into the first

`the_second_incident_was_deduplicated_into_the_first.eml` - Every distinct alert fingerprint paged on-call this shift, and the dedup that suppressed the rest removed only exact repeats. What a fingerprint groups together is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The deduplication is sensible. It groups alerts by a fingerprint so a flapping check does not page a hundred times; it holds the group open only while the condition persists; it pages once per new fingerprint; and it is why on-call is not drowned in noise.

The fingerprint is the service plus the error class, and two different incidents shared one.

```
dedup window                    : 4 hours
distinct incidents              : 2
  alerts paged                  : 1
  suppressed as duplicates      : 1
  reached nobody                : 1
second incident went unpaged for: 140 minutes
incidents lost                  : 5000 per ten thousand
```

```
the alert dedup
  groups by : a fingerprint
  holds a group open : while the condition persists
  pages : once per new fingerprint
  purpose : a flapping check does not page a hundred times
  exact repeats suppressed : as designed
  verdict : NOISE CONTROLLED
```

```
  holding one page for a persisting condition is the part
  done right here, and it is why on-call is not drowned
```

```
the fingerprint
  what it is : the service plus the error class
  what it assumes : the same fingerprint is the same
    incident, recurring
  what happened : two incidents, different root causes,
    same service and error class
  so the second : matched the first's open group
  and was treated as : a repeat of an incident already
    being handled
```

```
the second incident
  its own root cause : different from the first
  the page it generated : suppressed as a duplicate
  minutes it ran unattended : 140
  is the dedup rule wrong : no; the fingerprints did
    match
  is a matching fingerprint the same incident : not
    always, and here it was not
```

```
null control - fingerprint plus a correlation id
  alerts, fingerprint alone : 
    1
  alerts, with a correlation id : 
    2
  incidents lost : 0
  no alert changed its content; the key stopped collapsing
  two causes that share a surface
```

```
what per-fingerprint dedup guarantees
  every distinct fingerprint pages once : exactly, held
    open while the condition persists
  every incident pages someone : not addressed; alerts
    dedup by fingerprint, and two distinct incidents shared
    one - the second was suppressed as a duplicate and went
    140 minutes unpaged
```

```
a fingerprint is a guess that sameness of surface is sameness of cause, and
dedup acts on the guess; when two causes wear one face, silencing the repeat
silences the second incident
```

It pages once per fingerprint and holds the group while the condition persists - noise controlled. The fingerprint is service plus error class, and two distinct incidents shared it, so the second was suppressed as a duplicate: 140 minutes unpaged, 5000 per ten thousand of incidents reaching nobody.

Verify it yourself:

```bash
pnpm eml run examples/the-second-incident-was-deduplicated-into-the-first/the_second_incident_was_deduplicated_into_the_first.eml
```
