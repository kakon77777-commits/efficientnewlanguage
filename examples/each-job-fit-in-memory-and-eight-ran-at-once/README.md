# Each job fit in memory and eight ran at once

`each_job_fit_in_memory_and_eight_ran_at_once.eml` - Every report job has a measured memory cap asserted in CI against a real run, and none has ever exceeded it. What the host is asked for is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The per-job discipline is real. The cap is not a guess: each job is run in CI against a production-sized fixture with the resident set actually measured, and the build fails if it goes over. The measurement is of real memory rather than of an allocator counter, the fixture is representative rather than a toy, and forty-one jobs each carry their own asserted number.

The cap is per JOB. The scheduler runs eight of them on one host, and no assertion anywhere is about the sum.

Eight caps plus the runtime is more than the host has.

```
jobs                            : 41
  with a measured cap           : 41
  that exceeded it in CI        : 0
job memory cap, MB              : 1536
```

```
scheduler concurrency           : 8
concurrent job demand, MB       : 12288
runtime overhead, MB            : 900
peak demand, MB                 : 13188
```

```
host memory, MB                 : 12288
  demanded beyond it            : 900
  host as a share of the demand : 9317 per ten thousand
assertions about the sum        : 0
out-of-memory kills last month  : 14
```

```
the per-job cap
  where the number came from : a measured run, not a
    guess
  what is measured : resident memory, not an allocator
    counter
  the fixture : production-sized
  on exceeding it : the build fails
  jobs carrying one : 41 of 41
  breaches in CI : 0
  verdict : BOUNDED, EACH
```

```
  measuring resident memory against a real fixture is the
  expensive way to get this number and it is the only way
  the number means anything
```

```
the sum
  jobs that may run together : 8
  their caps added : 12288 MB
  plus the runtime : 13188 MB
  the host : 12288 MB
  assertions comparing the two : 0
  where such an assertion would live : neither in the job
    nor in the scheduler; between them
```

```
  every job is within its bound and the bounds were never
  added up against anything
```

```
why it is not always red
  typical run against the cap : well under
  eight typical runs : fit comfortably
  when it fails : when several large tenants land in one
    window
  is that a defect in a job : no; each is inside its cap
  is it a defect in the schedule : the schedule was never
    given the numbers
  kills last month : 14
```

```
one out-of-memory kill
  which job is killed : whichever the kernel picks
  is that the job that was over : not necessarily; none
    of them was over
  what the job's own metrics show : a run that was inside
    its cap and then stopped
  what the retry does : reruns it, often successfully,
    in a quieter window
  what the postmortem records : an infrastructure issue
```

```
the concurrency
  chosen from : throughput measurement
  the question it answers : how many keep the host busy
  measured against : typical jobs
  what it was not compared to : the caps
  8 times the cap : 12288 MB
  the host : 12288 MB, 9317 per ten thousand of
    the worst case
```

```
null control - the scheduler admits against a budget
  per-job caps : 41, unchanged
  assertions about the sum : 1
  peak demand, MB : 12288
  out-of-memory kills : 0
  no job got smaller; the scheduler started reading the
  numbers the jobs already carry
```

```
what a per-job memory cap guarantees
  no job uses more than its cap : exactly, measured
    against a production-sized fixture, enforced in CI
  the host does not run out of memory : not addressed;
    the cap is a bound on one job and the host holds
    8 of them
```

```
per-item bounds compose by addition and nothing adds them
unless somebody writes that down; the two facts live in two
repositories, and the number that would relate them is a
multiplication neither of them performs
```

Every one of 41 jobs carries a cap measured from a real run against a production-sized fixture, enforced by a failing build, with 0 breaches. The scheduler runs 8 at once, so 12288 MB of caps plus 900 of runtime ask a 12288 MB host for 13188 - 900 MB beyond it, 9317 per ten thousand covered - against 0 assertions about the sum and 14 kills last month.

Verify it yourself:

```bash
pnpm eml run examples/each-job-fit-in-memory-and-eight-ran-at-once/each_job_fit_in_memory_and_eight_ran_at_once.eml
```
