# The precision was set by the narrowest hop

`the_precision_was_set_by_the_narrowest_hop.eml` - Five systems carry a timestamp and each documents its own resolution. Which one the chain has is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Each system chose its resolution for a reason and each is documented. Seconds are enough for an audit log, milliseconds for a request trace, microseconds for a profiler. Nobody picked a coarse unit carelessly, and each is correct about itself.

A value that passes through all of them comes out with the resolution of the coarsest one it touched, whatever the others store. The chain's precision is a minimum over the hops, and it is documented in none of them, because each document describes one hop.

The chain is computed from the hops rather than read off any of them.

```
hop            ticks per second   resolution
  client sdk   1000000            microseconds
  ingest api   1000            milliseconds
  queue   1000            milliseconds
  archive   1            seconds
  report   1000            milliseconds
```

```
the chain's resolution is set by archive at 1 ticks per second
```

```
a timestamp of 1234567 microseconds past the second
  after client sdk : 1234567 microseconds
  after ingest api : 1234000 microseconds
  after queue : 1234000 microseconds
  after archive : 1000000 microseconds
  after report : 1000000 microseconds
```

```
  lost through the chain : 234567 microseconds
```

```
what each hop can honestly claim
  client sdk : stores to 1 microseconds, which is true
  ingest api : stores to 1000 microseconds, which is true
  queue : stores to 1000 microseconds, which is true
  archive : stores to 1000000 microseconds, which is true
  report : stores to 1000 microseconds, which is true
  none of these is wrong and none of them describes the chain
```

```
two events 500 microseconds apart
  at the chain's resolution they are 1 and 1
  the same tick, so their order is not recoverable downstream
  the profiler that produced them can tell them apart and the archive
  that keeps them cannot
```

```
hops finer than the chain : 4 of 5
  each of those is storing digits that the chain has already lost or is
  about to lose, and each of them is meeting its own specification
```

```
upgrading the archive to milliseconds
  the chain's resolution becomes 1000 ticks per second
  which is 1000 times finer
  and the client sdk's microseconds are still not reaching the report,
  because the minimum moved rather than went away
```

```
control - three hops all at 1000 ticks per second
  the chain : 1000
  the same as every hop, so reading any one document gives the right
  answer and the minimum is invisible because it is not doing anything
```

Every hop documents its own resolution correctly. The chain has the smallest of them, and that is a fact about the set rather than about any member of it.

Verify it yourself:

```bash
pnpm eml run examples/the-precision-was-set-by-the-narrowest-hop/the_precision_was_set_by_the_narrowest_hop.eml
```
