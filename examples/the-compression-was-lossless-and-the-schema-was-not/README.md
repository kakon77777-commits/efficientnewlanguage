# The compression was lossless and the schema was not

`the_compression_was_lossless_and_the_schema_was_not.eml` - Every archived byte comes back identical and ninety restores prove it. What cannot be recovered is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The compression is lossless in the exact sense. The decompressor returns the input bit for bit, a checksum over the original is stored beside the archive and compared on every restore, and ninety restores across three years have produced zero mismatches. There is no approximation anywhere in the codec.

Lossless is a property of the CODEC, over the bytes it was given. Producing those bytes was a separate step, and that step used an encoding where an omitted field and a field set to its default are the same on the wire.

So the archive restores exactly what was serialised, and what was serialised already could not tell "nobody said" from "somebody said zero".

```
records archived              : 71000000
restores performed            : 90
byte mismatches               : 0
```

```
field omitted                 : 22400000
field explicitly the default  : 5900000
records that read as zero     : 28300000
records with a nonzero value  : 42700000
```

```
the codec
  decompressed output equals input : bit for bit
  checksum stored beside the archive : yes
  restores performed  : 90
  byte mismatches     : 0
  approximation anywhere in the codec : none
  verdict             : LOSSLESS
```

```
  the guarantee is exact and the evidence for it is three
  years of restores
```

```
serialising one record
  field absent from the object : written as nothing
  field present and equal to the default : also written
    as nothing, because the encoding omits defaults
  bytes produced by the two cases : identical
  the codec receives            : one of them
```

```
  the loss happened before the compressor was called, in a
  step nobody describes as lossy because it is a schema
```

```
share of records that read as zero : 3985 per ten thousand
```

```
questions about the restored data
  what did record 4,180,002 hold : answerable, exactly
  is the archive intact          : answerable, 0 mismatches
  how many customers declined    : not answerable
  how many were never asked      : not answerable
  their sum                      : 28300000, answerable
```

```
  the pair is gone and the total is intact, which is the
  signature of a lossy encoding rather than a lossy codec
```

```
null control - absence given its own representation
  byte mismatches       : 0, unchanged
  recorded as absent    : 22400000
  recorded as zero      : 5900000
  ambiguous records     : 0
  the compression did not improve; the bytes handed to it
  started carrying the distinction
```

```
what lossless compression guarantees
  the bytes are recovered exactly : exactly
  the meaning is recovered        : not addressed; the
    codec's input is already the output of an encoding,
    and no property of the codec reaches upstream of it
```

```
'lossless' names the last hop; when a pipeline has a lossy
step and a lossless one, the honest claim is about the
composition, and only the second hop has a word for it
```

The codec is lossless in the exact sense: bit-for-bit output, a checksum on every restore, 90 restores and 0 mismatches in three years. The encoding omits defaults, so 22400000 records that never stated the field and 5900000 that stated it as zero produce identical bytes - 28300000 records, 3985 per ten thousand - and the archive restores that ambiguity perfectly.

Verify it yourself:

```bash
pnpm eml run examples/the-compression-was-lossless-and-the-schema-was-not/the_compression_was_lossless_and_the_schema_was_not.eml
```
