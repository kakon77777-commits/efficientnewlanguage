# The key was rotated and the old key was still required

`the_key_was_rotated_and_the_old_key_was_still_required.eml` - Encryption keys rotate every ninety days, automatically, verified by a canary decrypt after each rotation, with no failed decrypts in eight rotations. What rotation changes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The rotation is properly automated. It is not a runbook someone runs when they remember; it is scheduled, it re-wraps every data key under the new key encryption key, a canary object is decrypted after each rotation before the rotation is declared done, the old key encryption key is retired only after that canary passes, and eight rotations have completed with no failed decrypts and no application involvement.

Rotation changes the key that WRAPS the data keys. The ciphertext itself is not rewritten, so every object is still encrypted under the data key it was written with, and a data key that leaked before a rotation still opens them.

Forty-one million objects have never been re-encrypted.

```
rotation period, days           : 90
rotations completed             : 8
  days of history               : 720
  canary decrypts per rotation  : 1
  failed decrypts               : 0
```

```
encrypted objects               : 41000000
  re-encrypted under a new data key : 0
  share                         : 0 per ten thousand
  a pre-rotation data key still opens : 
    41000000
```

```
re-encryption jobs run          : 0
estimated days to re-encrypt everything : 14
```

```
the rotation
  scheduled or remembered : scheduled, every 90 days
  what it re-wraps : every data key, under the new key
    encryption key
  proof before it is declared done : a canary object is
    decrypted, 1 per rotation
  when the old wrapping key is retired : only after that
    canary passes
  rotations completed : 8, failed decrypts 0
  verdict : ROTATED
```

```
  retiring the old key only after a real decrypt is the
  step that turns this from a calendar entry into a
  guarantee, and it is done every time
```

```
the two keys
  the key encryption key : rotated, 8 times
  the data key on each object : unchanged since the write
  what the ciphertext is encrypted under : the data key
  what rotation rewrites : the wrapping, not the object
  objects rewritten : 0
  what a leaked data key from before a rotation opens : 
    41000000 objects, still
```

```
  the rotation is complete over the layer it names, and
  the layer below it has not moved in 720 days
```

```
the two windows
  a compromised key encryption key is useful for : at
    most 90 days, which is what rotation buys
  a compromised data key is useful for : the lifetime of
    the objects it wrote
  what shortens the second : re-encrypting the objects
  re-encryption jobs run : 0
  estimated cost if run : 14 days
```

```
the canary decrypt
  what it reads : one object
  what it proves : the new wrapping key can unwrap a data
    key, and that data key still opens its object
  is that the right check for the rotation : yes, exactly
  does it say anything about the data key's age : no
  the data key it exercised : the same one as last time
```

```
null control - the objects are rewritten too
  rotation period : 90 days, unchanged
  re-encryption jobs : 1
  objects re-encrypted : 41000000
  objects a pre-rotation data key still opens : 
    0
  the rotation did not become more frequent; the layer it
  never touched acquired a rotation of its own
```

```
what key rotation guarantees
  a compromised wrapping key stops being useful within a
    period : exactly, 8 times, proved by a real decrypt
  old data stops being readable with old material : not
    addressed; rotation rewrites the wrapping and the
    ciphertext is not the wrapping
```

```
a rotation bounds the exposure of the thing it rotates;
where a key hierarchy has two layers and only the upper one
turns, the guarantee is exact and the quantity people say it
out loud about belongs to the layer that did not move
```

Rotation is scheduled rather than remembered, re-wraps every data key, proves itself with a real decrypt before retiring the old key, and has completed 8 times with 0 failed decrypts. It rewrites the wrapping and not the ciphertext, so 0 of 41000000 objects have been re-encrypted - 0 per ten thousand - across 720 days and 0 re-encryption jobs.

Verify it yourself:

```bash
pnpm eml run examples/the-key-was-rotated-and-the-old-key-was-still-required/the_key_was_rotated_and_the_old_key_was_still_required.eml
```
