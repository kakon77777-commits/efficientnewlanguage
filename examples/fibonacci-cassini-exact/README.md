# Fibonacci to F(200), checked with Cassini

`fibonacci_cassini_exact.eml` builds Fibonacci numbers to F(200) and
checks them with an identity a float implementation cannot pass and
cannot fake.

**What it exercises**: Cassini's identity (1680),

```
F(n-1) · F(n+1) − F(n)²  =  (−1)ⁿ
```

The left side is a difference of two enormous, nearly equal numbers. At
n = 200 both products are 84 digits and they differ by exactly 1. In
64-bit floats they are the **same** number — the difference vanishes into
the rounding — so the identity evaluates to 0 and fails for every n at
once. There is no tolerance to loosen and no epsilon that helps: the
answer is always ±1 and floats always say 0.

Two more identities stress different machinery: the partial sums
(`F(1)+…+F(n) = F(n+2) − 1`), and `gcd(F(m), F(n)) = F(gcd(m, n))` —
which runs Euclid's algorithm on 84-digit numbers, using `%` at full
precision hundreds of times, where a single lost bit returns a wrong
answer rather than a close one.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**Output** (last 13 lines)

```
  m=64 n=96 gcd(m,n)=32 -> True
  m=90 n=200 gcd(m,n)=10 -> True

Cassini:      200/200
partial sums: 200/200
gcd identity: 6/6

All three identities hold exactly, at every n up to 200.

Cassini is the one that cannot be faked. In doubles, F(199)*F(201) and
F(200)^2 round to the same value, the difference is 0, and the identity
fails for every n rather than drifting slowly - so a passing run is proof
the arithmetic never went through a float.
```

Verified with `eml check`, `eml trace --run` (interpreter output equals
real CPython output — `eml:equiv ok:true`) and `eml roundtrip`
(EML → Python → EML → Python reaches a fixpoint). The deterministic
`fibonacci_cassini_exact.trace.jsonl` beside this file is the recorded execution.
