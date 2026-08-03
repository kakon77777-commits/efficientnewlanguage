# The parser that reads as far as it understands

`partial_parse_accepted.eml` compares two parsers for the same grammar, differing by one check: whether the whole input was consumed.

**What it exercises**: without that check, `"12abc"` parses to 12,
`"1,2,3"` as a single number parses to 1, and `"1,2,3;rm"` parses to 1.
Each is a successful parse returning a well-formed value, and the
discarded tail is where the meaning was.

Measured over generated inputs: the prefix parser accepts 9 of 27 and
fully consumed only 4 of them; the total parser accepts exactly the 4.
The property is checked as an implication — everything the total parser
accepts was fully consumed — not as an accept count, since a total
parser is expected to accept fewer.

The last check is the one that explains why this ships: the two parsers
**agree on every input both accept**. Adding the check never changes an
answer, only rejects. So swapping one for the other never shows up as a
changed result — it shows up as inputs that used to work and now raise,
which is the correct outcome and reads like a regression.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  '12abc' -> 12, dropped 'abc'
  '1,2,3' -> 1, dropped ',2,3'
  '1,2,3;rm' -> 1, dropped ',2,3;rm'
  '1,' -> 1, dropped ','

generated strings:            39
  prefix parser accepted:     9, of which fully consumed 4
  total parser accepted:      4, of which fully consumed 4

checks passed: 5/5
The extra check only ever rejects; it never changes an accepted answer.

The two parsers agree on every input both accept, which is why swapping one
for the other never shows up as a changed result in a test - it shows up as
inputs that used to work and now raise. That is the correct outcome and it
reads like a regression, which is the real reason the check gets left out.
```
