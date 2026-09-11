# The backup counted the files it chose

`the_backup_counted_the_files_it_chose.eml` - The nightly backup has reported success with zero errors for the whole quarter, and every count it reports is true. What it never enumerated is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The job is careful. It checksums each file after writing it; it fails loudly on a single write error; it stores three copies in two regions; and it emails a per-run report with the file count and the byte total.

It backs up the paths on an include list, and reports over those paths.

```
directories on the include list : 12
directories on disk             : 15
  never enumerated              : 3
files enumerated                : 480000
  written                       : 480000
  write errors                  : 0
files in the unlisted dirs      : 61000
files on disk                   : 541000
fraction of disk backed up      : 8872 per ten thousand
```

```
the backup job
  after each write : it checksums the file
  on a write error : it fails the whole run
  copies kept : three, in two regions
  report : file count and byte total, emailed
  write errors this quarter : 0
  verdict : SUCCESS
```

```
  checksumming every written file is the part almost
  nobody does, and it is why the byte total is trusted
```

```
the files the job saw
  files it enumerated : 480000
  files it wrote : 480000, all verified
  where the list comes from : twelve configured paths
  directories on disk not on the list : 
    3
  files in those directories : 61000
  their chance to succeed or fail : none; they were
    never candidates
```

```
the three unlisted directories
  added : last quarter, after the include list was set
  files they hold : 61000
  copies of them in the backup : 0
  errors the job raised about them : 0; an unenumerated
    file cannot error
  fraction of the disk that was never a candidate : 
    1127 per ten thousand
```

```
null control - enumerate from the root, report the gap
  write errors : 0, unchanged
  directories found but not configured : 
    3
  files it would flag as uncovered : 
    61000
  no file changed and no copy was made; the job stopped
  taking its own include list as the definition of all
```

```
what a successful backup guarantees
  every file it enumerated is written and checksummed :
    exactly, 480000 of them, zero errors
  every file is backed up : not addressed; the job reports
    on the files it enumerated, and three directories were
    never on the include list, so their 61000 files
    were never candidates to succeed or to fail
```

```
a job's success is a statement about the work it took on, and
the work it took on was chosen by a list; the files outside
the list are not failures, they are absences, and a report of
errors cannot show an absence
```

It checksums every written file, fails on one error, and keeps three copies - 480000 files, zero errors, SUCCESS. It enumerates an include list of twelve paths, so three directories added later were never seen: 61000 files, 1127 per ten thousand of the disk, in 3 directories no copy holds.

Verify it yourself:

```bash
pnpm eml run examples/the-backup-counted-the-files-it-chose/the_backup_counted_the_files_it_chose.eml
```
