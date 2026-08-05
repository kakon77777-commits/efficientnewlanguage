# Date parse ambiguity — information that is not in the string

`date_parse_ambiguity.eml` parses slashed dates under DD/MM and MM/DD and
measures how far apart the two readings land.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a case where no parser improvement helps, because
the missing information was never in the input.

| input | DD/MM | MM/DD | distance |
| --- | --- | --- | --- |
| `03/04/2026` | 2026-04-03 | 2026-03-04 | 30 days |
| `12/01/2026` | 2026-01-12 | 2026-12-01 | 323 days |
| `01/12/2026` | 2026-12-01 | 2026-01-12 | 323 days |

Both readings are valid dates. Nothing in the string distinguishes them,
so no amount of validation catches the misread — the wrong answer is
well-formed.

The reason this survives in production is measured rather than asserted:
the slashed form is correct on most dates because most dates have a day
above 12, which is a fact about calendars rather than about the parser.
That is the shape of the whole problem — the code appears to work, its
success rate is high and stable, and the reason has nothing to do with any
decision anyone made.

The control check confirms the parser is not simply permissive:
**4/4 clearly malformed slashed dates are refused** by the DD/MM reader.

Verify it yourself:

```bash
pnpm eml run examples/date-parse-ambiguity/date_parse_ambiguity.eml
```

```bash
pnpm eml trace examples/date-parse-ambiguity/date_parse_ambiguity.eml --run
```
