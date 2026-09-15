# The dollar sign matched the end of a line

`the_dollar_sign_matched_the_end_of_a_line.eml` - A validator checks that a field is digits and nothing else, and it uses the regex engine correctly on every submission. What the end-anchor matches is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The check is careful. It applies the pattern to the real submitted bytes, not a stripped copy; it uses the engine's own regex; it runs on every submission; and the intent is exactly 'the value is digits, nothing else'.

The pattern is ^\d+$, and in default mode $ matches at the end of the string OR just before a trailing newline, so a value of digits followed by a line feed still matches.

```
submissions                     : 2000000
  digits only                   : 1999000
  digits then a trailing newline : 1000
```

```
accepted by ^\d+$               : 2000000
accepted by \A\d+\Z             : 1999000
wrongly accepted                : 1000
of the newline-bearing, accepted : 10000 per ten thousand
```

```
the digits-only validator
  applies to : the real submitted bytes, not a stripped copy
  uses : the engine's own regex
  runs on : every submission
  intent : the value is digits, nothing else
  submissions skipped : 0
  verdict : EVERY VALUE IS DIGITS FROM START TO $
```

```
  using the engine's regex over the real bytes of every
  submission is the part done right here, and it is why a
  genuinely digits-only value always matches
```

```
the anchor $ in default mode
  where $ matches : the end of the string, OR just before
    a newline at the end of it
  so ^\d+$ against 123456 then a line feed : matches, the $
    lands before the newline
  what the value actually is : digits plus a line feed
  did the pattern fail : no; it matched, leniently
  what rides through : a newline certified as digits-only
```

```
the result of the digits check
  values that should pass : the 1999000 digits-only values
  values that passed : all 2000000, newline-bearing included
  newline-bearing values wrongly accepted : 1000
  is the pattern wrong : no; $ behaves as specified
  is a trailing newline 'nothing else' : no; and the
    fixtures had no trailing newline, so it never showed
```

```
null control - anchor to the very end with \Z
  newline-bearing accepted, $ : 1000
  newline-bearing accepted, \Z : 0
  values the end-of-string anchor rejects : 1000
  no submission and no pattern body changed; the anchor
  stopped matching before a trailing newline and started
  matching only the true end
```

```
what a ^\d+$ check guarantees
  the value is digits up to a line boundary : exactly, the
    engine's own match over every submission
  the value is digits and nothing else : not addressed; $
    also matches before a trailing newline, so a digits-
    then-newline value passes - all 1000 of them did
```

```
the end of a line is not the end of a string; an anchor that stops before a final
newline certifies everything up to the break and says nothing about the break
itself, so the one character that turns a value into two lines rides through
```

It runs the engine's regex over the real bytes of every submission - a digits- only value always matches. But $ also matches before a trailing newline, so a digits-then-newline value passes ^\d+$; all 1000 were accepted, 10000 per ten thousand of the newline-bearing values, until the anchor was \Z.

Verify it yourself:

```bash
pnpm eml run examples/the-dollar-sign-matched-the-end-of-a-line/the_dollar_sign_matched_the_end_of_a_line.eml
```
