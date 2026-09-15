# The quantifier was greedy and ate the delimiter

`the_quantifier_was_greedy_and_ate_the_delimiter.eml` - A parser extracts the first quoted field from each record, and it uses the regex engine correctly on every record. What the quantifier does at the delimiter is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The parse is careful. It reads the real record line, not a preview; it uses the engine's own regex, not a hand-split; it runs on every record; and the intent is exactly 'capture the first quoted field'.

The pattern is "(.*)", and .* is greedy, so it matches as much as it can and runs to the last quote on the line, swallowing every delimiter in between.

```
records                         : 500000
  with one quoted field         : 100000
  with several quoted fields    : 400000
```

```
first field correct, greedy .*  : 100000
first field correct, lazy .*?   : 500000
wrongly captured                : 400000
wrongly captured                : 8000 per ten thousand
```

```
the field extractor
  reads : the real record line, not a preview
  uses : the engine's own regex, not a hand-split
  runs on : every record
  intent : capture the first quoted field
  records skipped : 0
  verdict : EVERY RECORD PRODUCED A CAPTURE
```

```
  using the engine's regex over every real record is the
  part done right here, and it is why a single-field record
  is captured exactly
```

```
the capture "(.*)"
  what .* is : greedy, matches as much as possible
  where it stops : at the last quote on the line, not the
    first closing one
  a line like "alice","bob" : the capture is alice","bob
  so on one field : correct; on several : spans them all
  did it fail to match : no; it matched too much
```

```
the result of the extraction
  records where greedy equals intended : 100000, the single-
    field ones
  records where it over-captured : 400000
  is the pattern wrong : no; .* legitimately matches quotes
    and commas too
  did any record error : no; every one produced a capture,
    which is why the over-capture was silent
```

```
null control - make the quantifier lazy, "(.*?)"
  over-captured, greedy : 400000
  over-captured, lazy : 0
  records the lazy form fixes : 400000
  no record and no pattern anchor changed; the match
  stopped running to the last quote and stopped at the
  first closing one
```

```
what a "(.*)" capture guarantees
  it captures text between a quote and a later quote :
    exactly, the engine's own match over every record
  it captures the first quoted field : not addressed; .* is
    greedy and runs to the last quote, so on the 400000
    multi-field records the capture spans every field
```

```
a greedy quantifier takes the longest match its pattern still allows, and a
delimiter it is not told to avoid is just more that it can take; the field
boundary is invisible to a match that was never asked to stop at it
```

It runs the engine's regex over every record - a single-field line is captured exactly. But .* is greedy and runs to the last quote, so on 400000 multi-field records the first capture spans them all; 400000 were over-captured, 8000 per ten thousand, until the quantifier was made lazy.

Verify it yourself:

```bash
pnpm eml run examples/the-quantifier-was-greedy-and-ate-the-delimiter/the_quantifier_was_greedy_and_ate_the_delimiter.eml
```
