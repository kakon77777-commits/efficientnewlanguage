# Same output, and only one can say what went missing

`silent_drop_accounting.eml` runs a four-stage pipeline twice — once plain, once with a ledger — and reconciles the counts.

**What it exercises**: 10 records in, 4 out. Each stage drops rows for a
reason that is individually correct, and only one of the four records
why. The plain pipeline reports success with 6 records unaccounted for.

The two versions produce **byte-identical output**, which is checked
explicitly: no test comparing output can tell them apart. The accounting
changes nothing the pipeline computes, which is why it is the first
thing cut.

Its whole value is the subtraction at the end — `in - out - explained ==
0` — and the classification that subtraction enables. Two of the four
ledger lines are routine (dedupe, windowing) and two are data-quality
signals (bad input, a missing join key), and no code can make that call.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 16 lines)

```

what each line means, which is a judgement the pipeline cannot make:
  parse:not-a-number       upstream sent bad data      - investigate
  enrich:unknown-account   a join key is missing       - investigate
  dedupe:repeat            intended                    - normal
  window:out-of-range      intended                    - normal
suspicious drops: 3
routine drops:    3

checks passed: 5/5
Same output, and only one of them can say where the missing records went.

The accounting changes nothing about what the pipeline COMPUTES, which is
why it is the first thing cut and the last thing added. Its whole value is
the subtraction at the end, and that subtraction is the only check able to
distinguish a filter working as designed from a join quietly failing.
```
