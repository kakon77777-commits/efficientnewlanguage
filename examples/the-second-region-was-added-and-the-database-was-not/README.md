# The second region was added and the database was not

`the_second_region_was_added_and_the_database_was_not.eml` - A second region was added and static content there is twenty-five times faster. Dynamic pages are slower than before. What moved and what did not is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Adding the region was correct and it delivered what it was justified on. TLS terminates near the user, static assets are served locally, and the application tier is no longer a single point of failure. Every number in the proposal was met. Nothing about the region is misconfigured.

A page is not one round trip. The application tier moved; the data it needs did not, so each query that used to cross a rack now crosses an ocean, and a page issuing eighteen of them pays that distance eighteen times.

The proposal measured the thing that moved.

```
queries per dynamic page   : 18
query, same region         : 2 ms
query, across the ocean    : 140 ms
```

```
static content, the thing the region was for
  before : 40 ms
  after  : 8 ms
  faster by : 5 point 0 times
  application tier single point of failure : removed
```

```
  the proposal promised both of those and delivered both
```

```
a dynamic page, in query time
  region one : 18 queries at 2 ms = 36 ms
  region two : 18 queries at 140 ms = 2520 ms
  added      : 2484 ms
```

```
  slower by : 70 point 0 times
```

```
per page load in region two
  saved on static content : 32 ms
  added on queries        : 2484 ms
  net                     : 2452 ms slower
```

```
  the cost is 77 times the saving, and the saving is the
  number the proposal was measured against
```

```
pages by query count, in region two
queries   region one   region two   added
  6        12 ms       840 ms      828 ms
  12        24 ms       1680 ms      1656 ms
  18        36 ms       2520 ms      2484 ms
  24        48 ms       3360 ms      3312 ms
  30        60 ms       4200 ms      4140 ms
```

```
  a distance is paid once per round trip, and nothing in the
  region's own metrics counts round trips per page
```

```
instrument                      reads
  region two edge latency       8 ms, excellent
  region two app CPU            healthy
  database latency, as measured at the database  2 ms
  cross-region link             within budget
  page time in region two       2520 ms
```

```
  the database reports 2 ms and is right: it measures from
  arrival to response, and the ocean is not inside that
```

```
control - did the second region deliver
  static content faster            : yes, 5 point 0 times
  app tier no longer single-region : yes
  failed deploys to region two     : 0
  misconfigurations                : 0
  defects in the region            : 0
```

```
  removing the region gives back the 32 ms and returns the
  single point of failure
```

```
null control - the same region with a local read replica
  query latency  : 2 ms
  page time      : 36 ms
  static content : 8 ms, unchanged
  net against region one : 32 ms faster
  the region was never the problem; the distance to the data was
```

```
what adding a region moves
  where the request is terminated : yes
  where the computation happens   : yes
  where the data is               : only if that was part of it
  and a page's cost is the number of times it crosses whatever
  distance is left
```

```
the figure that predicts this is not latency, it is round
trips per page multiplied by the distance not removed
```

The region delivered what it was justified on: static content 5 point 0 times faster, 32 ms saved per load, the app tier no longer single-region, 0 misconfigurations. A dynamic page issues 18 queries, and each one now crosses an ocean, so page query time goes from 36 to 2520 ms - 2484 ms added against 32 saved, 77 times the number the proposal was measured on.

Verify it yourself:

```bash
pnpm eml run examples/the-second-region-was-added-and-the-database-was-not/the_second_region_was_added_and_the_database_was_not.eml
```
