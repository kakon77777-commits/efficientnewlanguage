# The hash was stable and the ring was not

`the_hash_was_stable_and_the_ring_was_not.eml` - The hash is stable and only one thirteenth of keys move when a node is added. How many requests reach the wrong node anyway is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Consistent hashing does what it promises. The hash is deterministic across processes, languages and restarts; adding the thirteenth node moves one thirteenth of the keyspace and leaves the rest where it was. The alternative - hashing modulo the node count - would move almost everything, and this is exactly the property the design was chosen for.

The placement is hash AND ring. The hash is one function; the ring is a list of members, and each client builds its own from a registry it polls on its own schedule. Two clients holding different lists compute different owners from the same stable hash.

The registry poll is sixty seconds with jitter. For three minutes after the node joins, both rings are in use.

```
keys                        : 40000000
nodes before                : 12
nodes after                 : 13
keys that move              : 3076923
```

```
rollout window, seconds     : 180
requests in the window      : 46800000
requests for moved keys     : 3600000
  reached the other node    : 1742000
  read a stale value        : 611000
```

```
the hash function
  same key, same point     : always
  across processes         : identical
  across restarts          : identical
  disagreements observed   : 0
  keys moved by the join   : 3076923, one thirteenth
  verdict                  : STABLE
```

```
  every line holds, and modulo hashing would have moved
  almost all 40000000
```

```
placing one key
  hash of the key   : one function, everywhere the same
  ring of members   : a list, per client, polled
  owner             : the first member clockwise of the hash
```

```
  the stable input is combined with an unstable one, and
  the result is only as agreed as the second
```

```
share of the window misrouted : 372 per ten thousand
```

```
after the window closes
  entries for a moved key : two, on two nodes
  the stale one expires   : at its own ttl, not before
  invalidation reaches it : only from a client whose ring
    still names the old owner
```

```
null control - the ring version carried on the request
  keys that move        : 3076923, unchanged
  refused and retried   : 1742000
  read a stale value    : 0
  the hash did not change and neither did the poll; the
  node stopped answering for keys it does not own
```

```
what a stable hash guarantees
  a key maps to the same point everywhere : exactly
  a key maps to the same NODE everywhere  : not addressed;
    the node comes from the point and a membership list,
    and only one of those two is a function
```

```
consistent hashing bounds how much moves, not when; the
disagreement window is the propagation delay of the member
list, and nothing in the hash shortens it
```

The hash is stable and the join moved exactly one thirteenth of the keyspace: 3076923 of 40000000 keys, 0 disagreements about any key's point. During the 180-second poll window 1742000 requests - 372 per ten thousand - reached the node their own client's ring named rather than the one the key had moved to, 611000 of them reading a value the new owner had already replaced.

Verify it yourself:

```bash
pnpm eml run examples/the-hash-was-stable-and-the-ring-was-not/the_hash_was_stable_and_the_ring_was_not.eml
```
