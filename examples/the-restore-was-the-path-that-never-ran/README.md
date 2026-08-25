# The restore was the path that never ran

`the_restore_was_the_path_that_never_ran.eml` - The backup has succeeded 412 nights in a row. How much of the restore path that number covers is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The backup is genuinely well built. It has a verification step rather than trusting the exit code, it alerts on failure, it has caught three real defects in its own life and each was fixed, and 412 consecutive successes is not a lucky streak, it is a mature piece of code. Nothing below is a criticism of it.

Backup and restore are two programs. They share a file format and nothing else: different code, different libraries, different failure modes, different authors in two of the three cases. A backup that succeeds says the writer worked. It says nothing about the reader, which has run once.

The reason is not carelessness. Code gets tested in proportion to how often it runs, and the paths that only run in an emergency are by construction the paths that have run least. The backup is well tested because it executes every night, which is the same fact from the other side.

```
executions and change, per path
  backup  : 412 runs, 31 commits, 13 runs per commit
  restore : 1 run, 23 commits, 0 runs per commit
  restore commits never executed even once : 22 of 23
```

```
  defects found in the backup path  : 3 in 412 runs
  defects found in the restore path : 0 in 1 run
  the second zero is not a measurement, it is the absence of one
```

```
restore failure modes and what the nightly check sees
  output file is empty                           yes
  write truncated by a full disk                 no
  encrypted with a key since rotated             no
  schema is newer than the dump                  no
  referenced blobs expired by a lifecycle rule   no
  compression codec changed version              no
  modes the verification can detect : 1 of 6
  the check confirms a file was written, which is the question the backup
  is able to ask about itself
```

```
the one restore that was run
  when                          : 14 months ago, in a drill
  result                        : passed
  commits to the restore path since : 23
  that evidence covers          : the restore path as it was 14 months ago
  a passing drill is real evidence and it has an age, and nothing in the
  dashboard shows the age
```

```
control - the path that runs every night
  executions          : 412
  defects found       : 3, all in production, all fixed
  defects per 1000 runs : 7
  reviewed no more carefully than the restore path, and written by the
  same people, so review is not what separates them
  exposure is what separates them
```

```
paths ranked by how often they run
  backup writer          365            found broken by: the nightly alert
  restore reader         1              found broken by: an outage
  failover to standby    0              found broken by: an outage
  certificate renewal    4              found broken by: an outage
  request handler        400000000      found broken by: immediately
  the column on the right is a function of the column on its left
```

```
how to give a path exposure it does not have naturally
  restore into a scratch database nightly and diff the row counts
    executions per year would become 365 instead of 1
  the cost is one scratch database and the time of one restore
  the current cost is that the first execution in production is also
  the first one that matters
```

The backup is mature: 412 consecutive successes and three defects found and fixed in its own life. It is the writer. The reader has run 1 time, 14 months and 23 commits ago, and the nightly verification covers 1 of 6 restore failure modes.

Verify it yourself:

```bash
pnpm eml run examples/the-restore-was-the-path-that-never-ran/the_restore_was_the_path_that_never_ran.eml
```
