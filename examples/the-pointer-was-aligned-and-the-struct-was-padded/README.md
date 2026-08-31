# The pointer was aligned and the struct was padded

`the_pointer_was_aligned_and_the_struct_was_padded.eml` - Every field in the record is correctly aligned and the compiler guarantees it. What the record costs is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Alignment is a correctness property and it holds here exactly. Each field begins at an offset divisible by its own size, no load straddles a cache line in a way the hardware would trap on, and the compiler inserted whatever gaps were needed to make that true without being asked.

The gaps are the cost. Alignment says WHERE each field starts; it says nothing about how much of the record is field and how much is the compiler making the next offset divide. Reordering the same fields changes nothing about correctness and changes the size.

The record is declared in the order a person would read it. Held that way it is forty bytes; sorted widest-first it is twenty-four.

```
bytes that are field       : 22
size as declared           : 40
size reordered widest first: 24
```

```
the alignment the compiler enforced
  flag      at offset 0
  id        at offset 8   divisible by 8
  kind      at offset 16
  timestamp at offset 24  divisible by 8
  count     at offset 32  divisible by 4
  misaligned loads : 0
  verdict          : correctly aligned
```

```
  true in both layouts, and true for every field; the
  compiler will not emit a misaligned one
```

```
padding in the declared layout  : 18
padding when reordered          : 2
difference per record           : 16
```

```
share of the declared record that is gap : 4500 per ten thousand
```

```
records held in memory     : 42000000
bytes as declared          : 1680000000
bytes reordered            : 1008000000
bytes the field order cost : 672000000
```

```
null control - the same fields declared widest first
  alignment verdict           : correctly aligned, unchanged
  padding                     : 2
  further saving from reorder : 0
  the rule did not change; the declaration order stopped
  forcing gaps to satisfy it
```

```
what correct alignment guarantees
  every field starts where the hardware wants it : exactly
  the record is no larger than its fields        : not
    addressed, and the padding is the mechanism that
    makes the first hold
```

```
alignment is satisfied by inserting gaps; declaration order
decides how many gaps satisfying it takes, and no diagnostic
fires because nothing is wrong
```

Every field is correctly aligned in both layouts and 0 loads are misaligned. The declared order needs 18 bytes of gap around 22 bytes of field - 4500 per ten thousand of the record is padding - so the same five values occupy 40 bytes instead of 24, and across 42000000 resident records that is 672000000 bytes bought by the order somebody wrote the fields in.

Verify it yourself:

```bash
pnpm eml run examples/the-pointer-was-aligned-and-the-struct-was-padded/the_pointer_was_aligned_and_the_struct_was_padded.eml
```
