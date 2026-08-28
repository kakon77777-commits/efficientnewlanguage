# The record was corrected and the derived copy was not

`the_record_was_corrected_and_the_derived_copy_was_not.eml` - Three hundred and forty records were corrected this quarter, each one verified against the source document. How many of the five places that hold a copy received the correction is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The correction process is careful and it works. Each change is reviewed against the original document, applied in a single transaction, recorded in an audit trail with the reviewer's name, and reflected immediately in the system of record. Anyone querying the source gets the corrected value from the moment it is applied. That part has never failed.

The copies were all built while this data was append-only. A search index that rebuilds nightly, a warehouse that reloads nightly, a feature set computed at training time, a document generated once and sent, and a partner feed that subscribes to creation events. Every one of those designs is reasonable for data that only ever grows.

A correction is not an append. It is the first operation these pipelines were not built for, and each of them handles it in the way its own design implies - which for three of the five is not at all.

```
corrections this quarter : 340
```

```
copy                  refresh mechanism                  receives corrections
  search index       nightly full rebuild        yes
  reporting warehouse       nightly full ETL        yes
  model features      recomputed at training, quarterly   no
  sent documents      generated once, delivered   no
  partner feed      subscribes to created events   no
```

```
  copies that receive corrections : 2 of 5
  copies that do not              : 3
  wrong records in each of those  : 340
  wrong records across them       : 1020
```

```
why the search index and the warehouse are correct
  designed to propagate corrections : no
  mechanism                         : both discard and re-read everything
  so a correction arrives the same way an insert does
  the property is a side effect of full reload, not a feature
  moving either one to incremental refresh would silently join the other
  three, and incremental refresh is the standard optimisation
```

```
the partner feed
  events it subscribes to : created
  event a correction emits: updated
  events dropped          : 0
  errors logged           : 0
  deliveries              : exactly the ones it asked for
  the subscription is working perfectly and does not include this
```

```
copy                  time until a correction reaches it
  search index          under 24 hours
  reporting warehouse   under 24 hours
  model features        until the next quarterly retrain
  sent documents        never, they are already delivered
  partner feed          never, no event matches
```

```
  two of the five have no path at all, so 'eventually' does not apply
```

```
the audit trail
  corrections recorded  : 340
  corrections applied   : 340
  discrepancies         : 0
  copies it mentions    : 0
  it is a complete record of what happened to the source
```

```
control - is the correction applied to the source
  records corrected          : 340
  records showing the new value on query : 340
  failed applications        : 0
  the process is correct, reviewed, and audited
```

```
  and 'corrected' is a claim about one store out of six
```

```
null control - the same five copies over append-only data
  corrections            : 0
  copies out of date     : 0
  designs that are wrong : 0 of 5
  same pipelines, same subscriptions, same refresh schedules
  every one of them is correct until an update exists
```

```
a derived copy, and the operation it was built for
  insert    every copy handles it, that is what they were built for
  correct   handled only by copies that discard and re-read
  delete    the same, and usually worse
  the copies that work do so accidentally, through full reload
  and full reload is the thing an optimisation removes
```

```
the question is not 'is the correction applied'
it is 'list every place this value is held, and name the path a correction
takes to each one'; three of the five paths here do not exist
```

Every correction is reviewed against the source document, applied in one transaction, and recorded with the reviewer's name - and the system of record is right from that moment. 2 of the 5 copies pick it up, both by discarding and re-reading everything rather than by carrying a correction. The other three hold 1020 values that the audit trail records as corrected.

Verify it yourself:

```bash
pnpm eml run examples/the-record-was-corrected-and-the-derived-copy-was-not/the_record_was_corrected_and_the_derived_copy_was_not.eml
```
