# The column was dropped and the cascade took the view

`the_column_was_dropped_and_the_cascade_took_the_view.eml` - Thirty-four repositories were searched for references to the column and none was found. What the drop removed is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The search was done properly. Every repository the organisation owns, not just the obvious ones; the column name and its camel-case and snake-case spellings; generated clients as well as hand-written ones; and the two hits it did find were in a changelog and a migration that had already run. Zero live references is a real zero and finding it took an afternoon.

It searched CODE. The database holds objects of its own that reference the column, and the drop refused until it was told to proceed anyway.

`CASCADE` is not a force flag. It is a request to drop whatever depends on this, and the statement does not say what that turned out to be.

```
repositories searched          : 34
live code references found     : 0
hits in a changelog or a spent migration : 2
```

```
database objects the cascade dropped : 3
dashboards reading the view    : 11
days until it was noticed      : 9
```

```
the reference search
  repositories        : 34, every one the organisation owns
  spellings           : the column name, camel case, snake case
  generated clients   : searched as well as hand-written code
  live references     : 0
  hits, both dead     : 2
  verdict             : UNREFERENCED
```

```
  this took an afternoon and it is the right way to do it
```

```
the objects the search cannot see
  a view selecting the column : in the database
  an index on it              : in the database
  a constraint mentioning it  : in the database
  where their definitions live : the catalog, not a
    repository
  what the drop did when it met them : refused
```

```
  the refusal was the system reporting exactly this, and
  the response to a refusal is what turned it off
```

```
the second attempt
  statement           : the same drop, with CASCADE
  what CASCADE means  : drop whatever depends on this too
  what it printed     : that it had done so
  what it named       : nothing
  objects removed     : 3
```

```
  the flag reads as 'yes, I am sure about the column' and
  means 'and about everything downstream of it'
```

```
dashboards on the dropped view : 11, all of them
```

```
how a dropped view looks on a dashboard
  the query errors    : yes
  the panel shows     : its empty state
  what an empty state means the rest of the time : a quiet
    period
  an alert on no-data : not configured, because no-data is
    normal at night
```

```
null control - the refusal read instead of overridden
  live code references : 0, unchanged
  objects the refusal names : 3
  objects dropped unknowingly : 0
  the search did not need to be better; the database had
  already produced the list the search could not
```

```
what an exhaustive code search guarantees
  no code refers to this : exactly, and thoroughly
  nothing refers to this : not addressed; a database holds
    definitions of its own, and they are not in any
    repository
```

```
a search covers the corpus it is run over; the objects most
likely to be missed are the ones stored somewhere that is
not a file, and the system that holds them will say so if
the refusal is read rather than overridden
```

The search covered all 34 repositories, three spellings and the generated clients, found 0 live references and 2 dead ones, and took an afternoon. The drop refused, CASCADE was added, and 3 database objects went with the column - including a view 11 dashboards read, which showed their empty state for 9 days because an empty state is what a quiet period looks like.

Verify it yourself:

```bash
pnpm eml run examples/the-column-was-dropped-and-the-cascade-took-the-view/the_column_was_dropped_and_the_cascade_took_the_view.eml
```
