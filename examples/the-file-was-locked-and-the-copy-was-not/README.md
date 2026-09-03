# The file was locked and the copy was not

`the_file_was_locked_and_the_copy_was_not.eml` - Two writers can never interleave, the lock has held for three years, and no torn write has ever been observed. How many backups are torn is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The write lock is correct. It is taken before the first byte and released after the last, every writer takes it, a stress test with sixteen concurrent writers produced no interleaving in an hour, and the one incident it was written for has not recurred. Zero torn writes is a measured zero.

The lock is advisory and it binds the WRITERS. A reader that does not ask for it is not stopped, is not queued, and is not told that a write is in progress — and the backup is a plain read of the path.

The backup runs once a night. There are forty-one thousand writes a day.

```
writes per day             : 41000
mean write duration, ms    : 40
ms a day mid-write         : 1640000
share of the day mid-write : 189 per ten thousand
```

```
backup reads per day       : 1
torn backups per year      : 6
torn writes observed       : 0
```

```
the write lock
  taken before the first byte : yes
  released after the last     : yes
  every writer takes it       : yes
  stress test, 16 concurrent writers : no interleaving
  torn writes observed        : 0
  verdict                     : EXCLUSIVE
```

```
  the incident it was written for has not recurred, and
  the lock is why
```

```
the reader
  asks for the lock  : no
  is queued          : no
  is told a write is in progress : no
  what it gets mid-write : whatever bytes are on disk
```

```
  an advisory lock is a convention among participants, and
  the backup is not a participant because reading was
  never the thing anyone was worried about
```

```
restoring from one
  the file parses     : yes
  the restore fails   : no
  the state it produces : a mixture of before and after
    one write, which no writer ever wrote
  a checksum would catch it : only if computed under the
    lock, which is the same fix
```

```
null control - the backup takes the lock in shared mode
  torn writes observed  : 0, unchanged
  torn backups per year : 0
  the backup waits, ms  : at most 40
  the lock did not become stronger; the reader joined the
  protocol, at a cost of one write's duration a night
```

```
what an exclusive write lock guarantees
  two writes never interleave : exactly
  a read sees a whole write   : not addressed; the lock
    binds whoever asks for it, and a reader that does not
    ask is outside the mutual exclusion by construction
```

```
advisory locking is a protocol between the parties that join
it; the question is not whether the lock works but who is in
the room, and the backup is usually written by someone else
```

The write lock is exclusive and its zero is measured: taken before the first byte, released after the last, 16 concurrent writers with no interleaving, 0 torn writes in three years. It is advisory, and the nightly backup reads without taking it, so with the path mid-write 189 per ten thousand of the day about 6 backups a year restore a state no writer ever wrote.

Verify it yourself:

```bash
pnpm eml run examples/the-file-was-locked-and-the-copy-was-not/the_file_was_locked_and_the_copy_was_not.eml
```
