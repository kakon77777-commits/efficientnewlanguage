# The encoding was declared and the bytes disagreed

`the_encoding_was_declared_and_the_bytes_disagreed.eml` - Every uploaded file declares its encoding, the importer honours the declaration, and the encoding validator passes 100 percent of records. How many names arrive correctly is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Trusting the declared encoding is the right thing to do and guessing is the wrong one. Charset detection is a heuristic that is confidently wrong on short strings, it makes the import non-deterministic for identical bytes, and it gives a partner no way to state what they actually sent. Honouring the declaration is the interoperable choice, it is what the specification says, and it makes the partner responsible for a fact only the partner knows.

The validator that runs afterwards asks whether the decoded text is valid UTF-8. It is a real check and it has caught real truncation bugs.

Decoding cp1252 bytes as UTF-8 does not produce invalid UTF-8. It produces replacement characters, and a replacement character is a perfectly valid UTF-8 code point. The validator is asking a question whose answer is yes for both the correct case and this one.

```
records imported          : 48000
declared utf-8, actually cp1252 : 1440 (30 per thousand)
correctly labelled        : 46560
```

```
  decode errors raised   : 0
  validator pass rate    : 48000 of 48000
  records with a corrupted name : 1440
```

```
what the validator asks, and what each case answers
  correct utf-8 input     -> is the result valid utf-8 : yes
  cp1252 read as utf-8    -> is the result valid utf-8 : yes
  truncated mid-sequence  -> is the result valid utf-8 : no, and it catches it
```

```
  the check discriminates the third case and not the second
  a replacement character is a valid code point, so a validity check
  cannot report it - it is not an invalidity
```

```
a corrupted name, downstream
  stored in the database    : yes, it is a valid string
  indexed for search        : yes
  returned by an exact-match lookup on the CORRECT spelling : no
  printed on a shipping label : yes, with the wrong characters
  flagged by any check       : no
  the only detector is a person who knows how their own name is spelled
```

```
  mislabeled records                       : 1440
  of those, names with a non-ascii character : 103
  records where the corruption is visible    : 103
  records where it is invisible              : 1337
```

```
  the invisible ones are pure ascii and decode identically under both
  encodings, so they are correct by coincidence rather than by check
```

```
a check that can distinguish the two cases
  decode under the declared encoding
  decode under cp1252
  compare
  identical   -> pure ascii, no information either way
  different   -> exactly one of them is what the partner meant
  records this flags : 103
  and it flags them without needing to know which is right
```

```
control - is the validator working
  truncated sequences it has caught : real, in production
  false positives                   : 0
  false negatives on INVALID utf-8  : 0
  the check is correct and complete for invalidity
```

```
  and this corruption is not an invalidity
  it is a valid encoding of the wrong characters
```

```
null control - the same import from a partner whose declaration is right
  records mislabeled     : 0
  decode errors          : 0
  validator pass rate    : 48000 of 48000
  corrupted names        : 0
  the validator's output is byte-identical in both cases
  it passes 100 percent when everything is right and 100 percent when
  1440 records are wrong
```

```
a check placed after a lossy transformation
  can it see the input          no, the transformation already ran
  can it see the loss           only if the loss leaves an invalid result
  a substitution leaves a VALID result, by design
  that is what a replacement character is for
```

```
the question is not 'is the output well-formed'
it is 'could this output have come from something else', and answering it
needs the input, which is why the check has to sit beside the decode
```

Honouring the declared encoding is correct and guessing is not: detection is a heuristic, it makes identical bytes decode differently on different days, and only the partner knows what they sent. 1440 records declare utf-8 and are cp1252. No decode error is raised, because cp1252 bytes read as utf-8 produce replacement characters, and 48000 of 48000 records pass a validity check that is structurally unable to report them.

Verify it yourself:

```bash
pnpm eml run examples/the-encoding-was-declared-and-the-bytes-disagreed/the_encoding_was_declared_and_the_bytes_disagreed.eml
```
