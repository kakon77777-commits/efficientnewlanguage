# C⁺⁺⁺ — feasibility notes (Phase 4 prototype)

**Status:** concept-validation, not a backend. The whitepaper (§3.18 "不做完整
C⁺⁺⁺", §571) is explicit that a full C⁺⁺⁺ would be dragged down by Clang/LLVM,
UE5, templates, the memory model, and build systems — Py⁺ is the correct first
target. This phase proves the *premise*: the **same EML AST** that emits Python
also emits readable, standalone C++ for a focused subset.

## What the prototype does

`@eml/transpiler-cpp` reuses the shared pipeline
(`normalize → lex → parse → analyzeSemantics`) — i.e. the identical resolved AST
used for Python — and swaps only the emitter (`emitCppProgram`). Run it with:

```bash
pnpm eml transpile examples/phase4-cpp/sum_squares.eml --target cpp
```

Top-level statements become a `main()`; `def`s become functions before it.

### Supported subset → C++ mapping

| EML / C⁺⁺⁺ | C++ |
|---|---|
| `x^+100` (first binding) | `auto x = 100;` |
| `x^+10` / `x^-5` / `x^*2` (declared) | `x += 10;` / `x -= 5;` / `x *= 2;` |
| `x^0` | `std::cout << x << "\n";` |
| `Σ(i^2, i in [1:N])` | an IIFE lambda running a real `for` loop with a `long long` accumulator |
| `i^n` | `eml_pow(i, n)` (integer power helper in the preamble) |
| `x > 40 ? A : B` | `(x > 40 ? A : B)` |
| `i in [1:10]` | `(i >= 1 && i <= 10)` |
| `f(x) => y` | `auto y = f(x);` |
| `list^+[1,2,3]` | `std::vector<long long>{1, 2, 3}` (integer literals only; assignment only — see limits) |
| `def f(x): … return …` | `auto f(auto x) { … }` (C++20 abbreviated templates) |

### Deliberately unsupported (fail loudly with `E_CPP_UNSUPPORTED`)

`<M>(...)` / `^T` (numpy), `await` / `@temporal_loop` (asyncio). These are
runtime-library-specific; the prototype refuses rather than emit broken C++.
`@cold` / `@hot` are preserved as comments (no C++ caching semantics yet).

It also fails loud (rather than emit non-compiling C++) on these otherwise-valid
EML constructs the C++ subset can't express:

- **Recursive functions** (self or mutual): an `auto`-returning function can't
  reference its own (still-undeduced) return type. A real backend needs a
  concrete return type.
- **Non-integer list literals** (`[1.5, …]`, `["a", …]`, nested lists): would
  narrow / invalid-convert inside `std::vector<long long>{…}`.
- **Outputting a list** (`nums^0` where `nums` is a list): `std::vector` has no
  `std::ostream operator<<`.
- **Two functions with the same name**: C++ has no name rebinding (redefinition).

## Known divergences (Python vs C++)

- **Requires `-std=c++20`** (abbreviated function templates `auto f(auto x)`).
  Verified to compile+run with **MSVC `cl /std:c++20 /EHsc`** (Visual Studio 2026)
  and supports g++/clang++ `-std=c++20`. `tests/transpiler-cpp.test.ts`
  auto-detects the toolchain (g++/clang++ on PATH, or MSVC via vswhere/vcvars) and
  actually compiles+runs the demos when one is present (skips otherwise).
- **`eml_pow` is integer-only** (`long long`); a non-integer base is truncated.
  Python's `**` is arbitrary precision / float.
- **`/` is C++ division** (integer division for integer operands), unlike
  Python's always-float `/`. The demos avoid division; a real backend would
  emit a typed division helper.
- **`%` (Phase 9) requires integer operands in C++** — modulo on a `double` is
  a compile error, unlike Python's, which also works on floats. This prototype
  catches only the obvious case (a literal non-integer operand) and rejects it
  with `E_CPP_UNSUPPORTED`; a non-literal (variable) float operand is the same
  kind of accepted, undetected type-blindness `/` already has, since this
  backend does no type inference. C++'s `%` is otherwise truncating like `/`,
  not Python's floor-mod — irrelevant here since the emitted text is the same
  raw `%`, and the divergence only matters for negative operands (out of
  scope for this prototype's own stated non-goals).
- **`auto`-returning functions can't be forward-declared**, so a function must be
  defined before its callers. Recursion (self or mutual) is therefore rejected
  with `E_CPP_UNSUPPORTED` (a real backend would emit a concrete return type).
- Accumulators are `long long`; no big-integer overflow protection.
- **`and`/`or` map to `&&`/`||` (Phase 9)**, which always yield `bool`. Python's `and`/`or` are
  short-circuit but return an OPERAND (e.g. `0 and 5` is `0`, not `False`) — this prototype backend
  narrows that to a plain boolean, a deliberate simplification (self-recursion hidden behind
  `and`/`or`, e.g. `f() and f()`, is still correctly rejected as `E_CPP_UNSUPPORTED` — verified with
  a dedicated test, not assumed, since the recursion-detection walker has a non-exhaustive fallback).

## Clang / LibTooling feasibility (the path to a real C⁺⁺⁺)

The forward direction (EML → C++ source text) needs no Clang — it is a pure AST
emit, exactly as for Python. Clang/LibTooling becomes necessary for the parts the
prototype omits:

1. **Reverse (C++ → C⁺⁺⁺ overlay).** Recovering EML symbols from existing C++
   requires a real C++ parser. LibTooling's `ASTMatchers` can spot
   accumulation-loop patterns (`for (…) acc += …`) → `Σ`, range loops →
   `[a:b]`, etc. — the C++ analogue of the Python-subset reverse transpiler,
   gated by the same round-trip validator.
2. **Type-correct emission.** `auto` everywhere is a prototype shortcut. A real
   backend would query Clang's type system (or carry EML type annotations) to
   emit concrete types, fixing the `/` and `eml_pow` divergences.
3. **Build integration.** Emit a CMake target alongside the `.cpp` so a demo is
   `cmake --build`-able; a Clang plugin could run EML expansion as a compile step.

Recommended next step before committing to a backend: a LibTooling spike that
round-trips ONE pattern (accumulation loop ↔ `Σ`) on real C++ — the smallest
proof that the reverse direction is tractable.

## UE5-oriented demo snippets (conceptual)

EML's overlays map naturally onto common UE5 idioms; these are illustrative
sketches of where a C⁺⁺⁺ → UE5 path would lead, not generated output:

```text
# Cold logic: a pure, cacheable gameplay formula
@cold
def damage(base, armor):
    base - armor / 2 => d        # -> a pure UFUNCTION, memoizable per (base,armor)

# Hot state: per-tick, dynamic — never cached
@hot
def on_tick(dt):
    ...                          # -> AActor::Tick(float DeltaTime)

# Σ over a fixed count: an inner damage roll
Σ(roll(i), i in [1:hits]) => total   # -> a tight for-loop, no allocation
```

The value proposition for UE5: the `@cold`/`@hot` split is exactly the
precompute-vs-tick distinction UE5 programmers reason about manually, and the
`loopKind`/importance metadata (Phase 2/4) gives a profiler/agent a head start on
which `UFUNCTION`s are safe to cache or hoist. Realizing this needs the
LibTooling work above and is out of scope for the prototype.
