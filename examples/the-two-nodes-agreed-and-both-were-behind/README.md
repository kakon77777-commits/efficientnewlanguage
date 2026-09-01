# The two nodes agreed and both were behind

`the_two_nodes_agreed_and_both_were_behind.eml` - Every read is confirmed by two replicas that agree, and they do agree. How old the answer is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The quorum is correctly implemented. A read is not returned until two of the three replicas have answered with the same value; a disagreement is detected, logged and retried against the third; and a deliberate corruption drill on one replica was caught on the first read. Two out of three is a real check and it is doing real work.

Agreement is a statement about two ANSWERS. It says the two replicas hold the same bytes. It does not say when either of them last heard from the leader, and two replicas behind by the same amount agree perfectly.

The client asks the two fastest. The current replica is the slow one, because applying the write stream is what makes it slow.

```
replicas                     : 3
quorum                       : 2
replica A lag, seconds       : 41
replica B lag, seconds       : 43
replica C lag, seconds       : 0
```

```
p99 of A and B, ms           : 12
p99 of C, ms                 : 180
writes the quorum cannot see : 139400
```

```
the quorum check
  replicas that must agree : 2
  disagreements this week  : 0
  corruption drill on one replica : caught on the first read
  reads served per second  : 26000
  verdict                  : CONSISTENT
```

```
  the drill is why this is trusted, and it found the
  corruption immediately
```

```
choosing the two
  policy            : the two fastest to respond
  A and B, p99 ms   : 12
  C, p99 ms         : 180
  why C is slow     : it is applying the write stream
  how often C is in the quorum : never
```

```
  the policy selects for the property that is anti-
  correlated with freshness, and it does so every time
```

```
the current replica is 15 times slower, which is why it is excluded
```

```
the evidence the reader has
  independent replicas agreeing : 2
  what that rules out           : one replica corrupted,
    one replica rolled back, one disk lying
  what it does not rule out     : both replicas being
    41 seconds old, which is exactly what they are
```

```
null control - each answer carries its lag, bounded at 5 s
  quorum disagreements    : 0, unchanged
  max lag accepted, seconds : 5
  writes the quorum cannot see : 17000
  the replicas did not become more consistent; the answer
  started carrying the one fact the comparison omits
```

```
what an agreeing quorum guarantees
  these replicas hold the same value : exactly
  the value is current                : not addressed;
    agreement is a comparison between replicas and
    currency is a comparison with the leader
```

```
two sources agreeing is strong evidence against corruption
and no evidence at all about age; when the selection policy
prefers the idle replicas, it is evidence against currency
```

The quorum agrees on every read and the check is real: 0 disagreements this week and a corruption drill caught on the first read. The two that answer are the two fastest, which are the two not applying the write stream - 15 times faster than the current replica - so the agreed answer is 41 seconds old and 139400 writes are invisible to a read that two independent replicas confirmed.

Verify it yourself:

```bash
pnpm eml run examples/the-two-nodes-agreed-and-both-were-behind/the_two_nodes_agreed_and_both_were_behind.eml
```
