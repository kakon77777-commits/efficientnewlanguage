# Mod 97 on a number too big to hold

`iban_mod97_validator.eml` validates IBANs by the ISO 13616 rule - rearrange, expand letters to digits, take the whole thing mod 97 - and does it twice, because the number does not fit anywhere.

**What it exercises**: an IBAN expands to a 30-plus digit integer. In
Python that is exact and `% 97` just works. In a fixed-width language it
is not, and the usual workaround is a float, which silently loses the
low digits - the exact digits the remainder depends on.

That failure has no symptom. A wrong remainder is uniformly distributed,
so a broken validator accepts roughly 1 invalid account in 97 and
rejects valid ones at random. Nothing raises, nothing looks wrong, and
the bug is a support ticket rather than a stack trace.

So the program computes the remainder a second way - streamed, taking
`% 97` after each digit, never holding more than four digits at once -
and the evidence is the two routes **agreeing** on all eight samples.
The float version is printed alongside to show what it loses.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  streamed mod 97:      1
  the same value through a float: 2.2102129011000012e+44
  int(float(x)) == x:             False

samples checked:        8
accepted:               4
rejected:               4
mod-97 methods agree:   8/8

Four valid, four rejected with a stated reason, both mod-97 routes agree.

A wrong remainder is uniformly distributed, so an implementation that loses
precision does not fail loudly - it accepts roughly 1 invalid account in 97
and rejects valid ones at random. That is why the streamed version exists
here even though it is unnecessary: it is the one a fixed-width language
would have to write, and the two agreeing is the actual evidence.
```
