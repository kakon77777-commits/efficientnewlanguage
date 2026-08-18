# The log covers the paths we suspected

`the_log_covers_the_paths_we_suspected.eml` - Logging was added to the paths that had failed before. The logs now say those paths are where the failures are.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Instrumenting what has already broken is the right first move. It is cheap, it is targeted, and it pays off immediately, because a path that failed once is genuinely more likely to fail again. Nobody instruments uniformly on day one and nobody should.

What the logs then contain is failures on instrumented paths. A path with no instrumentation contributes zero lines whatever it does, so "where the failures are" and "where the logging is" come out of the same query, and the query cannot tell them apart.

Both counts are computed here against an audit that did not read the logs.

```
paths : 6
  instrumented : 3
  not          : 3
```

```
path              instrumented   in the logs   actually failed
  payment retry   yes            4            4
  auth refresh   yes            6            6
  bulk import   no             0            22
  webhook replay   no             0            15
  search fallback   yes            3            3
  csv export   no             0            9
```

```
failures this quarter
  the audit found : 59
  the logs show   : 13
  invisible in the logs : 46 of 59, which is 77%
```

```
the worst path, by each source
  by the logs  : auth refresh (6)
  by the audit : bulk import (22)
  different paths, and the log answer is the worst of the ones being watched
```

```
how the instrumented set was chosen
  paths where instrumented == had failed before : 6 of 6
  the rule was applied exactly, with no exceptions either way
  so the set is decided by the past, and the past was read the same way
```

```
an investigation reading only the logs
  paths it can name        : 3
  failures it can count    : 13
  paths it cannot see      : 3
  failures it cannot count : 46
  it would report that the watched paths carry every failure, correctly,
  because every failure it has is on a watched path
```

```
instrumenting the remaining 3 paths
  failures that become countable : 46
  more than the current logs contain in total, by 33
```

```
control - every path instrumented
  worst by the logs  : b
  worst by the audit : b
  identical, so this service cannot show that placement decides the answer
```

The instrumented paths were chosen from real evidence and each of them does fail. A count of logged failures is a count of failures on logged paths, and the second word is doing work the first one hides.

Verify it yourself:

```bash
pnpm eml run examples/the-log-covers-the-paths-we-suspected/the_log_covers_the_paths_we_suspected.eml
```
