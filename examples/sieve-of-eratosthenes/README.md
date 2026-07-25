# Sieve of Eratosthenes

`sieve_of_eratosthenes.eml` lists every prime up to 50 (15 of them) via the
classic sieve.

**Source**: self-authored for the EML case corpus (no external origin);
license Apache-2.0 (same as the EML project).

**What it exercises**: building a boolean flag list by growth (`is_prime +
[True] => is_prime`, no `.append()`), then crossing off composites via
subscript assignment (`False => is_prime[multiple]`) in a nested `while`
loop bounded by `p * p <= limit`. A different strategy from the corpus's
existing [`examples/prime-checker/`](../prime-checker/) and
[`examples/prime-factorization/`](../prime-factorization/), which test one
number at a time by trial division — the sieve computes a whole range at
once, trading memory for far fewer divisions.

Verify it yourself:

```bash
pnpm eml transpile examples/sieve-of-eratosthenes/sieve_of_eratosthenes.eml   # -> Python
pnpm eml run examples/sieve-of-eratosthenes/sieve_of_eratosthenes.eml         # -> the 15 primes below 50
pnpm eml trace examples/sieve-of-eratosthenes/sieve_of_eratosthenes.eml --run # -> eml:equiv ok:true, 0 anomalies
pnpm eml roundtrip examples/sieve-of-eratosthenes/sieve_of_eratosthenes.eml   # -> OK (fixpoint)
```
