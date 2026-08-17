# The reading and the number are not the same record

`the_reading_and_the_number_are_not_the_same_record.eml` - The log stores readings as text. The report parses them with `float()`. One of those two holds a fact the other cannot.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: Parsing is the right thing to do. Text will not average, will not compare by magnitude, and will sort "10" before "9". Every question the report asks is a question about numbers, so it converts once at the edge and works in numbers after that, which is the shape everyone recommends.

What the conversion drops is the trailing zero. "3.10" and "3.1" are one number and two readings: the first says the instrument resolved to a hundredth, the second says it resolved to a tenth. After `float()` there is no way back, because there is nothing left to go back to.

Both counts are computed from the same log.

```
readings : 8
```

```
distinct as text   : 7
distinct as number : 3
  parsing merged 4 readings the log had kept apart
```

```
the distinct numbers
  3.1  2.5  4.0  
```

```
value   decimal places   reading as written
  3.1        2             3.10
  3.1        1             3.1
  3.1        3             3.100
  2.5        1             2.5
  2.5        2             2.50
  4.0        1             4.0
  4.0        0             4
  3.1        2             3.10
```

```
resolved to a hundredth or better : 4 of 8
resolved more coarsely            : 4 of 8
  that split is computable from the text and from nothing else
```

```
readings that parse to 3.1 : 4
  written as 3 different readings
  which the parsed value cannot distinguish, because it is one value
```

```
0.1 + 0.2, parsed
  sum      : 0.30000000000000004
  0.3      : 0.3
  not equal, and the difference is below any tolerance anyone would set
```

```
the same addition counted in tenths
  1 + 2 = 3, target 3
  exact, because the unit is the one the instrument reports in
```

```
control - a log written without trailing zeros
  distinct as text   : 4
  distinct as number : 4
  identical, so this log cannot show that parsing loses anything
```

Parsing at the edge is correct and the report needs numbers. The trailing zero is a statement about the instrument, and it is written in the only place the parse does not keep.

Verify it yourself:

```bash
pnpm eml run examples/the-reading-and-the-number-are-not-the-same-record/the_reading_and_the_number_are_not_the_same_record.eml
```
