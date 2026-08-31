# The log said success and the exit code was never read

`the_log_said_success_and_the_exit_code_was_never_read.eml` - Every nightly run in the quarter reported success, and the line it reported is true. How many rows those runs exported is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The job is a shell pipeline: read, transform, write. The wrapper decides success by checking that the last stage printed its completion line, and the last stage does print it, every night, honestly. It writes what it was handed and says how much.

A pipeline's exit status is the LAST stage's. Without pipefail an earlier stage can die and the shell still reports zero, and the last stage cannot tell a stream that ended from a stream that finished.

The middle stage was killed for memory on thirty-one nights. Each of those nights the writer received a short stream, wrote all of it, and said so.

```
nightly runs in the quarter : 214
reported success            : 214
a stage was killed on       : 31
rows on a clean run         : 1240000
mean rows on a killed run   : 486000
rows never exported         : 23374000
```

```
the success condition
  last line matches 'export complete' : yes, all 214
  the writer printed it                : truthfully
  the count in that line               : correct for what
    the writer received
  alerts fired                         : 0
```

```
  no line in the log is false; the writer reported exactly
  what it wrote
```

```
the pipeline's status
  stage 1 read      : exit 0
  stage 2 transform : killed, exit 137, on 31 nights
  stage 3 write     : exit 0, every night
  the shell's status : stage 3's
  pipefail set       : no
```

```
  the status the wrapper would have read is the one the
  wrapper does not read, and it was zero anyway
```

```
share of nights with a killed stage : 1448 per ten thousand
```

```
the number that would have shown it
  rows the writer reported : 486000 on a short night
  rows the reader read     : not reported by any stage
  a floor on the output    : would fire on quiet Sundays too
  a comparison of the two  : nothing computes it
```

```
null control - pipefail set, counts compared
  runs reporting success wrongly : 0
  runs failing loudly            : 31
  the writer's line did not become less true; a second
  number arrived for it to disagree with
```

```
what a success line in a log guarantees
  the stage that printed it finished : exactly
  the work finished                  : not addressed; a
    stage reports on its own input, and a truncated input
    is a complete input as far as it can tell
```

```
the last stage is the one most likely to succeed and the one
whose success means least; a status that is not read is not a
weaker check than one that is, it is not a check
```

Every one of 214 runs reported success and every success line is true: the writer finished and counted what it received. On 31 nights - 1448 per ten thousand - the transform was killed at exit 137 and the shell reported the writer's zero instead, so 23374000 rows were never exported, 0 alerts fired, and the only number that would have shown it is one no stage prints.

Verify it yourself:

```bash
pnpm eml run examples/the-log-said-success-and-the-exit-code-was-never-read/the_log_said_success_and_the_exit_code_was_never_read.eml
```
