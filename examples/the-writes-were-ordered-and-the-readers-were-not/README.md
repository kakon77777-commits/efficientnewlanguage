# The writes were ordered and the readers were not

`the_writes_were_ordered_and_the_readers_were_not.eml` - Two writes are committed in order to a primary, and the second is never visible without the first. What a reader sees is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Ordering the writes is correct and it is the guarantee the storage layer sells. A single primary applies transactions in a total order, the log records that order, and every replica applies the log in it. There is no interleaving to reason about and no window where the second landed and the first did not. The database is doing exactly what its documentation says.

A total order on writes is a statement about the log. It says nothing about how far along that log any particular reader is standing.

Both facts hold at once: no replica ever sees the second write before the first, and two replicas can be at different points, so two readers can disagree about whether either happened.

```
replicas             : 3
reads per minute     : 120000
writes in the pair   : 2
replication lag p50  : 900 ms
replication lag p99  : 4200 ms
```

```
the guarantee, checked
  replicas that applied write 2 before write 1 : 0
  replicas that applied write 1 twice          : 0
  replicas whose log order differs from the primary : 0
  ordering violations of any kind : 0
```

```
  the guarantee holds on every replica, at every moment
```

```
reader state         write 1   write 2   consistent with the order
  caught up            seen      seen      yes
  one behind           seen      not yet   yes
  two behind           not yet   not yet   yes
  impossible           not yet   seen      would be a violation
```

```
  three legal states, and the application was written
  expecting one of them
```

```
reads issued while a replica is behind
  within a p50 lag of 900 ms  : 1800
  within a p99 lag of 4200 ms : 8400
```

```
  each of those reads is served correctly from a consistent
  snapshot of a correctly ordered log
```

```
a user updates a setting and the page reloads
  write goes to the primary        : committed
  reload is routed to a replica    : by the load balancer, for read scaling
  replica lag at that instant      : 900 ms
  page render time after the write : 300 ms
  setting shown                    : the old one
```

```
  the window where this happens : 600 ms wide, per write
  reads that fall in it : 1200 per minute
```

```
what the storage layer tests
  log order preserved on replay : yes, continuously
  replica divergence            : checked, 0
  which replica a client read from : not its concern
```

```
what the application tests
  write then read, same connection : passes, hits the primary
  write then read, new connection  : passes in the test, the
    test environment has one node
```

```
  neither side has a test whose two halves touch two nodes
```

```
what would close it
  read the primary after a write     : correct, and gives up the read scaling
  wait for the replica to catch up   : correct, costs 900 ms on that path
  carry the write position and read at or past it : correct, and the
    position is already in the log the writes are ordered by
```

```
  the third uses the ordering that already exists, rather than
  asking for a stronger one
```

```
control - did ordering hold
  read observations checked : 360000 per minute
  observations showing write 2 without write 1 : 0
  torn or partial writes : 0
  defects in replication : 0
```

```
  the guarantee is exactly as strong as advertised, and it is
  a guarantee about pairs of writes, not about pairs of reads
```

```
null control - the same system reading from the primary
  ordering violations : 0
  replicas            : 3, still replicating, still in order
  reads served from a lagging point : 0
  the ordering did not get stronger; the readers stopped moving
```

```
what a total order on writes settles
  the sequence writes are applied in : completely
  that every replica uses it         : completely
  where a given reader is in it      : not addressed
  and a read is a position, not an ordering question
```

```
the missing value is not a stronger consistency level;
it is the position of the write, carried to the read
```

Across 360000 read observations a minute on 3 replicas, the number that saw the second write without the first is 0, and the number of ordering violations of any kind is 0. Replication lag is 900 ms at p50, so about 1800 reads a minute are served from a point earlier in that same correct order, and a user reloading 300 ms after their own write reads a replica that is 600 ms short of it.

Verify it yourself:

```bash
pnpm eml run examples/the-writes-were-ordered-and-the-readers-were-not/the_writes_were_ordered_and_the_readers_were_not.eml
```
