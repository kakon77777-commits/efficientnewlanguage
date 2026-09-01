# The audit log was append only and the reader filtered

`the_audit_log_was_append_only_and_the_reader_filtered.eml` - The audit log is append-only, hash-chained, and nothing has ever been removed from it. How much of it anybody has read is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The integrity is genuine. Every entry carries the hash of the one before it, the chain is verified nightly over all forty-one million eight hundred thousand links, and a deliberate tamper drill last quarter was detected in under a second. There is no delete path in the code and no operator has one.

Tamper-evidence is a property of the STORE. What anyone sees is a query, and the query has a default, and the default was chosen to make the page load.

The console filters to human actors. The service accounts do ninety-two percent of the writing, and every event in last week's incident was one.

```
entries in the log          : 41800000
  by human actors           : 3200000
  by service accounts       : 38600000
entries removed             : 0
```

```
the nightly chain verification
  links checked        : 41800000
  chain breaks found   : 0
  delete path in code  : none
  operator delete permission : none
  tamper drill last quarter  : detected in under a second
  verdict              : APPEND-ONLY, INTACT
```

```
  the drill is why anyone trusts this, and it worked
```

```
the default view
  filter        : actor type is human
  chosen because: the unfiltered page timed out
  entries shown : 3200000
  share shown   : 765 per ten thousand
  entries hidden: 38600000
```

```
  hidden is not deleted, and for a reader the difference
  only exists if somebody changes the filter
```

```
the review
  events that exist for the incident : 14
  events visible in the default view : 0
  the reviewer's conclusion : no audit trail
  the log's own answer      : all 14 present, chain intact
```

```
  both are honest reports of different questions
```

```
null control - paginate instead of filter
  chain breaks found     : 0, unchanged
  entries reachable      : 41800000
  incident events visible: 14
  the log did not become more complete; the default
  stopped removing most of it
```

```
what an append-only log guarantees
  nothing that was written is gone : exactly
  what happened can be found       : not addressed;
    findability is a property of the query, and the query
    has a default that no integrity check inspects
```

```
tamper-evidence answers 'was this changed'; it is used to
answer 'what happened', and between those two sits a filter
somebody set for a page-load time
```

The log is append-only and the nightly verification is right: 41800000 links, 0 breaks, 0 entries removed, no delete path, a tamper drill caught in under a second. The console defaults to human actors, which is 765 per ten thousand of it, so 38600000 entries are present and unseen - including all 14 events of last week's incident, reviewed as having no audit trail.

Verify it yourself:

```bash
pnpm eml run examples/the-audit-log-was-append-only-and-the-reader-filtered/the_audit_log_was_append_only_and_the_reader_filtered.eml
```
