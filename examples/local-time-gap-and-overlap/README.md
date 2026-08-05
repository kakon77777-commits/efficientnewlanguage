# Local time gap and overlap — a label, not an instant

`local_time_gap_and_overlap.eml` maps local times to instants across a
spring-forward and an autumn-back transition, and counts how many local
times survive a round trip.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the map between local times and instants is neither
total nor one-to-one, and the corpus's checks measure both failures
directly:

```
local times that survive a round trip on a spring day: 1380/1440
instants that survive one:                             1440/1440
```

Sixty local times do not exist; on the autumn day, sixty happen twice. In
the overlap, two events written as local 02:30 map to **2** distinct
instants, so they cannot be ordered from the local time alone — and with an
offset recorded they can: `02:30+01` precedes `02:30+00`.

This case corrected one of its own assertions during authoring. The first
version asserted that a local instant is unchanged across the transition;
it is not — the correct value shifts by the offset, because the offset
after the transition differs from the offset before it. The check now
carries the measured values and the reason.

Everything downstream — the job that runs twice, the timestamp that cannot
be ordered, the duration that is not a day — is that one fact, and it is
invisible on 363 days out of 365.

Verify it yourself:

```bash
pnpm eml run examples/local-time-gap-and-overlap/local_time_gap_and_overlap.eml
```

```bash
pnpm eml trace examples/local-time-gap-and-overlap/local_time_gap_and_overlap.eml --run
```
