# The report was signed off and the query changed

`the_report_was_signed_off_and_the_query_changed.eml` - Three people reviewed the quarterly report and signed it. What re-running it gives today is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The sign-off is real. Three named reviewers each opened the report, checked the totals against two independent sources, questioned one line and had it corrected, and signed. The signature is cryptographic, covers the exact bytes of the PDF, and verifies today.

The signature covers the DOCUMENT. The document is an output; the thing that produced it is a saved query in the reporting tool, referenced by name, and names are rebound.

Two weeks after the signature the query gained a filter — a correct filter, excluding test accounts, added by someone fixing a different report.

```
reviewers                       : 3
rows in the signed report       : 41800
rows when rerun today           : 38240
rows the new filter removes     : 3560
days between signature and edit : 14
```

```
the signature
  covers            : the exact bytes of the pdf
  algorithm         : verifies today
  verification failures : 0
  reviewers         : 3, each named
  totals checked against two independent sources : yes
  lines questioned and corrected during review : 1
  verdict           : SIGNED, VALID
```

```
  the review was not a formality; it found and fixed
  something
```

```
what produced those bytes
  the query          : saved in the reporting tool, by name
  versions stored    : 0
  edits since the signature : 1
  the edit itself    : correct, excluding test accounts
  attached to the signature : nothing about the query
```

```
  the signed artifact is downstream of a mutable
  definition, and the signature names neither
```

```
difference on re-running : 851 per ten thousand
```

```
the two figures
  signed        : 41800, correct for the question then
  today         : 38240, correct for the question now
  which is the report's figure : both, at different times
  a record that the question changed : none
```

```
  a reader who reruns it to check the signed number will
  conclude the signed number was wrong
```

```
null control - the query text hashed into the document
  signature verification failures : 0, unchanged
  query versions stored : 1
  rows when rerun       : 41800
  the signature did not get stronger; what it covers
  became the whole of what produced the number
```

```
what a signature guarantees
  these bytes are the bytes that were reviewed : exactly
  this number can be reproduced                : not
    addressed; reproduction runs a definition, and the
    signature covers an output
```

```
signing an artifact and being able to derive it again are
different properties; the second needs the inputs inside the
envelope, and a saved query referenced by name is not one
```

Three reviewers signed the report, the signature covers the exact bytes and verifies today with 0 failures, and the review corrected a line. 14 days later the query behind it gained a correct filter, so re-running gives 38240 against the signed 41800 - a difference of 3560, 851 per ten thousand - with 0 versions of the definition stored anywhere.

Verify it yourself:

```bash
pnpm eml run examples/the-report-was-signed-off-and-the-query-changed/the_report_was_signed_off_and_the_query_changed.eml
```
