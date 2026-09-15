# The character class was a range not a number

`the_character_class_was_a_range_not_a_number.eml` - A validator checks that a day-of-month value is in 1 to 31, and it uses the regex engine correctly on every value. What the character class actually denotes is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The check is careful. It applies the pattern to the real day value, not a rounded one; it uses the engine's own regex; it runs on every value; and the intent is exactly 'the day is between 1 and 31'.

The pattern is ^[1-31]$, and inside a class 1-3 is a character range and the trailing 1 is a redundant member, so the class is the three characters 1, 2, 3 and matches exactly one of them.

```
day values tested (1..31)       : 31000
  the characters 1, 2, 3        : 3000
  the days 4 through 31         : 28000
```

```
accepted by ^[1-31]$            : 3000
accepted by a numeric 1..31 check : 31000
valid days wrongly rejected     : 28000
share ^[1-31]$ accepts          : 967 per ten thousand
```

```
the day validator
  applies to : the real day value, not a rounded one
  uses : the engine's own regex
  runs on : every value
  intent : the day is between 1 and 31
  values skipped : 0
  verdict : EVERY VALUE WAS TESTED AGAINST THE CLASS
```

```
  using the engine's regex over every value is the part
  done right here, and it is why the class is applied
  uniformly and predictably
```

```
the class [1-31]
  what 1-3 is inside a class : the character range 1 to 3
  what the trailing 1 adds : nothing; it is already in 1-3
  so the class is the set : the characters 1, 2, 3
  how many characters it matches : exactly one
  so 27 and 31 and 4 : all rejected, being outside {1,2,3}
    or longer than one character
```

```
the result of the day check
  values that should pass : all 31000 days 1..31
  values that passed : 3000, only 1, 2, 3
  valid days wrongly rejected : 28000
  is the pattern malformed : no; it compiles and matches
  is a range the same as a number : no; [1-31] reads 1-3 as
    characters, and the fixtures happened to use 1, 2, 3
```

```
null control - write the numeric range, not a class
  accepted by ^[1-31]$ : 3000
  accepted by the numeric range : 31000
  valid days the range recovers : 28000
  no value and no intent changed; the pattern stopped
  reading 1-31 as three characters and started reading it
  as a span of numbers
```

```
what a ^[1-31]$ check guarantees
  the value is one character from {1,2,3} : exactly, the
    engine's own class match over every value
  the value is a day from 1 to 31 : not addressed; inside a
    class 1-3 is a range and the 1 is redundant, so [1-31]
    is {1,2,3} and rejects the 28000 days from 4 to 31
```

```
a character class is a set of characters, not an arithmetic interval; the dash
spans code points and the digits after it are members, so a class written to look
like a number range means something with no numbers in it at all
```

It runs the engine's regex over every value - the class is applied uniformly. But [1-31] denotes the characters 1, 2, 3, not the numbers 1 through 31, so it accepts 3000 values and rejects the other 28000; only 967 per ten thousand pass, until the intent is written as a numeric range.

Verify it yourself:

```bash
pnpm eml run examples/the-character-class-was-a-range-not-a-number/the_character_class_was_a_range_not_a_number.eml
```
