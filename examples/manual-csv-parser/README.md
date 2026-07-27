# Manual CSV parser

`manual_csv_parser.eml` splits CSV lines into fields one character at a
time, tracking whether the scan is currently inside a quoted region.

```
input:  "Smith, John",42,Taipei
fields: 3 -> ['Smith, John', '42', 'Taipei']
```

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: the corpus's first **parser** — small, but a real
one: it carries state, and what a character *means* depends on that
state.

This is deliberately not a split-on-comma. A comma inside quotes is
ordinary text, so `Smith, John` stays **one** field — precisely the case a
naive split gets wrong while still appearing to work on simple rows. The
samples cover a plain row (which a split would handle), a quoted-comma
row (which it would not), an empty middle field, a row that is nothing
but separators, and an escaped quote.

**The escaped-quote sample earned its place.** In CSV a doubled `""`
inside a quoted field is an escaped literal quote, not a close followed by
an open. A plain toggle produces the right field *boundaries* for
`"with ""inner"" marks"` but silently eats the quote characters, yielding
`with inner marks` instead of `with "inner" marks`. That is what the
one-character lookahead in the parser is for, and the bug was visible only
because that row was in the sample set.

EML has no `.split()` — it is interpreter-deferred — so the scan is
written out rather than delegated. That constraint is what makes this case
worth having: the state machine has to be visible.

Verify it yourself:

```bash
pnpm eml transpile examples/manual-csv-parser/manual_csv_parser.eml   # -> Python
pnpm eml run examples/manual-csv-parser/manual_csv_parser.eml         # -> 5 rows, each with its parsed fields
pnpm eml trace examples/manual-csv-parser/manual_csv_parser.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/manual-csv-parser/manual_csv_parser.eml   # -> OK (fixpoint)
```
