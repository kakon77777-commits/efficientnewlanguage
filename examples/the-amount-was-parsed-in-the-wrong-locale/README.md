# The amount was parsed in the wrong locale

`the_amount_was_parsed_in_the_wrong_locale.eml` - The importer parses every amount in the vendor file and rejects anything unparseable, and the parser is correct. What locale it parses in is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The importer is careful. It parses the real amount field, not a truncated preview; it rejects a value it cannot parse rather than defaulting it to zero; it processes every row; and the parsed totals reconcile against the row count.

The parser uses the server locale, where '.' is the thousands separator and ',' is the decimal, and the vendor file uses the opposite convention.

```
rows in the file                : 40000
  parsed                        : 40000
  rejected as unparseable       : 0
one amount, vendor meant        : 1.234 (one point two three four)
the server parsed it as         : 1234 (one thousand two hundred thirty-four)
  parsed over intended          : 10000000 per ten thousand
```

```
the amount importer
  parses : the real amount field, not a preview
  on an unparseable value : rejects it, does not default
    to zero
  over : every row
  reconciliation : parsed totals against the row count
  rows rejected : 0
  verdict : ALL ROWS PARSED
```

```
  rejecting rather than defaulting an unparseable value is
  the part done right here, and it is why a garbled row
  would not silently become zero
```

```
the parse, in the server locale
  server convention : '.' groups thousands, ',' is the
    decimal
  vendor convention : '.' is the decimal, ',' groups
    thousands
  the token '1.234' under the server locale : the integer
    1234, cleanly, no error
  so it parses : successfully, to the wrong number
  a well-formed value in one locale : is a well-formed
    different value in the other
```

```
the reconciliation
  what it checks : that every row produced a number
  rows that produced a number : all 40000
  what it does not check : that the number means what the
    vendor wrote
  is the parser wrong : no; '1.234' is a valid server-
    locale integer
  did any row fail : no; that is why the error was silent
```

```
null control - parse in the vendor's locale
  value under the server locale : 1234000 (x1000)
  value under the vendor locale : 1234
  rows now correct : 40000
  no byte in the file changed; the separators stopped
  being read by the wrong convention
```

```
what an all-rows-parsed import guarantees
  every amount parsed to a number and none was rejected :
    exactly, real field, reject-not-default, reconciled
  every amount means what the vendor wrote : not
    addressed; the parser uses the server locale where '.'
    groups thousands, so '1.234' parsed cleanly as 1234
    instead of 1.234 - a silent 1000x on every such value
```

```
a number's text is meaningless without the locale that reads it, and two
locales read the same separators oppositely; a value that parses without error
in the wrong locale is not a parse failure, it is a wrong number
```

It parses the real field, rejects the unparseable, and reconciles the count - all rows parsed. It parses in the server locale, where '.' groups thousands, so the vendor's '1.234' became 1234 - 10000000 per ten thousand of intended - with 0 rejections, because a wrong-locale amount is well-formed, not an error.

Verify it yourself:

```bash
pnpm eml run examples/the-amount-was-parsed-in-the-wrong-locale/the_amount_was_parsed_in_the_wrong_locale.eml
```
