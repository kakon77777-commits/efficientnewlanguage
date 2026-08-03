# Points add and reverse; relative changes do not

`percentage_points_vs_percent.eml` distinguishes the two units hiding behind "it went up 2%", in integer basis points so no float enters the comparison.

**What it exercises**: 4% to 6% is up 2 percentage points and up 50
percent, and the two differ by a factor of 25. Both are correct answers
to questions nobody distinguished, so no arithmetic check catches the
mix-up — only a unit does.

Measured over 20 round trips: percentage points reverse exactly **20/20**;
relative changes reverse exactly **0/20** and end lower every single
time. The error has a direction. Points compose by addition; relative
changes compose by multiplication, so reporting the sum of two relative
moves is wrong by their product.

And one "+50%" with no base stated produces three different levels from
three different starting rates — which is why the base is part of the
statement rather than context.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  75% would have given:       7.00%

a '+50%' with no base stated:
  1.00% +50% -> 1.50%
  4.00% +50% -> 6.00%
  20.00% +50% -> 30.00%
  distinct results from one sentence: 3

checks passed: 5/5
Points add and reverse; relative changes multiply and do not.

Both numbers are correct and they answer different questions, so no
arithmetic check catches the mix-up - only a unit does. Percentage points
are a real unit with addition and an inverse; a relative change is a ratio
that means nothing without the base it was taken against, and the base is
exactly what the sentence leaves out.
```
