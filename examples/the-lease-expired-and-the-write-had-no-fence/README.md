# The lease expired and the write had no fence

`the_lease_expired_and_the_write_had_no_fence.eml` - The distributed lock hands out a lease, and the lease logic is correct. What the store checks when a write arrives is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The lease is well designed. Only one holder has it at a time; the holder does real work only while it believes the lease is valid; it renews well before expiry; and a holder that cannot renew stops trying.

The store accepts any write. It does not check a fencing token.

```
writes in the day               : 240000
holders that paused past expiry : 90
lease length                    : 15 seconds
  the longest pause             : 23 seconds
  over the lease by             : 8 seconds
```

```
stale writes that reached store : 6
  the store rejected            : 0
  that landed                   : 6
among late wakeups              : 666 per ten thousand
```

```
the lease logic
  holders at once : one
  work while not holding : none the holder starts
  renewal : well before expiry
  on a failed renewal : the holder stops trying
  holders that overlapped by their own clock : 0
  verdict : ONE HOLDER
```

```
  stopping work on a failed renewal is the part done
  right here, and it is why the holder is not the problem
```

```
the holder that paused
  what paused it : a stop-the-world it did not choose
  how long : 23 seconds, past a 15-second lease
  what it holds when it wakes : a write it prepared
    before the pause
  what it does : sends that write, believing it still
    holds the lease
  what it cannot know : that someone took over at 
    8 seconds past expiry
```

```
the store receiving the stale write
  what it checks : that the write is well-formed
  what it does not check : a fencing token that would
    say the sender's lease is current
  stale writes it let through : 6
  who they overwrote : the new holder's work
  what a fence would have done : rejected each as stale
```

```
null control - a fencing token the store checks
  holders that paused past expiry : 
    90, unchanged
  stale writes that land : 0
  stale writes the fence rejects : 
    6
  no pause and no lease changed; the store started
  refusing a write from a holder whose token is old
```

```
what a correct lease guarantees
  at most one holder believes it holds the lease at once :
    exactly, by every clock, renewals well before expiry
  only the current holder writes : not addressed; the
    store accepts any write, and a holder that paused past
    its lease still writes when it wakes - 6 writes
    from expired holders landed because no fencing token
    was checked
```

```
a lease bounds who believes they are the holder, not who can write; the belief
is enforced at the holder and the write is accepted at the store, and only a
token the store checks closes the gap a pause opens between them
```

The lease is correct: one holder, renews early, stops on a failed renewal. The store checks no fence, so a holder paused 8 seconds past a 15-second lease still wrote on waking - 6 stale writes landed over the new holder, 666 per ten thousand of the late wakeups.

Verify it yourself:

```bash
pnpm eml run examples/the-lease-expired-and-the-write-had-no-fence/the_lease_expired_and_the_write_had_no_fence.eml
```
