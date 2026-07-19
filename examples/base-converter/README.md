# Base converter (decimal to binary/octal)

`base_converter.eml` converts three sample decimal integers (156, 2024, 45)
to their binary and octal string representations by manual
repeated-division-and-remainder — no `bin()`/`oct()`/`hex()` call is used;
the digit string is built by hand.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: a `def`/`return` function parameterized on the target
base, an early `return "0"` guard for the zero case, a `while` loop using `%`
to peel off the least-significant digit and `int(value / base)` to shift
right (EML's bare `/` always emits Python's true division, so `int(...)` is
required to keep `value` an integer across iterations), and building the
output string by prepending via plain concatenation
(`str(remainder) + digits => digits`) since every octal/binary digit is a
single ASCII character (no base-16 letter digits needed).

Verify it yourself:

```bash
pnpm eml transpile examples/base-converter/base_converter.eml   # -> Python
pnpm eml run examples/base-converter/base_converter.eml         # -> binary + octal per number
pnpm eml trace examples/base-converter/base_converter.eml --run # -> eml:equiv ok:true
pnpm eml roundtrip examples/base-converter/base_converter.eml   # -> OK (fixpoint)
```
