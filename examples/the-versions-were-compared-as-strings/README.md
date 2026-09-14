# The versions were compared as strings

`the_versions_were_compared_as_strings.eml` - The deploy picks the latest version by taking the maximum of the version column, and the maximum is computed correctly. What kind of maximum it is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The selection is careful. It reads the real version column, not a mutable 'latest' pointer; it uses the database's own MAX; it runs over every published version; and picking the greatest is exactly what 'deploy the latest' means.

The version column is text, so MAX is the lexicographically greatest string, not the highest version.

```
published versions              : 47
lexical max (as text)           : selects 1.9
intended max (as version)       : 1.10
  1.10 is newer than 1.9 by     : one minor release
deploys that shipped the older  : 1
live releases newer than picked : 0
```

```
the latest-version selection
  reads : the real version column, not a 'latest' pointer
  operator : the database's own MAX
  over : every published version
  intent : deploy the greatest version
  mutable pointers that could be stale : 0
  verdict : DEPLOY THE MAX
```

```
  reading the column rather than a mutable 'latest'
  pointer is the part done right here, and it is why the
  pick is not a stale tag
```

```
MAX over a text column
  what it compares : strings, character by character
  '1.10' against '1.9' : '1' = '1', '.' = '.', then '1' <
    '9', so '1.10' < '1.9'
  so the text maximum : '1.9'
  the version maximum : 1.10, which is newer
  the two disagree exactly when : a later component has
    more digits
```

```
the deploy
  version the query picked : 1.9
  newest published version : 1.10
  what shipped : the older release, as 'latest'
  is MAX wrong : no; '1.9' is the greatest string
  is the greatest string the newest version : no, once a
    component crosses ten
```

```
null control - compare by numeric components
  text comparison picks : 1.9
  component comparison picks : 1.10
  deploys that would flip to the newer : 
    1
  no version and no MAX changed; the comparison stopped
  ranking the digits as characters
```

```
what MAX(version) guarantees
  the selected value is the greatest in the column :
    exactly, the engine's own MAX over every row
  the selected version is the newest : not addressed; the
    column is text, so MAX is the lexicographically
    greatest string - '1.9' beats '1.10', and the deploy
    shipped the older release as latest
```

```
a maximum is only as meaningful as the order it maximizes over, and text order
ranks '1.10' below '1.9' because it reads the second digit before the length;
the greatest string is not the greatest number it spells
```

It reads the real column with the engine's MAX over every version - a correct string maximum. The column is text, so '1.9' outranks '1.10' character by character, and the deploy shipped 1.9 as the latest while 1.10 sat newer and unpicked, under 1 deploy of the older release.

Verify it yourself:

```bash
pnpm eml run examples/the-versions-were-compared-as-strings/the_versions_were_compared_as_strings.eml
```
