# A round-trip property that found a broken format

`run_length_encoding.eml` implements RLE and its inverse, and checks them
against each other rather than against hand-written expected strings.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

```
INPUT          ENCODED                 IN   OUT    ROUND
--------------------------------------------------------
""             ""                       0     0      yes
"a"            "1a"                     1     2      yes
"abcdef"       "1a1b1c1d1e1f"           6    12      yes
"aaaaaaaaaa"   "10a"                   10     3      yes
"wwwwwwwwwz"   "9w1z"                  10     4      yes
"wwwwwwwwwwz"  "10w1z"                 11     5      yes
"a1a1a1"       "1a111a111a11"           6    12       NO
"mississippi"  "1m1i2s1i2s1i2p1i"      11    16      yes
--------------------------------------------------------
round-trips intact: 8 of 9
inputs RLE made bigger: 4 of 9
```

## What it found

The first version of this file asserted, in a comment, that the format is
unambiguous "because each count is followed by exactly one payload
character". **That is false**, and the round-trip said so on the first
run.

`"a1a1a1"` encodes to `"1a111a111a11"` and decodes to 223 a's. Three
separate things run together into the count `111`: the count `1` for the
`'1'`-run, the literal `'1'` itself, and the count `1` for the next
`'a'`-run. That happens twice — `1 + 111 + 111 = 223` — and the trailing
`"11"` is dropped outright, because the string ends on digits with no
payload character to close them.

No amount of re-reading the encoder would have shown that. **The encoder
is fine; the format is broken**, for any input containing digits. Fixing
it needs a delimiter or an escape — a format change, not a decoder patch.

The table reports the failure rather than hiding it. A version of this
case that quietly dropped the digit sample would have looked better and
taught nothing.

**And the honest bit about compression**: RLE made 4 of 9 inputs
*longer*. On text without runs it costs a count per character and saves
nothing.

Verify it yourself:

```bash
pnpm eml transpile examples/run-length-encoding/run_length_encoding.eml
pnpm eml run examples/run-length-encoding/run_length_encoding.eml         # -> the table, 8 of 9, and why
pnpm eml trace examples/run-length-encoding/run_length_encoding.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/run-length-encoding/run_length_encoding.eml   # -> OK (fixpoint)
```
