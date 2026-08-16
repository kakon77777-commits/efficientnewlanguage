# The top three are the same item - one cause spread across three strings outranks every entry

`the_top_three_are_the_same_item.eml` groups by the string the log carries and again by the cause the strings stand for.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: grouping by the message string is the only grouping available - there is no error code, and the string is what the log has. Every count is a correct count of that exact string. The strings differ because one interpolates a hostname, one was reworded, one comes from a retry path.

```
the top errors, as displayed
  41  connect failed: db-1
  33  timeout in handler
  29  connection failed to db-1
  22  parse error at line 3
  18  connect failed (retry): db-1
  9  disk full
  total : 152
```

```
grouped by cause
  88  db-pool   (3 distinct strings)
  33  handler   (1 distinct strings)
  22  parser   (1 distinct strings)
  9  disk   (1 distinct strings)
```

```
  largest cause : db-pool at 88  (57% of all errors)
  largest single string : 41  (26%)
```

```
the top three, by string
  connect failed: db-1
  timeout in handler
  connection failed to db-1
  they cover 67% of errors and 
  2 distinct causes
```

```
where each cause would rank
  by string, db-pool does not appear as one entry at all
  by cause, it is first, at 57% - larger than any string in the list
```

```
control - a log where each cause emits one string
  strings : 3, causes : 3
  here the string ranking IS the cause ranking
```

Every count is right about the string it counts. Whether the strings stand one-to-one for the things anyone cares about is a separate fact, and the ranking is read as though they do.

Verify it yourself:

```bash
pnpm eml run examples/the-top-three-are-the-same-item/the_top_three_are_the_same_item.eml
```
