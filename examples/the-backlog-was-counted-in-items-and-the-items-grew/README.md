# The backlog was counted in items and the items grew

`the_backlog_was_counted_in_items_and_the_items_grew.eml` - The backlog is tracked as a count of unprocessed items, charted daily, and it has been flat for a year. What a flat count means is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Tracking it is better than not, and the chart is honest. The count is taken from the store rather than from the worker's own opinion, it is charted daily so a trend is visible rather than a snapshot, the target was agreed rather than assumed, and the number has genuinely not moved: the backlog held between eleven and thirteen thousand items every week of the year.

The count is of ITEMS. An item is a document to be indexed, and the mean document has grown from four kilobytes to thirty-one over the same year, because the product started accepting attachments.

The work is in the bytes.

```
items in the backlog            : 12000
days charted                    : 365
targets agreed with the business: 1
charts of the backlog in bytes  : 0
```

```
mean item, KB a year ago        : 4
mean item, KB now               : 31
  as a percent of then          : 775
alerts on the mean item size    : 0
```

```
backlog KB a year ago           : 48000
backlog KB now                  : 372000
  added while the count held flat : 324000
```

```
the backlog chart
  where the number comes from : the store, not the
    worker's own opinion
  charted : daily, so a trend is visible rather than a
    snapshot
  target : agreed, not assumed
  days charted : 365
  has the number moved : no; between eleven and thirteen
    thousand every week
  verdict : STABLE, AND HONESTLY MEASURED
```

```
  reading the count from the store rather than from the
  consumer is the difference between a metric and a
  self-report, and it was done
```

```
the counted unit
  what one item is : a document to be indexed
  what indexing one costs : proportional to its bytes
  mean bytes a year ago : 4 KB
  mean bytes now        : 31 KB
  why : the product started accepting attachments
  charts in bytes : 0
```

```
  the count is exact and the unit it counts changed size
  underneath it
```

```
what a flat line meant then and now
  a year ago : the workers keep up with the arrival rate
  now        : the workers keep up with an arrival rate
    carrying 775 percent of the bytes
  did anything about the chart change : no
  did anything about the system change : the work per
    item, by that factor
  bytes added while the line stayed flat : 
    324000 KB
```

```
the agreed target
  what it says : keep the backlog under a count
  when it was agreed : when an item was 4 KB
  what it constrains today : a queue holding 
    372000 KB
  was the target renegotiated : it did not appear to need
    renegotiating; the number it names is inside it
  alerts on the quantity that moved : 
    0
```

```
null control - plot the backlog in bytes as well
  items in the backlog : 12000, unchanged and still exact
  charts in bytes : 1
  alerts on the mean item size : 1
  the count did not become wrong; a second line appeared
  in the unit the work is denominated in
```

```
what a flat backlog count guarantees
  the number of unprocessed items is not growing :
    exactly, measured from the store, charted daily for
    365 days
  the backlog is not growing : not addressed; the count
    is in items and the work is in bytes, and nothing
    holds the conversion still
```

```
a count is a measurement only while the thing counted keeps
its size; where the unit can grow, a flat line records that
the growth was absorbed rather than that it did not happen
```

The chart is honestly built - read from the store rather than the worker, drawn daily for 365 days against an agreed target - and the count has genuinely not moved. It counts items, and the mean item went from 4 KB to 31, 775 percent of what it was, so 324000 KB entered the backlog while the line stayed flat, under 0 charts in bytes and 0 alerts on the size.

Verify it yourself:

```bash
pnpm eml run examples/the-backlog-was-counted-in-items-and-the-items-grew/the_backlog_was_counted_in_items_and_the_items_grew.eml
```
