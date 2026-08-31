# The checksum matched and the file was truncated

`the_checksum_matched_and_the_file_was_truncated.eml` - The stored object passes its integrity check on every pass, and has done for months. How much of the file is there is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The upload is checksummed end to end. The client streams the object, the store computes a digest over the bytes it receives, and every later verification recomputes that digest and compares. It has never disagreed. This is not a weak check: it catches a single flipped bit anywhere in six gigabytes, and it caught two of them last quarter on failing disks.

A checksum answers "are these the bytes I already had". It is computed over what ARRIVED, and it is stored beside what arrived. Nothing in that loop knows what was sent.

The connection dropped at seventy-two percent. The store had a complete, self-consistent object at that moment, and it wrote the digest of it.

```
records at the source     : 240000000
records in the object     : 172600000
records not there         : 67400000
```

```
bytes at the source       : 8640000000
bytes in the object       : 6213600000
bytes not there           : 2426400000
```

```
the integrity check, run nightly
  stored digest    : matches the recomputed digest
  passes so far    : 412
  failures         : 0
  bit flips caught last quarter : 2
  verdict          : INTACT
```

```
  the check is real; it found two corrupted blocks on
  failing disks and it would find a third
```

```
the two values the check reads
  digest recomputed over : the stored bytes
  digest on record       : computed over the same stored bytes
  bytes the client sent  : not recorded anywhere
  length the client meant: never declared
```

```
  both operands come from the same side of the transfer,
  so agreement is a fact about storage, not about arrival
```

```
share of the file absent : 2808 per ten thousand
```

```
the nightly aggregate over this object
  rows read      : 172600000
  rows expected  : the reader has no expectation
  errors raised  : 0
  the total it reports is a true total of what it read
```

```
null control - the same drop, with a declared length
  object committed on the short write : no
  records stored at that moment       : 0
  records after the retry             : 240000000
  the digest did not get better; a second value
  arrived for it to disagree with
```

```
what a matching checksum guarantees
  these bytes are unchanged since they were stored : exactly
  these bytes are all the bytes there were         : not
    addressed, and cannot be, because the quantity that
    would settle it was never transmitted
```

```
integrity and completeness are different questions; a digest
answers the first, and only a length or a terminator the
sender chose can answer the second
```

The object is intact and the nightly check is right to say so: 412 passes, 0 failures, and 2 real corruptions caught last quarter. It holds 172600000 of 240000000 records - 2808 per ten thousand of the file is absent - and every aggregate built on it reports a true total of what is there, because the digest was computed after the connection dropped and agrees with itself.

Verify it yourself:

```bash
pnpm eml run examples/the-checksum-matched-and-the-file-was-truncated/the_checksum_matched_and_the_file_was_truncated.eml
```
