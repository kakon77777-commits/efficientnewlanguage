# The integrity check read the backups own manifest

`the_integrity_check_read_the_backups_own_manifest.eml` - Every backup is verified rather than assumed: each file's checksum is recomputed after upload and the count is compared against the manifest, which caught three truncated uploads. What the manifest is a list of is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The verification is the kind most teams skip. A backup job that reports success has reported that it did not crash; this one recomputes every uploaded file's checksum from the object store and compares it to the value computed at read time, so a silent truncation or a corrupted transfer is caught rather than discovered during a restore. It found three.

The count it compares against comes from the MANIFEST, and the manifest is written by the same job from the list of things it decided to include. A database the job never enumerated is not a missing file; it is not a file.

The server has eighteen databases and the include list names fifteen.

```
files in the manifest           : 41200
  checksum recomputed           : 41200
  share verified                : 10000 per ten thousand
truncated uploads caught        : 3
```

```
databases on the server         : 18
  in the include list           : 15
  never backed up               : 3
  share covered                 : 8333 per ten thousand
```

```
processes writing the manifest and checking it : 1
jobs that enumerate the server                 : 0
alerts when a database is absent from the list : 0
```

```
the integrity check
  what a plain success report means : the job did not
    crash
  what this does instead : recomputes every uploaded
    file's checksum from the object store
  compared against : the value computed at read time
  so a silent truncation is : caught, not discovered
    during a restore
  truncated uploads it found : 3
  verdict : WHAT WAS UPLOADED IS INTACT
```

```
  recomputing from the object store rather than trusting
  the upload's own return code is the expensive half, and
  it is the half that found the three
```

```
the two sides of the comparison
  one  : the files present in the object store
  other: the count in the manifest
  who writes the manifest : this job, from its include
    list
  processes doing both : 1
  what a database outside the include list looks like : 
    absent from both sides
  databases in that state : 3
```

```
  the check can prove the job finished what it started
  and cannot ask what it should have started
```

```
how three fell outside
  created after the list was written : two
  renamed since : one
  was the list wrong when written : no
  did anyone edit it incorrectly : no
  what would have to happen for the list to notice : it
    would have to be derived rather than maintained
  alerts on that : 0
```

```
the nightly report
  files verified : 41200 of 41200
  integrity failures : none since the three
  what a reader concludes : the backup is complete
  what is claimed : everything the job set out to copy
    arrived intact
  the difference : 3 databases
```

```
null control - the expected set comes from the server
  files verified : 41200, unchanged
  jobs that enumerate the server : 1
  databases in the expected set : 18
  databases never backed up : 0
  the checksum work did not change; the list it is checked
  against stopped being written by the thing it checks
```

```
what a verified backup guarantees
  everything the job copied arrived intact : exactly,
    recomputed from the store, and it caught 3
  everything is backed up : not addressed; the expected
    set is written by the job, so a thing it never
    enumerated cannot be found missing
```

```
a completeness check needs an expectation from outside the
process it checks; taking the expectation from the process's
own record turns every omission into an absence, and an
absence is what a passing check looks like
```

The check recomputes every uploaded file's checksum from the object store rather than trusting a return code, and it caught 3 truncated uploads - 41200 of 41200 files verified. It compares against a manifest the same job writes from its include list, which names 15 of 18 databases - 8333 per ten thousand - leaving 3 that are absent from both sides of the comparison.

Verify it yourself:

```bash
pnpm eml run examples/the-integrity-check-read-the-backups-own-manifest/the_integrity_check_read_the_backups_own_manifest.eml
```
