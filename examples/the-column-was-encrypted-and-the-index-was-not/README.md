# The column was encrypted and the index was not

`the_column_was_encrypted_and_the_index_was_not.eml` - The column is encrypted and nobody with the disk has the key. How many rows a reader with the index alone can label is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The encryption is done properly. The key lives in a separate service, it is rotated, the ciphertext is authenticated, and a copy of the volume is genuinely opaque. An auditor who takes the disk home learns nothing from the column, and that was the requirement.

The column also has to be searchable by equality, so a second value is stored beside it: a deterministic index, where equal plaintexts produce equal entries. That is what makes the lookup work, and it is the whole property.

The column has six distinct values with a published population distribution. Sorting six ciphertexts by frequency and lining them up against six known frequencies takes no key at all.

```
rows                    : 18400000
distinct values         : 6
rows accounted for      : 18400000
```

```
index entries by frequency
  1 : 11040000
  2 : 3680000
  3 : 2208000
  4 : 920000
  5 : 460000
  6 : 92000
```

```
the column at rest
  algorithm            : authenticated, key held elsewhere
  key on this volume   : no
  rotation             : quarterly, performed
  plaintexts recoverable from the ciphertext : 0
  verdict              : ENCRYPTED
```

```
  a stolen volume yields nothing from this column, and
  that is the property that was asked for
```

```
the equality index beside it
  equal plaintexts        : produce equal entries
  that is the requirement : a lookup needs it
  entries are encrypted   : yes
  entries are distinguishable : also yes, and that is
    the same fact
```

```
  determinism is not a weakness of this index; it is what
  the index is for, and it publishes the partition
```

```
the largest class : 6000 per ten thousand of the table
```

```
labelling the rows without the key
  distinct entries observed : 6
  published frequencies to match against : 6
  rows labelled by rank      : 18400000
  key material used          : none
```

```
  the ciphertext of each row is still unread; what was
  recovered is which rows share a value, and then which
  value that is
```

```
null control - randomised index, equality done in the key service
  column verdict            : ENCRYPTED, unchanged
  distinct entries observed : 1 per row, all different
  rows labelled by rank     : 0
  the encryption did not get stronger; the equality moved
  to the side that holds the key
```

```
what an encrypted column guarantees
  the value cannot be read from the bytes : exactly
  the value cannot be inferred            : not addressed;
    an equality index publishes which rows agree, and on a
    low-cardinality column agreeing is nearly the value
```

```
encryption hides content and a deterministic index exposes
equality; the second is the feature and the leak, and the
cardinality decides which one it mostly is
```

The column is encrypted correctly and a stolen volume yields 0 plaintexts from it: authenticated, key held elsewhere, rotated quarterly. Beside it sits a deterministic index over 6 values whose largest class is 6000 per ten thousand of the table, so ranking 6 frequencies against a published distribution labels all 18400000 rows without touching the key.

Verify it yourself:

```bash
pnpm eml run examples/the-column-was-encrypted-and-the-index-was-not/the_column_was_encrypted_and_the_index_was_not.eml
```
