# The sanitiser made the bad input pass validation

`the_sanitiser_made_the_bad_input_pass_validation.eml` - A sanitiser and a validator both guard the same intake. What each rejects, and what the pair rejects, are computed separately below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Both are correct. The sanitiser exists because a supplier feed arrives with trailing whitespace, smart quotes and mixed line endings, and rejecting those outright meant a human retyping good data. The validator exists because a malformed record once reached the ledger. Each was added after a real incident and each does what it says.

The sanitiser runs first, because you cannot validate a field you cannot parse. So every record the validator sees has already been repaired, and a record that was wrong in a way the sanitiser could repair arrives at the validator looking correct. The validator's rejection count is a measurement taken after the evidence has been cleaned up.

Records are classified by what was wrong and by what each stage did.

```
defect                    per day   sanitiser   validator   repair correct
  trailing whitespace   4100      yes         yes         yes
  smart quotes   900      yes         yes         yes
  mixed line endings   2200      yes         yes         yes
  empty supplier code   140      yes         yes         no
  date as DD-MM not MM-DD   60      yes         yes         no
  negative quantity   30      no         yes         no
  unknown currency   12      no         yes         no
```

```
defective records a day        : 7442
repaired before validation     : 7400
still defective at validation  : 42
validator rejections a day     : 42
```

```
the validator's own report
  rejections : 42 a day
  which is 56 per 10000 of the defective records that arrived
  (a percentage floors to zero here, so the unit is finer)
  the other 7400 it never saw in a defective state
  the validator is not failing to catch these, it is being handed clean
  copies of them
```

```
repairs where the original value was not recoverable
  empty supplier code : 140 a day
  date as DD-MM not MM-DD : 60 a day
  total : 200 a day
  these are the records where the sanitiser produced a well-formed value
  that is not the value the supplier meant
  validator rejections they cause : 0, because they are well formed
```

```
three counts that look like the same thing
  records that arrived defective     : 7442
  records the validator rejected     : 42
  records that reached the ledger wrong : 200
  the middle number is on the dashboard; the other two are not measured
```

```
the same two stages in the other order
  validator first, on raw input : 7442 rejections a day
  sanitiser first, as deployed  : 42 rejections a day
  ratio : 177 to 1
  the same records, the same two rules, and the order decides how much
  the second one is allowed to know
```

```
separating the two kinds of repair
  repairs that cannot change meaning : 7200 a day
    whitespace, quote style, line endings - the value is the same value
  repairs that guess at meaning      : 200 a day
    a missing supplier code and an ambiguous date are not typography
  the sanitiser treats both as the same operation, and only the first kind
  is one
```

```
control - negative quantity, 30 a day
  sanitiser : no rule, passes through unchanged
  validator : rejects
  the record reaching the validator is the record the supplier sent,
  so the rejection means what a rejection is supposed to mean
control - unknown currency, 12 a day
  sanitiser : no rule, passes through unchanged
  validator : rejects
  the record reaching the validator is the record the supplier sent,
  so the rejection means what a rejection is supposed to mean
```

Both stages were added after real incidents and both do what they say. The sanitiser runs first because it must, so 99% of the defects are already gone when the only stage that counts them starts counting.

Verify it yourself:

```bash
pnpm eml run examples/the-sanitiser-made-the-bad-input-pass-validation/the_sanitiser_made_the_bad_input_pass_validation.eml
```
