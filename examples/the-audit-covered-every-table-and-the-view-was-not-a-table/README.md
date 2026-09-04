# The audit covered every table and the view was not a table

`the_audit_covered_every_table_and_the_view_was_not_a_table.eml` - Every table in the database is covered by the access audit and the coverage is enumerated rather than asserted. What is not covered is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The audit is built the right way round. It does not take a list of tables from a document; it queries the catalog for every table that exists, joins that against the tables it has a policy for, and fails if the difference is non-empty. A table added without a policy fails the nightly job, and that has happened four times and been fixed each time.

The catalog query asks for tables. A view is a different kind of object, it is queryable by the same clients with the same syntax, and it is not in the answer.

Nine of the eleven views select from a table the policy calls restricted.

```
tables                          : 412
tables with a policy            : 412
tables uncovered                : 0
tables caught without a policy this year : 4
```

```
views                           : 11
  selecting restricted data     : 9
  over unrestricted data        : 2
queryable objects               : 423
share not covered               : 260 per ten thousand
```

```
the coverage check
  source of the object list : the catalog, not a document
  method                    : every table that exists,
    joined against the tables with a policy
  fails when the difference is non-empty : yes
  tables caught this year   : 4, each fixed
  tables uncovered now      : 0
  verdict                   : COMPLETE
```

```
  enumerating from the catalog rather than from a list is
  the whole difference between this and a checklist, and
  it is why the four were caught
```

```
the enumeration
  asks for        : tables
  a view is       : a different object kind
  a client querying a view uses : the same syntax, the
    same connection, the same permissions model
  is a view in the answer : no
  is that a bug in the query : no, it asked what it asked
```

```
  the audit is complete over its population and the
  population is narrower than the word `every` suggests
```

```
why the views select restricted data
  a view exists to : expose a shaped subset to a caller
    who should not have the table
  who created most of them : a data-access review
  so selecting from a restricted table is : their purpose
  and it is also why they are the objects most worth
    auditing
```

```
share of views over restricted data : 8181 per ten thousand
```

```
null control - enumerate queryable objects, not tables
  source of the list  : the catalog, unchanged
  objects enumerated  : 423
  objects uncovered   : 0
  the audit did not become more thorough; the noun in its
  query stopped being narrower than the noun in its name
```

```
what an enumerated audit guarantees
  every member of the enumerated set is covered : exactly,
    and better than any checklist
  everything reachable is covered               : not
    addressed; the set comes from a query, and the query
    names a kind
```

```
enumerating from the system beats enumerating from a document
and inherits the system's taxonomy; the gap is not a
forgotten item but a category the query did not ask for, and
the audit's own completeness proof cannot see it
```

The audit enumerates from the catalog rather than from a document, joins every existing table against the tables with a policy, fails on any difference, and caught 4 tables this year - 0 are uncovered out of 412. Its query asks for tables, so 11 views are outside it - 260 per ten thousand of the queryable objects - and 9 of them, 8181 per ten thousand, exist to expose restricted data.

Verify it yourself:

```bash
pnpm eml run examples/the-audit-covered-every-table-and-the-view-was-not-a-table/the_audit_covered_every_table_and_the_view_was_not_a_table.eml
```
