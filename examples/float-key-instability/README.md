# Three wrong premises about floating point

`float_key_instability.eml` looks values up in a table keyed by a number that was computed rather than typed, and records the three premises it started from — all wrong.

**What it exercises**: a table keyed on the decimal amounts a person
wrote has no entry for a total that arrived by arithmetic. Measured over
512 lookups: the float key finds **319**, integer cents find **512**.

The wrong premises are the point. The first version stored every
*ordering* of every sum and looked up a reordering — in the table by
construction, so the float key scored a perfect 216/216 and the program
proved nothing. A probe that cannot miss is not a probe.

The second was a fact: the closing note claimed `int((0.1+0.2)*100)` is
29. It is 30. Truncation does lose a cent, and finding where took a
search rather than an anecdote — at **2.675**, whose float is a hair
below, so `*100` gives 267.49999999999997.

The third was a demand: a check insisted the grand totals differ between
the two routes. They do not, for any amounts in range — and that is
sharper than what it replaced. The totals agree while 193 individual
lookups miss, so a suite that checks only the total is green while the
key scheme underneath is broken.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
the same, as floats:         2.85
the two routes agree:        True
...and that agreement says nothing about the lookups above.

values where truncating loses a cent: 2
  2.675: truncate 267, round 268
  4.045: truncate 404, round 405

checks passed: 5/5
Integer cents find every entry; the float key misses totals it created itself.

Three premises in this file were wrong, all in the same way: they were
claims about floating point that sounded right. One made a check unable to
fail, one put a wrong number in a closing sentence, and one demanded a
divergence that does not occur. The last is the useful one - the totals DO
agree, which is precisely why a suite that checks the total finds nothing.
```
