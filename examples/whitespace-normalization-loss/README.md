# All three are idempotent; only one is lossless

`whitespace_normalization_loss.eml` compares trim, collapse and strip-all as normalizers, and checks the property each actually needs.

**What it exercises**: idempotence is the property that gets checked and
it is not the one that matters. All three settle on the first pass —
10/10 each. Strip-all is perfectly idempotent and merges a phone number
with a different phone number.

What separates them is how much they merge: 9, 8 and 6 distinct values
from 10 inputs. Whether that merging is the point or is data loss is a
fact about the field, not the string.

Two concrete costs measured: a whitespace-only field flips its presence
verdict across the trim, so a required-field check gives opposite
answers depending on where the trim happens; and a fixed-width record
parses correctly from the raw string and not at all once trimmed,
because the column offsets no longer land.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
...same input, opposite verdicts, decided by where the trim happens.

a fixed-width record, trimmed as a whole:
  raw:     'alice     30  london    '  length 24
  trimmed: 'alice     30  london'  length 20
  fields from the RAW record: 'alice' '30' 'london'
  the trimmed record is 20 chars, so the column offsets no longer land.

checks passed: 5/5
All three normalizers are idempotent, and only one of them is lossless.

Idempotence is the property that gets checked and it is not the property
that matters here - strip-all is perfectly idempotent and merges a phone
number with a different phone number. What decides whether a normalizer is
safe is whether the whitespace was accidental, and that is a fact about the
field, held by the person who designed it, not by the string.
```
