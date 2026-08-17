# The range and the slice disagree about the end

`the_range_and_the_slice_disagree_about_the_end.eml` - Two constructs in one language, both written [a:b], and they do not mean the same b.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Neither choice is wrong. A for-range that includes its end reads the way a person says "one to ten". A slice that excludes its end makes lengths subtract cleanly and makes adjacent slices tile without overlap. Most languages pick one convention; this one has both, each where it is natural.

The cost lands on code that uses them together, because the same bracket syntax carries two different promises about b. Every claim below is measured by running both constructs over the same bounds.

```
string : abcdefgh, length 8
```

```
for i in [2:5] visits
  2 3 4 5 
  values visited : 4
```

```
s[2:5] is
  cde
  characters : 3
```

```
  the range visits exactly one more index than the slice yields
```

```
walking the string with a for-range over indices
  rebuilt : abcdefgh
  original : abcdefgh
  identical - because s[i:i+1] takes one character and the range covers
  0 to n-1 inclusive, which is every index
```

```
the same walk written with the slice bound reused as the range bound
  rebuilt : abcdefgh|
  length : 8
  index n yields the empty slice rather than an error, so the loop runs
  one extra time and appends nothing
```

```
slices at and past the end
  s[7:8] : 'h'
  s[8:8] : ''
  s[8:10] : ''
  past the end is empty, not an error
```

```
  s[0:3] + s[3:8] : abcdefgh
  the two halves tile exactly, with the cut index appearing once
```

```
  for d in [1:7] gives 7 days, which is what a week is
```

```
control - a backwards pair
  for i in [3:2] visits : 0
  s[3:2] is : ''
  both empty, so a test on this input distinguishes nothing
```

Both conventions are the right one for their construct. They share a notation, so which promise [a:b] makes is decided by what is to the left of it.

Verify it yourself:

```bash
pnpm eml run examples/the-range-and-the-slice-disagree-about-the-end/the_range_and_the_slice_disagree_about_the_end.eml
```
