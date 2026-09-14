# The ids were sorted as text

`the_ids_were_sorted_as_text.eml` - The export lists records in ascending id order and the sort is correct. What kind of order it is is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The export is careful. It sorts on the real id, not a display label; it uses the database's own ORDER BY; it includes every record; and ascending id is exactly what the downstream reconciler expects so it can merge by a moving cursor.

The id column is stored as text, so the order is lexicographic, not numeric.

```
records exported                : 12000
a few ids, numeric order        : 2, 9, 10, 100
the same ids, text order        : 10, 100, 2, 9
```

```
id 10 vs id 2, numeric          : 10 comes after 2
id 10 vs id 2, as text          : '10' comes before '2'
reconciler mis-orderings it flagged : 0
```

```
the ordered export
  sorts on : the real id, not a display label
  operator : the database's own ORDER BY
  includes : every record
  intent : ascending id for a cursor-based merge
  records omitted : 0
  verdict : ORDERED BY ID ASCENDING
```

```
  sorting on the real id rather than a display label is
  the part done right here, and it is why the order is
  over the true key
```

```
ORDER BY over a text id
  what it compares : characters, left to right
  '10' against '2' : '1' < '2', so '10' sorts first
  '100' against '9' : '1' < '9', so '100' sorts before 9
  so the order : 10, 100, 2, 9 - not 2, 9, 10, 100
  numeric and text order agree only : while ids have the
    same number of digits
```

```
the cursor-based reconciler
  what it assumes : ids arrive in increasing numeric
    order
  what it does when an id looks smaller than the cursor :
    treats it as already processed and skips it
  so records after a digit-count change : are skipped as
    'behind the cursor'
  is the ORDER BY wrong : no; it is the correct text order
  is text order the numeric order the reconciler needs :
    no
```

```
null control - sort as integers (or zero-pad)
  text order matches numeric : 0
  numeric order is correct : 1
  reconciler merges cleanly : 1
  no id changed; the comparison stopped ranking the ids by
  their spelling
```

```
what ORDER BY id guarantees
  the rows are in ascending order of the column : exactly,
    the engine's own ORDER BY over every record
  the rows are in ascending numeric id order : not
    addressed; the id is text, so the order is
    lexicographic - '10' precedes '2', and a reconciler
    that expects numeric order skips the rows that look
    behind its cursor
```

```
an order is over a type, and the id's type is text; the sort is a correct
ordering of strings, and strings rank by their first differing character, not
by the quantity they denote
```

It sorts the real id with the engine's ORDER BY over every record - a correct text order. The id is stored as text, so it runs 10, 100, 2, 9, and a cursor-based reconciler that assumes numeric order skips whatever falls behind its cursor, under 0 mis-orderings it flagged.

Verify it yourself:

```bash
pnpm eml run examples/the-ids-were-sorted-as-text/the_ids_were_sorted_as_text.eml
```
