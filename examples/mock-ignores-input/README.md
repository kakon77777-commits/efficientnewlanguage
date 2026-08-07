# A mock that ignores its input — the double agreed with every caller

`mock_ignores_input.eml` runs four deliberately broken callers against three
test doubles and counts how many each one catches.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a double replaces a dependency, and what a dependency
mostly does is **refuse** things.

| double | caught | of | let through |
| --- | --- | --- | --- |
| always-ok | **0** | 4 | swapped, wrong-currency, cents, missing-user |
| records | **0** | 4 | swapped, wrong-currency, cents, missing-user |
| validating | 4 | 4 | none |

Recording the call catches exactly as much as returning `"ok"`: nothing.
Recording makes an assertion *possible*; it does not make one. A test that
records and asserts nothing is the always-ok double with extra steps, and it
reads as more rigorous.

Every double accepts the **correct** caller, so the difference between them is
never visible on a passing test.

The cost is legible: the always-ok double is one line and the validating one is
eight, because the eight lines are the contract. The cheapest double is cheap
because it encodes no contract, and the contract is the entire thing a double
stands in for.

**An ordering error the run caught**: the validating double originally compared
rendered values to detect swapped arguments, which does not detect a swap — and
then reached a numeric comparison holding a string, raising `TypeError`. The
argument-shape check has to come **first**, because every check after it assumes
the arguments are in the right positions.

Verify it yourself:

```bash
pnpm eml run examples/mock-ignores-input/mock_ignores_input.eml
```
