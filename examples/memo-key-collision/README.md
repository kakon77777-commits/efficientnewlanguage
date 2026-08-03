# The cache key that answers the wrong question

`memo_key_collision.eml` memoizes a two-argument function three ways and measures which of the three keys is a key at all.

**What it exercises**: gluing arguments together to form a cache key
means `f(1, 23)` and `f(12, 3)` both land on `"123"`. The second call is
a cache hit and returns the first call's answer — a well-formed number
for a well-formed input, with nothing to raise about.

The usual fix is a separator, and it survives every integer and dies on
the first string that contains one: `"1"+"|"+"2|3"` and `"1|2"+"|"+"3"`
are the same key. A separator is a convention, not a boundary — the same
lesson the run-length codec in this corpus learned.

Measured against the unmemoized function over a full grid: the naive key
gets **5 of 63** integer pairs wrong, the separator gets **1 of 36**
string pairs wrong, and only the length-prefixed key agrees everywhere.
There is also a check that the correct cache is still a cache — 49
distinct entries for 63 calls — because "disable the cache" would pass
every other test here.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```
  "1" + "|" + "2|3"  = 1|2|3
  "1|2" + "|" + "3"  = 1|2|3
  length-prefixed:     1:13:2|3   and   3:1|21:3

wrong answers from the naive key:      5/63
wrong answers from the separator key:  1/36 (strings only)
distinct length-prefixed entries:      49 for 63 calls

checks passed: 5/5
Only the length-prefixed key agrees with the unmemoized function everywhere.

A memo cache has no error state. When the key is wrong the second caller
receives the first caller's answer, which is a well-formed value of the
right type, and the function has quietly become a different function. The
separator is the instructive part: it is correct for every integer and
wrong for strings, so the type you tested with decides whether you ship it.
```
