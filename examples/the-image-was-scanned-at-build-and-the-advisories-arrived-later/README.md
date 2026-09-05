# The image was scanned at build and the advisories arrived later

`the_image_was_scanned_at_build_and_the_advisories_arrived_later.eml` - Every image is scanned before it can be pushed and eleven builds were blocked this quarter. How many running images carry a known advisory is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The build gate is real. The scanner runs on the assembled image rather than on the manifest, it fails the build above a severity rather than warning, the severity threshold was argued about and set deliberately, and it has blocked eleven builds this quarter — each of which was a genuine finding that somebody then fixed.

A scan is a comparison against the advisory database AT THAT MOMENT. The image does not change afterwards and the database does, so what the scan establishes has a date on it.

The running images average forty-seven days old.

```
images in production            : 240
mean age, days                  : 47
builds blocked this quarter     : 11
```

```
advisories published since build: 118
  high or critical              : 14
  lower severity                : 104
  high share                    : 1186 per ten thousand
rescans of running images       : 0
```

```
the build scan
  runs on            : the assembled image, not the manifest
  on a finding       : fails the build, does not warn
  severity threshold : argued about and set deliberately
  builds blocked this quarter : 11
  each of those      : a genuine finding somebody fixed
  verdict            : GATED
```

```
  scanning the assembled image rather than the manifest is
  the stronger of the two and costs more to run
```

```
the comparison
  one operand : the image, which does not change
  the other   : the advisory database, which does
  when it was made : at build
  what it establishes : that this image had no known
    high-severity advisory ON THAT DAY
  what a reader takes from a green scan : that it has none
```

```
  the scan is not stale in the sense of being wrong; the
  proposition it proved has a date in it
```

```
in the 47 days since a mean image was built
  advisories against its packages : 118
  per day                         : about 2
  high or critical                : 14
  scans that would have seen them : 0
```

```
the coverage number
  images scanned before push : all
  coverage reported          : complete
  what it counts             : builds
  what is running            : images, for 47 days on average
  a metric over the second   : none defined
```

```
null control - a nightly rescan of what is running
  builds blocked   : 11, unchanged
  rescans per day  : 1
  findings surfaced: 14
  the build gate did not get stricter; the fleet became a
  population the scanner is pointed at
```

```
what a passing build scan guarantees
  this image had no known finding when it was built : exactly
  this image has no known finding                    : not
    addressed; one operand of the comparison keeps moving
    and the check was run once
```

```
a scan is a join against a database with a timestamp; gating
the build fixes the image and leaves the other side free, so
the answer decays at whatever rate advisories are published
```

The build gate is real and blocked 11 builds this quarter, each a genuine finding, scanning the assembled image and failing rather than warning. It compares against a database that has since published 118 advisories against these packages - 14 of them high or critical, 1186 per ten thousand - across images averaging 47 days old, with 0 rescans of anything that is running.

Verify it yourself:

```bash
pnpm eml run examples/the-image-was-scanned-at-build-and-the-advisories-arrived-later/the_image_was_scanned_at_build_and_the_advisories_arrived_later.eml
```
