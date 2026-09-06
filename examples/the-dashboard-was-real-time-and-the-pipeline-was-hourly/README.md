# The dashboard was real time and the pipeline was hourly

`the_dashboard_was_real_time_and_the_pipeline_was_hourly.eml` - The dashboard refreshes every five seconds over a push connection and shows when it last updated. What that timestamp is the age of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The page is genuinely live. It is not a screenshot and not a five-minute poll: a push connection delivers the new value, the query behind it returns in tens of milliseconds, and the page carries a visible last-updated timestamp rather than leaving the reader to guess. Somebody built that deliberately, and every part of it is true.

The timestamp says when the PAGE refreshed. The table it reads is written by a batch that runs once an hour and takes fourteen minutes, so the freshest number the page can show was computed some time ago and the page has no way to say so.

Four of the six alerts wired to this table have windows shorter than an hour.

```
refresh interval, seconds       : 5
query to pixel, ms              : 40
timestamps shown on the page    : 1
  showing when data was produced: 0
```

```
pipeline interval, minutes      : 60
pipeline runtime, minutes       : 14
worst case data age, minutes    : 74
  in seconds                    : 4440
  the displayed age is          : 11 per ten thousand of it
```

```
alerts wired to this table      : 6
  window shorter than the interval : 4
  share                         : 6666 per ten thousand
```

```
the live page
  transport : a push connection, not a poll
  refresh interval, seconds : 5
  query to pixel, ms        : 40
  does it show its own freshness : yes, a visible
    timestamp rather than nothing
  is that timestamp correct : exactly correct
  verdict : LIVE
```

```
  showing a last-updated time at all is more than most
  dashboards do and the number in it is right
```

```
the timestamp
  measures : the interval between now and the last refresh
  what refreshed : the page
  what did not refresh : the table, which the batch owns
  when the batch last wrote : up to 74 minutes ago
  a timestamp for that : 0
  where the data would have to carry it : in the rows
```

```
  the page is fresh with respect to the table and the
  reader is asking about the world
```

```
the two clocks on this page
  time since the page refreshed : 5 seconds, displayed
  time since the number was true : up to
    74 minutes, not displayed
  ratio between them : the first is
    11 per ten thousand of the second
  which one the reader is shown : the first
  which one the reader is using : the second
```

```
the batch stops
  page refreshes : continue
  query errors   : none, the table is still there
  timestamp shown : still seconds old
  values shown    : the last batch's, indefinitely
  what would change on the page : nothing
  what would have to change for it to show : a timestamp
    carried by the data rather than by the request
```

```
the alerts on this table
  wired to it : 6
  with a window shorter than the interval : 4
  what a window shorter than the interval means : the
    condition is evaluated over a period the source
    cannot have observed separately
  are those alerts firing wrongly : no; they fire late
    and correctly, on the batch that carries the change
  what the page implies about their latency : seconds
```

```
null control - the page shows the data's own timestamp
  refresh interval : 5 seconds, unchanged
  timestamps showing when data was produced : 1
  age the page displays, minutes : up to 74
  the page did not get slower or faster; it started
  reporting the age of the answer instead of the age of
  the question
```

```
what a live dashboard guarantees
  what you see is what the table holds, now : exactly,
    within 40 ms, over a push connection
  what you see is what is happening now     : not
    addressed; the page is one hop from the reader and
    the batch is the hop that carries the age
```

```
freshness composes along a chain and a display can only
measure its own link; a timestamp attached to the fetch is
a property of the fetch, and the one a reader needs has to
be produced where the value was
```

The page is genuinely live: a push connection, 40 ms from query to pixel, and a visible last-updated timestamp that is exactly correct about the refresh. The table under it is written by a batch every 60 minutes taking 14, so the displayed age is 11 per ten thousand of the 74-minute worst case, with 0 timestamps for the data itself and 4 of 6 alerts - 6666 per ten thousand - watching windows shorter than the interval that feeds them.

Verify it yourself:

```bash
pnpm eml run examples/the-dashboard-was-real-time-and-the-pipeline-was-hourly/the_dashboard_was_real_time_and_the_pipeline_was_hourly.eml
```
