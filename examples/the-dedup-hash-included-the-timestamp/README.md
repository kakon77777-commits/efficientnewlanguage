# The dedup hash included the timestamp

`the_dedup_hash_included_the_timestamp.eml` - The event store deduplicates by content hash, and the hashing is correct. What the hash is taken over is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The dedup is built carefully. The hash is a strong one; two records with the same bytes always get the same key; the key is the primary key, so a repeat is rejected at insert; and the store is exactly-once by construction on that key.

The hash is taken over the whole record, and the record carries received_at.

```
events received                 : 4000000
true duplicates among them      : 90000
  removed by the dedup          : 200
  that survived                 : 89800
distinct events by payload      : 3910000
events stored                   : 3999800
```

```
dedup effectiveness             : 22 per ten thousand
survivors in the store          : 224 per ten thousand
```

```
the content-hash dedup
  hash : a strong one
  same bytes : always the same key
  the key : the primary key, repeats rejected at insert
  guarantee on that key : exactly-once by construction
  identical records that collided correctly : all of them
  verdict : DEDUPLICATED
```

```
  making the hash the primary key is the part done right
  here, and it is why an exact byte-repeat cannot land
  twice
```

```
the bytes the hash covers
  what is included : the whole record
  what the whole record carries : received_at, stamped on
    arrival
  so the same event sent twice : arrives at two instants
    and hashes to two keys
  what same-bytes means here : same payload AND same
    receive time, which a resend never has
  duplicates the key could catch : only exact-instant
    collisions, 200 of them
```

```
the consumer reading the store
  events it treats as distinct : 3999800
  true duplicates hidden among them : 
    89800
  is the hash wrong : no; it is correct over the bytes it
    was given
  were those bytes the identity of the event : no; the
    timestamp made every resend unique
  dedup that actually happened : 
    22 per ten thousand of the duplicates
```

```
null control - hash the payload, not the arrival time
  removed with timestamp in the key : 
    200
  removed with the payload as the key : 
    90000
  events whose payload changed : 0
  no event and no hash function changed; the key stopped
  covering the field that a resend always changes
```

```
what a content-hash dedup guarantees
  identical bytes are stored once : exactly, the hash is
    the primary key and repeats are rejected at insert
  each event is stored once : not addressed; the dedup key
    hashes the whole record, and the record carries the
    receive timestamp, so the same event arriving twice
    gets two keys - 89800 of 90000 duplicates survived
```

```
a hash is an identity over the bytes it is given, and dedup wants identity over
the event; a field that changes on every arrival belongs outside the key, or
the key distinguishes exactly the copies it should merge
```

The hash is strong and is the primary key, so identical bytes cannot land twice - correct on its inputs. It covers received_at, so a resend hashes anew: 89800 of 90000 duplicates survived, and the dedup caught 22 per ten thousand of what it was there to catch.

Verify it yourself:

```bash
pnpm eml run examples/the-dedup-hash-included-the-timestamp/the_dedup_hash_included_the_timestamp.eml
```
