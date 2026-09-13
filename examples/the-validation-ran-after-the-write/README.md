# The validation ran after the write

`the_validation_ran_after_the_write.eml` - The validation job flagged every invalid record it was given, and its rules are correct. When it runs relative to the write is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The validation itself is sound. It checks the real schema and business rules, not a subset; it flags every violation without exception; it runs on every record, not a sample; and its findings are logged and actioned.

It runs asynchronously, after the record is already written.

```
records written                 : 500000
records that failed validation  : 1300
  the validation flagged        : 1300
  it missed                     : 0
validation lag                  : 15 minutes
invalid records acted on first  : 1300
invalid share                   : 26 per ten thousand
```

```
the validation job
  checks : the real schema and business rules, not a
    subset
  flags : every violation, no exception
  runs on : every record, not a sample
  findings : logged and actioned
  invalid records it failed to flag : 0
  verdict : ALL VIOLATIONS FOUND
```

```
  checking the full ruleset rather than a cheap subset is
  the part done right here, and it is why its flags are
  trusted to be complete
```

```
the timing of the check
  when the record is written : immediately, on request
  when the validation runs : asynchronously, up to 
    15 minutes later
  what the record does in between : it is live, readable,
    and acted on
  so a flag arrives : after the harm, not before it
  what the check can do : report, not prevent
```

```
the window before the flag
  invalid records written : 1300
  acted on downstream before validation : 
    1300
  eventually flagged : all of them, correctly
  eventually undone : whatever downstream already did,
    only if it can be
  is the validation wrong : no; it is late
```

```
null control - validate in the write path
  records that fail the rules : 1300, unchanged
  invalid records persisted : 0
  invalid records acted on : 0
  no rule changed; the check moved from after the write to
  in front of it
```

```
what a passing validation job guarantees
  every invalid record is eventually flagged : exactly,
    full ruleset, every record, no exception
  invalid records are rejected : not addressed; the
    validation runs after the write, so it detects but
    cannot prevent - 1300 invalid records were persisted and
    acted on in the 15-minute window before the flag
```

```
detection and prevention are different guarantees, and a correct check placed
after the effect delivers only the first; the record is already doing whatever
it does by the time the flag catches up with it
```

It checks the full ruleset on every record and flags every violation - all 1300 found. It runs 15 minutes after the write, so those 1300 invalid records were persisted and acted on before the flag arrived - detected, not prevented, 26 per ten thousand of the writes.

Verify it yourself:

```bash
pnpm eml run examples/the-validation-ran-after-the-write/the_validation_ran_after_the_write.eml
```
