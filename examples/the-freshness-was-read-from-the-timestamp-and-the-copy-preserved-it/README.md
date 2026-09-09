# The freshness was read from the timestamp and the copy preserved it

`the_freshness_was_read_from_the_timestamp_and_the_copy_preserved_it.eml` - Every feed in the data lake is watched for staleness against a six-hour SLA, the check runs every five minutes, and in twenty months it has caught thirty-one real outages. What the check reads is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The monitor is well built. It runs on its own schedule rather than inside the pipeline it watches, so a pipeline that stops entirely still gets noticed; the six-hour SLA was argued down from twenty-four with the teams who consume the data; every alert has a runbook and every alert has been actioned.

It reads each file's modification time. The ingestion copies from the vendors with timestamps preserved, so that time is the vendor's write time, and the vendor's export job rewrites the file on every run whether or not anything in it changed.

```
feeds monitored                 : 1240
staleness SLA                   : 6 hours
checks per feed per day         : 288
months the monitor has run      : 20
real outages caught             : 31
```

```
days observed                   : 90
feeds that repeated content     : 47
  from a rewriting vendor       : 41
  the monitor saw               : 6
  detection                     : 1276 per ten thousand
```

```
feeds whose export rewrites     : 214
  share of monitored            : 1725 per ten thousand
feeds compared by content       : 0
alerts for repeated content     : 0
```

```
the staleness monitor
  runs : outside the pipeline it watches, so a pipeline
    that stops entirely is still noticed
  SLA : 6 hours, argued down from 24 with the teams
    that consume the data
  cadence : 288 checks per feed per day
  every alert : has a runbook, and has been actioned
  real outages caught in 20 months : 31
  verdict : WATCHED
```

```
  running it outside the pipeline is the part almost
  nobody does, and it is why the 31 are real
```

```
two objects
  what the monitor reads : the file's modification time
  what the question is about : whether the contents are
    today's
  when they agree : whenever the timestamp moves only
    because the content did
  feeds where that holds : 1026
  feeds where it does not : 214, whose export
    rewrites the file every run
```

```
  the copy preserves the vendor's timestamp, so the
  monitor reads a clock the vendor moves on a schedule
  of its own
```

```
a feed that repeated yesterday's rows
  did the file arrive : yes, on time
  did the modification time move : yes, the export
    rewrote it
  was it inside the SLA : yes, by hours
  did the monitor alert : no
  did anything compare the bytes : no; 0 feeds are
    compared by content
```

```
repeats over 90 days
  feeds that served yesterday's content again : 47
  of those, from a rewriting vendor : 41
  the monitor saw the rest : 6, whose timestamp
    stayed put and went past 6 hours
  detection : 1276 per ten thousand
```

```
  the 6 were caught by the timestamp failing to move,
  which is the monitor working exactly as specified
```

```
null control - store a content hash, compare deliveries
  real outages caught : 31, unchanged
  feeds compared by content : 1240
  alerts for repeated content : 41
  the monitor did not get better at reading timestamps;
  a second instrument was pointed at the object the
  question was always about
```

```
what a green staleness board guarantees
  every feed has a file whose recorded modification time
    is inside 6 hours : exactly, 288 times a day
  every feed has current data : not addressed; the
    timestamp is written by the vendor's export and the
    copy preserves it
```

```
an instrument that reads one object answers about that
object; the reading is correct and the question was about
the other one, and nothing here compares it
```

The monitor runs outside the pipeline, checks 288 times a day, and has caught 31 real outages in 20 months. It reads the modification time, which the copy preserves from a vendor export that rewrites the file every run, so of 47 feeds that served yesterday's content again it saw 6 - 1276 per ten thousand - and 0 feeds are compared by content.

Verify it yourself:

```bash
pnpm eml run examples/the-freshness-was-read-from-the-timestamp-and-the-copy-preserved-it/the_freshness_was_read_from_the_timestamp_and_the_copy_preserved_it.eml
```
