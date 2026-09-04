# The checksum covered the plaintext and the archive kept the compressed

`the_checksum_covered_the_plaintext_and_the_archive_kept_the_compressed.eml` - The digest is computed over the plaintext before compression and verified after decompression, end to end. What the storage migration verified is computed below.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: The end-to-end check is the right one. Computing the digest over the compressed bytes would verify the transport and say nothing about the content; computing it over the plaintext and checking it after decompression covers the compressor, the transport and the decompressor in one comparison. It has caught a truncated transfer and a bad decompressor build.

What the archive holds is the compressed bytes and that digest. Verifying it means decompressing, which for four point two terabytes is eighteen hundred CPU hours, so the migration that re-encoded everything to a newer format verified what it could afford: sizes and record counts.

Twelve archives came out of the migration short.

```
archives                     : 41000
bytes stored                 : 4200000000000
records                      : 71000000
```

```
archives that lost records   : 12
archives intact              : 40988
records lost                 : 310000
share lost                   : 43 per ten thousand
size or count mismatches reported : 0
```

```
the transfer check
  digest computed over : the plaintext, before compression
  verified             : after decompression, by the receiver
  what that covers     : compressor, transport, decompressor
  what it has caught   : a truncated transfer, a bad
    decompressor build
  verdict              : END TO END
```

```
  choosing the plaintext over the compressed bytes is the
  stronger of the two and somebody argued for it
```

```
checking one archive at rest
  requires        : decompressing it
  for the estate  : 1840 CPU hours
  what the migration checked instead : compressed size and
    record count, per archive
  mismatches those found : 0
```

```
  a count is a real check and it catches a whole class;
  it is not the class the digest was chosen to catch
```

```
the count
  written by      : the migration, as it wrote
  counts          : the records it emitted
  records dropped before the counter : 310000
  so the count is : a true count of the output
  what would have differed : a count taken from the input
```

```
share of archives affected : 2 per ten thousand
```

```
null control - a sample decompressed and digest-checked
  archives sampled   : 100
  CPU hours          : 4
  the class of defect it can see : the one the digest was
    chosen for, on 12 affected archives it would have to
    be lucky to hit - so the sample is a detector, not a
    proof, and it is stated as one
```

```
what an end-to-end digest guarantees
  what arrived is what was sent : exactly, on every transfer
  what is stored is what was sent : addressed only when
    somebody pays to check it, and the price is the
    decompression the digest's own choice of operand
    implies
```

```
choosing the stronger operand makes the check better and
makes it cost more to run; the cheap substitute a later job
reaches for is a different check, and it is the one that
actually runs
```

The digest covers the plaintext and is verified after decompression, which is the stronger of the two choices and has caught a truncated transfer and a bad decompressor. Re-checking it at rest costs 1840 CPU hours, so the migration compared sizes and counts and reported 0 mismatches, while 12 archives lost 310000 records - 43 per ten thousand - counted correctly on the way out.

Verify it yourself:

```bash
pnpm eml run examples/the-checksum-covered-the-plaintext-and-the-archive-kept-the-compressed/the_checksum_covered_the_plaintext_and_the_archive_kept_the_compressed.eml
```
