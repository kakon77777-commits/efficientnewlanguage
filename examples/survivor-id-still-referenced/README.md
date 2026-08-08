# Survivor id still referenced — the rows vanished from one report and stayed in the other

`survivor_id_still_referenced.eml` merges two customer records two ways — hard
delete, and tombstone with a redirect — then runs two ordinary reports over
each result and compares them against the pre-merge totals.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the choice of which row lives is made in the customer
table, by code that knows about customers. The loser's id is a foreign key in
the order table, and that table is not in the diff.

| | revenue (join) | rows | revenue (flat) | orders | dangling |
| --- | --- | --- | --- | --- | --- |
| before merge | 605 | 5 | 605 | 5 | 0 |
| merge by **delete** | **480** | **3** | 605 | 5 | **2** |
| merge by **alias** | 605 | 5 | 605 | 5 | 0 |

Nothing errored. An inner join's whole job is to drop rows with no match, so
"revenue by customer" simply produced fewer rows. "Total revenue", taken
straight off the order table, had nothing to drop. After the hard delete the
two reports disagree by **125**, and neither is wrong about its own question:

- the join reports revenue for customers that exist
- the flat report reports revenue for orders that exist

Before the merge those were the same set.

What the survivor ends up credited with:

```
before   c-101 is attributed 180
delete   c-101 is attributed 180
alias    c-101 is attributed 305
```

The merge existed to combine two records for one person. Under a hard delete it
credited the survivor with **nothing extra** — it discarded the other identity's
history instead of absorbing it.

An id is not owned by the table it is defined in; it is owned by every table
that stores it. A row deletion looks local only because foreign keys point
*inward* — the customer table cannot see who is pointing at it.

Verify it yourself:

```bash
pnpm eml run examples/survivor-id-still-referenced/survivor_id_still_referenced.eml
```
