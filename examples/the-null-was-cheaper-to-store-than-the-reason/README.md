# The null was cheaper to store than the reason

`the_null_was_cheaper_to_store_than_the_reason.eml` - A column is null on nineteen percent of rows. Three different things produced those nulls. What can be recovered from them is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Storing null was correct and it is what the column is for. The alternative was a sentinel value, and a sentinel in a numeric column is a number that enters averages, comparisons and sums as though it were data — which is the defect a nullable column exists to prevent. The schema is right, and it was argued about before it was chosen.

Null is one symbol. The situations that produce it are not one situation, and the difference between them is what a reader of the column needs.

The reason was known at write time by whichever code path wrote the row. It was not written down, because there was no column to write it in.

```
rows                : 420000
rows with a null    : 79800
rows with a value   : 340200
```

```
what wrote the null
  the question was not asked      : 35910
  the person declined to answer   : 27930
  the lookup failed at write time : 15960
  total                           : 79800
```

```
  three different facts, one symbol, and the symbol is
  identical in all three cases
```

```
consumer                   needs to distinguish
  the completeness report    not-asked from declined
  the retry job              failed from the other two
  the consent audit          declined from everything else
  the average                all three, they are all excluded
```

```
  three of the four cannot be answered from the column,
  and the fourth is the only one that ever gets computed
```

```
the retry job, as it must be written
  rows it can identify as retryable : 0
  rows it would have to retry       : 79800
  rows that would succeed           : 15960
  rows retried pointlessly          : 63840
```

```
  wasted work : 8000 per ten thousand of the retries
```

```
  and 27930 of them re-ask a person who already said no
```

```
the completeness report
  rows complete        : 8100 per ten thousand
  rows incomplete      : 1900 per ten thousand
  of the incomplete, how many are answerable : not computable
```

```
  the report is exactly right and the follow-up question is
  the one anybody actually has
```

```
recovering the reason after the fact
  from the column          : impossible, one symbol
  from the write path      : the code no longer exists in that form
  from the application log : retained 30 days, these rows are older
  by re-asking             : possible, and re-asks the 27930 who declined
```

```
  the information existed at write time, cost one small column
  to keep, and is now only obtainable by contacting people
```

```
control - was null the right symbol
  sentinel values in the average : 0
  comparisons against a magic number : 0
  rows where absent is treated as a value : 0
  defects in the schema choice : 0
```

```
  the column is correct; what is missing was never in it
```

```
null control - the same null with a reason column beside it
  nulls in the column      : 79800, unchanged
  sentinel values          : 0, unchanged
  nulls whose cause is unknown : 0
  retries that are pointless   : 0
  the symbol did not change; a second field records what the
  first one was never able to say
```

```
what a null records
  there is no value here : exactly, and unambiguously
  why there is no value  : nothing
  and 'why' is the part every consumer downstream needs,
  because it is what decides whether to retry, to re-ask,
  to exclude, or to leave alone
```

```
absence is not one state; it is at least three, and they are
distinguishable only at the moment of writing, by the code
that already knows which one it is
```

The column is nullable rather than sentinel-valued, which is the right choice: 0 magic numbers enter the averages and 0 rows treat absent as a value. Of the 79800 nulls, 35910 were never asked, 27930 were declined and 15960 failed a lookup, and nothing distinguishes them, so a retry job must attempt all 79800 to reach 15960 - 8000 per ten thousand wasted - while re-asking 27930 people who already answered.

Verify it yourself:

```bash
pnpm eml run examples/the-null-was-cheaper-to-store-than-the-reason/the_null_was_cheaper_to_store_than_the_reason.eml
```
