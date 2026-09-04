# The search index was fresh and the permissions were cached

`the_search_index_was_fresh_and_the_permissions_were_cached.eml` - A document is searchable two seconds after it is written and the freshness is measured continuously. How old the access rules in the index are is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The indexing pipeline is fast and it is watched. Writes are streamed rather than batched, the end-to-end lag from commit to searchable is measured on every document rather than sampled, the alert fires above five seconds, and it has fired twice this year for real reasons. Two seconds is a measured median and the tail is bounded.

What is indexed is the document AND a copy of who may see it, because filtering results by permission at query time against the authorization service would put a network call inside every hit.

A document is re-indexed when its CONTENT changes. Permissions are not content.

```
documents                      : 41000000
index lag, seconds             : 2
documents re-indexed per day   : 240000
permission changes per day     : 18400
```

```
days until a document is touched : 170
mean wait for a permission change: 85 days
```

```
the indexing pipeline
  writes streamed, not batched : yes
  lag measured on every document : yes, not sampled
  median lag, seconds          : 2
  alert above five seconds     : yes
  fired this year for real reasons : 2
  verdict                      : FRESH
```

```
  measuring every document rather than a sample is the
  expensive choice and it was made deliberately
```

```
the two things in an index entry
  the content   : re-indexed when it changes, in 2 s
  the access rule : copied in at index time, so that a
    query can filter without a network call per hit
  what re-indexing is triggered by : a content change
  what a permission change triggers : nothing
```

```
  the copy is there for a good reason and the trigger was
  written for the other field
```

```
permission changes waiting in the index : about 1564000
```

```
a reader whose access was revoked
  opening the document : refused, the service is current
  the document in results : present
  the title             : shown
  the snippet           : shown, and it is the matched text
  what that reveals     : the existence, the name, and the
    passage containing the searched term
```

```
null control - a permission change re-indexes its documents
  median content lag, seconds : 2, unchanged
  permission lag, seconds     : 2
  changes waiting             : 0
  the pipeline did not get faster; the second field in
  the entry got a trigger of its own
```

```
what a fresh index guarantees
  the content is current : exactly, and measured per document
  the entry is current   : not addressed; an entry has more
    than one field and only one of them has a trigger
```

```
a freshness metric measures the field its trigger fires on;
anything else copied into the same record ages silently, and
the copy exists precisely because reading it live was too
expensive
```

The index is fresh and measured on every document: streamed writes, a 2 second median, an alert above five that has fired 2 times this year for real reasons. Re-indexing is triggered by a content change, so with 240000 documents touched a day out of 41000000, a permission change waits about 85 days, roughly 1564000 of them in flight, while the title and the matching snippet stay visible.

Verify it yourself:

```bash
pnpm eml run examples/the-search-index-was-fresh-and-the-permissions-were-cached/the_search_index_was_fresh_and_the_permissions_were_cached.eml
```
