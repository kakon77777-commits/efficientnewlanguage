# Modular exponentiation

`modular_exponentiation.eml` computes `base^exponent mod m` by repeated
squaring — the operation underneath RSA and Diffie-Hellman.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: two separate claims, checked separately.

**Correctness** — five small cases are compared against `naive_pow`,
which just multiplies the base in a loop. That shares no operator and no
structure with repeated squaring, so agreement is real evidence rather
than the method confirming itself. `5^0 mod 13 = 1` covers the
zero-exponent case, where the loop never runs.

**Cost** — the closing section is the point:

```
Why the shortcut matters, for 7^1000 mod 13:
  repeated squaring: 9
  direct:            9
  but the direct route first builds an integer of 846 digits
  while repeated squaring never exceeds 169 (modulus squared)
```

Both routes reach the same answer. EML's integers are
arbitrary-precision, so the direct route genuinely *works* rather than
overflowing — which is what makes the comparison honest: **the difference
here is cost, not correctness**, and the case says so rather than
implying the naive version is wrong.

**One language limitation this case ran into.** EML's `^` power operator
requires a **numeric literal** exponent — `n^0.5` in
[`examples/newton-sqrt/`](../newton-sqrt/) works, but `base^exponent`
with a variable exponent does not parse (`E_PARSE`). That is why the
independent check is a hand-written loop rather than the built-in
operator. It turned out to be the better choice anyway, for the
independence reason above.

Verify it yourself:

```bash
pnpm eml transpile examples/modular-exponentiation/modular_exponentiation.eml   # -> Python
pnpm eml run examples/modular-exponentiation/modular_exponentiation.eml         # -> 5 agreement lines + the cost comparison
pnpm eml trace examples/modular-exponentiation/modular_exponentiation.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/modular-exponentiation/modular_exponentiation.eml   # -> OK (fixpoint)
```
