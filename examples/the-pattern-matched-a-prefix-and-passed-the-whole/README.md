# The pattern matched a prefix and passed the whole

`the_pattern_matched_a_prefix_and_passed_the_whole.eml` - A validator checks that a submitted code is a six-digit number, and it uses the regex engine correctly on every submission. What the pattern is anchored to is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The check is careful. It applies the pattern to the real submitted string, not a trimmed copy; it uses the engine's own regex, not a hand-rolled scan; it runs on every submission; and the intent is exactly 'the whole value is a six-digit code'.

The pattern is re.match(r"\d{6}"), which anchors the start but not the end, so it confirms a six-digit prefix and ignores whatever follows.

```
submissions                     : 2000000
  well-formed six-digit codes   : 1999000
  six-digit prefix then junk    : 1000
```

```
accepted by re.match(\d{6})      : 2000000
accepted by re.fullmatch(\d{6})  : 1999000
wrongly accepted                : 1000
of the junk-suffixed, accepted  : 10000 per ten thousand
```

```
the code validator
  applies to : the real submitted string, not a trimmed copy
  uses : the engine's own regex, not a hand-rolled scan
  runs on : every submission
  intent : the whole value is a six-digit code
  submissions skipped : 0
  verdict : EVERY VALUE HAS A SIX-DIGIT PREFIX
```

```
  using the engine's regex over every real submission is
  the part done right here, and it is why a genuine six-
  digit prefix is reliably found
```

```
re.match(r"\d{6}")
  what re.match anchors : the start of the string
  what it does not anchor : the end
  what \d{6} then matches : the first six digits, and stops
  what happens to the rest : it is never looked at
  so a value like 482913-then-anything : matches, because
    its prefix is six digits
```

```
the result of the code check
  values that should pass : the 1999000 exact codes
  values that passed : all 2000000, junk included
  junk-suffixed values wrongly accepted : 1000
  is the pattern wrong : no; \d{6} does match six digits
  did the tail get validated : no; the fixtures were all
    clean, so the missing end-anchor never showed
```

```
null control - anchor the end (re.fullmatch)
  junk-suffixed accepted, prefix match : 1000
  junk-suffixed accepted, fullmatch : 0
  values the end-anchor now rejects : 1000
  no submission and no pattern body changed; the match
  stopped covering a prefix and started covering the whole
  string
```

```
what a re.match(\d{6}) check guarantees
  the value begins with six digits : exactly, the engine's
    own match over every submission
  the value is a six-digit code : not addressed; re.match
    anchors only the start, so \d{6} matches a prefix and
    ignores the tail - all 1000 junk-suffixed values passed
```

```
an anchor is half a fence; a start-anchored pattern says where a match begins and
nothing about where the string ends, so it certifies a prefix and lets the
remainder through, and the remainder is exactly where an unexpected value hides
```

It applies the engine's own regex to every real submission - a genuine six-digit prefix is always found. But re.match anchors only the start, so \d{6} passes any value whose first six characters are digits; all 1000 junk-suffixed values were accepted, 10000 per ten thousand of them, until the end was anchored.

Verify it yourself:

```bash
pnpm eml run examples/the-pattern-matched-a-prefix-and-passed-the-whole/the_pattern_matched_a_prefix_and_passed_the_whole.eml
```
