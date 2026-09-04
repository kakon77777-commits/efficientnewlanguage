# The numbers were anonymised and the combination was unique

`the_numbers_were_anonymised_and_the_combination_was_unique.eml` - Every direct identifier was removed and the removal was verified field by field. How many records identify one person is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The removal was thorough. Name, email address, account number and phone were dropped, not masked; the extract was diffed against the source to prove the columns are absent rather than blanked; free-text fields were scanned for identifiers that had leaked into them and forty-one were found and removed; and the release was signed off by someone who had done this before.

What was kept is what the research needs: postcode, date of birth, sex. Each of those is worthless alone and the three together are not.

Two point six million of the three point one million records are the only record with their triple.

```
records                      : 3100000
direct identifiers removed   : 4
direct identifiers remaining : 0
quasi identifiers kept       : 3
```

```
unique on the kept triple    : 2684000
sharing their triple         : 416000
share unique                 : 8658 per ten thousand
```

```
the de-identification
  columns dropped rather than masked : yes
  extract diffed against the source  : yes
  free-text scanned for leaked identifiers : yes
  identifiers found and removed there : 41
  direct identifiers remaining : 0
  signed off by someone experienced : yes
  verdict                      : DE-IDENTIFIED
```

```
  the free-text scan alone is more than most releases do,
  and it found real leaks
```

```
the three that stayed
  postcode      : the study is about geography
  date of birth : the study is about age
  sex           : the study stratifies on it
  each alone identifies : nobody
  the three together    : 2684000 records
```

```
  every one was kept for a reason and none of the reasons
  is wrong; the property that fails is a property of the
  combination, and no field-by-field review has one
```

```
linking to an external list
  what is needed  : a list with the same three fields
  such lists      : commercially available
  the operation   : a join
  records it names : 2684000
  inference or cryptanalysis required : none
```

```
null control - postcode district and birth year
  direct identifiers remaining : 0, unchanged
  unique on the triple  : 0
  sharing their triple  : 3100000
  the removal did not get more thorough; the fields that
  were kept stopped being fine enough to single anyone out
```

```
what removing every direct identifier guarantees
  no field names a person : exactly, and verifiably
  no record names a person : not addressed; identification
    is a property of a tuple, and a review that walks the
    columns one at a time cannot hold a tuple
```

```
anonymity is a property of a set, not of a schema; the check
that would find this counts how many records share their
quasi-identifiers, and nothing in a field-by-field review
asks for a count
```

The de-identification is thorough: 4 columns dropped rather than masked, the extract diffed against the source, free text scanned with 41 real leaks found and removed, 0 direct identifiers remaining. The 3 fields the study needs leave 2684000 of 3100000 records - 8658 per ten thousand - as the only record with their combination, recoverable by a join against a list anyone can buy.

Verify it yourself:

```bash
pnpm eml run examples/the-numbers-were-anonymised-and-the-combination-was-unique/the_numbers_were_anonymised_and_the_combination_was_unique.eml
```
