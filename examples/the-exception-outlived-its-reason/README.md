# The exception outlived its reason — 5 of 6 rows removed for a condition that is false

`the_exception_outlived_its_reason.eml` evaluates the stated reason for an
exclusion against the rows the exclusion currently removes.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: supplier 7's rows were excluded because a migration had
corrupted them. That was correct, it was documented, and the documentation even
names the condition — rows whose checksum does not match. What it does not do is
*evaluate* that condition at read time; the exclusion is by supplier id, because
that was the cheap way to express it on the day.

```
rows in the source            : 12
excluded by the rule as written : 6
excluded by the stated reason   : 2
  both agree on                 : 1
  rule removes, reason does not : 5
  reason removes, rule does not : 1
```

Row by row:

```
  supplier 7 amount 14 : checksum fine - removed for a reason that expired
  supplier 7 amount 22 : checksum fine - removed for a reason that expired
  supplier 7 amount 30 : checksum fine - removed for a reason that expired
  supplier 7 amount 40 : checksum fine - removed for a reason that expired
  supplier 7 amount 8 : checksum fine - removed for a reason that expired
  supplier 7 amount 9 : checksum bad - the reason still holds

rows the reason would remove and the rule keeps
  supplier 5 amount 13 : checksum bad, still in the report
```

**It is wrong in both directions, which is the part that matters:**

```
The rule both removes rows the reason does not cover and keeps rows it
does. It is not a conservative approximation of the reason - it is a
different rule that happened to agree on the day it was written.
```

And it moves the number people read:

```
reported total
  with no exclusion at all : 225
  under the rule as written : 102
  under the stated reason   : 203
```

Nothing is declared: the exclusion, the reason, and the report all run over the
same rows, and the checksum is recomputed rather than trusted.

An exclusion whose reason is stated but not evaluated cannot expire. It has no
condition to become false — only a note explaining why somebody once thought it
was a good idea.

Verify it yourself:

```bash
pnpm eml run examples/the-exception-outlived-its-reason/the_exception_outlived_its_reason.eml
```
